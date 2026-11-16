import type { Point } from './modeling'
export const HALF = 8
export const SHRINE: Point = [0.25, -4.15]
export const GATE: Point = [-2.7, 4.65]
export const PONDS = [
  { x: 4.5, z: 2.3, rx: 2.55, rz: 3.15, phase: 0.25 },
  { x: -5.75, z: -1.15, rx: 1.45, rz: 1.75, phase: 1.9 },
]
export function bank(angle: number, phase: number) {
  return 1 + 0.105 * Math.sin(3 * angle + phase) + 0.045 * Math.cos(5 * angle - phase)
}
export function pondPoint(i: number, angle: number, scale = 1): Point {
  const p = PONDS[i], r = bank(angle, p.phase) * scale
  return [p.x + Math.cos(angle) * p.rx * r, p.z + Math.sin(angle) * p.rz * r]
}
export function inPond(x: number, z: number, margin = 0) {
  return PONDS.some(p => {
    const dx = (x-p.x)/(p.rx + margin), dz = (z-p.z)/(p.rz + margin)
    return Math.hypot(dx, dz) < bank(Math.atan2(dz, dx), p.phase)
  })
}
export const BRIDGE = { x: 4.38, z: 1.8, halfLength: 2.56, halfWidth: 0.68 }
export function bridgeHeight(x: number, z: number) {
  const t = (x - BRIDGE.x) / BRIDGE.halfLength
  return Math.abs(t) <= 1 && Math.abs(z - BRIDGE.z) < BRIDGE.halfWidth ? 0.07 + 0.62 * (1 - t * t) : 0
}
export const TREES = [
  { x: -5.55, z: -4.35, size: 1.17, turn: 0.5, pink: true },
  { x: 5.65, z: -5.3, size: 0.91, turn: -0.8, pink: true },
  { x: -6.25, z: 3.1, size: 0.68, turn: 1.7, pink: true },
  { x: 6.62, z: 5.98, size: 0.56, turn: 2.3, pink: false },
]
export const LANTERNS: Point[] = [[-3.75,-1.22],[2.55,-1.45],[-4.8,5.22],[-0.64,5.12],[6.9,-0.65]]
export const BAMBOO: Point[] = [[-6.9,-6.6],[4.05,-6.95],[6.75,-3.75]]
export const ROCKS: [number, number, number][] = [[-6.7,0.76,0.6],[-4.15,-2.8,0.51],[5.8,5.5,0.5],[1.7,4.45,0.56],[6.95,3.83,0.52],[-5.88,6.32,0.64],[3.9,-3.7,0.48],[-6.75,-5.8,0.5]]
export const PATH: Point[] = [[-2.7,8],[-2.7,4.65],[-2.2,2.55],[-1.4,1.35],[0.2,0.05],[0.25,-1.7]]
export const QUIET: Point[] = [[-4.8,2.1],[-3.8,-4.4],[2.8,5.7],[0.85,5.4]]
export const SIGHTS: Point[] = [[-4.2,0],[-2.7,4.3],[0,0.85],[1.18,2],[7.12,1.8],[3.8,6.02],[-4.2,5.7],[-3.3,-2.1]]
export const RACK: Point = [4.62,-2.57]
export const SIGN: Point = [-4.25,6.45]

