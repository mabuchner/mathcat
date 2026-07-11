import type { Operation } from '../game/types'

/**
 * Fewer selected numbers than this makes rounds too repetitive — a single
 * number would even repeat the same answer, making high scores farmable.
 */
export const MIN_TABLES = 3

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
