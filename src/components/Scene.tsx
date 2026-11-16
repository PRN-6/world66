import { Canvas } from '@react-three/fiber'
import { OrbitControls, Grid } from '@react-three/drei'
import { PhysicsWorld } from '@/physics'
import { VerificationScene } from './VerificationScene'
import { LoadingFallback } from './LoadingFallback'

interface SceneProps {
  onPhysicsReady?: () => void
}

/**
 * Main 3D viewport component.
 * Sets up the WebGL canvas, lights, camera controls, and physics world.
 */
export function Scene({ onPhysicsReady }: SceneProps) {
  return (
    <Canvas
      shadows
      camera={{ position: [6, 6, 8], fov: 45 }}
      dpr={[1, 2]}
      className="w-full h-full"
    >
      <color attach="background" args={['#090d16']} />

      {/* Lighting foundation */}
      <ambientLight intensity={0.6} />
      <directionalLight
        position={[10, 15, 10]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-10}
        shadow-camera-right={10}
        shadow-camera-top={10}
        shadow-camera-bottom={-10}
      />

      {/* Camera Controls */}
      <OrbitControls makeDefault enableDamping dampingFactor={0.05} />

      {/* Spatial Reference Grid */}
      <Grid
        infiniteGrid
        cellSize={0.5}
        sectionSize={2}
        cellColor="#334155"
        sectionColor="#64748b"
        fadeDistance={30}
        fadeStrength={1}
      />

      {/* Physics World with Verification Objects */}
      <PhysicsWorld fallback={<LoadingFallback />}>
        <VerificationScene onPhysicsReady={onPhysicsReady} />
      </PhysicsWorld>
    </Canvas>
  )
}
