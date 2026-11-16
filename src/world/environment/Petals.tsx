import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, DoubleSide, DynamicDrawUsage, InstancedMesh, Object3D } from 'three'
import { randomSource, TAU } from '../modeling'
import { TREES } from '../layout'

export function Petals() {
  const mesh = useRef<InstancedMesh>(null),
    time = useRef(0)
  const particles = useRef<
    { x: number; y: number; z: number; phase: number; speed: number; size: number }[]
  >([])
  const dummy = useRef(new Object3D())
  useLayoutEffect(() => {
    const rand = randomSource(1999),
      cloud = mesh.current!
    particles.current = Array.from({ length: 72 }, (_, i) => {
      const tree = TREES[i % 3],
        phi = rand() * TAU,
        r = rand() * 2.4 * tree.size
      cloud.setColorAt(i, new Color(i % 3 ? '#ffd1d0' : '#e99cad'))
      return {
        x: tree.x + Math.cos(phi) * r,
        y: tree.size * (2.9 + rand() * 1.45),
        z: tree.z + Math.sin(phi) * r,
        phase: rand(),
        speed: 0.065 + rand() * 0.069,
        size: 0.039 + rand() * 0.045,
      }
    })
    cloud.instanceMatrix.setUsage(DynamicDrawUsage)
  }, [])
  useFrame((_, dt) => {
    if (!mesh.current) return
    const t = (time.current += Math.min(dt, 0.1)),
      o = dummy.current
    particles.current.forEach((p, i) => {
      const fall = (p.phase + t * p.speed) % 1
      o.position.set(
        p.x + 1.8 * fall + 0.29 * Math.sin(t * 0.9 + i),
        0.02 + p.y * (1 - fall),
        p.z + 0.68 * fall + 0.25 * Math.cos(t * 0.76 + i),
      )
      o.rotation.set(i + t * 1.7, i + t * 1.32, Math.sin(t * 1.2 + i))
      o.scale
        .set(p.size, p.size * 0.59, p.size * 0.3)
        .multiplyScalar(Math.min(1, fall * 16, (1 - fall) * 19))
      o.updateMatrix()
      mesh.current!.setMatrixAt(i, o.matrix)
    })
    mesh.current.instanceMatrix.needsUpdate = true
  })
  return (
    <instancedMesh ref={mesh} args={[undefined, undefined, 72]} frustumCulled={false}>
      <circleGeometry args={[1, 6]} />
      <meshBasicMaterial side={DoubleSide} />
    </instancedMesh>
  )
}
