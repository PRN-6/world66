/**
 * Foundation types for cat models, states, and animations.
 * Ready for future cat AI and animation systems.
 */

export type CatBehaviorState = 'idle' | 'walking' | 'running' | 'sleeping' | 'sitting' | 'grooming'

export interface CatEntity {
  id: string
  name?: string
  position: [number, number, number]
  rotation: [number, number, number]
  state: CatBehaviorState
}
