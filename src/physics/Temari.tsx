import { useEffect, useMemo } from 'react'
import { BallCollider, RigidBody } from '@react-three/rapier'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { CollisionGroups as G } from '../types/physics'
import { GardenToys, TOY_MASS, TOY_RADIUS, toyStarts } from './toys'

function threadPattern(index: number) {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 128
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = index ? '#497f87' : '#cd695a'
  ctx.fillRect(0, 0, 256, 128)
  for (let i = 0; i < 4; i++) {
    ctx.beginPath()
    for (let x = 0; x <= 256; x++) {
      const y = 64 + Math.sin((x * Math.PI) / 64 + (i * Math.PI) / 2) * 33
      if (x === 0) ctx.moveTo(x, y)
      else ctx.lineTo(x, y)
    }
    ctx.lineWidth = 7
    ctx.strokeStyle = i % 2 ? '#f3cc86' : '#f7e9cf'
    ctx.stroke()
  }
  for (const y of [16, 21, 105, 110]) {
    ctx.fillStyle = '#ead098'
    ctx.fillRect(0, y, 256, 3)
  }
  const map = new CanvasTexture(canvas)
  map.colorSpace = SRGBColorSpace
  return map
}
export function Temari({ index, toys }: { index: number; toys: GardenToys }) {
  const start = toyStarts[index],
    map = useMemo(() => threadPattern(index), [index])
  useEffect(() => () => map.dispose(), [map])
  return (
    <RigidBody
      ref={(body) => toys.register(index, body)}
      position={[start[0], 0.34, start[1]]}
      colliders={false}
      linearDamping={0.72}
      angularDamping={1.05}
      ccd
      canSleep
    >
      <BallCollider
        args={[TOY_RADIUS]}
        mass={TOY_MASS}
        restitution={0.42}
        friction={0.72}
        collisionGroups={
          (G.INTERACTABLES << 16) | G.TERRAIN | G.ARCHITECTURE | G.CATS | G.INTERACTABLES
        }
      />
      <mesh
        receiveShadow
        onClick={(e) => {
          if (e.delta >= 5) return
          e.stopPropagation()
          toys.swat(index, e.ray.direction.x, e.ray.direction.z)
        }}
      >
        <sphereGeometry args={[TOY_RADIUS, 24, 16]} />
        <meshStandardMaterial map={map} roughness={0.82} />
      </mesh>
    </RigidBody>
  )
}
