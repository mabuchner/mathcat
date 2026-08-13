import type { OperationNumbers } from '../settings/types'
import type { Operation, Problem } from './types'

/**
 * The multiplier a selected table is always practiced against, regardless of which
 * tables are selected — "the 7 times table" means 7×1 through 7×12, not just 7×7.
 */
const MULTIPLICATION_RANGE = Array.from({ length: 12 }, (_, index) => index + 1)

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b)
}

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
    candidate = createProblem(operation, numbers[operation], random)
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

function createProblem(operation: Operation, pool: number[], random: () => number): Problem {
  const pick = (values: number[]) => values[Math.floor(random() * values.length)]

  switch (operation) {
    case 'addition':
    case 'subtraction': {
      let a = pick(pool)
      let b = pick(pool)
      if (operation === 'subtraction' && b > a) [a, b] = [b, a]
      return { a, b, operation, answer: operation === 'addition' ? a + b : a - b }
    }
    case 'multiplication': {
      const a = pick(pool)
      const b = pick(MULTIPLICATION_RANGE)
      return { a, b, operation, answer: a * b }
    }
    case 'fractionAddition': {
      // The pool holds the like denominators; numerators keep the sum a proper fraction.
      const denominator = pick(pool)
      const a = 1 + Math.floor(random() * (denominator - 2))
      const b = 1 + Math.floor(random() * (denominator - 1 - a))
      return { a, b, operation, answer: a + b, denominator }
    }
    case 'fractionSubtraction': {
      // Both fractions proper and the difference positive: 1 ≤ b < a ≤ denominator − 1.
      const denominator = pick(pool)
      const a = 2 + Math.floor(random() * (denominator - 2))
      const b = 1 + Math.floor(random() * (a - 1))
      return { a, b, operation, answer: a - b, denominator }
    }
    case 'fractionSimplification': {
      // The pool holds the denominators of the shown fraction; only reducible
      // numerators qualify, so the answer is always genuinely simpler.
      const denominator = pick(pool)
      const reducible: number[] = []
      for (let numerator = 2; numerator < denominator; numerator++) {
        if (gcd(numerator, denominator) > 1) reducible.push(numerator)
      }
      const a = pick(reducible)
      const divisor = gcd(a, denominator)
      return { a, b: denominator, operation, answer: a / divisor, answerDenominator: denominator / divisor }
    }
  }
}
