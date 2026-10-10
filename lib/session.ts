import { SHEET, type Session, type Mask } from './types';
import { validateCorners } from './engine';
export function encodeMask(data:Uint8Array):number[] {const runs:number[]=[];let value=0,count=0;for(const byte of data){const bit=byte?1:0;if(bit===value)count++;else{runs.push(count);count=1;value=bit;}}runs.push(count);return runs;}
export function decodeMask(runs:number[]):Uint8Array {if(!Array.isArray(runs)||runs.length>SHEET.width*SHEET.height+1)throw new Error('Project mask data is invalid.');const out=new Uint8Array(SHEET.width*SHEET.height);let pos=0;for(let i=0;i<runs.length;i++){const n=runs[i];if(!Number.isInteger(n)||n<0||(i>0&&n===0)||pos+n>out.length)throw new Error('Project mask data is invalid.');if(i%2)out.fill(1,pos,pos+n);pos+=n;}if(pos!==out.length)throw new Error('Project mask dimensions are invalid.');return out;}
export function serializeMasks(masks:Mask[]):Session['masks'] {return masks.map(m=>({id:m.id,name:m.name,color:m.color,excluded:m.excluded,data:encodeMask(m.data)}));}
export function parseSession(value:unknown):Session {
  if(!value||typeof value!=='object')throw new Error('Choose an OFFCUT project JSON file.');
  const s=value as Session;
  if(s.version!==1||typeof s.photo!=='string'||typeof s.rectified!=='string'||typeof s.target!=='string'||!Array.isArray(s.corners)||!Array.isArray(s.masks)||s.masks.length>8||![6,8].includes(s.grid)||typeof s.subject!=='string')throw new Error('This project format is unsupported.');
  for(const url of [s.photo,s.rectified,s.target]) if(url&&(!/^data:image\/(jpeg|png|webp);base64,[A-Za-z0-9+/=]+$/.test(url)||url.length>32000000))throw new Error('Project contains unsupported image data.');
  validateCorners(s.corners);
  const ids=new Set<string>();
  for(const m of s.masks){if(typeof m.id!=='string'||!/^scrap-\d+$/.test(m.id)||ids.has(m.id)||typeof m.name!=='string'||m.name.length>40||typeof m.excluded!=='boolean'||!Array.isArray(m.color)||m.color.length!==3||m.color.some(v=>!Number.isFinite(v)||v<0||v>255))throw new Error('Project material data is invalid.');ids.add(m.id);decodeMask(m.data);}
  return {version:1,portraitConfirmed:s.portraitConfirmed===true,photo:s.photo,corners:s.corners,rectified:s.rectified,masks:s.masks,target:s.target,subject:s.subject.slice(0,80),grid:s.grid};
}
function db():Promise<IDBDatabase>{return new Promise((resolve,reject)=>{const r=indexedDB.open('offcut-local',1);r.onupgradeneeded=()=>r.result.createObjectStore('session');r.onsuccess=()=>resolve(r.result);r.onerror=()=>reject(new Error('Local saving is unavailable. Download your project to keep it.'));});}
export async function saveLocal(s:Session){const d=await db();try{await new Promise<void>((resolve,reject)=>{const tx=d.transaction('session','readwrite');tx.objectStore('session').put(s,'current');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(new Error('Local storage is full. Download your project.'));});}finally{d.close();}}
export async function loadLocal():Promise<Session|undefined>{const d=await db();try{return await new Promise((resolve,reject)=>{const r=d.transaction('session').objectStore('session').get('current');r.onsuccess=()=>resolve(r.result?parseSession(r.result):undefined);r.onerror=()=>reject(r.error);});}finally{d.close();}}
export async function clearLocal(){const d=await db();try{await new Promise<void>((resolve,reject)=>{const tx=d.transaction('session','readwrite');tx.objectStore('session').delete('current');tx.oncomplete=()=>resolve();tx.onerror=()=>reject(tx.error);});}finally{d.close();}}
