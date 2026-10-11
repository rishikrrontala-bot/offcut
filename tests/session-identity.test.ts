import { it,expect } from 'vitest';
import { parseSession } from '../lib/session';
import { SHEET } from '../lib/types';

const full=[SHEET.width*SHEET.height];
function project(overrides:Record<string,unknown>={}):any{
  return {version:1,portraitConfirmed:true,photo:'data:image/png;base64,AAAA',rectified:'',target:'',
    corners:[{x:0,y:0},{x:1050,y:0},{x:1050,y:1485},{x:0,y:1485}],
    masks:[{id:'scrap-1',name:'Paper 1',color:[10,20,30],excluded:false,data:[...full]},
           {id:'scrap-2',name:'Paper 2',color:[10,20,30],excluded:false,data:[...full]}],
    subject:'',grid:6,...overrides};
}
it('preserves the persisted palette mask ids through parsing and rejects ids that reference no saved mask',()=>{
  const parsed=parseSession(project({pattern:{id:'heart',foreground:[10,20,30],background:[10,20,30]},fgId:'scrap-2',bgId:'scrap-1'}));
  expect(parsed.fgId).toBe('scrap-2');
  expect(parsed.bgId).toBe('scrap-1');
  expect(()=>parseSession(project({pattern:{id:'heart',foreground:[10,20,30],background:[10,20,30]},fgId:'scrap-9'}))).toThrow('palette selection');
  expect(()=>parseSession(project({bgId:'paper-2'}))).toThrow('palette selection');
});
it('accepts legacy projects saved before palette ids were persisted',()=>{
  const legacy=parseSession(project({pattern:{id:'heart',foreground:[10,20,30],background:[40,50,60]}}));
  expect(legacy.fgId).toBeUndefined();
  expect(legacy.bgId).toBeUndefined();
});
