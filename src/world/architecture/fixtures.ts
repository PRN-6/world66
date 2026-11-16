import { Model, type V3 } from '../modeling'
import { BRIDGE } from '../layout'
export const wood = '#9e4832',
  red = '#cd563b',
  trim = '#efb86a',
  ink = '#37494b',
  stone = '#959e89'
export function paperLamp(m: Model, x: number, y: number, z: number, size = 1) {
  const l = new Model()
  l.add('ball', [0, 0, 0], [0.24, 0.335, 0.24], '#ffbc67')
  for (const h of [-0.26, -0.13, 0, 0.13, 0.26]) {
    const r = 0.243 * Math.sqrt(1 - (h * h) / 0.335 ** 2)
    l.add('rod', [0, h, 0], [r, 0.013, r], '#bd784d')
  }
  for (const h of [-0.32, 0.32]) l.add('rod', [0, h, 0], [0.115, 0.05, 0.115], ink)
  l.beam([0, 0.34, 0], [0, 0.58, 0], 0.018, ink)
  l.beam([0, -0.33, 0], [0, -0.48, 0], 0.025, '#b64433')
  m.place(l, [x, y, z], 0, size)
}
export function shimenawa(m: Model, left: V3, right: V3, sag: number, drops: number) {
  const p = (t: number): V3 => [
    left[0] + (right[0] - left[0]) * t,
    left[1] + (right[1] - left[1]) * t - 4 * sag * t * (1 - t),
    left[2] + (right[2] - left[2]) * t,
  ]
  for (let i = 0; i < 28; i++) {
    m.beam(p(i / 28), p((i + 1) / 28), 0.063, i % 2 ? '#cd9e5f' : '#ecc889')
  }
  for (let i = 0; i < drops; i++) {
    const [x, y, z] = p((i + 1) / (drops + 1))
    m.add('box', [x, y - 0.12, z], [0.12, 0.26, 0.027], '#fff1d1', [0, 0, -0.28])
    m.add('box', [x + 0.065, y - 0.27, z], [0.13, 0.18, 0.027], '#f6e2bc', [0, 0, -0.38])
  }
}
export function torii(width = 3.5) {
  const m = new Model()
  for (const s of [-1, 1]) {
    const x = (s * width) / 2
    m.beam([x, 0, 0], [x * 0.94, 3.58, 0], 0.19, red)
    m.add('rod', [x, 0.32, 0], [0.23, 0.63, 0.23], ink)
    m.add('rod', [x, 0.67, 0], [0.212, 0.074, 0.212], '#ba8d52')
    m.add('soft', [x, 0.075, 0], [0.58, 0.15, 0.58], stone)
  }
  m.add('box', [0, 2.67, 0], [width + 0.83, 0.205, 0.19], wood)
  m.add('box', [0, 2.73, 0.035], [width + 0.85, 0.12, 0.22], red)
  for (let i = 0; i < 14; i++) {
    const xa = (i / 14 - 0.5) * (width + 1.4),
      xb = ((i + 1) / 14 - 0.5) * (width + 1.4)
    const h = (x: number) => 3.43 + 0.22 * (Math.abs(x) / ((width + 1.4) / 2)) ** 3
    for (const [offset, r, d, c] of [
      [0, 0.23, 0.32, red],
      [0.17, 0.14, 0.46, ink],
    ] as const) {
      m.beam([xa, h(xa) + offset, 0], [xb, h(xb) + offset, 0], r, c, 'box', d)
    }
  }
  m.add('soft', [0, 3.08, 0.16], [0.54, 0.73, 0.1], trim)
  m.add('box', [0, 3.08, 0.229], [0.44, 0.63, 0.045], '#355452')
  shimenawa(m, [-width * 0.44, 2.67, 0.15], [width * 0.44, 2.67, 0.15], 0.23, 5)
  for (const s of [-1, 1]) paperLamp(m, s * (width / 2 + 0.34), 2.87, 0, 0.91)
  return m
}
export function stoneLantern() {
  const m = new Model()
  m.add('soft', [0, 0.105, 0], [0.75, 0.21, 0.75], '#a7ac95')
  m.add('hip', [0, 0.32, 0], [0.45, 0.28, 0.45], stone)
  m.add('rod', [0, 0.68, 0], [0.17, 0.66, 0.17], '#929a83')
  m.add('hip', [0, 1.0, 0], [0.44, 0.17, 0.44], stone, [Math.PI, 0, 0])
  m.add('soft', [0, 1.11, 0], [0.62, 0.14, 0.62], '#b1b49e')
  m.add('box', [0, 1.39, 0], [0.39, 0.44, 0.39], '#ffe298')
  for (const x of [-0.23, 0.23])
    for (const z of [-0.23, 0.23]) m.add('box', [x, 1.39, z], [0.105, 0.48, 0.105], stone)
  m.add('hip', [0, 1.76, 0], [0.64, 0.3, 0.64], '#899888')
  m.add('ball', [0, 1.98, 0], [0.135, 0.15, 0.135], '#a0a894')
  m.add('cone', [0, 2.09, 0], [0.095, 0.14, 0.095], stone)
  return m
}
export function bridge(m: Model) {
  const { x, z, halfLength: l, halfWidth: w } = BRIDGE
  const height = (t: number) => 0.07 + 0.62 * (1 - t * t)
  for (let i = 0; i < 25; i++) {
    const t = -1 + ((i + 0.5) * 2) / 25
    m.add(
      'soft',
      [x + t * l, height(t) - 0.065, z],
      [(2 * l) / 25 - 0.014, 0.13, w * 2 + 0.12],
      i % 3 ? '#c77c4e' : '#d48f59',
      [0, 0, Math.atan((-1.24 * t) / l)],
    )
  }
  for (const s of [-1, 1]) {
    const p = (t: number, dy: number): V3 => [x + t * l, height(t) + dy, z + s * w]
    for (let i = 0; i < 6; i++) {
      const t = i / 3 - 1
      for (const [y, r, c] of [
        [0.55, 0.065, red],
        [0.24, 0.04, wood],
        [-0.13, 0.08, wood],
      ] as const)
        m.beam(p(t, y), p(t + 1 / 3, y), r, c)
    }
    for (let i = 0; i < 5; i++) {
      const t = i / 2 - 1
      m.beam(p(t, -0.12), p(t, 0.61), 0.073, red)
      m.add('ball', p(t, 0.66), [0.092, 0.085, 0.092], trim)
    }
  }
}
export function emaRack() {
  const m = new Model()
  for (const x of [-1.05, 1.05]) m.add('box', [x, 1.14, 0], [0.11, 2.28, 0.13], wood)
  m.add('soft', [0, 2.35, 0], [2.55, 0.19, 0.55], ink)
  for (const y of [0.97, 1.76]) {
    m.add('box', [0, y, 0], [2.16, 0.08, 0.095], wood)
    for (let i = 0; i < 6; i++) {
      const x = (i - 2.5) * 0.33
      m.beam([x, y, 0], [x + 0.02, y - 0.24, 0.11], 0.014, '#c75b48')
      m.add('soft', [x, y - 0.33, 0.11], [0.275, 0.23, 0.055], i % 2 ? '#e7bc7e' : '#efcf92', [
        0,
        0,
        0.07 * Math.sin(i + y),
      ])
      m.add('ball', [x, y - 0.32, 0.15], [0.043, 0.035, 0.012], i % 2 ? red : wood)
    }
  }
  return m
}
