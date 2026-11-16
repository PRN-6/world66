const vertex = `
varying vec2 p;
void main() {
  p = uv;
  gl_Position = vec4(position.xy * 2.0, 0.99999, 1.0);
}`
const fragment = `
varying vec2 p;
uniform float aspect;
float ridge(float x,float seed){
  return 0.038*sin(8.0*x+seed)+0.027*sin(17.0*x+seed)+0.009*cos(38.0*x+seed);
}
void main(){
  vec2 uv=p;
  float y=uv.y;
  vec3 col=mix(vec3(.97,.825,.733),vec3(.516,.657,.738),smoothstep(.31,1.09,y));
  vec2 sun=(uv-vec2(.807,.765))*vec2(aspect,1.);
  float d=length(sun);
  col=mix(col,vec3(1.,.901,.758),.19*exp(-d*5.)+.76*(1.-smoothstep(.039,.041,d)));
  float x=(uv.x-.5)*aspect;
  float a=.39+ridge(x,1.27);
  col=mix(col,vec3(.699,.747,.741),.68*(1.-smoothstep(a,a+.004,y)));
  float b=.32+ridge(x*.78,6.);
  col=mix(col,vec3(.585,.697,.698),.71*(1.-smoothstep(b,b+.003,y)));
  float c=.25+ridge(x*1.13,2.2);
  col=mix(col,vec3(.513,.638,.641),.75*(1.-smoothstep(c,c+.003,y)));
  col=mix(vec3(.455,.61,.614),col,smoothstep(-.23,.21,y));
  col+=(fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453)-.5)*.008;
  gl_FragColor=vec4(col,1.);
}`
import { useThree } from '@react-three/fiber'
export function Backdrop() {
  const size=useThree(s=>s.size)
  return <mesh frustumCulled={false} renderOrder={-100}>
    <planeGeometry args={[1,1]}/>
    <shaderMaterial vertexShader={vertex} fragmentShader={fragment} uniforms={{aspect:{value:size.width/size.height}}} depthWrite={false} depthTest={false} toneMapped={false}/>
  </mesh>
}

