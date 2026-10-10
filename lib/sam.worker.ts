import { SamModel, AutoProcessor, RawImage, env } from '@huggingface/transformers';
import type { Point } from './types';
env.allowLocalModels=false;
env.backends.onnx.wasm!.numThreads=1;
let ready:Promise<[any,any]>|undefined;
function load() {
  if(!ready) ready=Promise.all([
    SamModel.from_pretrained('Xenova/slimsam-77-uniform',{device:'wasm',dtype:'q8',progress_callback:(p:any)=>self.postMessage({type:'progress',text:p.status==='progress'?`Loading segmentation weights: ${Math.round(p.progress||0)}%`:'Preparing local segmentation…'})}),
    AutoProcessor.from_pretrained('Xenova/slimsam-77-uniform')
  ]).catch(error=>{ready=undefined;throw error;});
  return ready;
}
let queue=Promise.resolve();
self.onmessage=(event:MessageEvent<{id:number;rgba:ArrayBuffer;width:number;height:number;seeds:Point[]}>)=>{
  const task=event.data;
  queue=queue.catch(()=>{}).then(async()=>{
    const started=performance.now();
    try {
      const [model,processor]=await load();
      const image=new RawImage(new Uint8ClampedArray(task.rgba),task.width,task.height,4).rgb();
      const inputs=await processor(image);
      self.postMessage({type:'progress',text:'Reading the paper photograph…'});
      const embeddings=await model.get_image_embeddings(inputs);
      const output=await model({...embeddings,...await processor(image,{input_points:[task.seeds.map(p=>[[p.x,p.y]])],input_labels:[task.seeds.map(()=>[1])]})});
      const [masks]=await processor.post_process_masks(output.pred_masks,inputs.original_sizes,inputs.reshaped_input_sizes);
      const plane=task.width*task.height, results:ArrayBuffer[]=[];
      for(let s=0;s<task.seeds.length;s++) {
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
      self.postMessage({id:task.id,type:'result',masks:results,seconds:(performance.now()-started)/1000}, {transfer:results});
    } catch(error) {self.postMessage({id:task.id,type:'error',message:error instanceof Error?error.message:'Segmentation failed. Try again.'});}
  });
};
