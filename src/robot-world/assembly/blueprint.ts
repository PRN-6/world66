import { CENTRE } from '../site/layout.ts'
import type { V3 } from '../../world/modeling'
export const STAGES=['Legs','Lower body','Torso','Arms','Head','Electronics','Activated'] as const
export type PartKind='boot'|'shin'|'thigh'|'pelvis'|'belt'|'chest'|'collar'|'shoulder'|'gauntlet'|'hand'|'helmet'|'visor'|'ear'|'eye'|'reactor'
export type Joint='frame'|'left-arm'|'right-arm'|'head'
export interface BlueprintPart {id:string;kind:PartKind;side:number;stage:number;socket:V3;joint:Joint;air:boolean}
function part(kind:PartKind,stage:number,at:V3,side=0,air=false,joint:Joint='frame'):BlueprintPart{
  return {id:kind+(side<0?'-l':side>0?'-r':''),kind,side,stage,socket:[at[0],at[1],at[2]+CENTRE[2]],air,joint}
}
const pair=(kind:PartKind,stage:number,x:number,y:number,z:number,air=false,arms=false)=>
  [-1,1].map(s=>part(kind,stage,[s*x,y,z],s,air,arms?(s<0?'left-arm':'right-arm'):'frame'))
export const blueprint:BlueprintPart[]=[
  ...pair('boot',0,.89,1.27,.19),...pair('shin',0,.89,2.1,0),...pair('thigh',0,.81,3.08,-.03),
  part('pelvis',1,[0,3.95,0]),part('belt',1,[0,4.39,0],0,true),
  ...pair('chest',2,.70,5.46,0),part('collar',2,[0,6.37,-.02],0,true),
  ...pair('shoulder',3,1.91,6.02,0,false,true),...pair('gauntlet',3,2.25,5.01,.13,false,true),...pair('hand',3,2.27,4.24,.22,true,true),
  part('helmet',4,[0,7.44,-.07],0,false,'head'),part('visor',4,[0,7.43,.64],0,true,'head'),
  ...[-1,1].map(s=>part('ear',5,[s*1.07,7.4,-.02],s,true,'head')),
  ...[-1,1].map(s=>part('eye',5,[s*.43,7.45,.844],s,true,'head')),
  part('reactor',5,[0,5.53,.85],0,true)
]
export const armPivot=(s:number):V3=>[s*1.55,6.24,CENTRE[2]]
export const headPivot:V3=[0,6.78,CENTRE[2]]
