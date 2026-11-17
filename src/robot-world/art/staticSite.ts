import { Model, TAU, type V3 } from '../../world/modeling.ts'
import { airPads, CENTRE, CRANE, docks, palette as P, relays, service, sources, upperDock } from '../site/layout.ts'

import {yardEquipment} from './equipment.ts'

function cylinder(m:Model,at:V3,r:number,h:number,color:string){m.add('rod',at,[r,h,r],color)}
function panel(m:Model,at:V3,w:number,h:number,d:number,color:string){m.add('soft',at,[w,h,d],color)}
function bollard(m:Model,x:number,z:number){
  cylinder(m,[x,.08,z],.17,.15,P.ink)
  cylinder(m,[x,.38,z],.089,.60,P.lemon)
  cylinder(m,[x,.51,z],.097,.11,P.navy)
  m.add('bud',[x,.70,z],[.105,.075,.105],P.white)
}
function rail(m:Model,a:V3,b:V3,color=P.lemon){
  const n=Math.max(1,Math.ceil(Math.hypot(b[0]-a[0],b[2]-a[2])/1.18))
  for(let i=0;i<=n;i++){
    const x=a[0]+(b[0]-a[0])*i/n,z=a[2]+(b[2]-a[2])*i/n
    m.beam([x,a[1],z],[x,a[1]+.58,z],.042,P.navy)
  }
  for(const h of [.28,.58])m.beam([a[0],a[1]+h,a[2]],[b[0],b[1]+h,b[2]],.043,color)
}
function hazard(m:Model,x:number,y:number,z:number,count:number,spacing=.27){
  for(let i=0;i<count;i++)m.add('box',[x+i*spacing,y,z],[.115,.025,.36],i%2?P.ink:P.lemon,[0,-.52,0])
}
function chassis(m:Model){
  panel(m,[0,-.86,0],21.25,1.47,21.25,P.navy)
  panel(m,[0,-.34,0],21.53,.55,21.53,P.teal)
  panel(m,[0,-.09,0],21.64,.18,21.64,'#b6c5b5')
  for(let side=0;side<4;side++){
    const rim=new Model()
    for(let i=-4;i<=4;i++){
      panel(rim,[i*2.29,-.86,10.58],2.21,.74,.22,i%3?'#4b6875':'#688188')
      panel(rim,[i*2.29,-.54,10.71],1.72,.061,.066,P.lemon)
      for(const x of [-.94,.94])rim.add('rod',[i*2.29+x,-.86,10.72],[.065,.069,.065],P.iron,[Math.PI/2,0,0])
    }
    for(const x of [-8.8,8.8]){panel(rim,[x,-1.41,10.42],1.9,.28,.51,P.ink);panel(rim,[x,-1.36,10.67],1.12,.09,.12,P.mint)}
    m.place(rim,[0,0,0],side*Math.PI/2)
  }
  const deck=[-8.7,-6.6,-4.5,-2.4,-.3,1.8,3.9,6,8.1]
  for(const x of deck){
    m.add('box',[x,.009,8.52],[.021,.012,3.5],'#859e99')
    for(const z of [8.49,9.74])m.add('rod',[x+.1,.021,z],[.044,.017,.044],P.iron)
  }
  for(const z of [7.8,9.65])m.add('box',[0,.011,z],[19.7,.015,.023],'#8da5a1')
}
function workshop(m:Model,x:number,z:number,repair:boolean){
  const b=new Model(),w=repair?3.25:3.56,d=repair?2.72:3.8,h=repair?1.85:2.4
  panel(b,[0,.13,0],w+.27,.26,d+.27,P.iron)
  panel(b,[0,h/2+.2,0],w,h,d,repair?'#e29b60':'#6ab6ac')
  panel(b,[0,h+.27,0],w+.33,.32,d+.28,P.white)
  panel(b,[0,h+.46,0],w+.15,.11,d+.12,repair?P.coral:P.teal)
  panel(b,[0,h*.47,d/2+.035],w*.68,h*.7,.12,P.ink)
  for(let i=0;i<6;i++)panel(b,[0,h*.28+i*.15,d/2+.11],w*.59,.105,.08,repair?'#63939a':'#9db9ad')
  panel(b,[0,h*.88,d/2+.12],w*.86,.32,.15,P.navy)
  for(const side of [-1,1]){
    panel(b,[side*(w/2-.13),h*.51,d/2+.08],.17,h*.87,.16,P.white)
    for(let j=0;j<4;j++)panel(b,[side*(w/2+.02),h*.61,-d*.35+j*d*.225],.1,.42,.49,P.navy)
  }
  for(const px of [-.88,.58]){
    panel(b,[px,h+.65,-.17],.88,.28,.77,P.iron)
    for(let j=0;j<5;j++)b.add('box',[px-.29+j*.143,h+.81,-.17],[.072,.043,.59],P.navy)
  }
  b.beam([-w*.36,h+.42,-d*.32],[-w*.36,h+1.24,-d*.32],.032,P.ink)
  b.add('bud',[-w*.36,h+1.24,-d*.32],[.092,.092,.092],P.coral)
  m.place(b,[x,0,z],repair?-.14:.1)
}
function platform(m:Model){
  const [x,,z]=CENTRE
  for(const [r,h,y,c] of [[3.75,.24,.12,P.iron],[3.6,.3,.35,P.coral],[3.51,.19,.57,P.navy],[3.37,.08,.66,'#dae0ca']] as const)cylinder(m,[x,y,z],r,h,c)
  for(let i=0;i<40;i++){
    const a=i/40*TAU,r=3.07
    m.add('box',[x+r*Math.sin(a),.709,z+r*Math.cos(a)],[i%5?.056:.12,.018,i%5?.22:.38],i%5?P.steel:P.coral,[0,a,0])
  }
  for(const s of [-1,1]){
    panel(m,[s*.88,.78,z],1.61,.17,1.85,P.iron)
    for(const t of [-1,1])panel(m,[s*.88+t*.66,.91,z+.43],.17,.16,.66,P.lemon)
  }
  for(const side of [-1,1]){
    const sx=side*2.83
    for(const ez of [-2.95,-.67]){
      for(const ex of [-.4,.4])m.beam([sx+ex,.22,ez],[sx+ex,6.13,ez],.064,P.iron)
    }
    for(const h of [1.6,3.26,5.05]){
      panel(m,[sx,h,-1.82],1.04,.13,2.64,P.iron)
      panel(m,[sx,h+.095,-1.82],1.09,.064,2.7,P.lemon)
      rail(m,[sx+side*.44,h+.13,-3.05],[sx+side*.44,h+.13,-.57])
      for(const dz of [-1,1])m.beam([sx+side*.41,h-.1,-1.82+dz*1.1],[sx+side*.41,h-1.43,-1.82-dz*1.1],.037,P.steel)
    }
    const lx=sx-side*.36
    for(const dx of [-.18,.18])m.beam([lx+dx,.29,-.42],[lx+dx,5.71,-.42],.033,P.iron)
    for(let j=0;j<17;j++)m.beam([lx-.18,.42+j*.31,-.42],[lx+.18,.42+j*.31,-.42],.028,P.lemon)
  }
  const [ux,uy,uz]=upperDock
  panel(m,[ux,uy-.12,uz],1.45,.24,1.47,P.teal)
  for(const s of [-1,1])m.beam([ux+s*.58,.13,uz-.44],[ux+s*.58,uy-.11,uz-.44],.075,P.iron)
}
function mast(m:Model){
  const [x,h,z]=CRANE
  panel(m,[x,.31,z],1.67,.61,1.67,P.navy)
  for(const sx of [-.37,.37])for(const sz of [-.37,.37])m.beam([x+sx,.54,z+sz],[x+sx,h-.36,z+sz],.082,P.lemon)
  for(let y=.62;y<h-.7;y+=.88){
    for(const s of [-1,1]){
      m.beam([x-.37,y,z+s*.37],[x+.37,y+.86,z+s*.37],.05,P.amber)
      m.beam([x+s*.37,y,z-.37],[x+s*.37,y+.86,z+.37],.05,P.amber)
    }
    panel(m,[x,y,z],.91,.07,.91,P.lemon)
  }
  cylinder(m,[x,h-.26,z],.68,.26,P.navy)
  panel(m,[x-.61,h-.85,z],.82,.94,.94,P.lemon)
  panel(m,[x-.61,h-.79,z+.46],.63,.49,.04,P.ink)
}
export function createSite(){
  const m=new Model();chassis(m);platform(m);mast(m)
  workshop(m,-8.28,-6.76,false);workshop(m,8.23,5.6,true)
  // The warehouse feeds three live loading bays beside the one-way service road.
  for(const b of sources){
    const [x,,z]=b.point
    panel(m,[x-.87,.24,z],1.94,.44,1.15,P.iron)
    for(let j=0;j<8;j++)m.add('rod',[x-1.76+j*.23,.51,z],[.088,1.18,.088],j%2?P.steel:P.navy,[Math.PI/2,0,0])
    for(const s of [-1,1])panel(m,[x-.89,.51,z+s*.64],2.13,.2,.13,P.lemon)
  }
  relays.forEach((b,i)=>{
    const [x,,z]=b.point
    panel(m,[x,.05,z],2.26,.10,1.59,'#8baba8')
    hazard(m,x-.87,.115,z+.66,7)
    if(i===0)bollard(m,x-1.22,z+.72)
  })
  for(const b of docks){
    const [x,,z]=b.point
    panel(m,[x,.045,z],1.96,.09,1.39,P.steel)
    hazard(m,x-.74,.105,z-.53,6)
  }
  for(const [x,y,z] of airPads){
    cylinder(m,[x,.22,z],.78,.41,P.iron)
    cylinder(m,[x,.47,z],.72,.13,P.teal)
    cylinder(m,[x,y-.015,z],.56,.05,P.navy)
    for(let i=0;i<8;i++){
      const a=TAU*i/8
      m.add('box',[x+.61*Math.cos(a),y+.012,z+.61*Math.sin(a)],[.19,.032,.074],P.light,[0,-a,0])
    }
  }
  for(const b of service){
    const [x,,z]=b.point
    panel(m,[x+.87,.62,z],.55,1.24,.85,P.white)
    panel(m,[x+.56,.79,z],.10,.51,.53,P.ink)
    for(let j=0;j<3;j++)panel(m,[x+.49,.66+j*.12,z],.039,.062,.31,P.mint)
  }
  for(const [x,z] of [[-8.7,4.55],[-8.39,6.24],[-9.26,7.31],[7.62,-9.54],[-6.51,-8.78]]){
    panel(m,[x,.42,z],1.29,.83,1.03,P.coral)
    for(const dx of [-.44,.44])panel(m,[x+dx,.43,z],.105,.87,1.07,P.white)
    panel(m,[x,.47,z+.526],.46,.26,.03,P.navy)
  }
  for(const [x,z] of [[-9.8,-2.7],[9.5,2.78],[-5.7,8.76],[4.7,-8.96]]){
    cylinder(m,[x,.13,z],.25,.26,P.iron);m.beam([x,.24,z],[x,2.96,z],.057,P.navy)
    m.beam([x,2.94,z],[x+.49,3.16,z],.056,P.navy)
    panel(m,[x+.49,3.14,z],.67,.15,.34,P.lemon)
    panel(m,[x+.49,3.05,z],.55,.043,.28,'#fff1c7')
  }
  for(const x of [-9,-7.7,4.5,5.83,7.16,8.49])bollard(m,x,9.74)
  for(const [x,z] of [[-7.4,8.65],[5,8.45],[-7.88,-9.33],[9.2,1.8]]){
    for(let j=0;j<3;j++){
      const px=x+j*.34
      panel(m,[px,.05,z],.28,.1,.28,P.navy)
      m.add('cone',[px,.24,z],[.118,.41,.118],P.coral)
      cylinder(m,[px,.25,z],.074,.068,P.white)
    }
  }
  yardEquipment(m)
  return m
}
