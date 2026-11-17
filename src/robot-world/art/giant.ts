import {Model,TAU,type V3} from '../../world/modeling.ts'
import {palette as P,CENTRE} from '../site/layout.ts'
import type {BlueprintPart} from '../assembly/blueprint'

export function disc(m:Model,x:number,y:number,z:number,r:number,d:number,c:string){
  m.add('rod',[x,y,z],[r,d,r],c,[Math.PI/2,0,0])
}
function bolt(m:Model,x:number,y:number,z:number,r=.067){disc(m,x,y,z,r,.044,P.iron)}
export function giantFrame(){
  const m=new Model()
  for(const s of [-1,1]){
    const x=s*.89
    m.add('soft',[x,1.03,.04],[1.02,.32,1.29],P.navy)
    for(const dx of [-.22,.22])m.beam([x+dx,1.17,-.08],[x+dx*.61,3.75,-.04],.11,P.steel)
    for(const y of [1.34,2.58,3.6]){m.add('rod',[x,y,-.04],[.385,.18,.37],P.iron);disc(m,x,y,.32,.16,.08,P.amber)}
    m.beam([s*.57,4.1,-.02],[s*1.19,6.12,-.08],.12,P.iron)
    m.beam([s*1.13,6.14,-.08],[-s*.55,4.42,-.08],.066,P.steel)
    m.add('rod',[s*1.43,6.17,0],[.30,.37,.30],P.iron,[0,0,Math.PI/2])
    for(const y of [4.9,5.47,6.02])m.add('soft',[s*.85,y,-.08],[.94,.12,.61],P.iron,[0,0,-s*.11])
    m.add('ball',[s*1.49,6.12,-.05],[.43,.43,.44],P.navy)
    disc(m,s*1.46,6.12,.33,.258,.12,P.amber)
    disc(m,s*1.46,6.12,.414,.146,.072,P.iron)
    m.add('ball',[s*.78,3.59,-.03],[.4,.38,.39],P.iron)
    m.beam([x-.13,1.38,.17],[x-.13,2.35,.17],.152,P.teal)
    m.beam([s*.83,2.65,.13],[s*.70,3.44,.13],.145,P.amber)
    for(let k=0;k<9;k++){
      const at=(t:number):V3=>[s*(.75+.32*Math.sin(t*Math.PI)),4.11+t*1.9,.22+.23*Math.sin(t*Math.PI*1.5)]
      m.beam(at(k/9),at((k+1)/9),.063,s<0?P.coral:P.teal)
    }
    for(const y of [4.99,5.62]){
      m.beam([s*1.16,y+.14,-.16],[s*.85,y,.38],.105,P.steel)
      m.beam([s*.85,y,.38],[s*.38,y-.14,.4],.105,P.iron)
    }
  }
  disc(m,0,5.52,.43,.53,.19,P.navy);disc(m,0,5.52,.54,.4,.09,P.iron)
  for(let j=0;j<8;j++)disc(m,.29*Math.sin(j*TAU/8),5.52+.29*Math.cos(j*TAU/8),.60,.053,.035,P.amber)
  m.add('soft',[0,3.77,-.04],[1.94,.43,.83],P.navy)
  m.add('rod',[0,5.14,-.13],[.31,2.54,.31],P.navy)
  for(let j=0;j<11;j++)m.add('rod',[0,4.22+j*.208,-.13],[.35,.076,.35],j%2?P.teal:P.steel)
  m.add('soft',[0,6.18,0],[3.28,.29,.67],P.iron)
  m.add('rod',[0,6.66,-.03],[.35,.72,.35],P.steel)
  m.add('soft',[0,7.28,-.09],[1.41,.85,1.05],P.iron)
  m.add('ball',[0,7.65,-.08],[.65,.32,.49],P.steel)
  for(let j=0;j<4;j++)m.add('soft',[-.46+j*.30,7.76,-.11],[.073,.11,.62],P.navy)
  m.add('soft',[0,7.39,.44],[1.28,.54,.15],P.ink)
  for(const s of [-1,1])disc(m,s*.35,7.41,.53,.14,.056,P.steel)
  const result=new Model();result.place(m,CENTRE);return result
}
export function moduleModel(p:BlueprintPart){
  const m=new Model(),s=p.side||1
  const box=(at:V3,size:V3,c:string,rot:V3=[0,0,0])=>m.add('soft',at,size,c,rot)
  switch(p.kind){
    case 'boot':
      box([0,-.12,0],[1.45,.45,1.72],P.navy);box([0,.105,.08],[1.39,.50,1.61],P.teal)
      m.add('ball',[0,.13,.59],[.64,.235,.37],P.white)
      for(const dx of [-.44,0,.44])box([dx,-.19,.85],[.17,.13,.08],P.steel)
      box([s*.56,.36,-.19],[.19,.23,.70],P.lemon);break
    case 'shin':
      box([0,0,0],[1.08,1.22,1.03],P.white);box([0,-.12,.47],[.85,.83,.22],P.teal)
      box([0,-.12,.6],[.13,.59,.04],P.mint)
      disc(m,0,.40,.52,.325,.15,P.navy);disc(m,0,.40,.62,.232,.10,P.lemon)
      for(const x of [-.41,.41])bolt(m,x,-.46,.48);break
    case 'thigh':
      box([0,0,0],[1.0,.83,.94],P.iron);box([s*.13,.06,.3],[.91,.68,.54],P.white,[0,0,s*.11])
      box([s*.49,-.02,.06],[.18,.48,.65],P.coral);break
    case 'pelvis':
      box([0,0,0],[2.09,.73,1.26],P.teal);box([0,-.10,.59],[1.15,.53,.22],P.white)
      for(const j of [-1,1])box([j*.83,.02,.50],[.35,.52,.29],P.mint,[0,0,-j*.14]);break
    case 'belt':
      box([0,0,0],[1.73,.30,1.22],P.navy);box([0,0,.62],[.62,.26,.13],P.lemon)
      for(const j of [-1,1])box([j*.62,.01,.61],[.28,.1,.12],P.steel);break
    case 'chest':
      box([0,0,0],[1.44,1.70,1.37],P.white,[0,0,-s*.055])
      box([s*.12,.43,.48],[1.32,.78,.68],P.teal,[0,0,s*.08])
      box([s*.34,-.41,.69],[.58,.43,.10],P.navy)
      for(let j=0;j<4;j++)box([s*.34,-.56+j*.095,.76],[.45,.045,.042],P.steel)
      box([s*.08,.44,.825],[.63,.12,.047],P.mint)
      for(let k=0;k<3;k++)box([s*(.24+k*.16),.15,.72],[.081,.18,.04],P.amber,[0,0,-.43])
      for(const x of [-.46,.46])bolt(m,x,-.70,.7);break
    case 'collar':
      box([0,0,0],[2.31,.29,1.25],P.navy);box([0,.12,.34],[1.64,.19,.64],P.white)
      m.add('rod',[0,.18,-.05],[.51,.25,.51],P.iron);break
    case 'shoulder':
      m.add('ball',[0,-.13,0],[.53,.53,.55],P.navy)
      box([s*.025,.14,0],[1.25,.88,1.35],P.coral,[0,0,s*.13])
      m.add('ball',[s*.035,.39,-.02],[.63,.39,.67],P.coral)
      box([s*.50,.06,.04],[.22,.63,1.12],P.white,[0,0,s*.13])
      disc(m,0,.1,.66,.22,.072,P.white);disc(m,0,.1,.71,.13,.05,P.amber);break
    case 'gauntlet':
      box([0,0,0],[1.03,1.13,1.15],P.teal,[0,0,s*.08]);box([0,-.27,.43],[.83,.52,.42],P.white)
      for(const y of [.17,.34])box([0,y,.58],[.57,.068,.06],P.mint)
      break
    case 'hand':
      box([0,.02,0],[.69,.45,.69],P.navy)
      for(let i=0;i<3;i++)box([(i-1)*.24,-.23,.12],[.19,.47,.55],P.iron)
      box([-s*.36,-.04,.19],[.23,.42,.37],P.lemon,[0,0,-s*.3]);break
    case 'helmet':
      box([0,0,0],[2.14,1.45,1.54],P.white)
      m.add('ball',[0,.47,-.04],[1.08,.54,.81],P.teal)
      box([0,.75,-.05],[.24,.29,1.01],P.coral)
      for(const j of [-1,1])box([j*.79,-.44,.64],[.37,.33,.29],P.lemon)
      box([0,-.56,.69],[.77,.17,.135],P.navy)
      for(let k=0;k<5;k++)box([(k-2)*.116,-.56,.766],[.043,.09,.023],P.steel)
      break
    case 'visor':
      box([0,0,-.04],[1.88,.78,.40],P.navy)
      box([0,.03,.13],[1.65,.55,.1],P.ink)
      box([0,-.30,.157],[.38,.055,.10],P.steel);break
    case 'ear':
      m.add('rod',[0,0,0],[.39,.22,.39],P.navy,[0,0,Math.PI/2])
      m.add('rod',[s*.11,0,0],[.30,.16,.30],P.lemon,[0,0,Math.PI/2])
      m.beam([s*.10,.12,-.04],[s*.20,.73,-.12],.049,P.iron)
      m.add('bud',[s*.20,.76,-.12],[.085,.096,.085],P.coral);break
    case 'eye':
      box([0,0,0],[.40,.29,.09],P.iron);box([0,0,.054],[.31,.21,.055],'#497779');break
    case 'reactor':
      disc(m,0,0,0,.57,.25,P.navy);disc(m,0,0,.14,.45,.14,P.lemon)
      disc(m,0,0,.22,.31,.11,P.teal)
      for(let i=0;i<8;i++)bolt(m,.49*Math.cos(i*TAU/8),.49*Math.sin(i*TAU/8),.14,.046)
  }
  return m
}
