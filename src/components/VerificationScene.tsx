import { useEffect, useRef } from 'react'
import { RigidBody, useRapier, useAfterPhysicsStep } from '@/physics'
import type { RapierRigidBody } from '@react-three/rapier'

interface VerificationSceneProps {
  onPhysicsReady?: () => void
}

/**
 * Minimal 3D scene verifying:
 * 1. WebGL geometry and material rendering
 * 2. Shadow maps and directional lighting
 * 3. Rapier WebAssembly initialization and rigid body physics simulation
 */
export function VerificationScene({ onPhysicsReady }: VerificationSceneProps) {
  const { rapier, world } = useRapier()
  const rigidBodyRef = useRef<RapierRigidBody>(null)
  const signaledRef = useRef(false)

  useEffect(() => {
    if (world && rapier && !signaledRef.current) {
      signaledRef.current = true
      onPhysicsReady?.()
    }
  }, [world, rapier, onPhysicsReady])

  useAfterPhysicsStep(() => {
    if (!signaledRef.current) {
      signaledRef.current = true
      onPhysicsReady?.()
    }
  })

  return (
    <group>
      {/* Dynamic cube to verify physics gravity and collision response */}
      <RigidBody
        ref={rigidBodyRef}
        position={[0, 4, 0]}
        restitution={0.6}
        colliders="cuboid"
      >
        <mesh castShadow receiveShadow>
          <boxGeometry args={[1, 1, 1]} />
          <meshStandardMaterial
            color="#38bdf8"
            roughness={0.2}
            metalness={0.3}
          />
        </mesh>
      </RigidBody>

      {/* Static ground platform collider */}
      <RigidBody type="fixed" position={[0, -0.5, 0]} colliders="cuboid">
        <mesh receiveShadow>
          <boxGeometry args={[12, 1, 12]} />
          <meshStandardMaterial
            color="#1e293b"
            roughness={0.8}
            metalness={0.1}
          />
        </mesh>
      </RigidBody>
    </group>
  )
}

