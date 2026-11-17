import { createElement, lazy } from 'react'

const Scene = lazy(() =>
  import('../../components/Scene.tsx').then((m) => ({ default: m.Scene }))
)

/**
 * Adapter for World 01 — Cat Shrine.
 * Exposes a clean, parameterless component interface for the world selection container.
 * Unmounts cleanly to release WebGL context, physics loop, and AI updates.
 */
export function CatShrineAdapter() {
  return createElement(Scene)
}
