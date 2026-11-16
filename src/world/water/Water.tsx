import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Group, ShaderMaterial, Vector2 } from 'three'
import { PONDS, pondPoint } from '../layout'
import { buildInstances, Model, randomSource, TAU } from '../modeling'
import { pondOutline } from '../terrain/terrainModel'
import { Koi } from './Koi'

const waterVertex = `
varying vec2 p;
void main(){
  p=vec2(position.x,-position.y);
  gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);
}`
const waterFragment = `
uniform float t;
uniform float phase;
uniform vec2 center;
uniform vec2 radius;
varying vec2 p;
void main(){
  vec2 d=(p-center)/radius;
  float a=atan(d.y,d.x);
  float shore=length(d)/(1.+.105*sin(3.*a+phase)+.045*cos(5.*a-phase));
  float light=.5+.5*sin(p.x*2.1+p.y*.8)+.15*sin(4.*p.y);
  vec3 col=mix(vec3(.073,.405,.406),vec3(.302,.661,.585),smoothstep(.10,.96,shore)+.06*light);
  float edge=1.-smoothstep(.008,.023,abs(shore-.95-.009*sin(a*17.+t)));
  col+=vec3(.17,.17,.105)*edge;
  float w=sin(9.*p.y+1.8*sin(2.05*p.x+.5*t)+.8*sin(p.y*3.4-.64*t)+t*.56);
  float glint=smoothstep(.965,.999,w)*smoothstep(.33,.85,sin(p.x*4.16+p.y*3.-t*.27));
  col+=vec3(.11,.17,.13)*glint;
  gl_FragColor=vec4(col,1.);
}`
const reflectionVertex = `
varying vec3 worldPoint;
void main(){
  vec4 point=modelMatrix*vec4(position,1.);
  worldPoint=point.xyz;
  gl_Position=projectionMatrix*viewMatrix*point;
}`
const reflectionFragment = `
uniform float t;
uniform vec2 center;
varying vec3 worldPoint;
float crown(vec3 direction,vec3 center,float radius){
  vec3 toTree=center-worldPoint;
  float along=dot(toTree,direction);
  return step(0.,along)*(1.-smoothstep(radius*.62,radius,length(toTree-along*direction)));
}
void main(){
  vec2 p=worldPoint.xz;
  vec3 n=normalize(vec3(.023*sin(p.x*5.+t),1.,.044*sin(p.y*7.4+.7*t+sin(p.x*2.))));
  vec3 eye=isOrthographic?vec3(viewMatrix[0][2],viewMatrix[1][2],viewMatrix[2][2]):normalize(cameraPosition-worldPoint);
  vec3 ray=reflect(-eye,n);
  float pink=max(crown(ray,vec3(-5.7,4.1,-4.35),2.57),crown(ray,vec3(5.65,3.6,-5.3),2.15));
  float green=crown(ray,vec3(6.62,2.,5.98),1.32);
  vec3 reflection=mix(vec3(.79,.86,.85),vec3(.88,.66,.72),pink);
  reflection=mix(reflection,vec3(.36,.53,.39),green);
  float phase=fract(t*.23+center.x*.37);
  float ring=1.-smoothstep(.008,.026,abs(length((p-center-vec2(.28,.49))*vec2(1.,1.04))-.81*phase));
  float strength=.075+.14*pow(1.-abs(eye.y),2.)+.19*pink+.15*green;
  gl_FragColor=vec4(reflection,strength+.37*ring*sin(3.14159*phase));
}`
function shorePlants(model: Model) {
  const rand = randomSource(329)
  PONDS.forEach((_, p) => {
    for (const center of p ? [0.34, 1.82, 4.5] : [0.65, 1.79, 2.35, 4.16, 5.2]) {
      for (let j = 0; j < 4; j++) {
        const a = center + rand() * 0.25,
          [x, z] = pondPoint(p, a, 0.65 + rand() * 0.17),
          r = 0.13 + rand() * 0.12
        model.add('pad', [x, -0.083, z], [r, 0.025, r * 0.92], j % 2 ? '#83ab72' : '#94bb7e', [
          0,
          a * 3,
          0,
        ])
        if (j === 0) {
          for (let k = 0; k < 8; k++) {
            const turn = (k * TAU) / 8
            model.add(
              'ball',
              [x + 0.068 * Math.sin(turn), 0.003, z + 0.068 * Math.cos(turn)],
              [0.049, 0.078, 0.096],
              k % 2 ? '#f7b2b8' : '#fbe3ce',
              [-0.55, turn, 0],
            )
          }
          model.add('ball', [x, 0.03, z], [0.047, 0.061, 0.047], '#edba67')
        }
      }
      const [rx, rz] = pondPoint(p, center, 1.06)
      for (let j = 0; j < 8; j++) {
        const x = rx + (rand() - 0.5) * 0.36,
          z = rz + (rand() - 0.5) * 0.36,
          h = 0.35 + rand() * 0.48,
          lean = (rand() - 0.5) * 0.31
        model.beam([x, 0, z], [x + lean, h, z + 0.1], 0.028, j % 3 ? '#7c9b5f' : '#94ac67', 'taper')
        if (j % 3 === 0)
          model.add('ball', [x + lean, h, z + 0.1], [0.042, 0.105, 0.042], '#906f4e', [0, 0, -lean])
      }
    }
  })
}
export function Water() {
  const bank = useRef<Group>(null)
  const materials = useRef<(ShaderMaterial | null)[]>([])
  const waterTime = useRef(0)
  const ponds = useMemo(
    () =>
      PONDS.map((p, i) => ({
        shape: pondOutline(i),
        uniforms: {
          t: { value: 0 },
          phase: { value: p.phase },
          center: { value: new Vector2(p.x, p.z) },
          radius: { value: new Vector2(p.rx, p.rz) },
        },
      })),
    [],
  )
  useFrame((_, dt) => {
    waterTime.current += Math.min(dt, 0.1)
    for (const material of materials.current)
      if (material) material.uniforms.t.value = waterTime.current
  })
  useLayoutEffect(() => {
    const m = new Model()
    shorePlants(m)
    const batch = buildInstances(m),
      parent = bank.current!
    parent.add(batch.group)
    return () => {
      parent.remove(batch.group)
      batch.dispose()
    }
  }, [])
  return (
    <group name="Koi ponds">
      {ponds.map(({ shape, uniforms }, i) => (
        <group key={i}>
          <mesh position-y={-0.25} rotation-x={-Math.PI / 2}>
            <shapeGeometry args={[shape]} />
            <shaderMaterial
              ref={(m) => {
                materials.current[i] = m
              }}
              vertexShader={waterVertex}
              fragmentShader={waterFragment}
              uniforms={uniforms}
              toneMapped={false}
            />
          </mesh>
          <mesh position-y={-0.078} rotation-x={-Math.PI / 2}>
            <shapeGeometry args={[shape]} />
            <shaderMaterial
              ref={(m) => {
                materials.current[i + ponds.length] = m
              }}
              vertexShader={reflectionVertex}
              fragmentShader={reflectionFragment}
              uniforms={uniforms}
              transparent
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </group>
      ))}
      <group ref={bank} />
      <Koi />
    </group>
  )
}
