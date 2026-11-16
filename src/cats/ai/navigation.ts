import type { Point } from '../../world/modeling'
import { walkable } from '../../world/obstacles.ts'

const STEP = 0.3,
  N = 51,
  ORIGIN = (-(N - 1) * STEP) / 2
export const CAT_SPACING = 0.98
const coord = (id: number): Point => [ORIGIN + (id % N) * STEP, ORIGIN + Math.floor(id / N) * STEP]
const directions = [
  [-1, 0],
  [1, 0],
  [0, -1],
  [0, 1],
  [-1, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
]
export const distance = (a: Point, b: Point) => Math.hypot(a[0] - b[0], a[1] - b[1])
export function clearLine(a: Point, b: Point, blocked: Point[] = []) {
  const steps = Math.max(1, Math.ceil(distance(a, b) / 0.12))
  for (let i = 1; i <= steps; i++) {
    const t = i / steps,
      x = a[0] + (b[0] - a[0]) * t,
      z = a[1] + (b[1] - a[1]) * t
    if (!walkable(x, z) || blocked.some((p) => Math.hypot(x - p[0], z - p[1]) < CAT_SPACING))
      return false
  }
  return true
}
export class GardenNavigation {
  cells = Array.from({ length: N * N }, (_, i) => walkable(...coord(i)))
  // Precompute swept edges once. Diagonals cannot cut a pond bank or building corner.
  edges = this.cells.map((free, i) => {
    if (!free) return []
    const x = i % N,
      z = Math.floor(i / N)
    return directions.flatMap(([dx, dz]) => {
      const nx = x + dx,
        nz = z + dz,
        j = nz * N + nx
      return nx >= 0 && nx < N && nz >= 0 && nz < N && this.cells[j] && clearLine(coord(i), coord(j))
        ? [j]
        : []
    })
  })
  closest(goal: Point, blocked: Point[] = [], from?: Point) {
    const ix = Math.round((goal[0] - ORIGIN) / STEP),
      iz = Math.round((goal[1] - ORIGIN) / STEP)
    if (ix >= 0 && ix < N && iz >= 0 && iz < N) {
      const nearest = iz * N + ix,
        p = coord(nearest)
      if (
        this.cells[nearest] &&
        blocked.every((b) => distance(b, p) >= CAT_SPACING) &&
        (!from || clearLine(from, p, blocked))
      )
        return nearest
    }
    let id = -1,
      best = Infinity
    for (let i = 0; i < this.cells.length; i++) {
      if (!this.cells[i]) continue
      const p = coord(i),
        d = distance(goal, p)
      if (
        d >= best ||
        blocked.some((b) => distance(b, p) < CAT_SPACING) ||
        (from && !clearLine(from, p, blocked))
      )
        continue
      best = d
      id = i
    }
    return id
  }
  route(start: Point, goal: Point, blocked: Point[] = []): Point[] {
    if (clearLine(start, goal, blocked)) return [goal]
    const begin = this.closest(start, blocked, start),
      end = this.closest(goal, blocked)
    if (begin < 0 || end < 0) return []
    const target = coord(end),
      score = new Float32Array(N * N).fill(Infinity),
      parent = new Int16Array(N * N).fill(-1)
    const open = [begin],
      closed = new Uint8Array(N * N)
    score[begin] = 0
    while (open.length) {
      let best = 0,
        bestF = Infinity
      for (let i = 0; i < open.length; i++) {
        const f = score[open[i]] + distance(coord(open[i]), target)
        if (f < bestF) {
          best = i
          bestF = f
        }
      }
      const current = open[best]
      open[best] = open[open.length - 1]
      open.pop()
      if (current === end) {
        const path: Point[] = []
        for (let node = end; node !== -1; node = parent[node]) path.push(coord(node))
        path.reverse()
        if (walkable(...goal) && clearLine(target, goal, blocked)) path.push(goal)
        const smooth: Point[] = []
        let p = start
        for (let n = 0; n < path.length;) {
          let far = n
          while (far + 1 < path.length && clearLine(p, path[far + 1], blocked)) far++
          smooth.push(path[far])
          p = path[far]
          n = far + 1
        }
        return smooth
      }
      if (closed[current]) continue
      closed[current] = 1
      for (const next of this.edges[current]) {
        if (closed[next]) continue
        const p = coord(next)
        if (blocked.length && !clearLine(coord(current), p, blocked)) continue
        const cost = score[current] + distance(coord(current), p)
        if (cost >= score[next]) continue
        score[next] = cost
        parent[next] = current
        open.push(next)
      }
    }
    return []
  }
}
