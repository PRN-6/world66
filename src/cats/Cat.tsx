import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, Quaternion } from 'three'
import { ContactShadow } from './ContactShadow'
import { PetHeart } from '../world/environment/PetHeart'
import { makeCat, type CatRig } from './models/catRig'
import { animateCat } from './animations/pose'
import type { CatProfile } from './profiles'
import type { CatMotion } from './ai/GardenLife'

export function Cat({
  profile,
  motion,
  index,
  onPet,
}: {
  profile: CatProfile
  motion: CatMotion
  index: number
  onPet?: () => void
}) {
  const root = useRef<Group>(null),
    rig = useRef<CatRig | null>(null)
  const heart = useRef<Group>(null),
    affection = useRef(0),
    orientation = useRef(new Quaternion())
  useLayoutEffect(() => {
    const model = makeCat(profile),
      parent = root.current!
    rig.current = model
    parent.add(model.mesh)
    animateCat(model, motion.state, 0, index, 1)
    return () => {
      parent.remove(model.mesh)
      model.dispose()
      rig.current = null
    }
  }, [profile, motion, index])
  useFrame(({ clock, camera }, dt) => {
    if (!rig.current || !root.current) return
    root.current.position.set(motion.x, motion.y, motion.z)
    root.current.rotation.y = motion.yaw
    if (heart.current) {
      affection.current = Math.max(0, affection.current - dt)
      heart.current.visible = affection.current > 0
      if (heart.current.visible) {
        heart.current.position.y = 1.45 + (1 - affection.current) * 0.63
        heart.current.scale.setScalar(
          Math.min(1.1, affection.current * 4, (1 - affection.current) * 9 + 0.1),
        )
        root.current.getWorldQuaternion(orientation.current)
        heart.current.quaternion.copy(orientation.current.invert()).multiply(camera.quaternion)
      }
    }
    animateCat(
      rig.current,
      motion.state,
      motion.speed,
      clock.elapsedTime + index * 2.43,
      Math.min(dt, 0.1),
    )
  })
  return (
    <group
      ref={root}
      name={profile.id}
      scale={profile.size}
      onClick={(e) => {
        if (e.delta < 5) {
          e.stopPropagation()
          affection.current = 1
          onPet?.()
        }
      }}
    >
      <ContactShadow />
      <group ref={heart} visible={false}>
        <PetHeart />
      </group>
    </group>
  )
}
