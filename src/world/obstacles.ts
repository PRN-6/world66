import {
  BAMBOO,
  GATE,
  HALF,
  LANTERNS,
  RACK,
  ROCKS,
  SHRINE,
  SIGN,
  TREES,
  BRIDGE,
  inPond,
} from './layout.ts'

export interface Obstacle {
  x: number
  z: number
  halfX: number
  halfZ: number
  height: number
  round?: boolean
}
const circle = (x: number, z: number, radius: number, height: number): Obstacle => ({
  x,
  z,
  halfX: radius,
  halfZ: radius,
  height,
  round: true,
})
export const obstacles: Obstacle[] = [
  { x: SHRINE[0], z: SHRINE[1] + 0.18, halfX: 2.67, halfZ: 1.99, height: 3.45 },
  { x: SHRINE[0], z: SHRINE[1] + 2.44, halfX: 1.3, halfZ: 0.42, height: 0.42 },
  { x: RACK[0], z: RACK[1], halfX: 1.19, halfZ: 0.23, height: 2.4 },
  { x: SIGN[0], z: SIGN[1], halfX: 0.36, halfZ: 0.26, height: 1.92 },
  ...TREES.map((t) => circle(t.x, t.z, 0.47 * t.size, 2.8 * t.size)),
  ...BAMBOO.map(([x, z]) => circle(x, z, 0.85, 3.2)),
  ...LANTERNS.map(([x, z]) => circle(x, z, 0.32, 1.55)),
  ...ROCKS.map(([x, z, s]) => circle(x + 0.08, z, s * 1.17, 1.13 * s)),
  ...[-1, 1].map((s) => circle(GATE[0] + s * 1.75, GATE[1], 0.265, 3.6)),
  ...[-1, 1].map((s) => circle(-4.56 + s * 0.96, -5.68 + s * 0.21, 0.15, 1.95)),
  ...[
    [-5.74, 7.06, 1.36],
    [5.4, 7.19, 1.89],
    [-5.09, -6.95, 2.28],
    [5.11, -7.13, 2.24],
  ].map(([x, z, halfX]) => ({ x, z, halfX, halfZ: 0.09, height: 0.8 })),
]
export const CLEARANCE = 0.4
export function walkable(x: number, z: number, r = CLEARANCE) {
  if (Math.abs(x) > HALF - 0.35 - r || Math.abs(z) > HALF - 0.35 - r) return false
  const onDeck =
    Math.abs(z - BRIDGE.z) < BRIDGE.halfWidth - r * 0.65 &&
    Math.abs(x - BRIDGE.x) < BRIDGE.halfLength + 0.35
  if (!onDeck && inPond(x, z, r)) return false
  if (
    Math.abs(x - BRIDGE.x) < BRIDGE.halfLength + 0.15 &&
    Math.abs(Math.abs(z - BRIDGE.z) - BRIDGE.halfWidth) < r + 0.055
  )
    return false
  return !obstacles.some((o) => {
    const dx = Math.max(0, Math.abs(x - o.x) - o.halfX),
      dz = Math.max(0, Math.abs(z - o.z) - o.halfZ)
    return o.round ? Math.hypot(x - o.x, z - o.z) < o.halfX + r : Math.hypot(dx, dz) < r
  })
}
