import { useMemo } from 'react'
import { DoubleSide } from 'three'
import { SHRINE } from '../layout'
import { roofs, roofSkin } from './shrineModel'

export function Roofs() {
  const meshes=useMemo(()=>roofs.map(roofSkin),[])
  return <group position={[SHRINE[0],0,SHRINE[1]]}>
    {meshes.map((g,i)=><mesh key={i} geometry={g} castShadow receiveShadow><meshStandardMaterial color="#465f64" side={DoubleSide} roughness={0.72}/></mesh>)}
  </group>
}

