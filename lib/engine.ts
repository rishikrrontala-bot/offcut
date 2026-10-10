import { SHEET,type Point,type RGB,type Mask,type Tile,type Allocation } from './types';
const finite=(values:number[])=>values.every(Number.isFinite);
export function validateCorners(points:Point[]):void {
 if(points.length!==4||!points.every(p=>finite([p.x,p.y])))throw new Error('Confirm four finite sheet corners, in clockwise order.');
 let area=0;
 for(let i=0;i<4;i++){const a=points[i],b=points[(i+1)%4],c=points[(i+2)%4];area+=a.x*b.y-b.x*a.y;if((b.x-a.x)*(c.y-b.y)-(b.y-a.y)*(c.x-b.x)<=1e-6)throw new Error('Sheet corners cross or are reversed. Use top left, top right, bottom right, bottom left.');}
 if(area/2<100)throw new Error('The selected sheet is too small or degenerate. Place handles on the four A4 corners.');
}
export function solveHomography(from:Point[],to:Point[]):number[] {
 validateCorners(from);validateCorners(to);
 const rows:number[][]=[];
 for(let i=0;i<4;i++){const {x,y}=from[i],u=to[i].x,v=to[i].y;rows.push([x,y,1,0,0,0,-u*x,-u*y,u],[0,0,0,x,y,1,-v*x,-v*y,v]);}
 for(let c=0;c<8;c++){let pivot=c;for(let r=c+1;r<8;r++)if(Math.abs(rows[r][c])>Math.abs(rows[pivot][c]))pivot=r;if(Math.abs(rows[pivot][c])<1e-10)throw new Error('Sheet geometry is singular. Correct the corners.');[rows[c],rows[pivot]]=[rows[pivot],rows[c]];const div=rows[c][c];for(let j=c;j<9;j++)rows[c][j]/=div;for(let r=0;r<8;r++)if(r!==c){const factor=rows[r][c];for(let j=c;j<9;j++)rows[r][j]-=factor*rows[c][j];}}
 return [...rows.map(r=>r[8]),1];
}
export function invert3(h:number[]):number[] {
 if(h.length!==9||!finite(h))throw new Error('Invalid perspective transform.');
 const [a,b,c,d,e,f,g,i,j]=h;const det=a*(e*j-f*i)-b*(d*j-f*g)+c*(d*i-e*g);if(Math.abs(det)<1e-12)throw new Error('Perspective transform is singular.');
 return [e*j-f*i,c*i-b*j,b*f-c*e,f*g-d*j,a*j-c*g,c*d-a*f,d*i-e*g,b*g-a*i,a*e-b*d].map(v=>v/det);
}
export function transformPoint(h:number[],p:Point):Point {const w=h[6]*p.x+h[7]*p.y+h[8];if(!Number.isFinite(w)||Math.abs(w)<1e-10)throw new Error('Point is outside usable perspective geometry.');return {x:(h[0]*p.x+h[1]*p.y+h[2])/w,y:(h[3]*p.x+h[4]*p.y+h[5])/w};}
function checkMasks(masks:Mask[]) {const ids=new Set<string>();for(const m of masks){if(ids.has(m.id)||m.width!==SHEET.width||m.height!==SHEET.height||m.data.length!==SHEET.width*SHEET.height)throw new Error('Material masks have duplicate IDs or incorrect dimensions.');ids.add(m.id);}}
function checkTile(t:Tile) {if(t.size!==SHEET.tileMm*SHEET.pxPerMm||![t.x,t.y,t.size].every(Number.isInteger)||t.x<5||t.y<5||t.x+t.size+5>SHEET.width||t.y+t.size+5>SHEET.height||!finite(t.color)||t.color.some(v=>v<0||v>255))throw new Error('Source piece geometry or colour is invalid.');}
export function extractTiles(masks:Mask[],rgba:Uint8ClampedArray,revision:number):Tile[] {
 checkMasks(masks);const {width:w,height:h,pxPerMm}=SHEET;if(rgba.length!==w*h*4)throw new Error('Photograph pixels do not match the calibrated A4 sheet.');
 const margin=SHEET.marginMm*pxPerMm,size=SHEET.tileMm*pxPerMm,pitch=SHEET.pitchMm*pxPerMm;
 const owner=new Int16Array(w*h);masks.forEach((m,index)=>{if(m.excluded)return;for(let j=0;j<owner.length;j++)if(m.data[j])owner[j]=owner[j]===0?index+1:-1;});
 const result:Tile[]=[];const stride=w+1;
 masks.forEach((mask,index)=>{if(mask.excluded)return;const integral=new Uint32Array((w+1)*(h+1));for(let y=0;y<h;y++){let row=0;for(let x=0;x<w;x++){row+=owner[y*w+x]===index+1?1:0;integral[(y+1)*stride+x+1]=integral[y*stride+x+1]+row;}}
 for(let y=margin;y+size+margin<=h;y+=pitch)for(let x=margin;x+size+margin<=w;x+=pitch){const x0=x-margin,y0=y-margin,x1=x+size+margin,y1=y+size+margin;const count=integral[y1*stride+x1]-integral[y0*stride+x1]-integral[y1*stride+x0]+integral[y0*stride+x0];if(count!==(size+2*margin)**2)continue;const color:RGB=[0,0,0];for(let py=y;py<y+size;py++)for(let px=x;px<x+size;px++){const q=(py*w+px)*4;color[0]+=rgba[q];color[1]+=rgba[q+1];color[2]+=rgba[q+2];}for(let c=0;c<3;c++)color[c]/=size*size;result.push({id:`r${revision}:${mask.id}:${x}:${y}`,scrapId:mask.id,x,y,size,color});}
 });
 return result;
}
/** CIE Lab approximates camera colour. Output always uses original photo crops. */
function lab(c:RGB):RGB {const rgb=c.map(v=>{const s=v/255;return s>.04045?((s+.055)/1.055)**2.4:s/12.92;});const xyz=[(rgb[0]*.4124564+rgb[1]*.3575761+rgb[2]*.1804375)/.95047,rgb[0]*.2126729+rgb[1]*.7151522+rgb[2]*.072175,(rgb[0]*.0193339+rgb[1]*.119192+rgb[2]*.9503041)/1.08883].map(v=>v>.008856?Math.cbrt(v):7.787*v+16/116);return [116*xyz[1]-16,500*(xyz[0]-xyz[1]),200*(xyz[1]-xyz[2])];}
export function allocate(tiles:Tile[],target:RGB[],grid:number,revision:number):Allocation {
 if(![6,8].includes(grid)||target.length!==grid*grid)throw new Error('Choose a supported 6 × 6 or 8 × 8 target grid.');
 if(tiles.length<target.length)throw new Error(`You need ${target.length-tiles.length} more verified squares for this layout (${tiles.length} available, ${target.length} needed). Add paper${grid===8?' or choose 6 × 6':''}.`);
 if(tiles.length>1024)throw new Error('Inventory exceeds the supported 1024 source pieces.');
 const ids=new Set<string>();for(const t of tiles){checkTile(t);if(ids.has(t.id))throw new Error('Source IDs are duplicated. Rebuild the inventory.');ids.add(t.id);}
 if(target.some(c=>c.length!==3||!finite(c)||c.some(v=>v<0||v>255)))throw new Error('Target colours are invalid.');
 const sources=[...tiles].sort((a,b)=>a.id.localeCompare(b.id)),colors=sources.map(t=>lab(t.color)),wanted=target.map(lab),n=wanted.length,m=sources.length;
 const cost=wanted.map(c=>colors.map(d=>(c[0]-d[0])**2+(c[1]-d[1])**2+(c[2]-d[2])**2));
 const u=new Float64Array(n+1),v=new Float64Array(m+1),p=new Int32Array(m+1),way=new Int32Array(m+1);
 for(let i=1;i<=n;i++){p[0]=i;let j0=0;const min=new Float64Array(m+1).fill(Infinity),used=new Uint8Array(m+1);do{used[j0]=1;const i0=p[j0];let delta=Infinity,j1=0;for(let j=1;j<=m;j++)if(!used[j]){const cur=cost[i0-1][j-1]-u[i0]-v[j];if(cur<min[j]){min[j]=cur;way[j]=j0;}if(min[j]<delta){delta=min[j];j1=j;}}for(let j=0;j<=m;j++)if(used[j]){u[p[j]]+=delta;v[j]-=delta;}else min[j]-=delta;j0=j1;}while(p[j0]!==0);do{const j1=way[j0];p[j0]=p[j1];j0=j1;}while(j0!==0);}
 const tileIds=Array<string>(n);let total=0;for(let j=1;j<=m;j++)if(p[j]){tileIds[p[j]-1]=sources[j-1].id;total+=cost[p[j]-1][j-1];}
 return {revision,grid,tileIds,cost:total};
}
export function validateAllocation(a:Allocation,tiles:Tile[],masks:Mask[],revision:number):void {
 checkMasks(masks);if(a.revision!==revision)throw new Error('The materials changed. Recompute the collage before exporting.');
 if(![6,8].includes(a.grid)||a.tileIds.length!==a.grid*a.grid||new Set(a.tileIds).size!==a.tileIds.length)throw new Error('The plan has missing or repeated source pieces.');
 const tileMap=new Map(tiles.map(t=>[t.id,t]));if(tileMap.size!==tiles.length)throw new Error('Inventory has repeated source IDs.');
 const chosen=a.tileIds.map(id=>{const t=tileMap.get(id);if(!t)throw new Error('The plan refers to unavailable material.');checkTile(t);const m=masks.find(m=>m.id===t.scrapId&&!m.excluded);if(!m)throw new Error('A source paper was excluded. Recompute before exporting.');for(let y=t.y-5;y<t.y+t.size+5;y++)for(let x=t.x-5;x<t.x+t.size+5;x++){const q=y*SHEET.width+x;if(!m.data[q]||masks.some(other=>other.id!==m.id&&!other.excluded&&other.data[q]))throw new Error('A piece or its cutting margin is outside exclusive approved paper. Review masks and recompute.');}return t;});
 for(let i=0;i<chosen.length;i++)for(let j=i+1;j<chosen.length;j++){const a=chosen[i],b=chosen[j];if(a.x<b.x+b.size&&a.x+a.size>b.x&&a.y<b.y+b.size&&a.y+a.size>b.y)throw new Error('Source pieces overlap. Rebuild the inventory.');}
}
