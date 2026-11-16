import {
  BoxGeometry,
  BufferGeometry,
  Color,
  ConeGeometry,
  CylinderGeometry,
  DodecahedronGeometry,
  Euler,
  Float32BufferAttribute,
  Group,
  IcosahedronGeometry,
  InstancedMesh,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  SphereGeometry,
  Vector3,
} from 'three'
import { RoundedBoxGeometry } from 'three/examples/jsm/geometries/RoundedBoxGeometry.js'

export type V3 = [number, number, number]
export type Point = [number, number]
export const TAU = Math.PI * 2
export function randomSource(seed: number) {
  return () => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0
    return seed / 4294967296
  }
}

function blossom() {
  const vertices = [0, 0.17, 0],
    faces: number[] = []
  for (let i = 0; i < 30; i++) {
    const a = (i * TAU) / 30,
      r = 0.74 + 0.26 * Math.cos(5 * a)
    vertices.push(r * Math.cos(a), 0.06 + 0.15 * r, r * Math.sin(a))
    faces.push(0, 1 + ((i + 1) % 30), i + 1)
  }
  return surfaceGeometry(vertices, faces)
}
export const shapeLibrary = () => ({
  box: new BoxGeometry(1, 1, 1),
  soft: new RoundedBoxGeometry(1, 1, 1, 1, 0.086),
  ball: new SphereGeometry(1, 14, 10),
  bud: new SphereGeometry(1, 8, 5),
  pebble: new IcosahedronGeometry(1, 0),
  rock: new DodecahedronGeometry(1, 0),
  bloom: new IcosahedronGeometry(1, 1),
  rod: new CylinderGeometry(1, 1, 1, 12),
  taper: new CylinderGeometry(0.72, 1, 1, 9),
  cone: new ConeGeometry(1, 1, 10),
  hip: new CylinderGeometry(0.48, 1, 1, 4, 1, false, Math.PI / 4),
  pad: new CylinderGeometry(1, 1, 1, 22, 1, false, 0.1, 5.89),
  blossom: blossom(),
})
export type ShapeName = keyof ReturnType<typeof shapeLibrary>
export interface Part {
  shape: ShapeName
  matrix: Matrix4
  color: Color
}
const up = new Vector3(0, 1, 0)
export class Model {
  parts: Part[] = []
  add(shape: ShapeName, at: V3, size: V3, color: string, rotation: V3 = [0, 0, 0]) {
    const matrix = new Matrix4().compose(
      new Vector3(...at),
      new Quaternion().setFromEuler(new Euler(...rotation)),
      new Vector3(...size),
    )
    this.parts.push({ shape, matrix, color: new Color(color) })
  }
  beam(a: V3, b: V3, radius: number, color: string, shape: ShapeName = 'rod', depth = radius) {
    const start = new Vector3(...a),
      end = new Vector3(...b)
    const axis = end.clone().sub(start)
    const matrix = new Matrix4().compose(
      start.lerp(end, 0.5),
      new Quaternion().setFromUnitVectors(up, axis.clone().normalize()),
      new Vector3(radius, axis.length(), depth),
    )
    this.parts.push({ shape, matrix, color: new Color(color) })
  }
  place(other: Model, at: V3, angle = 0, scale = 1) {
    const transform = new Matrix4().compose(
      new Vector3(...at),
      new Quaternion().setFromAxisAngle(up, angle),
      new Vector3().setScalar(scale),
    )
    for (const part of other.parts)
      this.parts.push({ ...part, matrix: transform.clone().multiply(part.matrix) })
  }
}

// Every family of repeated shapes shares geometry, material and a draw call.
export function buildInstances(model: Model, breeze?: { value: number }) {
  const library = shapeLibrary()
  const material = new MeshStandardMaterial({ roughness: 0.88 })
  const foliage = material.clone()
  if (breeze)
    foliage.onBeforeCompile = (shader) => {
      shader.uniforms.breeze = breeze
      shader.vertexShader =
        'uniform float breeze;\n' +
        shader.vertexShader.replace(
          '#include <project_vertex>',
          `
      vec4 mvPosition = instanceMatrix * vec4(transformed, 1.);
      float sway = clamp(mvPosition.y * .014, 0., .075);
      mvPosition.x += sway * sin(breeze * .84 + mvPosition.x * .85 + mvPosition.z * .6);
      mvPosition.z += sway * .41 * cos(breeze * .63 + mvPosition.x);
      mvPosition = modelViewMatrix * mvPosition;
      gl_Position = projectionMatrix * mvPosition;
    `,
        )
    }
  const group = new Group()
  for (const [name, geometry] of Object.entries(library)) {
    const parts = model.parts.filter((part) => part.shape === name)
    if (!parts.length) continue
    const windswept = breeze && ['bloom', 'blossom', 'pebble'].includes(name)
    const mesh = new InstancedMesh(geometry, windswept ? foliage : material, parts.length)
    mesh.name = name
    parts.forEach((part, i) => {
      mesh.setMatrixAt(i, part.matrix)
      mesh.setColorAt(i, part.color)
    })
    mesh.castShadow = mesh.receiveShadow = true
    group.add(mesh)
  }
  return {
    group,
    dispose() {
      group.children.forEach((mesh) => (mesh as InstancedMesh).dispose())
      Object.values(library).forEach((geometry) => geometry.dispose())
      material.dispose()
      foliage.dispose()
    },
  }
}
export function surfaceGeometry(vertices: number[], indices: number[]) {
  const geometry = new BufferGeometry()
  geometry.setAttribute('position', new Float32BufferAttribute(vertices, 3))
  geometry.setIndex(indices)
  geometry.computeVertexNormals()
  return geometry
}
