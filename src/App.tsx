import { useState, useCallback, useEffect, Suspense } from 'react'
import {
  getWorldByIndex,
  getNextWorldIndex,
  getPreviousWorldIndex,
  WorldSwitchButtons,
} from '@/worlds'

export function App() {
  // Initially loads Cat Shrine (index 0)
  const [worldIndex, setWorldIndex] = useState(0)

  const currentWorld = getWorldByIndex(worldIndex)
  const ActiveWorldComponent = currentWorld.component

  const handleNext = useCallback(() => {
    setWorldIndex((prev) => getNextWorldIndex(prev))
  }, [])

  const handlePrevious = useCallback(() => {
    setWorldIndex((prev) => getPreviousWorldIndex(prev))
  }, [])

  // Keyboard navigation for Left / Right arrow keys
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement
      ) {
        return
      }

      if (event.key === 'ArrowLeft') {
        event.preventDefault()
        handlePrevious()
      } else if (event.key === 'ArrowRight') {
        event.preventDefault()
        handleNext()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleNext, handlePrevious])

  return (
    <main
      aria-label="3D World Viewer"
      style={{ width: '100%', height: '100%', position: 'relative', overflow: 'hidden' }}
    >
      {/* Active 3D World: Keyed mount ensures full unmount of previous world and clean mount of next world */}
      <Suspense fallback={null}>
        <ActiveWorldComponent key={currentWorld.id} />
      </Suspense>

      {/* Only two small circular buttons at the bottom center */}
      <WorldSwitchButtons
        currentWorld={currentWorld}
        onPrevious={handlePrevious}
        onNext={handleNext}
      />
    </main>
  )
}

export default App
