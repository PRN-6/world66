import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group } from 'three'
import { makeCat, type CatRig } from './models/catRig'
import { animateCat } from './animations/pose'
import type { CatProfile } from './profiles'
import type { CatMotion } from './ai/GardenLife'

export function Cat({profile,motion,index,onPet}:{profile:CatProfile;motion:CatMotion;index:number;onPet?:()=>void}) {
  const root=useRef<Group>(null),rig=useRef<CatRig|null>(null)
  useLayoutEffect(()=>{
    const model=makeCat(profile),parent=root.current!
    rig.current=model;parent.add(model.mesh)
    animateCat(model,motion.state,0,index,1)
    return ()=>{parent.remove(model.mesh);model.dispose();rig.current=null}
  },[profile,motion,index])
  useFrame(({clock},dt)=>{
    if(!rig.current||!root.current)return
    root.current.position.set(motion.x,motion.y,motion.z)
    root.current.rotation.y=motion.yaw
    animateCat(rig.current,motion.state,motion.speed,clock.elapsedTime+index*2.43,Math.min(dt,0.1))
  })
  return <group ref={root} name={profile.id} scale={profile.size}
    onClick={e=>{if(e.delta<5){e.stopPropagation();onPet?.()}}}/>
}

