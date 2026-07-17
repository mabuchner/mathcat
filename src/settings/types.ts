import type { Operation } from '../game/types'

/**
 * Fewer selected numbers than this makes rounds too repetitive — a single addend
 * or subtrahend would even repeat the same answer, making high scores farmable.
 * Multiplication is exempt: it always varies the other factor across the full
 * times-table range, so even a single selected table stays varied.
 */
export const MIN_NUMBERS_BY_OPERATION: Record<Operation, number> = {
  addition: 3,
  subtraction: 3,
  multiplication: 1,
}

/** The pool of numbers to draw problems from, configured separately per operation
 * since it means something different for each: which multiplication tables to
 * practice, versus which numbers to add or subtract. */
export type OperationNumbers = Record<Operation, number[]>

export interface Settings {
  operations: Operation[]
  numbers: OperationNumbers
  soundEnabled: boolean
}

const DEFAULT_NUMBERS: number[] = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]

export const DEFAULT_SETTINGS: Settings = {
  operations: ['multiplication'],
  numbers: {
    addition: DEFAULT_NUMBERS,
    subtraction: DEFAULT_NUMBERS,
    multiplication: DEFAULT_NUMBERS,
  },
  soundEnabled: true,
}
