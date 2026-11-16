import {
  Bone,
  BufferGeometry,
  Color,
  Euler,
  Float32BufferAttribute,
  Matrix4,
  MeshStandardMaterial,
  Quaternion,
  Skeleton,
  SkinnedMesh,
  SphereGeometry,
  Uint16BufferAttribute,
  Vector3,
} from 'three'
import { shapeLibrary, type ShapeName, type V3 } from '../../world/modeling'
import type { CatProfile } from '../profiles'

const coats = {
  tabby: ['#e69b54', '#a35b32', '#fff0d7', '#719884'],
  snow: ['#f8ede0', '#e7d6c7', '#fff8ea', '#80b8bd'],
  tuxedo: ['#40404a', '#33333b', '#f8ebd9', '#d3b469'],
  calico: ['#fbefda', '#c17b45', '#f8e8cf', '#a2ad72'],
  smoke: ['#969da3', '#66717c', '#e4e0d7', '#9dbb8a'],
} as const
export function makeCat(profile: CatProfile) {
  const library = shapeLibrary(),
    furGeometry = new SphereGeometry(1, 56, 36)
  const vertices: number[] = [],
    normals: number[] = [],
    colors: number[] = [],
    joints: number[] = [],
    weights: number[] = [],
    indices: number[] = []
  const bones: Bone[] = []
  function joint(parent: Bone | null, at: V3, name: string) {
    const bone = new Bone()
    bone.name = name
    bone.position.set(...at)
    parent?.add(bone)
    bone.updateWorldMatrix(true, false)
    bones.push(bone)
    return bone
  }
  const palette = coats[profile.coat],
    base = palette[0],
    mark = palette[1],
    cream = palette[2]
  const colorCache = new Map<string, Color>()
  const tint = (c: string) => {
    let value = colorCache.get(c)
    if (!value) {
      value = new Color(c)
      colorCache.set(c, value)
    }
    return value
  }
  const fur = (x: number, y: number, z: number, head: boolean) => {
    if (profile.coat === 'calico') {
      if ((x + 0.65) ** 2 + (y - 0.46) ** 2 + (z - (head ? 0.56 : 0.27)) ** 2 < 0.87) return '#49464a'
      if ((x - 0.56) ** 2 + (y - 0.6) ** 2 + (z - (head ? 0.52 : -0.05)) ** 2 < 0.88) return '#d38e50'
      if (!head && z < -0.4 && x < 0.3) return '#b47e4d'
    }
    if (
      profile.coat === 'tuxedo' &&
      ((head && z > 0.55 && Math.abs(x) < 0.17 * (1.35 - y)) || (!head && z > 0.41 && y < 0.55))
    )
      return cream
    if (profile.coat === 'tabby' || profile.coat === 'smoke') {
      if (
        head &&
        y > 0.24 &&
        z > 0.2 &&
        Math.abs(x) < 0.54 &&
        Math.cos(24 * x + 1.8 * y) > 0.44 + 0.4 * (1 - y)
      )
        return mark
      if (!head && y > -0.16 && Math.cos(z * 17 + 0.85 * y) > 0.46 - 0.25 * y) return mark
    }
    return y < -0.56 ? cream : base
  }
  function part(
    bone: Bone,
    shape: ShapeName | 'fur',
    at: V3,
    size: V3,
    color: string,
    rot: V3 = [0, 0, 0],
    head = false,
  ) {
    const g = shape === 'fur' ? furGeometry : library[shape],
      p = g.getAttribute('position'),
      n = g.getAttribute('normal')
    const transform = bone.matrixWorld
      .clone()
      .multiply(
        new Matrix4().compose(
          new Vector3(...at),
          new Quaternion().setFromEuler(new Euler(...rot)),
          new Vector3(...size),
        ),
      )
    const normalMatrix = transform.clone().invert().transpose()
    const start = vertices.length / 3,
      bi = bones.indexOf(bone),
      v = new Vector3()
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i)
      const c = tint(shape === 'fur' ? fur(v.x, v.y, v.z, head) : color)
      v.applyMatrix4(transform)
      vertices.push(v.x, v.y, v.z)
      v.fromBufferAttribute(n, i).transformDirection(normalMatrix)
      normals.push(v.x, v.y, v.z)
      colors.push(c.r, c.g, c.b)
      joints.push(bi, 0, 0, 0)
      weights.push(1, 0, 0, 0)
    }
    const count = g.index?.count ?? p.count
    for (let i = 0; i < count; i++) indices.push(start + (g.index?.getX(i) ?? i))
  }
  const spine = joint(null, [0, 0.5, 0], 'Spine')
  part(spine, 'fur', [0, 0.01, -0.08], [0.3, 0.32, 0.52], base)
  const head = joint(spine, [0, 0.37, 0.31], 'Head')
  part(head, 'fur', [0, 0.018, 0.025], [0.367, 0.317, 0.305], base, [0, 0, 0], true)
  const eyes = joint(head, [0, 0.06, 0], 'Eyelids')
  for (const s of [-1, 1]) {
    const ear = profile.coat === 'calico' ? (s < 0 ? '#49464a' : '#c58d53') : base
    part(head, 'cone', [s * 0.218, 0.283, -0.007], [0.151, 0.36, 0.137], ear, [-0.06, 0, -s * 0.25])
    part(head, 'cone', [s * 0.223, 0.298, 0.069], [0.099, 0.258, 0.065], '#d99b98', [
      0.02,
      0,
      -s * 0.25,
    ])
    part(eyes, 'ball', [s * 0.152, 0, 0.277], [0.069, 0.085, 0.033], '#433837', [
      0,
      s * 0.38,
      s * 0.045,
    ])
    part(eyes, 'ball', [s * 0.152, -0.005, 0.301], [0.054, 0.067, 0.018], palette[3], [0, s * 0.38, 0])
    part(eyes, 'ball', [s * 0.151, 0.008, 0.313], [0.035, 0.059, 0.015], '#333039', [0, s * 0.38, 0])
    part(eyes, 'ball', [s * 0.151 - 0.012, 0.032, 0.328], [0.018, 0.019, 0.009], '#fff8df')
    part(head, 'ball', [s * 0.072, -0.056, 0.294], [0.094, 0.07, 0.05], cream)
    for (let j = 0; j < 3; j++)
      part(
        head,
        'ball',
        [s * 0.273, -0.053 - j * 0.035, 0.229],
        [0.105, 0.008, 0.009],
        profile.coat === 'tuxedo' ? '#e0d6c5' : '#856d61',
        [0, s * 0.4, s * (0.13 - j * 0.15)],
      )
  }
  part(head, 'ball', [0, -0.029, 0.347], [0.039, 0.024, 0.021], '#b97571')
  part(head, 'ball', [0, -0.074, 0.339], [0.009, 0.024, 0.009], '#875e53')
  part(
    spine,
    'ball',
    [0, 0.24, 0.279],
    [0.247, 0.102, 0.235],
    profile.coat === 'calico' ? '#619a88' : '#b95e50',
    [-0.25, 0, 0],
  )
  part(spine, 'ball', [0, 0.17, 0.511], [0.055, 0.057, 0.047], '#ddb86b')
  const legs = [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ].map(([s, f], i) => {
    const leg = joint(spine, [s * 0.191, -0.065, f * 0.295 - 0.035], 'Leg' + i)
    part(leg, 'ball', [0, -0.133, 0], [0.114, f < 0 ? 0.215 : 0.19, f < 0 ? 0.145 : 0.1], base)
    part(
      leg,
      'ball',
      [0, -0.286, 0.006],
      [0.087, 0.112, 0.09],
      profile.coat === 'tuxedo' ? cream : base,
    )
    part(leg, 'ball', [0, -0.353, 0.042], [0.101, 0.077, 0.127], cream)
    return leg
  })
  const tail: Bone[] = []
  for (let i = 0; i < 6; i++) {
    const b = joint(tail[i - 1] ?? spine, i === 0 ? [0, 0.05, -0.49] : [0, 0.129, 0], 'Tail' + i)
    const r = 0.084 - i * 0.004
    part(
      b,
      'ball',
      [0, 0.063, 0],
      [r, 0.12, r],
      i === 5 || ((profile.coat === 'tabby' || profile.coat === 'smoke') && i % 2) ? mark : base,
    )
    tail.push(b)
  }
  const geometry = new BufferGeometry()
  for (const [key, data, width] of [
    ['position', vertices, 3],
    ['normal', normals, 3],
    ['color', colors, 3],
    ['skinWeight', weights, 4],
  ] as const)
    geometry.setAttribute(key, new Float32BufferAttribute(data, width))
  geometry.setAttribute('skinIndex', new Uint16BufferAttribute(joints, 4))
  geometry.setIndex(indices)
  const material = new MeshStandardMaterial({ vertexColors: true, roughness: 0.86 })
  const mesh = new SkinnedMesh(geometry, material),
    skeleton = new Skeleton(bones)
  mesh.add(spine)
  mesh.bind(skeleton)
  mesh.receiveShadow = true
  mesh.frustumCulled = false
  mesh.name = profile.id
  Object.values(library).forEach((g) => g.dispose())
  furGeometry.dispose()
  return {
    mesh,
    spine,
    head,
    eyes,
    legs,
    tail,
    dispose() {
      geometry.dispose()
      material.dispose()
      skeleton.dispose()
    },
  }
}
export type CatRig = ReturnType<typeof makeCat>
