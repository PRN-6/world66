import { useMemo, useRef } from 'react'
import {
  BallCollider,
  RigidBody,
  useBeforePhysicsStep,
  useAfterPhysicsStep,
  type RapierRigidBody,
} from '@react-three/rapier'
import { Cat } from './Cat'
import { GardenLife } from './ai/GardenLife'
import { GardenToys, toyStarts } from '../physics/toys'
import { Temari } from '../physics/Temari'
import { CollisionGroups as G } from '../types/physics'

export interface ColonyProps {
  seed?: number
  onPhysicsReady?: () => void
  onCatPet?: (name: string) => void
}
export function Colony({ seed = 66, onPhysicsReady, onCatPet }: ColonyProps) {
  const life = useMemo(() => new GardenLife(seed), [seed]),
    toys = useMemo(() => new GardenToys(), [])
  const bodies = useRef<(RapierRigidBody | null)[]>([]),
    ready = useRef(false)
  useBeforePhysicsStep((world) => {
    const dt = world.timestep
    toys.sync(dt)
    life.tick(dt, toys)
    life.cats.forEach((c, i) =>
      bodies.current[i]?.setNextKinematicTranslation({
        x: c.x,
        y: c.y + 0.36 * c.profile.size,
        z: c.z,
      }),
    )
  })
  useAfterPhysicsStep(() => {
    if (!ready.current) {
      ready.current = true
      onPhysicsReady?.()
    }
  })
  return (
    <>
      {life.cats.map((c, i) => (
        <group key={c.profile.id}>
          <RigidBody
            ref={(b) => {
              bodies.current[i] = b
            }}
            type="kinematicPosition"
            colliders={false}
            position={[c.profile.start[0], 0.36 * c.profile.size + 0.079, c.profile.start[1]]}
          >
            <BallCollider
              args={[0.33 * c.profile.size]}
              collisionGroups={(G.CATS << 16) | G.INTERACTABLES}
            />
          </RigidBody>
          <Cat
            profile={c.profile}
            index={i}
            motion={c}
            onPet={() => {
              life.pet(i)
              onCatPet?.(c.profile.id)
            }}
          />
        </group>
      ))}
      {toyStarts.map((_, i) => (
        <Temari key={i} index={i} toys={toys} />
      ))}
    </>
  )
}
