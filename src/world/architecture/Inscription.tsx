import { useEffect, useMemo } from 'react'
import { CanvasTexture, SRGBColorSpace } from 'three'
import { GATE, SIGN } from '../layout'

function Calligraphy({
  text,
  width,
  height,
  color,
}: {
  text: string
  width: number
  height: number
  color: string
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement('canvas')
    canvas.width = 192
    canvas.height = 192 * text.length
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = color
    ctx.font = 'bold 152px "Yu Mincho","Noto Serif CJK JP",serif'
    Array.from(text).forEach((char, i) => ctx.fillText(char, 96, 192 * i + 97, 170))
    const tex = new CanvasTexture(canvas)
    tex.colorSpace = SRGBColorSpace
    return tex
  }, [text, color])
  useEffect(() => () => texture?.dispose(), [texture])
  return texture ? (
    <mesh>
      <planeGeometry args={[width, height]} />
      <meshBasicMaterial map={texture} transparent depthWrite={false} toneMapped={false} />
    </mesh>
  ) : null
}
export function Inscriptions() {
  return (
    <group>
      <group position={[GATE[0], 3.075, GATE[1] + 0.255]}>
        <Calligraphy text="猫社" width={0.31} height={0.46} color="#ffe0a2" />
      </group>
      <group position={[SIGN[0], 1.08, SIGN[1] + 0.114]}>
        <Calligraphy text="猫の社" width={0.38} height={1.08} color="#584637" />
      </group>
    </group>
  )
}
