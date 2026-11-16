import { useEffect, useMemo } from 'react'
import { DoubleSide, Path } from 'three'
import { PONDS } from '../layout'
import { pondOutline, topOutline } from './terrainModel'
import { groundTexture } from './groundTexture'

export function Ground() {
  const grass=useMemo(()=>groundTexture(),[])
  useEffect(()=>()=>grass.dispose(),[grass])
  const surface = useMemo(() => {
    const shape = topOutline()
    PONDS.forEach((_,i) => shape.holes.push(new Path(pondOutline(i).getPoints())))
    return shape
  }, [])
  return <group rotation-x={-Math.PI/2}>
    <mesh receiveShadow><shapeGeometry args={[surface]} /><meshStandardMaterial map={grass} side={DoubleSide}/></mesh>
  </group>
}

