import { useMemo } from 'react'
import { Shape } from 'three'

export function PetHeart() {
  const heart = useMemo(() => {
    const s = new Shape()
    s.moveTo(0, -0.15)
    s.bezierCurveTo(-0.23, 0.01, -0.17, 0.23, 0, 0.11)
    s.bezierCurveTo(0.17, 0.23, 0.23, 0.01, 0, -0.15)
    return s
  }, [])
  return (
    <mesh>
      <shapeGeometry args={[heart, 12]} />
      <meshBasicMaterial color="#f59da7" toneMapped={false} />
    </mesh>
  )
}
