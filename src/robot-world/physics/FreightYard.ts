import type Rapier from '@dimforge/rapier3d-compat'
import { docks, relays, sources, upperDock, CENTRE, CRANE, YARD_HALF } from '../site/layout.ts'
import { loadPoint, type ConstructionSite, type CargoMode } from '../assembly/coordination.ts'
import type { V3 } from '../../world/modeling'

export interface CargoHull{half:V3;center:V3}
const ALL=0xffff,STRUCTURE=1,VEHICLE=2,FREIGHT=4
const groups=(member:number,filter:number)=>(member<<16)|filter
const vec=([x,y,z]:V3)=>({x,y,z})
type API=typeof Rapier
interface PhysicalCargo{body:Rapier.RigidBody;mode:CargoMode;drop:number}
export class FreightYard{
  private api:API
  private world:Rapier.World
  private site:ConstructionSite
  private bodies:Rapier.RigidBody[]=[]
  private cargo:(PhysicalCargo|undefined)[]=[]
  private actors:Rapier.RigidBody[]=[]
  private hulls:CargoHull[]
  constructor(api:API,world:Rapier.World,site:ConstructionSite,hulls:CargoHull[]){
    this.api=api;this.world=world;this.site=site;this.hulls=hulls
    const foundation=this.body(api.RigidBodyDesc.fixed())
    const box=(at:V3,half:V3)=>world.createCollider(api.ColliderDesc.cuboid(...half).setTranslation(...at).setFriction(.9).setCollisionGroups(groups(STRUCTURE,ALL)),foundation)
    box([0,-.30,0],[YARD_HALF,.30,YARD_HALF])
    for(const s of [-1,1]){box([s*YARD_HALF,.33,0],[.1,.42,YARD_HALF]);box([0,.33,s*YARD_HALF],[YARD_HALF,.42,.1])}
    world.createCollider(api.ColliderDesc.cylinder(.34,3.51).setTranslation(CENTRE[0],.34,CENTRE[2]),foundation)
    box([-8.28,1.24,-6.76],[1.78,1.24,1.9]);box([8.23,1.02,5.6],[1.58,1.02,1.35]);box([CRANE[0],5,CRANE[2]],[.42,5,.42])
    for(const b of [...sources,...relays,...docks]){
      const p=loadPoint(b);box([p[0],p[1]/2,p[2]],[.88,p[1]/2,.71])
    }
    box([upperDock[0],upperDock[1]-.12,upperDock[2]],[.75,.12,.75])
    for(const [i,h] of hulls.entries()){
      site.orders[i].under=h.half[1]-h.center[1];site.orders[i].top=h.half[1]+h.center[1]
    }
    for(const r of site.crew){
      const b=this.body(api.RigidBodyDesc.kinematicPositionBased().setTranslation(...r.pos))
      const half=r.role==='drone'?.21:r.role==='transport'?.32:.4
      world.createCollider(api.ColliderDesc.cylinder(half,r.role==='transport'?.41:.28).setTranslation(0,half,0).setCollisionGroups(groups(VEHICLE,ALL)),b)
      this.actors.push(b)
    }
  }
  private body(desc:Rapier.RigidBodyDesc){const b=this.world.createRigidBody(desc);this.bodies.push(b);return b}
  beforeStep(){
    const {site,api}=this
    for(const r of site.crew)this.actors[r.id].setNextKinematicTranslation(vec(r.pos))
    for(const o of site.orders){
      if(o.mode==='hidden')continue
      let c=this.cargo[o.index]
      if(!c){
        const h=this.hulls[o.index],body=this.body(api.RigidBodyDesc.dynamic().setTranslation(...o.pos).lockRotations().setLinearDamping(1.3).setCcdEnabled(true))
        this.world.createCollider(api.ColliderDesc.cuboid(...h.half).setTranslation(...h.center)
          .setMass(o.spec.air?.4:2.7).setFriction(.88).setRestitution(.05).setCollisionGroups(groups(FREIGHT,ALL)),body)
        c={body,mode:'hidden',drop:-1};this.cargo[o.index]=c
      }
      const b=c.body
      if(c.mode!==o.mode||c.drop!==o.drop){
        if(o.mode==='loose'){
          b.setBodyType(api.RigidBodyType.Dynamic,true)
          // Dock guides constrain lateral drift while gravity settles each shipment.
          b.collider(0).setCollisionGroups(groups(FREIGHT,STRUCTURE))
          b.setEnabledTranslations(false,true,false,true);b.setTranslation(vec(o.target),true);b.setLinvel({x:0,y:0,z:0},true)
        }else if(o.mode==='gripped'){
          b.collider(0).setCollisionGroups(groups(FREIGHT,VEHICLE|FREIGHT|STRUCTURE))
          b.setEnabledTranslations(true,true,true,true);b.setBodyType(api.RigidBodyType.KinematicPositionBased,true)
        }else if(o.mode==='attached'){
          b.setTranslation(vec(o.spec.socket),false);b.setBodyType(api.RigidBodyType.Fixed,false)
          // Once bolted in, the module belongs to its articulated visual joint.
          b.setEnabled(false)
        }
        c.mode=o.mode;c.drop=o.drop
      }
      if(o.mode==='gripped')b.setNextKinematicTranslation(vec(o.pos))
    }
  }
  afterStep(){
    for(const o of this.site.orders){
      if(o.mode!=='loose')continue
      const b=this.cargo[o.index]!.body,p=b.translation(),v=b.linvel()
      o.pos=[p.x,p.y,p.z]
      o.settled=Math.abs(v.y)<.065&&Math.abs(p.y-o.under-o.floor)<.085
    }
  }
  dispose(){for(const b of this.bodies)if(b.isValid())this.world.removeRigidBody(b);this.bodies.length=0;this.cargo.length=0;this.actors.length=0}
}
