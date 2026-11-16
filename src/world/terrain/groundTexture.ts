import { CanvasTexture, SRGBColorSpace } from 'three'
import { LANTERNS, PATH, ROCKS, SHRINE, TREES } from '../layout'
import { randomSource, TAU } from '../modeling'

// Hand-painted ground colour with soft contact shading under the fixed landmarks.
export function groundTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 768
  const ctx = canvas.getContext('2d')!,
    rand = randomSource(262),
    unit = canvas.width / 16
  ctx.scale(unit, unit)
  ctx.translate(8, 8)
  ctx.fillStyle = '#a4bd72'
  ctx.fillRect(-8, -8, 16, 16)
  function wash(x: number, z: number, r: number, color: string) {
    const g = ctx.createRadialGradient(x, z, 0, x, z, r)
    g.addColorStop(0, color)
    g.addColorStop(1, 'rgba(120,145,79,0)')
    ctx.fillStyle = g
    ctx.fillRect(x - r, z - r, 2 * r, 2 * r)
  }
  for (let i = 0; i < 160; i++)
    wash(
      (rand() - 0.5) * 16,
      (rand() - 0.5) * 16,
      0.45 + rand() * 1.8,
      i % 3 ? 'rgba(115,150,79,0.25)' : 'rgba(219,214,137,0.48)',
    )
  for (let i = 0; i < 6800; i++) {
    ctx.fillStyle = i % 2 ? 'rgba(222,218,142,.25)' : 'rgba(93,135,76,.15)'
    ctx.beginPath()
    ctx.ellipse(
      (rand() - 0.5) * 16,
      (rand() - 0.5) * 16,
      0.014 + rand() * 0.05,
      0.012 + rand() * 0.021,
      rand() * TAU,
      0,
      TAU,
    )
    ctx.fill()
  }
  for (const t of TREES) wash(t.x, t.z, 2.57 * t.size, 'rgba(75,101,70,.66)')
  for (const [x, z, s] of ROCKS) wash(x, z, s * 2.5, 'rgba(74,106,74,.65)')
  for (const [x, z] of LANTERNS) wash(x, z, 0.81, 'rgba(81,101,72,.62)')
  wash(SHRINE[0], SHRINE[1], 3.9, 'rgba(69,93,70,.69)')
  ctx.lineWidth = 2.06
  ctx.lineJoin = 'round'
  ctx.strokeStyle = 'rgba(143,139,94,.51)'
  ctx.beginPath()
  PATH.forEach(([x, z], i) => (i ? ctx.lineTo(x, z) : ctx.moveTo(x, z)))
  ctx.stroke()
  const texture = new CanvasTexture(canvas)
  texture.colorSpace = SRGBColorSpace
  texture.repeat.set(1 / 16, 1 / 16)
  texture.offset.set(0.5, 0.5)
  texture.anisotropy = 4
  return texture
}
