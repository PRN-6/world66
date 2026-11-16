import { BRIDGE, HALF, PATH, PONDS, STEPPING, pondPoint } from '../world/layout.ts'
import { obstacles } from '../world/obstacles.ts'
import { TAU, type V3 } from '../world/modeling.ts'
import { CollisionGroups as G } from '../types/physics.ts'

type Box = { kind: 'box'; args: V3 }
type Cylinder = { kind: 'cylinder'; args: [number, number] }
export type FixedCollider = (Box | Cylinder) & { at: V3; rotation: V3; mask: number }

export function gardenCollisionLayout() {
  const shapes: FixedCollider[] = []
  const architecture = (G.ARCHITECTURE << 16) | G.INTERACTABLES,
    terrain = (G.TERRAIN << 16) | G.INTERACTABLES
  function box(at: V3, args: V3, rotation: V3 = [0, 0, 0], mask = architecture) {
    shapes.push({ kind: 'box', at, args, rotation, mask })
  }
  function cylinder(at: V3, halfHeight: number, radius: number) {
    shapes.push({
      kind: 'cylinder',
      at,
      args: [halfHeight, radius],
      rotation: [0, 0, 0],
      mask: architecture,
    })
  }
  box([0, -0.5, 0], [HALF, 0.5, HALF], [0, 0, 0], terrain)
  for (const s of [-1, 1]) {
    box([0, 1.4, s * (HALF - 0.11)], [HALF, 1.5, 0.12])
    box([s * (HALF - 0.11), 1.4, 0], [0.12, 1.5, HALF])
  }
  PATH.slice(1).forEach(([x, z], i) => {
    const [ax, az] = PATH[i]
    box(
      [(ax + x) / 2, 0.046, (az + z) / 2],
      [0.94, 0.046, Math.hypot(x - ax, z - az) / 2],
      [0, Math.atan2(x - ax, z - az), 0],
    )
  })
  STEPPING.forEach(([x, z]) => cylinder([x, 0.054, z], 0.054, 0.32))
  for (const o of obstacles) {
    const at: V3 = [o.x, o.height / 2, o.z]
    if (o.round) cylinder(at, o.height / 2, o.halfX)
    else box(at, [o.halfX, o.height / 2, o.halfZ])
  }
  PONDS.forEach((_, p) => {
    for (let i = 0; i < 36; i++) {
      const a = pondPoint(p, (TAU * i) / 36),
        b = pondPoint(p, (TAU * (i + 1)) / 36)
      const x = (a[0] + b[0]) / 2,
        z = (a[1] + b[1]) / 2
      if (p === 0 && Math.abs(z - BRIDGE.z) < BRIDGE.halfWidth + 0.16) continue
      box(
        [x, 0.16, z],
        [Math.hypot(b[0] - a[0], b[1] - a[1]) / 2 + 0.02, 0.25, 0.085],
        [0, Math.atan2(a[1] - b[1], b[0] - a[0]), 0],
      )
    }
  })
  for (let i = 0; i < 16; i++) {
    const t = (i + 0.5) / 8 - 1,
      x = BRIDGE.x + t * BRIDGE.halfLength,
      y = 0.07 + 0.62 * (1 - t * t)
    const rotation: V3 = [0, 0, Math.atan((-1.24 * t) / BRIDGE.halfLength)]
    box([x, y - 0.067, BRIDGE.z], [BRIDGE.halfLength / 16 + 0.007, 0.067, BRIDGE.halfWidth], rotation)
    for (const s of [-1, 1])
      box(
        [x, y + 0.27, BRIDGE.z + s * BRIDGE.halfWidth],
        [BRIDGE.halfLength / 16 + 0.01, 0.25, 0.06],
        rotation,
      )
  }
  return shapes
}
