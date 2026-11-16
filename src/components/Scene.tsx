import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { useLayoutEffect } from 'react'
import { OrthographicCamera, PCFShadowMap } from 'three'
import { Backdrop } from '@/world/environment/Backdrop'
import { ShrineWorld } from '@/world/ShrineWorld'
import type { ShrineWorldProps } from '@/world/ShrineWorld'

function Framing() {
  const { camera, size } = useThree()
  useLayoutEffect(() => {
    if (!(camera instanceof OrthographicCamera)) return
    // Three.js owns the camera. Resize its projection when the canvas changes.
    // oxlint-disable-next-line react/immutability
    camera.zoom = Math.min(size.width / 22.9, size.height / 18.05)
    camera.updateProjectionMatrix()
  }, [camera, size])
  return (
    <OrbitControls
      makeDefault
      enablePan={false}
      enableDamping
      dampingFactor={0.075}
      target={[0, 1.1, 0]}
      minPolarAngle={0.38}
      maxPolarAngle={1.29}
      minZoom={Math.min(size.width / 30, size.height / 26)}
      maxZoom={Math.min(size.width / 5, size.height / 4)}
    />
  )
}
export type SceneProps = ShrineWorldProps
export function Scene(props: SceneProps) {
  return (
    <Canvas
      orthographic
      shadows={{ type: PCFShadowMap }}
      camera={{ position: [11, 16.4, 25], near: 0.1, far: 110 }}
      dpr={[1, 1.5]}
      gl={{ antialias: true, alpha: false, powerPreference: 'high-performance' }}
      style={{ width: '100%', height: '100%', touchAction: 'none' }}
    >
      <Backdrop />
      <hemisphereLight args={['#edf2ff', '#a4b7a9', 1.72]} />
      <directionalLight
        position={[-8, 15, 9]}
        intensity={2.05}
        color="#ffe5c9"
        castShadow
        shadow-autoUpdate={false}
        shadow-needsUpdate={true}
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
        shadow-camera-left={-12}
        shadow-camera-right={12}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-far={45}
        shadow-normalBias={0.035}
        shadow-bias={-0.00015}
      />
      <directionalLight position={[7, 8, -10]} intensity={0.85} color="#ffd5c6" />
      <ShrineWorld {...props} />
      <Framing />
    </Canvas>
  )
}
