import type { Operation } from '../game/types'

export interface HighScoreEntry {
  correctCount: number
  incorrectCount: number
  operations: Operation[]
  /** The number pool practiced for each of this entry's operations. */
  numbers: Partial<Record<Operation, number[]>>
  dateISO: string
}

export const MAX_HIGH_SCORES = 5
