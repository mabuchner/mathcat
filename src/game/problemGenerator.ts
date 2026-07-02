import type { Problem } from './types'

export interface GenerateProblemOptions {
  tables: number[]
  previous?: Problem | null
  random?: () => number
}

export function generateProblem(options: GenerateProblemOptions): Problem {
  const { tables, previous = null, random = Math.random } = options
  if (tables.length === 0) {
    throw new Error('At least one multiplication table must be selected')
  }

  let candidate: Problem
  let attempts = 0
  do {
    const a = tables[Math.floor(random() * tables.length)]
    const b = tables[Math.floor(random() * tables.length)]
    candidate = { a, b, answer: a * b }
    attempts++
  } while (previous && candidate.a === previous.a && candidate.b === previous.b && attempts < 20)

  return candidate
}
