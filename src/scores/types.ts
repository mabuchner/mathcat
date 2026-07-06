import type { Operation } from '../game/types'

export interface HighScoreEntry {
  correctCount: number
  incorrectCount: number
  operations: Operation[]
  tables: number[]
  dateISO: string
}

export const MAX_HIGH_SCORES = 5
