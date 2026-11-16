const vertex = `
varying vec2 vUv;
void main(){
  vUv=uv*2.-1.;
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}`
const fragment = `
varying vec2 vUv;
void main(){
  float falloff=max(0.,1.-dot(vUv,vUv));
  gl_FragColor=vec4(.16,.20,.16,.31*falloff*falloff);
}`
export function ContactShadow() {
  return (
    <mesh rotation-x={-Math.PI / 2} position-y={0.009} renderOrder={1}>
      <planeGeometry args={[1.12, 1.54]} />
      <shaderMaterial
        vertexShader={vertex}
        fragmentShader={fragment}
        transparent
        depthWrite={false}
        polygonOffset
        polygonOffsetFactor={-1}
      />
    </mesh>
  )
}
