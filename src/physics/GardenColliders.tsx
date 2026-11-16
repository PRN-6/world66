import { useMemo } from 'react'
import { CuboidCollider, CylinderCollider, RigidBody } from '@react-three/rapier'
import { gardenCollisionLayout } from './collisionLayout'

export function GardenColliders() {
  const colliders = useMemo(() => gardenCollisionLayout(), [])
  return (
    <RigidBody type="fixed" colliders={false}>
      {colliders.map((c, i) =>
        c.kind === 'box' ? (
          <CuboidCollider
            key={i}
            args={c.args}
            position={c.at}
            rotation={c.rotation}
            collisionGroups={c.mask}
          />
        ) : (
          <CylinderCollider key={i} args={c.args} position={c.at} collisionGroups={c.mask} />
        ),
      )}
    </RigidBody>
  )
}
