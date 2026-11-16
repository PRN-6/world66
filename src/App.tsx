import { useState, useCallback } from 'react'
import { Scene } from '@/components'

export function App() {
  const [physicsReady, setPhysicsReady] = useState(false)
  const [sceneKey, setSceneKey] = useState(0)

  const handlePhysicsReady = useCallback(() => {
    setPhysicsReady(true)
  }, [])

  const handleReset = () => {
    setPhysicsReady(false)
    setSceneKey((prev) => prev + 1)
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 select-none">
      {/* 3D Canvas Viewport */}
      <Scene key={sceneKey} onPhysicsReady={handlePhysicsReady} />

      {/* Verification HUD */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-3 rounded-xl border border-slate-700/60 bg-slate-900/85 p-4 shadow-xl backdrop-blur-md max-w-sm">
        <div>
          <h1 className="text-sm font-bold tracking-wide text-white">
            Cat Shrine World
          </h1>
          <p className="text-xs text-slate-400">Development Foundation</p>
        </div>

        <div className="flex flex-col gap-1.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-300">WebGL / Three.js</span>
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-medium">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              Active
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-slate-300">Rapier Physics</span>
            <span
              className={`inline-flex items-center gap-1.5 font-medium ${
                physicsReady ? 'text-emerald-400' : 'text-amber-400'
              }`}
            >
              <span
                className={`h-2 w-2 rounded-full ${
                  physicsReady ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'
                }`}
              />
              {physicsReady ? 'Initialized & Stepping' : 'Initializing WASM...'}
            </span>
          </div>
        </div>

        <div className="border-t border-slate-700/60 pt-2 text-[11px] text-slate-400 leading-relaxed">
          <p>Rotate: Left click + drag</p>
          <p>Pan: Right click + drag</p>
          <p>Zoom: Scroll wheel</p>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="mt-1 w-full rounded-md bg-slate-800 px-3 py-1.5 text-xs font-medium text-slate-200 transition hover:bg-slate-700 active:scale-98"
        >
          Reset Simulation
        </button>
      </div>
    </div>
  )
}

export default App
