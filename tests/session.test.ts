import { it,expect } from 'vitest';
import { encodeMask,decodeMask,parseSession } from '../lib/session';
import { SHEET } from '../lib/types';
it('preserves paper holes and brush strokes through a compact project round trip',()=>{const bytes=new Uint8Array(SHEET.width*SHEET.height);bytes.fill(1,100,5000);bytes[1010]=0;bytes[50000]=1;expect(decodeMask(encodeMask(bytes))).toEqual(bytes);});
it('rejects overflowing or truncated mask runs from imported projects',()=>{expect(()=>decodeMask([SHEET.width*SHEET.height+1])).toThrow();expect(()=>decodeMask([2,3])).toThrow();expect(()=>decodeMask([0,-4])).toThrow();});

it('retains the illustrated-input label and rejects unsupported provenance labels',()=>{const sample={version:1,inputKind:'illustration',portraitConfirmed:true,photo:'data:image/png;base64,AAAA',rectified:'',target:'',corners:[{x:0,y:0},{x:1050,y:0},{x:1050,y:1485},{x:0,y:1485}],masks:[],subject:'',grid:6};expect(parseSession(sample).inputKind).toBe('illustration');expect(()=>parseSession({...sample,inputKind:'real-camera-verified'})).toThrow('input label');expect(parseSession({...sample,inputKind:undefined}).inputKind).toBeUndefined();});
