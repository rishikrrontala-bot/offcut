import { SHEET, type Point, type RGB } from './types';
import { validateCorners, solveHomography, invert3 } from './engine';

export async function readPhoto(file: File): Promise<string> {
  if (!['image/jpeg','image/png','image/webp'].includes(file.type)) throw new Error('Choose a JPEG, PNG or WebP photograph. SVG and other files are not supported.');
  if (file.size > 12*1024*1024) throw new Error('This image is over 12 MB. Export a smaller camera photograph.');
  const bmp = await createImageBitmap(file);
  try {
    if (bmp.width*bmp.height > 25000000 || Math.min(bmp.width,bmp.height)<300) throw new Error('Use a clear image between 300 pixels and 25 megapixels.');
    const scale = Math.min(1, 2000/Math.max(bmp.width,bmp.height));
    const canvas=document.createElement('canvas'); canvas.width=Math.round(bmp.width*scale); canvas.height=Math.round(bmp.height*scale);
    canvas.getContext('2d')!.drawImage(bmp,0,0,canvas.width,canvas.height);
    return canvas.toDataURL('image/jpeg',0.97);
  } finally { bmp.close(); }
}
export async function imageCanvas(url: string): Promise<HTMLCanvasElement> {
  if (!/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(url) || url.length>32000000) throw new Error('Image data is invalid or too large.');
  const image=new Image(); image.src=url; await image.decode();
  if (image.width*image.height>25000000) throw new Error('Image dimensions are too large.');
  const canvas=document.createElement('canvas');canvas.width=image.width;canvas.height=image.height;canvas.getContext('2d')!.drawImage(image,0,0);return canvas;
}
let cvReady:Promise<any>|undefined;
function loadOpenCV():Promise<any> {
  if(!cvReady) cvReady=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src='/vendor/opencv.js'; script.async=true;
    const timer=setTimeout(()=>{script.remove();cvReady=undefined;reject(new Error('Perspective tools timed out loading. Retry after checking your connection.'));},60000);
    script.onload=async()=>{try{const cv=await (window as any).cv;if(!cv?.matFromArray)throw new Error('Perspective tools did not initialize.');clearTimeout(timer);resolve(cv);}catch(e){clearTimeout(timer);cvReady=undefined;reject(e);}};
    script.onerror=()=>{clearTimeout(timer);cvReady=undefined;script.remove();reject(new Error('Perspective tools could not load. Retry after checking your connection.'));};
    document.head.appendChild(script);
  });
  return cvReady;
}
export async function rectify(url: string, corners: Point[]) {
  validateCorners(corners);
  const source=await imageCanvas(url);
  for (const point of corners) if(point.x<0||point.y<0||point.x>source.width||point.y>source.height) throw new Error('Keep all four corners inside the photograph.');
  const cv = await loadOpenCV();
  const dest=[{x:0,y:0},{x:SHEET.width,y:0},{x:SHEET.width,y:SHEET.height},{x:0,y:SHEET.height}];
  const from=cv.matFromArray(4,1,cv.CV_32FC2,corners.flatMap(v=>[v.x,v.y]));
  const to=cv.matFromArray(4,1,cv.CV_32FC2,dest.flatMap(v=>[v.x,v.y]));
  const src=cv.imread(source), out=new cv.Mat(); let matrix;
  try {
    matrix=cv.getPerspectiveTransform(from,to);
    cv.warpPerspective(src,out,matrix,new cv.Size(SHEET.width,SHEET.height),cv.INTER_LINEAR,cv.BORDER_CONSTANT,new cv.Scalar(255,255,255,255));
    const canvas=document.createElement('canvas');canvas.width=SHEET.width;canvas.height=SHEET.height;cv.imshow(canvas,out);
    return {canvas,inverse:invert3(solveHomography(corners,dest))};
  } finally { from.delete();to.delete();src.delete();out.delete();matrix?.delete(); }
}
/** Contrast only proposes points. Learned SAM prediction creates the masks. */
export function proposeSeeds(rgba: Uint8ClampedArray): Point[] {
  const {width:w,height:h}=SHEET, step=5, sw=Math.ceil(w/step), sh=Math.ceil(h/step);
  const samples: number[][]=[[],[],[]];
  for(let x=10;x<w-10;x+=25) for(const y of [10,h-11]) for(let c=0;c<3;c++)samples[c].push(rgba[(y*w+x)*4+c]);
  for(let y=10;y<h-10;y+=25) for(const x of [10,w-11]) for(let c=0;c<3;c++)samples[c].push(rgba[(y*w+x)*4+c]);
  const bg=samples.map(a=>a.sort((a,b)=>a-b)[Math.floor(a.length/2)]);
  const foreground=new Uint8Array(sw*sh),seen=new Uint8Array(sw*sh);const seeds:{point:Point;area:number}[]=[];
  for(let y=0;y<sh;y++)for(let x=0;x<sw;x++) {const i=(Math.min(h-1,y*step)*w+Math.min(w-1,x*step))*4; foreground[y*sw+x]=Math.hypot(rgba[i]-bg[0],rgba[i+1]-bg[1],rgba[i+2]-bg[2])>55?1:0;}
  for(let start=0;start<foreground.length;start++) {
    if(!foreground[start]||seen[start])continue;
    const cells=[start];seen[start]=1;let sx=0,sy=0;
    for(let k=0;k<cells.length;k++){const a=cells[k],x=a%sw,y=Math.floor(a/sw);sx+=x;sy+=y;
      for(const [nx,ny] of [[x-1,y],[x+1,y],[x,y-1],[x,y+1]]) {if(nx<0||ny<0||nx>=sw||ny>=sh)continue;const b=ny*sw+nx;if(foreground[b]&&!seen[b]){seen[b]=1;cells.push(b);}}
    }
    if(cells.length<100||cells.length>sw*sh*.45)continue;
    const cx=sx/cells.length,cy=sy/cells.length;
    const best=cells.reduce((a,b)=> Math.hypot(b%sw-cx,Math.floor(b/sw)-cy)<Math.hypot(a%sw-cx,Math.floor(a/sw)-cy)?b:a);
    seeds.push({point:{x:Math.min(w-1,(best%sw)*step),y:Math.min(h-1,Math.floor(best/sw)*step)},area:cells.length});
  }
  return seeds.sort((a,b)=>b.area-a.area).slice(0,8).map(a=>a.point);
}
export async function targetColors(url:string, grid:number):Promise<RGB[]> {
  const photo=await imageCanvas(url),c=document.createElement('canvas');c.width=grid;c.height=grid;
  const ctx=c.getContext('2d')!;ctx.drawImage(photo,0,0,grid,grid);const d=ctx.getImageData(0,0,grid,grid).data;
  return Array.from({length:grid*grid},(_,i)=>[d[i*4],d[i*4+1],d[i*4+2]] as RGB);
}
export function download(text:string,name:string,type:string) { const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000); }
