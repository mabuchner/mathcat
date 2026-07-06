import type { Operation } from '../game/types'

export interface Settings {
  tables: number[]
  operations: Operation[]
  soundEnabled: boolean
}

export const DEFAULT_SETTINGS: Settings = {
  tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  operations: ['multiplication'],
  soundEnabled: true,
}
