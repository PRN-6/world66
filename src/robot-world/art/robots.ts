import {Model,type V3} from '../../world/modeling.ts'
import {palette as P} from '../site/layout.ts'
import type {Role,Robot} from '../crew/types'
import {disc} from './giant.ts'

export type RigJoint='body'|'head'|'arm'|'foot'|'wheel'|'rotor'
export interface RobotJoint {joint:RigJoint;at:V3;side:number;model:Model}
export function robotRig(role:Role){
  const parts:RobotJoint[]=[]
  function joint(joint:RigJoint,at:V3,side=0){const model=new Model();parts.push({joint,at,side,model});return model}
  const body=joint('body',[0,0,0])
  if(role==='transport'){
    body.add('soft',[0,.29,.05],[.90,.39,1.06],P.amber)
    body.add('soft',[0,.51,-.18],[.77,.28,.62],P.lemon)
    body.add('soft',[0,.47,-.47],[.63,.16,.12],P.navy)
    for(const s of [-1,1]){
      body.add('soft',[s*.26,.24,.64],[.11,.12,.71],P.iron)
      body.add('soft',[s*.34,.43,.48],[.10,.52,.13],P.navy)
      for(const z of [-.31,.35]){
        const wheel=joint('wheel',[s*.433,.247,z],s)
        wheel.add('rod',[0,0,0],[.213,.17,.213],P.ink,[0,0,Math.PI/2])
        wheel.add('rod',[s*.094,0,0],[.119,.042,.119],P.steel,[0,0,Math.PI/2])
        wheel.add('soft',[s*.12,.038,0],[.02,.09,.033],P.white)
      }
    }
    const h=joint('head',[0,.79,-.12])
    h.add('soft',[0,0,0],[.65,.43,.56],P.white)
    face(h,.286,.55,.26)
    h.add('rod',[.37,-.02,0],[.13,.11,.13],P.coral,[0,0,Math.PI/2])
    return parts
  }
  const engineer=role==='engineer'
  const shell=engineer?P.coral:P.mint
  body.add('soft',[0,.44,0],[.58,.46,.44],shell)
  body.add('soft',[0,.46,.20],[.41,.29,.10],P.white)
  body.add('soft',[-.09,.51,.265],[.12,.052,.034],P.teal)
  body.add('soft',[0,.47,-.245],[.40,.31,.18],P.navy)
  for(const s of [-1,1]){
    const foot=joint('foot',[s*.161,.275,0],s)
    foot.add('ball',[0,-.071,0],[.095,.126,.096],P.iron)
    foot.add('soft',[0,-.18,.029],[.245,.17,.31],P.navy)
    foot.add('soft',[0,-.148,.105],[.22,.105,.18],P.white)
    const arm=joint('arm',[s*.31,.55,0],s)
    arm.add('ball',[0,-.055,0],[.102,.133,.107],P.iron)
    arm.add('soft',[s*.014,-.198,.015],[.17,.21,.17],shell)
    arm.add('bud',[s*.012,-.308,.036],[.10,.095,.10],P.navy)
    if(engineer&&s===1){arm.add('rod',[0,-.32,.16],[.061,.26,.061],P.lemon,[Math.PI/2,0,0]);disc(arm,0,-.32,.31,.042,.048,P.blue)}
  }
  const h=joint('head',[0,.866,.01])
  h.add('soft',[0,0,0],engineer?[.65,.45,.58]:[.66,.48,.56],P.white)
  face(h,.284,.55,.30)
  for(const s of [-1,1])h.add('rod',[s*.322,.008,0],[.126,.088,.126],shell,[0,0,Math.PI/2])
  if(engineer){
    h.add('soft',[0,.236,-.01],[.61,.11,.52],P.coral)
    h.beam([.22,.22,-.15],[.29,.44,-.16],.028,P.iron)
    h.add('bud',[.29,.45,-.16],[.064,.065,.064],P.mint)
    disc(h,-.125,.015,.318,.113,.053,P.amber);disc(h,-.125,.014,.355,.074,.025,P.light)
  }else{
    h.add('ball',[0,.215,-.012],[.343,.162,.307],P.lemon)
    h.add('soft',[0,.203,.056],[.73,.061,.686],P.amber)
    h.add('soft',[0,.331,-.013],[.087,.091,.44],P.lemon)
  }
  return parts
}
function face(h:Model,z:number,w:number,height:number){
  h.add('soft',[0,0,z],[w,height,.087],P.ink)
  for(const s of [-1,1])h.add('ball',[s*w*.228,.016,z+.052],[.047,.063,.021],P.light)
  h.add('soft',[0,-.065,z+.052],[.074,.017,.018],P.teal)
}
export function droneRig(){
  const parts:RobotJoint[]=[]
  const m=new Model()
  parts.push({joint:'body',at:[0,0,0],side:0,model:m})
  m.add('ball',[0,.21,0],[.319,.223,.29],P.white)
  m.add('soft',[0,.16,.173],[.43,.225,.247],P.teal)
  face(m,.307,.34,.154)
  m.add('soft',[0,.385,-.01],[.28,.085,.29],P.coral)
  for(const sx of [-1,1]){
    m.beam([sx*.17,.11,-.1],[sx*.24,.015,-.1],.036,P.navy)
    m.add('soft',[sx*.23,.005,0],[.093,.068,.33],P.navy)
    for(const sz of [-1,1]){
      const x=sx*.375,z=sz*.30
      m.beam([sx*.12,.23,sz*.09],[x,.32,z],.052,P.teal)
      m.add('rod',[x,.33,z],[.088,.113,.088],P.navy)
      const rotor=new Model();rotor.add('soft',[0,0,0],[.48,.033,.066],P.iron);rotor.add('bud',[0,.019,0],[.065,.04,.065],P.lemon)
      parts.push({joint:'rotor',at:[x,.415,z],side:sx*sz,model:rotor})
    }
  }
  return parts
}
export function jointMotion(j:RobotJoint,r:Robot,t:number):V3{
  const swing=Math.sin(r.stride)*Math.min(r.speed,1),s=j.side
  const busy=r.tool>0||r.duty==='collect'||r.duty==='assemble'||r.duty==='repair'
  if(j.joint==='foot')return [s*swing*.48,0,0]
  if(j.joint==='arm')return [busy?-.96+.23*Math.sin(t*8+r.phase):r.duty==='handoff'?-.98:-s*swing*.43,0,-s*.055]
  if(j.joint==='head')return [busy?.11:0,.15*Math.sin(t*1.6+r.phase),.035*Math.sin(t*1.1+r.phase)]
  if(j.joint==='wheel')return [r.stride*1.3,0,0]
  if(j.joint==='rotor')return [0,t*(r.duty==='charge'&&r.arrived?1.3:33)*s+r.phase,0]
  return [0,0,0]
}
