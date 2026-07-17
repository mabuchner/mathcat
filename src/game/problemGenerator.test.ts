import { describe, expect, it } from 'vitest'
import type { OperationNumbers } from '../settings/types'
import { generateProblem } from './problemGenerator'
import type { Problem } from './types'

const numbersFor = (pool: number[]): OperationNumbers => ({
  addition: pool,
  subtraction: pool,
  multiplication: pool,
})

describe('generateProblem', () => {
  it('for addition and subtraction, always picks both operands from the selected numbers only', () => {
    for (let i = 0; i < 300; i++) {
      const problem = generateProblem({ numbers: numbersFor([3, 7]), operations: ['addition', 'subtraction'] })
      expect([3, 7]).toContain(problem.a)
      expect([3, 7]).toContain(problem.b)
    }
  })

  it('for multiplication, picks the table factor from the selected numbers and the multiplier from 1–12', () => {
    for (let i = 0; i < 300; i++) {
      const problem = generateProblem({ numbers: { ...numbersFor([1]), multiplication: [3, 7] } })
      expect([3, 7]).toContain(problem.a)
      expect(problem.b).toBeGreaterThanOrEqual(1)
      expect(problem.b).toBeLessThanOrEqual(12)
      expect(problem.answer).toBe(problem.a * problem.b)
    }
  })

  it('for multiplication, varies the multiplier across the full 1–12 range even with a single table selected', () => {
    const seenMultipliers = new Set<number>()
    for (let i = 0; i < 500; i++) {
      const problem = generateProblem({ numbers: { ...numbersFor([1]), multiplication: [7] } })
      expect(problem.a).toBe(7)
      seenMultipliers.add(problem.b)
    }
    // With 500 draws from a 12-value range, we should see well more than one distinct multiplier.
    expect(seenMultipliers.size).toBeGreaterThan(5)
  })

  it('draws from each operation\'s own number pool, not a shared one', () => {
    const numbers: OperationNumbers = { addition: [100, 200], subtraction: [1, 2], multiplication: [9, 9] }
    for (let i = 0; i < 100; i++) {
      const problem = generateProblem({ numbers, operations: ['addition'], random: () => 0 })
      expect(problem).toEqual({ a: 100, b: 100, operation: 'addition', answer: 200 })
    }
  })

  it('throws if no operations are selected', () => {
    expect(() => generateProblem({ numbers: numbersFor([1, 2, 3]), operations: [] })).toThrow()
  })

  it('throws if a selected operation has no numbers to draw from', () => {
    const numbers: OperationNumbers = { addition: [], subtraction: [1, 2, 3], multiplication: [1, 2, 3] }
    expect(() => generateProblem({ numbers, operations: ['addition'] })).toThrow()
  })

  it('avoids immediately repeating the previous problem when a different one is reachable', () => {
    // numbers.multiplication: [2, 5] — the multiplier is drawn from the fixed 1–12 range, not the pool.
    // first attempt: table index 0 → a=2; multiplier index 1 → b=2 (same as previous)
    // second attempt: table index 0 → a=2; multiplier index 4 → b=5 (different)
    const previous: Problem = { a: 2, b: 2, operation: 'multiplication', answer: 4 }
    const sequence = [0, 0, 0.1, 0, 0, 0.35]
    let i = 0
    const random = () => sequence[i++]
    const problem = generateProblem({ numbers: numbersFor([2, 5]), previous, random })
    expect(problem).toEqual({ a: 2, b: 5, operation: 'multiplication', answer: 10 })
  })

  it('terminates instead of looping forever if the random source keeps producing the previous problem', () => {
    const previous: Problem = { a: 2, b: 1, operation: 'multiplication', answer: 2 }
    const random = () => 0
    const problem = generateProblem({ numbers: numbersFor([2]), previous, random })
    expect(problem).toEqual({ a: 2, b: 1, operation: 'multiplication', answer: 2 })
  })
})
