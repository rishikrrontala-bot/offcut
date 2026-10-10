import { SamModel, AutoProcessor, RawImage, env } from '@huggingface/transformers';
import type { Point } from './types';
env.allowLocalModels=false;
env.backends.onnx.wasm!.numThreads=1;

let loadingId=0;
let ready:Promise<[any,any]>|undefined;
function load() {
  if(!ready) ready=Promise.all([
    SamModel.from_pretrained('Xenova/slimsam-77-uniform',{device:'wasm',dtype:'q8',progress_callback:(p:any)=>self.postMessage({id:loadingId,type:'progress',text:p.status==='progress'?`Loading segmentation weights: ${Math.round(p.progress||0)}%`:'Preparing local segmentation…'})}),
    AutoProcessor.from_pretrained('Xenova/slimsam-77-uniform')
  ]).catch(error=>{ready=undefined;throw error;});
  return ready;
}

type Prompt={points:Point[];labels:(0|1)[]};
type Task={id:number;imageKey?:string;rgba:ArrayBuffer;width:number;height:number;seeds?:Point[];prompts?:Prompt[]};

let queue=Promise.resolve();
let cache:{key:string;raw:RawImage;meta:any;embeddings:any}|undefined;

function validate(t:Task):Prompt[] {
  if(!t.rgba||!(t.rgba instanceof ArrayBuffer))throw new Error('Invalid image.');
  const plane=t.width*t.height;
  if(!Number.isInteger(t.width)||!Number.isInteger(t.height)||t.width<=0||t.height<=0||plane>25000000||t.rgba.byteLength!==plane*4)throw new Error('Dimensions do not match RGBA buffer.');
  let prompts:Prompt[]|undefined=t.prompts;
  if(!prompts||!prompts.length) {
    if(!t.seeds||!t.seeds.length)throw new Error('No prompts or seeds provided.');
    prompts=t.seeds.map(s=>({points:[{x:s.x,y:s.y}],labels:[1]}));
  }
  if(prompts.length<1||prompts.length>8)throw new Error('Expected 1-8 prompts.');
  for(const p of prompts) {
    if(!Array.isArray(p.points)||!Array.isArray(p.labels)||p.points.length!==p.labels.length||p.points.length<1||p.points.length>16)throw new Error('Invalid prompt points.');
    if(!p.labels.some(l=>l===1))throw new Error('Each prompt needs at least one positive point.');
    for(const pt of p.points) {
      if(!Number.isFinite(pt.x)||!Number.isFinite(pt.y)||pt.x<0||pt.y<0||pt.x>=t.width||pt.y>=t.height)throw new Error('Point out of bounds.');
    }
    if(!p.labels.every(l=>l===0||l===1))throw new Error('Labels must be 0 or 1.');
  }
  return prompts;
}

self.onmessage=(event:MessageEvent<Task>)=>{
  const task=event.data;
  queue=queue.catch(()=>{}).then(async()=>{
    const started=performance.now();
    try {
      const prompts=validate(task);
      loadingId=task.id;
      const [model,processor]=await load();
      let reusedEmbeddings=false, embeddings:any, meta:any, raw:RawImage;
      const key=(task.imageKey&&task.imageKey.length)?`${task.imageKey}|${task.width}x${task.height}`:'';
      const cached=key&&cache?.key===key?cache:undefined;
      if(cached) {reusedEmbeddings=true;embeddings=cached.embeddings;meta=cached.meta;raw=cached.raw;}
      else {
        self.postMessage({id:task.id,type:'progress',text:'Reading the paper photograph…'});
        raw=new RawImage(new Uint8ClampedArray(task.rgba),task.width,task.height,4).rgb();
        const inputs=await processor(raw);
        embeddings=await model.get_image_embeddings(inputs);
        meta={original_sizes:inputs.original_sizes,reshaped_input_sizes:inputs.reshaped_input_sizes};
        cache=key?{key,raw,meta,embeddings}:undefined;
      }
      const proc=await processor(raw,{input_points:[prompts.map(p=>p.points.map(pt=>[pt.x,pt.y]))],input_labels:[prompts.map(p=>p.labels)]});
      const output=await model({...embeddings,...proc});
      const [masks]=await processor.post_process_masks(output.pred_masks,meta.original_sizes,meta.reshaped_input_sizes);
      const plane=task.width*task.height, results:ArrayBuffer[]=[];
      for(let s=0;s<prompts.length;s++) {
        let best=-1,bestScore=-Infinity;
        for(let k=0;k<3;k++) {
          const offset=(s*3+k)*plane;let area=0;
          for(let j=0;j<plane;j++)area+=Number(masks.data[offset+j]);
          const score=Number(output.iou_scores.data[s*3+k]);
          if(area>100&&area<plane*.50&&score>bestScore){best=k;bestScore=score;}
        }
        const bytes=new Uint8Array(plane);
        if(best>=0)for(let j=0;j<plane;j++)bytes[j]=Number(masks.data[(s*3+best)*plane+j]);
        results.push(bytes.buffer);
      }
      self.postMessage({id:task.id,type:'result',masks:results,seconds:(performance.now()-started)/1000,reusedEmbeddings},{transfer:results});
    } catch(error) {
      if(error instanceof Error&&/embed|encoding|image/i.test(error.message))cache=undefined;
      self.postMessage({id:task.id,type:'error',message:error instanceof Error?error.message:'Segmentation failed. Try again.'});
    }
  });
};
