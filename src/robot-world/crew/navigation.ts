import {airPads,makeBay,roadAt,ROAD_LENGTH,wrapRoad,type Bay} from '../site/layout.ts'
import type {V3} from '../../world/modeling'
import type {Robot,Role} from './types'
const distance=(a:V3,b:V3)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])
const turn=(a:number,b:number,dt:number)=>a+Math.max(-dt*5,Math.min(dt*5,Math.atan2(Math.sin(b-a),Math.cos(b-a))))
export function makeCrew(seed:number,count=28):Robot[]{
  const crew:Robot[]=[]
  for(let i=0;i<count;i++){
    const role:Role=i>=count-6?'drone':i%5===0?'transport':i%4===0?'engineer':'worker'
    const lane=0,capacity=Math.max(32,count-4),slot=Math.floor(i*capacity/(count-6)),s=wrapRoad(slot/capacity*ROAD_LENGTH+seed%13*.07)
    const p=roadAt(s,lane),pad=i-(count-6)
    const pos:V3=role==='drone'?[...airPads[pad]]:[p.x,.044,p.z]
    crew.push({id:i,role,duty:role==='drone'?'charge':'patrol',pos,yaw:Math.atan2(p.dx,p.dz),speed:0,stride:i,phase:i*2.39+seed*.04,
      s,lane,slot:role==='drone'?-1:slot,offset:lane,bay:null,berth:null,entry:null,departure:null,parked:false,leaving:false,order:-1,scan:-1,wait:0,charge:1,flight:[],pad,arrived:role==='drone',tool:0})
  }
  return crew
}

export function groundGoal(r:Robot,bay:Bay|null){
  r.bay=bay
  r.arrived=!!bay&&r.slot<0&&r.berth?.id===bay.id
  r.leaving=r.slot<0&&!r.arrived
  r.parked=r.slot<0
}
export function gatherBay(r:Robot,groundCount:number){
  const side=r.id%4,index=Math.floor(r.id/4),count=Math.ceil((groundCount-side)/4)
  const axis=count===1?0:-3.62+7.24*index/(count-1)
  const pos=side===0?[axis,5.62]:side===1?[5.82,axis]:side===2?[axis,-5.62]:[-5.82,axis]
  let s=0,best=Infinity
  for(let t=0;t<ROAD_LENGTH;t+=.03){const p=roadAt(t),d=Math.hypot(p.x-pos[0],p.z-pos[1]);if(d<best){best=d;s=t}}
  return makeBay('audience-'+r.id,s,index%2?1.29:-1.30)
}
const smooth=(v:number)=>{const t=Math.max(0,Math.min(1,v));return t*t*(3-2*t)}
// A reservation travels with each vehicle on the marked one-way circuit. A parked
// vehicle returns its slot and re-enters with the next vacant one passing its bay.
export class YardTraffic{
  private phase:number
  private capacity:number
  private ground:Robot[]
  constructor(crew:Robot[],seed:number){
    this.ground=crew.filter(r=>r.role!=='drone');this.capacity=Math.max(32,this.ground.length+2);this.phase=seed%13*.07
  }
  step(dt:number){
    const step=3.38*dt,turnout=1.26
    this.phase=wrapRoad(this.phase+step)
    const slotAt=(slot:number)=>wrapRoad(this.phase+slot*ROAD_LENGTH/this.capacity)
    const used=new Set(this.ground.filter(r=>r.slot>=0).map(r=>r.slot))
    for(const r of this.ground){
      if(r.slot>=0||!r.leaving||!r.berth)continue
      for(let slot=0;slot<this.capacity;slot++){
        if(used.has(slot)||wrapRoad(slotAt(slot)-r.s)>step+.0001)continue
        r.slot=slot;used.add(slot);r.departure=r.berth;r.parked=false;r.leaving=false;break
      }
    }
    for(const r of this.ground){
      if(r.slot<0){r.speed=0;continue}
      let s=slotAt(r.slot),offset=0
      if(r.departure){
        const progress=wrapRoad(s-r.departure.s)/turnout
        offset=r.departure.offset*(1-smooth(progress))
        if(progress>=1){r.departure=null;r.berth=null}
      }else{
        if(!r.entry&&r.bay&&wrapRoad(r.bay.s-s)<=turnout){
          const bay=r.bay
          const occupied=this.ground.some(o=>o!==r&&((o.berth&&o.berth.id===bay.id)||(o.entry&&o.entry.id===bay.id)))
          if(!occupied)r.entry=bay
        }
        if(r.entry){
          const remaining=wrapRoad(r.entry.s-s)
          if(wrapRoad(s-r.entry.s)<=step+.0001){
            s=r.entry.s;offset=r.entry.offset;r.berth=r.entry;r.entry=null;r.slot=-1
            r.parked=true;r.arrived=r.bay?.id===r.berth.id;r.leaving=!r.arrived
          }else offset=r.entry.offset*smooth(1-remaining/turnout)
        }
      }
      const p=roadAt(s,offset),next:V3=[p.x,.046,p.z]
      const moved=distance(next,r.pos)
      if(moved>.0001)r.yaw=turn(r.yaw,Math.atan2(next[0]-r.pos[0],next[2]-r.pos[2]),dt)
      r.s=s;r.offset=offset;r.pos=next;r.speed=moved/dt;r.stride+=moved*7
    }
  }
}
function clear(r:Robot,next:V3,crew:Robot[],radius:number){
  return !crew.some(o=>{
    if(o===r||((o.role==='drone')!==(r.role==='drone')))return false
    const d=distance(next,o.pos)
    return d<radius && d<distance(r.pos,o.pos)-.00001
  })
}
// Aircraft travel around the front and starboard faces of the build envelope.
// The vertical approach is confined to a reserved handoff pad or inspection perch.
export function flightPlan(from:V3,to:V3,pad:number):V3[]{
  const altitude=4.55+pad*.91
  const right=6.82+pad*.39,front=4.45+pad*.35
  const path:V3[]=[]
  const add=(p:V3)=>{if(distance(path.at(-1)??from,p)>.045)path.push(p)}
  add([from[0],altitude,from[2]])
  if(from[2]<3.5){add([right,altitude,from[2]]);add([right,altitude,front])}
  else add([from[0],altitude,front])
  if(to[2]<3.5){add([right,altitude,front]);add([right,altitude,to[2]])}
  else add([to[0],altitude,front])
  add([to[0],altitude,to[2]]);add([...to])
  return path
}
export function flyTo(r:Robot,p:V3){
  r.flight=flightPlan(r.pos,p,r.pad);r.arrived=false;r.parked=false
}
export function moveDrone(r:Robot,crew:Robot[],dt:number){
  const wp=r.flight[0]
  if(!wp){r.speed=0;return}
  const dist=distance(r.pos,wp),step=Math.min(dist,dt*(r.order>=0?3.4:2.95))
  const next=r.pos.map((v,i)=>v+(wp[i]-v)*step/(dist||1)) as V3
  if(!clear(r,next,crew,.73)){
    // Slide around a crossing flight instead of waiting in its descent column.
    const dx=wp[0]-r.pos[0],dz=wp[2]-r.pos[2],length=Math.hypot(dx,dz)
    const sx=length>.01?dz/length:Math.cos(r.phase),sz=length>.01?-dx/length:Math.sin(r.phase)
    for(const sign of [1,-1]){
      const side:V3=[r.pos[0]+sign*sx*dt*1.75,r.pos[1],r.pos[2]+sign*sz*dt*1.75]
      if(clear(r,side,crew,.73)){r.pos=side;break}
    }
    r.speed=0;return
  }
  if(Math.hypot(wp[0]-r.pos[0],wp[2]-r.pos[2])>.02)r.yaw=turn(r.yaw,Math.atan2(wp[0]-r.pos[0],wp[2]-r.pos[2]),dt)
  r.pos=next;r.speed=step/dt;r.stride+=step
  if(dist-step<.015){r.flight.shift();if(!r.flight.length)r.arrived=true}
}
