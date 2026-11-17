import { CatShrineAdapter } from './adapters/CatShrineAdapter.ts'
import { RobotConstructionAdapter } from './adapters/RobotConstructionAdapter.ts'
import type { WorldMetadata } from './types.ts'

export const WORLDS: readonly WorldMetadata[] = [
  {
    id: 'cat-shrine',
    number: '01',
    title: 'Cat Shrine',
    shortTitle: 'Cat Shrine',
    subtitle: 'Japanese Garden · Feline Sanctuary',
    description:
      'A serene, sunny shrine garden nestled with cherry blossoms, torii gates, and adorable wandering cats exploring their peaceful sanctuary.',
    badge: 'Zen Sanctuary',
    themeColor: '#f43f5e',
    ambientColor: '#ffe5c9',
    tags: ['Cozy Garden', 'Feline AI', 'Pond & Shrine', 'Physics Toys'],
    buttonTheme: {
      bg: 'rgba(247, 218, 196, 0.88)',
      hoverBg: 'rgba(255, 234, 218, 0.98)',
      arrowColor: '#2d2118',
      borderColor: 'rgba(180, 135, 105, 0.45)',
      shadowColor: 'rgba(45, 33, 24, 0.18)',
    },
    component: CatShrineAdapter,
  },
  {
    id: 'robot-construction',
    number: '02',
    title: 'Robot Construction World',
    shortTitle: 'Robot Construction',
    subtitle: 'Atlas Works · Heavy Titan Assembly Yard',
    description:
      'An autonomous industrial shipyard where coordinated crane operators, mobile haulers, and fabrication robots assemble a towering titan mech.',
    badge: 'Industrial Yard',
    themeColor: '#38bdf8',
    ambientColor: '#c9f2ff',
    tags: ['Autonomous Fleet', 'Crane Rigging', 'Titan Assembly', 'Industrial Physics'],
    buttonTheme: {
      bg: 'rgba(175, 198, 200, 0.88)',
      hoverBg: 'rgba(195, 218, 220, 0.98)',
      arrowColor: '#122228',
      borderColor: 'rgba(90, 125, 130, 0.45)',
      shadowColor: 'rgba(18, 34, 40, 0.18)',
    },
    component: RobotConstructionAdapter,
  },
] as const

export function getWorldByIndex(index: number): WorldMetadata {
  const normalizedIndex = ((index % WORLDS.length) + WORLDS.length) % WORLDS.length
  return WORLDS[normalizedIndex]
}

export function getNextWorldIndex(currentIndex: number): number {
  return (currentIndex + 1) % WORLDS.length
}

export function getPreviousWorldIndex(currentIndex: number): number {
  return (currentIndex - 1 + WORLDS.length) % WORLDS.length
}

export function findWorldById(id: string): WorldMetadata | undefined {
  return WORLDS.find((w) => w.id === id)
}
