import { Canvas, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { OrthographicCamera, PCFShadowMap } from 'three'
import { useLayoutEffect } from 'react'
import { RobotConstructionWorld } from './RobotConstructionWorld'
import type { RobotWorldProps } from './types'
import { YardLighting } from './art/YardLighting'

function CameraRig(){
  const {camera,size}=useThree()
  useLayoutEffect(()=>{
    if(camera instanceof OrthographicCamera){
      // oxlint-disable-next-line react/immutability
      camera.zoom=Math.min(size.width/31,size.height/24.4)
      camera.updateProjectionMatrix()
    }
  },[camera,size])
  return <OrbitControls makeDefault enablePan={false} enableDamping target={[0,2.8,0]} minZoom={Math.min(size.width/39,size.height/32)} maxZoom={Math.min(size.width/7,size.height/6)} minPolarAngle={.28} maxPolarAngle={1.37}/>
}
function Sky(){
  return <mesh renderOrder={-99} frustumCulled={false}>
    <planeGeometry args={[2,2]}/>
    <shaderMaterial depthWrite={false} depthTest={false} vertexShader={`
      varying vec2 v;void main(){v=uv;gl_Position=vec4(position.xy,.999,1.);}
    `} fragmentShader={`
      varying vec2 v;
      void main(){
        vec3 col=mix(vec3(.67,.80,.79),vec3(.93,.86,.71),smoothstep(0.,.47,v.y));
        col=mix(col,vec3(.47,.73,.81),smoothstep(.42,1.,v.y));
        float cloud=0.;
        for(int i=0;i<6;i++){
          float k=float(i);vec2 p=v-vec2(fract(.17+k*.313),.59+.13*sin(k*3.57));
          cloud+=exp(-pow(abs(p.x)/.062,3.)-pow(abs(p.y+.002*sin(p.x*49.))/.005,2.));
        }
        col=mix(col,vec3(.98,.94,.82),.38*min(cloud,1.));
        float hills=.24+.027*sin(v.x*15.)+.019*cos(v.x*29.+.85);
        col=mix(col,vec3(.58,.73,.75),.36*(1.-smoothstep(hills,hills+.003,v.y)));
        gl_FragColor=vec4(col,1.);
      }`} toneMapped={false}/>
  </mesh>
}
export function RobotConstructionScene(props:RobotWorldProps){
  return <Canvas orthographic shadows={{type:PCFShadowMap}} camera={{position:[13.5,17.5,29],near:.1,far:110}} dpr={[1,1.5]} gl={{antialias:true,alpha:false,powerPreference:'high-performance'}} style={{height:'100%',width:'100%',touchAction:'none'}}>
    <Sky/><YardLighting/>
    <RobotConstructionWorld {...props}/><CameraRig/>
  </Canvas>
}
