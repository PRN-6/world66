import * as THREE from 'three'

/**
 * Utility function to convert degrees to radians.
 */
export function degToRad(degrees: number): number {
  return THREE.MathUtils.degToRad(degrees)
}

/**
 * Utility function to clamp a number between min and max.
 */
export function clamp(value: number, min: number, max: number): number {
  return THREE.MathUtils.clamp(value, min, max)
}

