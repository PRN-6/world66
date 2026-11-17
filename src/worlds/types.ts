import type { ComponentType } from 'react'

export type WorldId = 'cat-shrine' | 'robot-construction'

export interface WorldButtonTheme {
  bg: string
  hoverBg: string
  arrowColor: string
  borderColor: string
  shadowColor: string
}

export interface WorldMetadata {
  id: WorldId
  number: string
  title: string
  shortTitle: string
  subtitle: string
  description: string
  badge: string
  themeColor: string
  ambientColor: string
  tags: string[]
  buttonTheme: WorldButtonTheme
  component: ComponentType
}
