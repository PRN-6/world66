import type { RapierRigidBody } from '@react-three/rapier'
import type { Point } from '../world/modeling'
import { walkable } from '../world/obstacles.ts'

export const toyStarts:Point[]=[[-1.27,5.85],[2.65,6.25]]
export const TOY_RADIUS=0.235
export const TOY_MASS=0.24
export class GardenToys {
  bodies:(RapierRigidBody|null)[]=toyStarts.map(()=>null)
  locations=toyStarts.map(([x,z])=>({x,z}))
  private stranded=toyStarts.map(()=>0)
  private cooldown=toyStarts.map(()=>0)
  register(index:number,body:RapierRigidBody|null){this.bodies[index]=body}
  swat=(index:number,dx:number,dz:number)=>{
    const body=this.bodies[index]
    if(!body||this.cooldown[index]>0)return
    const d=Math.hypot(dx,dz)||1
    body.applyImpulse({x:dx/d*0.48,y:0.38,z:dz/d*0.48},true)
    body.applyTorqueImpulse({x:dz/d*0.011,y:0.004,z:-dx/d*0.011},true)
    this.cooldown[index]=0.42
  }
  sync(dt:number){
    this.bodies.forEach((body,i)=>{
      if(!body)return
      this.cooldown[i]=Math.max(0,this.cooldown[i]-dt)
      const p=body.translation()
      this.stranded[i]=walkable(p.x,p.z,0.22)?0:this.stranded[i]+dt
      if(p.y< -1||Math.max(Math.abs(p.x),Math.abs(p.z))>8.15||this.stranded[i]>8){
        const [x,z]=toyStarts[i]
        body.setTranslation({x,y:0.28,z},true)
        body.setLinvel({x:0,y:0,z:0},true);body.setAngvel({x:0,y:0,z:0},true)
        this.locations[i].x=x;this.locations[i].z=z;this.stranded[i]=0
      }else{
        this.locations[i].x=p.x;this.locations[i].z=p.z
      }
    })
  }
}

