import type { OperationNumbers } from '../settings/types'
import type { Operation, Problem } from './types'

/**
 * The multiplier a selected table is always practiced against, regardless of which
 * tables are selected — "the 7 times table" means 7×1 through 7×12, not just 7×7.
 */
const MULTIPLICATION_RANGE = Array.from({ length: 12 }, (_, index) => index + 1)

export interface GenerateProblemOptions {
  numbers: OperationNumbers
  operations?: Operation[]
  previous?: Problem | null
  random?: () => number
}

export function generateProblem(options: GenerateProblemOptions): Problem {
  const { numbers, operations = ['multiplication'], previous = null, random = Math.random } = options
  if (operations.length === 0) throw new Error('At least one operation must be selected')
  for (const operation of operations) {
    if (numbers[operation].length === 0) throw new Error(`At least one number must be selected for ${operation}`)
  }

  let candidate: Problem
  let attempts = 0
  do {
    const operation = operations[Math.floor(random() * operations.length)]
    const pool = numbers[operation]
    let a = pool[Math.floor(random() * pool.length)]
    let b =
      operation === 'multiplication'
        ? MULTIPLICATION_RANGE[Math.floor(random() * MULTIPLICATION_RANGE.length)]
        : pool[Math.floor(random() * pool.length)]

    if (operation === 'subtraction' && b > a) [a, b] = [b, a]

    const answer =
      operation === 'addition'    ? a + b :
      operation === 'subtraction' ? a - b :
      /* multiplication */          a * b

    candidate = { a, b, operation, answer }
    attempts++
  } while (
    previous &&
    candidate.a === previous.a &&
    candidate.b === previous.b &&
    candidate.operation === previous.operation &&
    attempts < 20
  )

  return candidate
}
