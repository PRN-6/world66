import { useEffect,useRef } from 'react'
import { useFrame,useThree } from '@react-three/fiber'
import { DirectionalLight,PMREMGenerator } from 'three'
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js'

export function YardLighting(){
  const sun=useRef<DirectionalLight>(null),elapsed=useRef(1)
  const {gl,scene}=useThree()
  useEffect(()=>{
    const generator=new PMREMGenerator(gl),room=new RoomEnvironment(),reflection=generator.fromScene(room,.035)
    const old=scene.environment,oldIntensity=scene.environmentIntensity
    // The standalone viewport owns its studio reflections for this mount.
    Object.assign(scene,{environment:reflection.texture,environmentIntensity:.24})
    room.dispose();generator.dispose()
    return ()=>{Object.assign(scene,{environment:old,environmentIntensity:oldIntensity});reflection.dispose()}
  },[gl,scene])
  useFrame((_,dt)=>{
    elapsed.current+=dt
    if(sun.current&&elapsed.current>=1/20){sun.current.shadow.needsUpdate=true;elapsed.current=0}
  })
  return <>
    <hemisphereLight args={['#f1f7ff','#b7bdab',1.53]}/>
    <directionalLight ref={sun} position={[-8,17,11]} intensity={2.12} color="#ffe8c9" castShadow shadow-autoUpdate={false} shadow-needsUpdate={true} shadow-radius={2.4} shadow-mapSize-width={2048} shadow-mapSize-height={2048} shadow-camera-left={-16} shadow-camera-right={16} shadow-camera-top={17} shadow-camera-bottom={-13} shadow-camera-far={53} shadow-normalBias={.028} shadow-bias={-.00016}/>
    <directionalLight position={[8,10,-9]} color="#c9f2ff" intensity={1.04}/>
  </>
}
