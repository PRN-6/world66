import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { useRapier, useAfterPhysicsStep, useBeforePhysicsStep } from '@react-three/rapier'
import { Group } from 'three'
import { PhysicsWorld } from '../../physics/PhysicsWorld'
import { ConstructionSite, stageNames } from './coordination'
import { FreightYard } from '../physics/FreightYard'
import { YardRenderer } from '../art/YardRenderer'
import type { RobotWorldProps } from '../types'

function Shift({seed,crewSize,...callbacks}:RobotWorldProps){
  const root=useRef<Group>(null),live=useRef<{site:ConstructionSite;physics:FreightYard;art:YardRenderer;stage:number}|null>(null)
  const callbacksRef=useRef(callbacks)
  useLayoutEffect(()=>{callbacksRef.current=callbacks},[callbacks])
  const {world,rapier}=useRapier()
  useLayoutEffect(()=>{
    const site=new ConstructionSite({seed,crewSize,onEvent:e=>callbacksRef.current.onEvent?.(e)})
    const art=new YardRenderer(site),physics=new FreightYard(rapier,world,site,art.hulls),node=root.current!
    node.add(art.root);live.current={site,physics,art,stage:-1}
    return ()=>{live.current=null;node.remove(art.root);physics.dispose();art.dispose()}
  },[seed,crewSize,world,rapier])
  useBeforePhysicsStep(w=>{
    const yard=live.current;if(!yard)return
    yard.site.tick(w.timestep);yard.physics.beforeStep()
  })
  useAfterPhysicsStep(()=>{
    const yard=live.current;if(!yard)return
    yard.physics.afterStep()
    if(yard.stage!==yard.site.stage){
      if(yard.stage===-1)callbacksRef.current.onPhysicsReady?.()
      yard.stage=yard.site.stage
      callbacksRef.current.onStageChange?.(stageNames[yard.stage])
      if(yard.site.completed)callbacksRef.current.onComplete?.()
    }
  })
  useFrame(()=>{const yard=live.current;if(yard)yard.art.draw(yard.site)})
  return <group ref={root}/>
}
export default function RunningYard(props:RobotWorldProps){
  return <PhysicsWorld timeStep={1/60} colliders={false}><Shift {...props}/></PhysicsWorld>
}
