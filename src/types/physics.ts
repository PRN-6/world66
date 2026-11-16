/**
 * Foundation types and collision groups for Rapier physics integration.
 */

export interface PhysicsWorldConfig {
  gravity?: [number, number, number]
  debug?: boolean
  paused?: boolean
  timeStep?: number | 'vary'
}

/**
 * Standard collision groups for filtering physics interactions.
 */
export const CollisionGroups = {
  DEFAULT: 0x0001,
  TERRAIN: 0x0002,
  ARCHITECTURE: 0x0004,
  CATS: 0x0008,
  INTERACTABLES: 0x0010,
} as const

export type CollisionGroupKey = keyof typeof CollisionGroups

