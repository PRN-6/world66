import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import {
  Group,
  Mesh,
  MeshStandardMaterial,
  SphereGeometry,
  Color,
  Float32BufferAttribute,
  type BufferGeometry,
  Vector3,
} from 'three'
import { mergeGeometries } from 'three/examples/jsm/utils/BufferGeometryUtils.js'
import { PONDS } from '../layout'

function koiGeometry(index: number) {
  const pieces: BufferGeometry[] = []
  const spot = new Color(),
    v = new Vector3()
  function lobe(
    x: number,
    y: number,
    z: number,
    w: number,
    h: number,
    l: number,
    color: string,
    angle = 0,
    body = false,
  ) {
    const g = new SphereGeometry(1, body ? 38 : 12, body ? 18 : 7),
      p = g.getAttribute('position'),
      rgb: number[] = []
    for (let i = 0; i < p.count; i++) {
      v.fromBufferAttribute(p, i)
      let c = color
      if (body && Math.sin(v.z * 7.5 + index * 1.8 + 1.7 * v.x) + 0.4 * v.y > 0.18)
        c = index % 3 === 1 ? '#efa943' : '#e86c43'
      if (body && index % 3 === 2 && v.x > 0.03 && v.z < -0.2) c = '#5a6262'
      spot.set(c)
      rgb.push(spot.r, spot.g, spot.b)
    }
    g.setAttribute('color', new Float32BufferAttribute(rgb, 3))
    g.scale(w, h, l)
    g.rotateY(angle)
    g.translate(x, y, z)
    pieces.push(g)
  }
  lobe(0, 0, 0, 0.128, 0.061, 0.37, '#fff0cf', 0, true)
  for (const s of [-1, 1]) {
    lobe(s * 0.122, -0.006, 0.03, 0.07, 0.015, 0.119, '#e8bf8c', s * 0.81)
    lobe(s * 0.042, 0, -0.387, 0.063, 0.018, 0.14, '#f1c899', -s * 0.35)
    lobe(s * 0.074, 0.029, 0.221, 0.013, 0.012, 0.017, '#413f3b')
  }
  const geometry = mergeGeometries(pieces)!
  pieces.forEach((g) => g.dispose())
  return geometry
}
export function Koi() {
  const parent = useRef<Group>(null),
    fish = useRef<Mesh[]>([]),
    time = useRef(0)
  useLayoutEffect(() => {
    const group = parent.current!,
      material = new MeshStandardMaterial({ vertexColors: true, roughness: 0.61 })
    const phase = { value: 0 }
    material.onBeforeCompile = (shader) => {
      shader.uniforms.swimTime = phase
      shader.vertexShader =
        'uniform float swimTime;\n' +
        shader.vertexShader.replace(
          '#include <begin_vertex>',
          '#include <begin_vertex>\n transformed.x += .12 * smoothstep(.05,.50,-position.z) * sin(swimTime * 5. + position.z*11. + modelMatrix[3].x);',
        )
    }
    group.userData.phase = phase
    const school = Array.from({ length: 9 }, (_, i) => {
      const mesh = new Mesh(koiGeometry(i), material)
      mesh.scale.setScalar(i < 6 ? 1.1 : 0.78)
      group.add(mesh)
      return mesh
    })
    fish.current = school
    return () => {
      school.forEach((m) => {
        group.remove(m)
        m.geometry.dispose()
      })
      material.dispose()
      fish.current = []
    }
  }, [])
  useFrame((_, dt) => {
    time.current += Math.min(dt, 0.1)
    if (!parent.current?.userData.phase) return
    parent.current.userData.phase.value = time.current
    fish.current.forEach((m, i) => {
      const p = PONDS[i < 6 ? 0 : 1],
        a = i * 2.39 + time.current * (0.12 + 0.018 * (i % 4)) * (i % 3 === 1 ? -1 : 1)
      const rx = p.rx * (0.34 + 0.076 * (i % 4)),
        rz = p.rz * (0.45 + 0.06 * (i % 3))
      const x = rx * Math.cos(a) + 0.16 * Math.sin(2 * a),
        z = rz * Math.sin(a)
      m.position.set(p.x + x, -0.148, p.z + z)
      m.rotation.y =
        Math.atan2(-rx * Math.sin(a) + 0.32 * Math.cos(2 * a), rz * Math.cos(a)) +
        (i % 3 === 1 ? Math.PI : 0)
    })
  })
  return <group ref={parent} name="Koi" />
}
