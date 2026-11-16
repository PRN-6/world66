/**
 * Foundation types for the 3D World Environment.
 */

export interface WorldSettings {
  gravity: [number, number, number]
  ambientLightIntensity: number
  directionalLightIntensity: number
  sunPosition: [number, number, number]
  shadows: boolean
}

export interface TerrainBounds {
  width: number
  depth: number
  minHeight: number
  maxHeight: number
}

