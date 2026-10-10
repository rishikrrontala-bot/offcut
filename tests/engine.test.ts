import { describe,it,expect } from 'vitest';
import { validateCorners,solveHomography,invert3,transformPoint,extractTiles,allocate,validateAllocation } from '../lib/engine';
import { SHEET,type Mask,type RGB,type Tile } from '../lib/types';
const area=SHEET.width*SHEET.height;
function mask(id='scrap-1'):Mask{return {id,name:'Paper',width:SHEET.width,height:SHEET.height,color:[20,80,30],data:new Uint8Array(area).fill(1),excluded:false};}
function pixels(){const data=new Uint8ClampedArray(area*4);for(let i=0;i<area;i++)data.set([20,80,30,255],i*4);return data;}
function tile(i:number,color:RGB=[20,80,30]):Tile{return {id:`t${i}`,scrapId:'scrap-1',x:5+(i%14)*70,y:5+Math.floor(i/14)*70,size:60,color};}
describe('physical geometry',()=>{
 it('recovers A4 dimensions and inverse positions after a skewed photograph',()=>{const from=[{x:90,y:50},{x:600,y:70},{x:660,y:900},{x:30,y:800}],to=[{x:0,y:0},{x:210,y:0},{x:210,y:297},{x:0,y:297}],h=solveHomography(from,to);for(let i=0;i<4;i++){const v=transformPoint(h,from[i]);expect(v.x).toBeCloseTo(to[i].x,5);expect(v.y).toBeCloseTo(to[i].y,5);}const pos={x:320,y:420},round=transformPoint(invert3(h),transformPoint(h,pos));expect(round.x).toBeCloseTo(pos.x,5);expect(round.y).toBeCloseTo(pos.y,5);});
 it('rejects crossed and degenerate sheet corners',()=>{expect(()=>validateCorners([{x:0,y:0},{x:100,y:100},{x:100,y:0},{x:0,y:100}])).toThrow();expect(()=>validateCorners([{x:0,y:0},{x:1,y:0},{x:1,y:1},{x:0,y:1}])).toThrow();});
});
describe('cuttable inventory',()=>{
 it('rejects a square with an internal hole even when all corners are on paper',()=>{const m=mask();m.data[30*SHEET.width+30]=0;const ts=extractTiles([m],pixels(),1);expect(ts.some(t=>t.x===5&&t.y===5)).toBe(false);expect(ts.length).toBeGreaterThan(36);});
 it('never uses overlapping material masks twice',()=>{const a=mask(),b=mask('scrap-2');const ts=extractTiles([a,b],pixels(),1);const origins=ts.map(t=>`${t.x},${t.y}`);expect(new Set(origins).size).toBe(ts.length);});
 it('enforces the whole margin and captures actual pixel colours',()=>{const m=mask();m.data[0]=0;const ts=extractTiles([m],pixels(),1);expect(ts.some(t=>t.x===5&&t.y===5)).toBe(false);expect(ts[0].size).toBe(60);expect(ts[0].color).toEqual([20,80,30]);});
});
describe('finite allocation',()=>{
 it('uses scarce colour only once and optimally preserves exact target matches',()=>{const tiles=Array.from({length:36},(_,i)=>tile(i,i===0?[240,20,20]:[20,80,30]));const target=Array.from({length:36},(_,i)=>i===15?[240,20,20] as RGB:[20,80,30] as RGB);const a=allocate(tiles,target,6,1);expect(new Set(a.tileIds).size).toBe(36);expect(a.tileIds[15]).toBe('t0');});
 it('reports shortages and refuses duplicate source IDs',()=>{expect(()=>allocate([tile(0)],Array(36).fill([0,0,0]),6,1)).toThrow();expect(()=>allocate(Array.from({length:36},()=>tile(0)),Array(36).fill([0,0,0]),6,1)).toThrow();});
 it('accepts reviewed material then refuses stale revision and excluded paper',()=>{const m=mask(),tiles=extractTiles([m],pixels(),1),a=allocate(tiles,Array(36).fill([20,80,30]),6,1);expect(()=>validateAllocation(a,tiles,[m],1)).not.toThrow();expect(()=>validateAllocation(a,tiles,[m],2)).toThrow();expect(()=>validateAllocation(a,tiles,[{...m,excluded:true}],1)).toThrow();});
});
