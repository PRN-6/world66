import { createElement, lazy } from 'react'

const RobotConstructionScene = lazy(() =>
  import('../../robot-world/RobotConstructionScene.tsx').then((m) => ({
    default: m.RobotConstructionScene,
  }))
)

/**
 * Adapter for World 02 — Robot Construction World.
 * Exposes a clean, parameterless component interface for the world selection container.
 * Unmounts cleanly to release WebGL context, shipyard simulation, and FreightYard physics.
 */
export function RobotConstructionAdapter() {
  return createElement(RobotConstructionScene)
}
