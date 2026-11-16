import type { CatBehaviorState } from '../../types/cat'
import type { CatRig } from '../models/catRig'

export function animateCat(
  rig: CatRig,
  state: CatBehaviorState,
  speed: number,
  time: number,
  dt: number,
) {
  const { spine, head, legs, tail, eyes } = rig
  const blend = 1 - Math.exp(-dt * 8),
    move = Math.min(1, speed * 1.5)
  const sleep = state === 'sleeping' ? 1 : 0,
    sit = state === 'sitting' || state === 'grooming' ? 1 : 0,
    play = state === 'playing' ? 1 : 0
  const stride = Math.sin(time * (speed > 1.4 ? 12 : 7.4)),
    breath = Math.sin(time * 2.35)
  const toward = (v: number, target: number) => v + (target - v) * blend
  spine.position.y = toward(
    spine.position.y,
    0.5 -
      0.22 * sleep -
      0.115 * sit +
      0.011 * breath +
      0.036 * move * Math.abs(stride) +
      play * 0.07 * Math.max(0, Math.sin(time * 8)),
  )
  spine.rotation.x = toward(spine.rotation.x, -0.48 * sit + 0.1 * sleep + 0.045 * stride * move)
  head.rotation.x = toward(
    head.rotation.x,
    0.35 * sit + 0.57 * sleep - 0.12 + 0.065 * breath + 0.17 * play * Math.sin(time * 7),
  )
  head.rotation.y = toward(
    head.rotation.y,
    sleep * 1.39 + (1 - sleep) * Math.sin(time * 0.86) * 0.19 * (1 - 0.6 * move),
  )
  head.rotation.z = toward(head.rotation.z, sleep * 0.39 + 0.053 * Math.sin(time * 0.64))
  head.position.y = toward(head.position.y, 0.37 - sleep * 0.23)
  const blink = Math.max(0, Math.cos(time * 1.54)) ** 120
  eyes.scale.y = toward(eyes.scale.y, sleep ? 0.09 : 1 - 0.94 * blink)
  legs.forEach((leg, i) => {
    const front = i > 1,
      phase = i === 0 || i === 3 ? 1 : -1
    leg.rotation.x = toward(
      leg.rotation.x,
      stride * phase * move * 0.62 +
        sit * (front ? 0.32 : 1.29) +
        sleep * (front ? -1.05 : 1.1) +
        (i === 2 ? play * (-0.75 + 0.67 * Math.sin(time * 9)) : 0),
    )
    leg.position.y = toward(leg.position.y, -0.065 + sleep * 0.015 + (sit && !front ? 0.1 : 0))
  })
  tail.forEach((b, i) => {
    b.rotation.x = toward(b.rotation.x, i === 0 ? -1.65 - sleep * 0.43 : 0.39 * (1 - sleep))
    b.rotation.z = toward(
      b.rotation.z,
      (i === 0 ? 0.12 : 0.1) * Math.sin(time * 1.7 + i * 0.51) +
        (sit + sleep) * (i === 0 ? 0.65 : 0.34),
    )
    b.rotation.y = toward(b.rotation.y, (sit + sleep) * 0.59 + 0.13 * Math.sin(time * 1.1))
  })
}
