import type { Operation } from '../game/types'

/**
 * Fewer selected numbers than this makes rounds too repetitive — a single addend
 * or subtrahend would even repeat the same answer, making high scores farmable.
 * Multiplication is exempt: it always varies the other factor across the full
 * times-table range, so even a single selected table stays varied. Fraction
 * operations vary the numerators within a denominator, so two denominators are
 * enough for variety.
 */
export const MIN_NUMBERS_BY_OPERATION: Record<Operation, number> = {
  addition: 3,
  subtraction: 3,
  multiplication: 1,
  fractionAddition: 2,
  fractionSubtraction: 2,
  fractionSimplification: 2,
}

const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, index) => from + index)

/**
 * Which numbers may be selected per operation: operands for the basic operations,
 * denominators for the fraction ones. Denominators below 4 admit only a single
 * proper-fraction sum or difference, and simplification only works on denominators
 * that share a factor with some smaller numerator, which rules out primes.
 */
export const SELECTABLE_NUMBERS_BY_OPERATION: Record<Operation, number[]> = {
  addition: range(1, 12),
  subtraction: range(1, 12),
  multiplication: range(1, 12),
  fractionAddition: range(4, 12),
  fractionSubtraction: range(4, 12),
  fractionSimplification: [4, 6, 8, 9, 10, 12],
}

/** The pool of numbers to draw problems from, configured separately per operation
 * since it means something different for each: which multiplication tables to
 * practice, which numbers to add or subtract, or which fraction denominators to use. */
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
    fractionAddition: [4, 5, 6, 7, 8, 9, 10],
    fractionSubtraction: [4, 5, 6, 7, 8, 9, 10],
    fractionSimplification: [4, 6, 8, 9, 10],
  },
  soundEnabled: true,
}
