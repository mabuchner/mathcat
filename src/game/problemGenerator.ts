import type { Operation, Problem } from './types'

export interface GenerateProblemOptions {
  tables: number[]
  operations?: Operation[]
  previous?: Problem | null
  random?: () => number
}

export function generateProblem(options: GenerateProblemOptions): Problem {
  const { tables, operations = ['multiplication'], previous = null, random = Math.random } = options
  if (tables.length === 0) throw new Error('At least one table must be selected')
  if (operations.length === 0) throw new Error('At least one operation must be selected')

  let candidate: Problem
  let attempts = 0
  do {
    const operation = operations[Math.floor(random() * operations.length)]
    let a = tables[Math.floor(random() * tables.length)]
    let b = tables[Math.floor(random() * tables.length)]

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
