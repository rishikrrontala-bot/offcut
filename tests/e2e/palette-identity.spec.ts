import {test,expect} from '@playwright/test';
import fs from 'node:fs/promises';

test('restores the exact saved palette masks when two included scraps share an identical colour',async({page})=>{
  const errors:string[]=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto('/');
  const fixture=await page.evaluate(()=>{
    const w=1050,h=1485;
    const c=document.createElement('canvas');c.width=w;c.height=h;
    const ctx=c.getContext('2d')!;
    ctx.fillStyle='white';ctx.fillRect(0,0,w,h);
    const runs=(x:number,y:number,ww:number,hh:number)=>{const m=new Uint8Array(w*h);for(let py=y;py<y+hh;py++)m.fill(1,py*w+x,py*w+x+ww);const r:number[]=[];let bit=0,n=0;for(const v of m){if(v===bit)n++;else{r.push(n);n=1;bit=v;}}r.push(n);return r;};
    const twin:[number,number,number]=[194,70,43];
    const other:[number,number,number]=[73,104,153];
    const rects=[[25,40],[515,40],[25,730],[515,730]];
    const colors=[twin,twin,other,other];
    const masks=rects.map((r,i)=>({id:`scrap-${i+1}`,name:`Paper ${i+1}`,color:colors[i],excluded:false,data:runs(r[0],r[1],450,620)}));
    rects.forEach((r,i)=>{ctx.fillStyle=`rgb(${colors[i].join(',')})`;ctx.fillRect(r[0],r[1],450,620);});
    const photo=c.toDataURL('image/png');
    return {version:1,portraitConfirmed:true,fgId:'scrap-2',bgId:'scrap-4',pattern:{id:'heart',foreground:twin,background:other},photo,corners:[{x:0,y:0},{x:w,y:0},{x:w,y:h},{x:0,y:h}],rectified:photo,masks,target:'',subject:'Twin-colour fixture — not a camera photograph',grid:6};
  });
  await page.locator('#project-open').setInputFiles({name:'twin-colour.offcut.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(fixture))});
  await expect(page.getByText('Project restored. Review masks, then recompute before exporting.')).toBeVisible();
  await expect(page.getByRole('combobox',{name:'Subject paper',exact:true})).toHaveValue('scrap-2');
  await expect(page.getByRole('combobox',{name:'Background paper',exact:true})).toHaveValue('scrap-4');
  const waiting=page.waitForEvent('download');
  await page.getByRole('button',{name:'Save project',exact:true}).click();
  const file=await waiting;
  const saved=JSON.parse(await fs.readFile((await file.path())!,'utf8'));
  expect(saved.fgId).toBe('scrap-2');
  expect(saved.bgId).toBe('scrap-4');
  const legacy={...fixture};delete legacy.fgId;delete legacy.bgId;
  await page.locator('#project-open').setInputFiles({name:'legacy-twin.offcut.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(legacy))});
  await expect(page.getByText('Project restored. Review masks, then recompute before exporting.')).toBeVisible();
  await expect(page.getByRole('combobox',{name:'Subject paper',exact:true})).toHaveValue('scrap-1');
  await expect(page.getByRole('combobox',{name:'Background paper',exact:true})).toHaveValue('scrap-3');
  expect(errors).toEqual([]);
});
