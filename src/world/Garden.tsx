import { useLayoutEffect, useRef } from 'react'
import { Group } from 'three'
import { useFrame } from '@react-three/fiber'
import { Petals } from './environment/Petals'
import { bridge, emaRack, stoneLantern, torii } from './architecture/fixtures'
import { Inscriptions } from './architecture/Inscription'
import { Roofs } from './architecture/Shrine'
import { BAMBOO, GATE, LANTERNS, RACK, SHRINE, SIGN, TREES } from './layout'
import { buildInstances, Model } from './modeling'
import { shrineBuilding } from './architecture/shrineModel'
import { terrainDetails } from './terrain/terrainModel'
import { Ground } from './terrain/Ground'
import { planting } from './vegetation/planting'
import { Water } from './water/Water'

function landmarks(model: Model) {
  model.place(shrineBuilding(), [SHRINE[0], 0, SHRINE[1]])
  model.place(torii(), [GATE[0], 0, GATE[1]])
  model.place(torii(), [-4.56, 0, -5.68], -0.21, 0.56)
  model.place(emaRack(), [RACK[0], 0, RACK[1]], -0.12)
  LANTERNS.forEach(([x, z], i) => model.place(stoneLantern(), [x, 0, z], 0, i > 1 ? 0.76 : 0.92))
  bridge(model)
  const [x, z] = SIGN
  model.add('soft', [x, 0.91, z], [0.53, 1.82, 0.21], '#dbb677', [0, 0, 0])
  model.add('soft', [x, 1.86, z], [0.73, 0.12, 0.36], '#536764')
  model.add('soft', [x, 0.13, z], [0.74, 0.26, 0.53], '#a6aa92')
  // A low bamboo fence frames the rear garden, with bound joints at every post.
  for (const [start, end, z] of [
    [-7.28, -2.9, -6.95],
    [2.95, 7.27, -7.13],
    [-7.1, -4.6, 7.06],
    [3.6, 7.2, 7.19],
  ]) {
    const n = Math.ceil(end - start)
    for (let j = 0; j <= n; j++) {
      const x = start + ((end - start) * j) / n
      model.add('rod', [x, 0.4, z], [0.07, 0.8, 0.07], '#bcab73')
      for (const y of [0.28, 0.59]) model.add('rod', [x, y, z], [0.077, 0.072, 0.077], '#66634b')
    }
    for (const y of [0.28, 0.59]) model.beam([start - 0.09, y, z], [end + 0.09, y, z], 0.049, '#c9b480')
  }
  for (const t of TREES)
    model.add('ball', [t.x, 0.01, t.z], [1.02 * t.size, 0.043, 0.79 * t.size], '#91a75f')
  for (const [x, z] of BAMBOO) model.add('bloom', [x, 0.01, z], [1.08, 0.12, 0.94], '#94a861')
}
export function Garden() {
  const ref = useRef<Group>(null)
  const breeze = useRef({ value: 0 })
  useFrame((_, dt) => {
    breeze.current.value += Math.min(dt, 0.1)
  })
  useLayoutEffect(() => {
    const model = new Model()
    terrainDetails(model)
    planting(model)
    landmarks(model)
    const batch = buildInstances(model, breeze.current),
      parent = ref.current!
    parent.add(batch.group)
    return () => {
      parent.remove(batch.group)
      batch.dispose()
    }
  }, [])
  return (
    <group name="Shrine garden">
      <Ground />
      <group ref={ref} />
      <Roofs />
      <Water />
      <Inscriptions />
      <Petals />
    </group>
  )
}
