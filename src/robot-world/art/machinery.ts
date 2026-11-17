import {Model,TAU} from '../../world/modeling.ts'
import {palette as P,CRANE_REACH} from '../site/layout.ts'
export function craneModels(){
  const jib=new Model(),trolley=new Model(),hook=new Model()
  // Build along local +Z so azimuth and trolley travel describe the hook position.
  const start=-2.07,end=CRANE_REACH
  for(const s of [-1,1])jib.beam([s*.29,0,start],[s*.29,0,end],.073,P.lemon)
  jib.beam([0,.50,start],[0,.50,end],.072,P.lemon)
  for(let i=0;i<16;i++){
    const z=start+i*(end-start)/16,n=start+(i+1)*(end-start)/16
    for(const s of [-1,1]){jib.beam([s*.29,0,z],[0,.50,n],.035,P.amber);jib.beam([0,.50,z],[s*.29,0,n],.035,P.amber)}
    jib.beam([-.29,0,z],[.29,0,z],.034,P.iron)
  }
  jib.add('soft',[0,-.02,-1.57],[1.05,.71,1.19],P.teal)
  for(const s of [-1,1])jib.add('soft',[s*.47,.03,-1.57],[.13,.77,1.19],P.white)
  jib.add('bud',[0,.64,end],[.11,.16,.11],P.coral)
  trolley.add('soft',[0,-.04,0],[.74,.30,.77],P.navy)
  trolley.add('rod',[0,-.22,0],[.19,.59,.19],P.coral,[0,0,Math.PI/2])
  hook.add('soft',[0,.18,0],[.53,.31,.39],P.lemon)
  for(let i=0;i<3;i++)hook.add('box',[-.16+i*.16,.18,.202],[.071,.29,.023],P.ink,[0,0,-.29])
  for(const s of [-1,1]){hook.beam([s*.19,.09,0],[s*.25,-.01,0],.047,P.navy);hook.beam([s*.25,-.01,0],[s*.13,-.11,0],.045,P.navy)}
  return {jib,trolley,hook}
}
export function generatorRotor(){
  const m=new Model()
  for(let i=0;i<8;i++){
    const a=i/8*TAU
    m.add('soft',[.29*Math.cos(a),0,.29*Math.sin(a)],[.32,.046,.12],P.steel,[0,-a+.45,0])
  }
  m.add('rod',[0,.026,0],[.14,.085,.14],P.lemon);return m
}
