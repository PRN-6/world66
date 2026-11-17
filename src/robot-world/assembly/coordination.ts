import { blueprint, type BlueprintPart, STAGES } from './blueprint.ts'
import { airPads, CRANE, craneConsole, docks, makeBay, relays, ROAD_LENGTH, roadAt, service, sources, toolBays, upperDock, upperInspector, wrapRoad, type Bay } from '../site/layout.ts'
import { flyTo, gatherBay, groundGoal, makeCrew, moveDrone, YardTraffic } from '../crew/navigation.ts'
import type { Duty, Robot } from '../crew/types'
import type { V3 } from '../../world/modeling'

export type OrderState='missing'|'ordered'|'collecting'|'at-relay'|'in-transit'|'delivered'|'verified'|'rigging'|'attached'
export type CargoMode='hidden'|'loose'|'gripped'|'attached'
export interface Order{
  index:number;spec:BlueprintPart;state:OrderState;mode:CargoMode;pos:V3;target:V3;floor:number;under:number;top:number
  settled:boolean;scanned:boolean;drop:number;owner:number;source:number;relay:number;dock:number;inspector:number;installer:number;carrier:number;collector:number
}
export interface ConstructionEvent {type:'survey'|'scan'|'pickup'|'handoff'|'delivery'|'inspection'|'installation'|'repair'|'activation';order:number;robot:number;time:number}
export interface WorksiteOptions{seed?:number;crewSize?:number;onEvent?:(event:ConstructionEvent)=>void}
export const stageNames=STAGES
const inspectorBay=makeBay('blueprint survey',ROAD_LENGTH*.65,1.48)
const groupCount=(crew:Robot[])=>crew.filter(r=>r.role!=='drone').length
const dist=(a:V3,b:V3)=>Math.hypot(a[0]-b[0],a[1]-b[1],a[2]-b[2])
const clamp=(v:number,a:number,b:number)=>Math.max(a,Math.min(v,b))
export function loadPoint(b:Bay):V3{
  const p=roadAt(b.s,b.offset+Math.sign(b.offset)*.72)
  return [p.x,b.id.startsWith('stock')?.61:b.id.startsWith('dock')?.105:.112,p.z]
}
export function deliveryPoint(o:Order):V3{return o.spec.air?[...upperDock]:loadPoint(docks[o.dock])}
function approach(a:V3,b:V3,speed:number):boolean{
  const d=dist(a,b),f=Math.min(1,speed/(d||1))
  for(let k=0;k<3;k++)a[k]+=(b[k]-a[k])*f
  return d<=speed+.008
}
export class ConstructionSite{
  crew:Robot[]
  orders:Order[]
  time=0;stage=0;activation=0;completed=false;survey=-1
  crane={job:-1,operator:-1,step:0,hook:[2.8,8.82,-3.84] as V3}
  machines=service.map((_,i)=>({wear:.58+i*.12,technician:-1,repairs:0}))
  private decision=0
  private preparedKits=0
  private traffic:YardTraffic
  private listener?:WorksiteOptions['onEvent']
  constructor(options:WorksiteOptions={}){
    this.crew=makeCrew(options.seed??2,clamp(Math.round(options.crewSize??28),24,48))
    this.traffic=new YardTraffic(this.crew,options.seed??2)
    this.listener=options.onEvent
    this.orders=blueprint.map((spec,index)=>({index,spec,state:spec.stage===0?'ordered':'missing',mode:'hidden',
      pos:[0,-5,0],target:[0,0,0],floor:0,under:.44,top:.45,settled:false,scanned:false,drop:0,owner:-1,source:-1,relay:-1,dock:-1,inspector:-1,installer:-1,carrier:-1,collector:-1}))
  }
  private event(type:ConstructionEvent['type'],order:number,robot:number){
    this.listener?.({type,order,robot,time:this.time})
  }
  private availableBay(b:Bay,except?:Robot){
    return !this.crew.some(r=>r!==except&&r.role!=='drone'&&
      (r.bay?.id===b.id||(r.leaving&&Math.min(wrapRoad(r.s-b.s),wrapRoad(b.s-r.s))<.82)))
  }
  private idle(r:Robot){return r.order<0&&(r.duty==='patrol'||r.duty==='standby'||r.duty==='charge'&&r.arrived&&r.charge>.38)}
  private nearest(role:Robot['role'],bay:Bay){
    const available=this.crew.filter(r=>r.role===role&&this.idle(r))
    return available.sort((a,b)=>role==='drone'?dist(a.pos,bay.point)-dist(b.pos,bay.point):wrapRoad(bay.s-a.s)-wrapRoad(bay.s-b.s))[0]
  }
  private send(r:Robot,duty:Duty,bay:Bay,order=-1){
    r.duty=duty;r.order=order;r.wait=0;r.tool=0
    if(r.role==='drone')flyTo(r,[bay.point[0],bay.floor+.99,bay.point[2]])
    else groundGoal(r,bay)
  }
  private release(r:Robot){
    r.order=-1;r.tool=0;r.wait=0
    if(r.role==='drone'){r.duty='charge';flyTo(r,[...airPads[r.pad]])}
    else {r.duty='patrol';groundGoal(r,null)}
  }
  private loose(o:Order,p:V3){
    o.floor=p[1];o.target=[p[0],p[1]+o.under+.20,p[2]]
    o.pos=[...o.target];o.owner=-1;o.mode='loose';o.settled=false;o.drop++
  }
  private pick(o:Order,r:Robot){
    o.mode='gripped';o.owner=r.id;o.settled=false
    this.event('pickup',o.index,r.id)
  }
  private dispatch(){
    if(this.completed)return
    if(this.crane.operator<0){
      const operator=this.nearest('transport',craneConsole)
      if(operator){this.crane.operator=operator.id;this.send(operator,'operate',craneConsole)}
    }
    // Installation and inspection get first access to crews and unloading docks.
    for(const o of this.orders){
      if(o.state!=='delivered'&&o.state!=='verified')continue
      const bay=o.spec.air?upperInspector:docks[o.dock]
      if(!o.settled||!this.availableBay(bay))continue
      if(o.state==='delivered'&&o.inspector<0){
        const engineer=this.nearest('engineer',bay)
        if(engineer){o.inspector=engineer.id;this.send(engineer,'inspect',bay,o.index)}
      }else if(o.state==='verified'&&o.installer<0){
        const rigger=this.nearest('worker',bay)
        if(rigger){o.installer=rigger.id;this.send(rigger,'assemble',bay,o.index)}
      }
    }
    for(const o of this.orders){
      if(o.state!=='at-relay'||!o.settled)continue
      const bay=relays[o.relay]
      if(!this.availableBay(bay))continue
      const dock=o.spec.air?3:docks.findIndex((_,i)=>!this.orders.some(p=>p.dock===i))
      if(dock<0||o.spec.air&&this.orders.some(p=>p.dock===3))continue
      const carrier=this.nearest(o.spec.air?'drone':'transport',bay)
      if(!carrier)continue
      o.carrier=carrier.id;o.dock=dock;o.state='in-transit'
      this.send(carrier,'haul',bay,o.index)
      if(carrier.role==='drone')flyTo(carrier,[o.pos[0],o.pos[1]+o.top+.37,o.pos[2]])
    }
    for(const o of this.orders){
      if(o.state!=='ordered')continue
      const source=sources.findIndex((b,i)=>!this.orders.some(p=>p.source===i)&&this.availableBay(b))
      const relay=relays.findIndex((_,i)=>!this.orders.some(p=>p.relay===i))
      if(source<0||relay<0)break
      const collector=this.nearest('worker',sources[source])
      if(!collector)break
      o.source=source;o.relay=relay;o.collector=collector.id;o.state='collecting'
      this.loose(o,loadPoint(sources[source]))
      this.send(collector,'search',sources[source],o.index)
    }
    if(this.orders.some(o=>o.spec.stage===this.stage&&o.state==='missing')&&this.survey<0){
      const engineer=this.nearest('engineer',inspectorBay)
      if(engineer){this.survey=engineer.id;this.send(engineer,'search',inspectorBay)}
    }
    for(let i=0;i<this.machines.length;i++){
      const machine=this.machines[i]
      if(machine.wear<.87||machine.technician>=0)continue
      // Keep a technician available for incoming inspections.
      if(this.crew.filter(r=>r.role==='engineer'&&this.idle(r)).length<2)break
      const engineer=this.nearest('engineer',service[i])
      if(engineer){machine.technician=engineer.id;this.send(engineer,'repair',service[i])}
    }
    for(const drone of this.crew.filter(r=>r.role==='drone'&&r.duty==='charge'&&r.arrived&&r.charge>=.97)){
      // Two survey flights at a time leave the remaining aircraft available for freight.
      if(this.crew.filter(r=>r.role==='drone'&&r.duty==='inspect'&&r.order<0).length>=2)break
      const missing=this.orders.find(o=>o.spec.stage===this.stage&&!o.scanned&&o.state!=='attached'&&!this.crew.some(r=>r.scan===o.index))
      if(!missing)break
      drone.duty='inspect';drone.wait=0;drone.scan=missing.index
      flyTo(drone,[2.45+drone.pad*.23,Math.max(3.35,missing.spec.socket[1])+.32*drone.pad,2.86+drone.pad*.24])
    }
    for(const bay of toolBays){
      if(!this.availableBay(bay))continue
      const idle=this.crew.filter(r=>r.role!=='drone'&&r.duty==='patrol'&&!r.leaving)
      if(idle.length<4)break
      idle.sort((a,b)=>wrapRoad(bay.s-a.s)-wrapRoad(bay.s-b.s))
      this.send(idle[0],'standby',bay)
    }
  }
  private robotWork(r:Robot,dt:number){
    r.tool=0
    if(r.role==='drone'){
      r.charge=clamp(r.charge+dt*(r.duty==='charge'&&r.arrived?.13:-.008),.04,1)
      moveDrone(r,this.crew,dt)
    }
    if(!r.arrived)return
    r.wait+=dt
    if(r.duty==='gather'){
      r.yaw=Math.atan2(-r.pos[0],-1.18-r.pos[2]);return
    }
    if(r.order<0){
      if(r.duty==='standby'){
        r.tool=this.preparedKits<8?1:0
        if(r.wait>3.6&&this.preparedKits<8){this.preparedKits++;r.wait=0}
      }else if(r.duty==='repair'){
        const machine=this.machines.find(m=>m.technician===r.id)
        r.tool=1
        if(machine&&r.wait>2.35){machine.wear=0;machine.repairs++;machine.technician=-1;this.event('repair',-1,r.id);this.release(r)}
      }else if(r.id===this.survey&&r.wait>.85){
        this.orders.filter(o=>o.spec.stage===this.stage&&o.state==='missing').forEach(o=>{o.state='ordered'})
        this.event('survey',-1,r.id);this.survey=-1;this.release(r)
      }else if(r.role==='drone'&&r.duty==='inspect'&&r.scan>=0){
        const target=this.orders[r.scan];r.tool=1;r.yaw=Math.atan2(target.spec.socket[0]-r.pos[0],target.spec.socket[2]-r.pos[2])
        if(r.wait>1.6){target.scanned=true;this.event('scan',target.index,r.id);r.scan=-1;this.release(r)}
      }
      return
    }
    const o=this.orders[r.order]
    if(r.duty==='search'){r.duty='collect';r.wait=0}
    else if(r.duty==='collect'&&o.settled&&r.wait>(this.preparedKits>0?.48:1.38)){
      this.preparedKits=Math.max(0,this.preparedKits-1)
      this.pick(o,r);o.source=-1;this.send(r,'handoff',relays[o.relay],o.index)
    }else if(r.duty==='handoff'&&r.wait>.46){
      this.loose(o,loadPoint(relays[o.relay]));o.state='at-relay'
      this.event('handoff',o.index,r.id);this.release(r)
    }else if(r.duty==='haul'&&o.settled&&r.wait>.48){
      this.pick(o,r);o.relay=-1;r.duty='deliver';r.wait=0
      if(r.role==='drone'){
        const p=deliveryPoint(o);flyTo(r,[p[0],p[1]+o.under+o.top+.48,p[2]])
      }else groundGoal(r,docks[o.dock])
    }else if(r.duty==='deliver'&&r.wait>.36){
      this.loose(o,deliveryPoint(o));o.state='delivered'
      this.event('delivery',o.index,r.id);this.release(r)
    }else if(r.duty==='inspect'){
      r.tool=1
      if(o.settled&&r.wait>(o.scanned?.82:1.8)){o.state='verified';this.event('inspection',o.index,r.id);this.release(r)}
    }else if(r.duty==='assemble'){
      r.tool=1
      if(this.crane.job<0&&o.state==='verified'&&this.crew[this.crane.operator]?.arrived){o.state='rigging';this.crane.job=o.index;this.crane.step=-1}
    }
  }
  private runCrane(dt:number){
    const c=this.crane
    if(c.job<0){
      const safe:V3=c.hook[1]<8.80?[c.hook[0],8.82,c.hook[2]]:[2.8,8.82,-3.84]
      approach(c.hook,safe,dt*2.7);return
    }
    const o=this.orders[c.job],goal=o.spec.socket,h=o.top+.14
    // Pick up, clear the receiving rack, slew in front of the socket, then seat it.
    const approachZ=goal[2]+1.42
    const clearance=Math.min(CRANE[1]-.68,Math.max(o.pos[1]+h,goal[1]+h)+1.34)
    let p:V3
    if(c.step<0)p=[o.pos[0],8.85,o.pos[2]]
    else if(c.step===0)p=[o.pos[0],o.pos[1]+h,o.pos[2]]
    else if(c.step===1)p=[c.hook[0],Math.max(o.target[1]+h+1.15,goal[1]+h+.94),c.hook[2]]
    else if(c.step===2)p=[goal[0],Math.max(goal[1]+h+.94,Math.min(c.hook[1],clearance)),approachZ]
    else if(c.step===3)p=[goal[0],goal[1]+h,approachZ]
    else p=[goal[0],goal[1]+h,goal[2]]
    const reached=approach(c.hook,p,dt*(c.step===4?1.48:4.35))
    if(c.step>0){o.pos=[c.hook[0],c.hook[1]-h,c.hook[2]]}
    if(!reached)return
    if(c.step===0){o.mode='gripped';o.owner=-2;o.target=[...o.pos]}
    c.step++
    if(c.step<=4)return
    o.pos=[...goal];o.mode='attached';o.state='attached';o.owner=-1;o.dock=-1;c.job=-1
    this.event('installation',o.index,o.installer);this.release(this.crew[o.installer])
    if(this.orders.filter(part=>part.spec.stage===this.stage).every(part=>part.state==='attached')){
      this.stage++
      if(this.stage===STAGES.length-1)this.activate()
    }
  }
  private activate(){
    this.completed=true;this.event('activation',-1,-1)
    const ground=groupCount(this.crew)
    for(const r of this.crew){
      r.order=-1;r.duty='gather';r.wait=0
      if(r.role==='drone')flyTo(r,[(r.pad-2.5)*1.78,2.85+.28*Math.cos(r.pad*1.4),4.52+.34*Math.abs(r.pad-2.5)])
      else groundGoal(r,gatherBay(r,ground))
    }
  }
  tick(dt:number){
    this.time+=dt
    if(this.completed)this.activation+=dt
    this.decision-=dt
    if(this.decision<=0){this.dispatch();this.decision=.17}
    for(const machine of this.machines)machine.wear=Math.min(1,machine.wear+dt*.012)
    this.traffic.step(dt)
    for(const r of this.crew)this.robotWork(r,dt)
    for(const o of this.orders){
      if(o.mode!=='gripped'||o.owner<0)continue
      const r=this.crew[o.owner],air=r.role==='drone'
      if(r.arrived&&(r.duty==='deliver'||r.duty==='handoff')){
        const p=r.duty==='deliver'?deliveryPoint(o):loadPoint(relays[o.relay])
        approach(o.pos,[p[0],p[1]+o.under+.2,p[2]],dt*6.2);continue
      }
      const height=air?r.pos[1]-o.top-.30:r.pos[1]+(r.role==='worker'?1.26:.89)+o.under
      const reach=air?0:r.role==='worker'?.09:.31
      approach(o.pos,[r.pos[0]+Math.sin(r.yaw)*reach,height,r.pos[2]+Math.cos(r.yaw)*reach],dt*7.4)
    }
    this.runCrane(dt)
  }
}
