import type { Point } from '../world/modeling'
import type { CatBehaviorState } from '../types/cat'

export interface CatProfile {
  id: string
  coat: 'tabby' | 'snow' | 'tuxedo' | 'calico' | 'smoke'
  size: number
  start: Point
  heading: number
  initial: CatBehaviorState
  curiosity: number
  playfulness: number
  sociability: number
  sleepiness: number
}
export const residents: CatProfile[] = [
  {
    id: 'Mikan',
    coat: 'tabby',
    size: 1.24,
    start: [-2.55, 6.28],
    heading: 0.32,
    initial: 'sitting',
    curiosity: 0.82,
    playfulness: 0.88,
    sociability: 0.76,
    sleepiness: 0.18,
  },
  {
    id: 'Yuki',
    coat: 'snow',
    size: 1.06,
    start: [-0.33, 2.52],
    heading: -0.48,
    initial: 'idle',
    curiosity: 0.54,
    playfulness: 0.56,
    sociability: 0.95,
    sleepiness: 0.44,
  },
  {
    id: 'Sumi',
    coat: 'tuxedo',
    size: 1.12,
    start: [-3.45, -0.32],
    heading: 0.72,
    initial: 'sitting',
    curiosity: 0.93,
    playfulness: 0.43,
    sociability: 0.16,
    sleepiness: 0.39,
  },
  {
    id: 'Hana',
    coat: 'calico',
    size: 1.22,
    start: [3.42, 6.0],
    heading: 0.03,
    initial: 'idle',
    curiosity: 0.7,
    playfulness: 0.99,
    sociability: 0.73,
    sleepiness: 0.24,
  },
  {
    id: 'Gin',
    coat: 'smoke',
    size: 1.15,
    start: [-5.09, 2.14],
    heading: 1.15,
    initial: 'sleeping',
    curiosity: 0.32,
    playfulness: 0.28,
    sociability: 0.4,
    sleepiness: 0.97,
  },
]
