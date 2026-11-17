import type { WorldMetadata } from '../types.ts'

interface WorldSwitchButtonsProps {
  currentWorld: WorldMetadata
  onPrevious: () => void
  onNext: () => void
}

/**
 * Two small circular arrow buttons fixed at the bottom center.
 * Background color dynamically matches the active world's background with high-contrast arrow icons.
 */
export function WorldSwitchButtons({
  currentWorld,
  onPrevious,
  onNext,
}: WorldSwitchButtonsProps) {
  const { bg, arrowColor, borderColor, shadowColor } = currentWorld.buttonTheme

  return (
    <div
      role="group"
      aria-label="World selection navigation"
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 pointer-events-auto select-none"
    >
      {/* Left circular button: ← Previous world */}
      <button
        type="button"
        onClick={onPrevious}
        aria-label="Previous world"
        title="Previous world"
        style={{
          backgroundColor: bg,
          color: arrowColor,
          borderColor,
          boxShadow: `0 4px 16px ${shadowColor}`,
        }}
        className="w-10 h-10 rounded-full border flex items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-110 hover:brightness-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer"
      >
        <svg
          className="w-4 h-4 pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Right circular button: → Next world */}
      <button
        type="button"
        onClick={onNext}
        aria-label="Next world"
        title="Next world"
        style={{
          backgroundColor: bg,
          color: arrowColor,
          borderColor,
          boxShadow: `0 4px 16px ${shadowColor}`,
        }}
        className="w-10 h-10 rounded-full border flex items-center justify-center backdrop-blur-md transition-all duration-200 hover:scale-110 hover:brightness-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer"
      >
        <svg
          className="w-4 h-4 pointer-events-none"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
