import { bridgeHeight, QUIET, SIGHTS } from '../../world/layout.ts'
import { randomSource, type Point } from '../../world/modeling.ts'
import { walkable } from '../../world/obstacles.ts'
import type { CatBehaviorState } from '../../types/cat'
import type { CatProfile } from '../profiles'
import { residents } from '../profiles.ts'
import { distance, GardenNavigation } from './navigation.ts'

export interface CatMotion {x:number;z:number;y:number;yaw:number;speed:number;state:CatBehaviorState}
type Intent='rest'|'observe'|'wander'|'social'|'toy'
export interface Resident extends CatMotion {
  profile:CatProfile;intent:Intent;route:Point[];goal:Point;timer:number;blocked:number;think:number
  gaze:number;friend:number;toy:number;swatCooldown:number
}
export interface ToyLocation {x:number;z:number}
export interface ToyActions {locations:ToyLocation[];swat:(index:number,dx:number,dz:number)=>void}
const position=(c:ToyLocation):Point=>[c.x,c.z]
const yawDiff=(a:number,b:number)=>Math.atan2(Math.sin(b-a),Math.cos(b-a))
const turn=(a:number,b:number,dt:number)=>a+Math.max(-3.4*dt,Math.min(3.4*dt,yawDiff(a,b)))
export class GardenLife {
  nav=new GardenNavigation()
  random:()=>number
  cats:Resident[]
  constructor(seed=66,profiles=residents){
    this.random=randomSource(seed)
    this.cats=profiles.map((p,i)=>({
      profile:p,x:p.start[0],z:p.start[1],y:0.075,yaw:p.heading,state:p.initial,speed:0,
      intent:'wander',route:[],goal:p.start,timer:3.1+i*0.83,blocked:0,think:0.13*i,
      gaze:p.heading,friend:-1,toy:-1,swatCooldown:0,
    }))
  }
  private choose<T>(list:T[]):T{return list[Math.floor(this.random()*list.length)]}
  private pause(c:Resident,state:CatBehaviorState,seconds:number){
    c.route=[];c.speed=0;c.state=state;c.timer=seconds;c.blocked=0
  }
  private go(c:Resident,goal:Point,intent:Intent,state:CatBehaviorState,blocked:Point[]=[]){
    c.route=this.nav.route(position(c),goal,blocked);c.goal=goal;c.intent=intent
    c.blocked=0;c.timer=0
    if(c.route.length)c.state=state
    else this.pause(c,'idle',0.9+this.random())
  }
  private neighbour(c:Resident){
    return this.cats.filter(other=>other!==c).sort((a,b)=>distance(position(c),position(a))-distance(position(c),position(b)))[0]
  }
  private approach(c:Resident,p:Point,space:number):Point{
    const dx=c.x-p[0],dz=c.z-p[1],d=Math.hypot(dx,dz)||1
    return [p[0]+space*dx/d,p[1]+space*dz/d]
  }
  private decide(c:Resident,toys:ToyActions){
    const p=c.profile,other=this.neighbour(c)
    if(other&&p.sociability<0.3&&distance(position(c),position(other))<1.45){
      const far=SIGHTS.filter(s=>distance(s,position(other))>3.5)
      this.go(c,this.choose(far),'observe','exploring');return
    }
    const weights=[0.35,p.curiosity*1.4,p.sleepiness*1.25,toys.locations.length?p.playfulness*1.3:0,other?p.sociability:0,0.55]
    let roll=this.random()*weights.reduce((a,b)=>a+b)
    const pick=weights.findIndex(w=>(roll-=w)<0)
    if(pick===0){
      c.gaze=c.yaw+(this.random()-0.5)*2.4
      this.pause(c,this.random()<0.6?'sitting':'idle',2+this.random()*4)
    }else if(pick===2){
      const empty=QUIET.filter(s=>this.cats.every(other=>other===c||distance(s,position(other))>1))
      this.go(c,this.choose(empty.length?empty:QUIET),'rest','walking')
    }else if(pick===3){
      c.toy=toys.locations.reduce((best,t,i)=>distance(position(c),position(t))<distance(position(c),position(toys.locations[best]))?i:best,0)
      this.go(c,this.approach(c,position(toys.locations[c.toy]),0.7),'toy',p.playfulness>0.7?'running':'walking')
    }else if(pick===4&&other){
      c.friend=this.cats.indexOf(other)
      this.go(c,this.approach(c,position(other),1.13),'social','following')
    }else {
      const goal=this.choose(SIGHTS.filter(s=>distance(s,position(c))>1.2))
      this.go(c,[goal[0]+(this.random()-0.5)*0.5,goal[1]+(this.random()-0.5)*0.5],pick===1?'observe':'wander',pick===1?'exploring':'roaming')
    }
  }
  private arrive(c:Resident,toys:ToyActions){
    const t=toys.locations[c.toy],other=this.cats[c.friend]
    if(c.intent==='rest'){this.pause(c,'sleeping',6+12*c.profile.sleepiness+this.random()*4);return}
    if(c.intent==='toy'&&t&&distance(position(c),position(t))<1.28){
      c.gaze=Math.atan2(t.x-c.x,t.z-c.z);this.pause(c,'playing',1.55);return
    }
    if(c.intent==='social'&&other&&distance(position(c),position(other))<1.85){
      c.gaze=Math.atan2(other.x-c.x,other.z-c.z);this.pause(c,'interacting',2.3+2*this.random())
      if(other.speed<0.1&&other.state!=='sleeping')other.gaze=c.gaze+Math.PI
      return
    }
    c.gaze=c.yaw+0.7*(this.random()-0.5)
    this.pause(c,this.random()<0.38?'sitting':'idle',1.3+3.1*this.random())
  }
  pet(index:number){
    const c=this.cats[index]
    if(!c)return
    c.gaze=c.yaw+0.48
    this.pause(c,'interacting',2.8)
  }
  tick(dt:number,toys:ToyActions){
    dt=Math.min(dt,0.1)
    for(const c of this.cats){
      c.think-=dt;c.swatCooldown-=dt
      if(c.route.length===0){
        c.timer-=dt;c.yaw=turn(c.yaw,c.gaze,dt)
        const t=toys.locations[c.toy]
        if(c.state==='playing'&&t&&c.swatCooldown<=0&&distance(position(c),position(t))<1.28&&c.timer<1.15){
          const dx=t.x-c.x,dz=t.z-c.z,d=Math.hypot(dx,dz)||1
          toys.swat(c.toy,dx/d,dz/d);c.swatCooldown=2.5
        }
        if(c.timer<=0&&c.think<=0)this.decide(c,toys)
      }else{
        const [gx,gz]=c.route[0],dx=gx-c.x,dz=gz-c.z,d=Math.hypot(dx,dz)
        const angle=Math.atan2(dx,dz);c.yaw=turn(c.yaw,angle,dt)
        const pace=c.state==='running'?2.0:c.state==='following'?1.05:0.76+0.34*c.profile.curiosity
        const desired=pace*Math.max(0,Math.cos(yawDiff(c.yaw,angle)))
        c.speed+=(desired-c.speed)*(1-Math.exp(-dt*6))
        const step=Math.min(d,dt*c.speed),nx=c.x+dx/(d||1)*step,nz=c.z+dz/(d||1)*step
        const occupied=this.cats.filter(o=>o!==c&&Math.hypot(nx-o.x,nz-o.z)<0.83&&Math.hypot(nx-o.x,nz-o.z)<distance(position(c),position(o)))
        if(occupied.length||!walkable(nx,nz)){
          c.blocked+=dt;c.speed=0
          if(c.blocked>0.75){this.go(c,c.goal,c.intent,c.state,occupied.map(position))}
        }else{
          c.x=nx;c.z=nz;c.blocked=0;c.y=0.079+bridgeHeight(nx,nz)
          if(d<=step+0.025){c.route.shift();if(!c.route.length)this.arrive(c,toys)}
        }
        if(c.route.length&&c.think<=0){
          const target=c.intent==='social'?this.cats[c.friend]:c.intent==='toy'?toys.locations[c.toy]:null
          if(target&&distance(c.goal,position(target))>1.85)this.go(c,this.approach(c,position(target),c.intent==='social'?1.13:0.7),c.intent,c.state)
        }
      }
      if(c.think<=0)c.think=0.46+this.random()*0.19
    }
  }
}

