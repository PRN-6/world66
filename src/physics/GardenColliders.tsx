import { useMemo } from 'react'
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { BRIDGE, HALF, PONDS, pondPoint } from '../world/layout'
import { obstacles } from '../world/obstacles'
import { CollisionGroups as G } from '../types/physics'
import { TAU } from '../world/modeling'

const fixedMask=(G.ARCHITECTURE<<16)|G.INTERACTABLES
export function GardenColliders() {
  const banks=useMemo(()=>PONDS.flatMap((_,p)=>Array.from({length:36},(_,i)=>{
    const a=pondPoint(p,TAU*i/36),b=pondPoint(p,TAU*(i+1)/36)
    return {x:(a[0]+b[0])/2,z:(a[1]+b[1])/2,angle:Math.atan2(a[1]-b[1],b[0]-a[0]),length:Math.hypot(b[0]-a[0],b[1]-a[1])}
  })).filter(b=>Math.abs(b.z-BRIDGE.z)>BRIDGE.halfWidth+0.16),[])
  const bridge=useMemo(()=>Array.from({length:16},(_,i)=>{
    const t=(i+0.5)/8-1
    return {x:BRIDGE.x+t*BRIDGE.halfLength,y:0.07+0.62*(1-t*t),angle:Math.atan(-1.24*t/BRIDGE.halfLength)}
  }),[])
  return <RigidBody type="fixed" colliders={false} collisionGroups={fixedMask}>
    <CuboidCollider args={[HALF,0.5,HALF]} position={[0,-0.5,0]} friction={0.75} collisionGroups={(G.TERRAIN<<16)|G.INTERACTABLES}/>
    {[-1,1].map(s=><group key={s}>
      <CuboidCollider args={[HALF,1.5,0.12]} position={[0,1.4,s*(HALF-0.11)]}/>
      <CuboidCollider args={[0.12,1.5,HALF]} position={[s*(HALF-0.11),1.4,0]}/>
    </group>)}
    {obstacles.map((o,i)=>o.round?
      <CylinderCollider key={i} args={[o.height/2,o.halfX]} position={[o.x,o.height/2,o.z]}/>:
      <CuboidCollider key={i} args={[o.halfX,o.height/2,o.halfZ]} position={[o.x,o.height/2,o.z]}/>)}
    {banks.map((b,i)=><CuboidCollider key={'bank'+i} args={[b.length/2+0.02,0.25,0.085]} position={[b.x,0.16,b.z]} rotation={[0,b.angle,0]}/>)}
    {bridge.map((b,i)=><group key={'deck'+i}>
      <CuboidCollider args={[BRIDGE.halfLength/16+0.007,0.067,BRIDGE.halfWidth]} position={[b.x,b.y-0.067,BRIDGE.z]} rotation={[0,0,b.angle]}/>
      {[-1,1].map(s=><CuboidCollider key={s} args={[BRIDGE.halfLength/16+0.01,0.25,0.06]} position={[b.x,b.y+0.27,BRIDGE.z+s*BRIDGE.halfWidth]} rotation={[0,0,b.angle]}/>)}
    </group>)}
  </RigidBody>
}

