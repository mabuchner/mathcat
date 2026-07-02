import { describe, expect, it } from 'vitest'
import { generateProblem } from './problemGenerator'
import type { Problem } from './types'

describe('generateProblem', () => {
  it('always picks both factors from the selected tables only, with a correct product', () => {
    for (let i = 0; i < 200; i++) {
      const problem = generateProblem({ tables: [3, 7] })
      expect([3, 7]).toContain(problem.a)
      expect([3, 7]).toContain(problem.b)
      expect(problem.answer).toBe(problem.a * problem.b)
    }
  })

  it('never produces a factor outside the selected tables', () => {
    for (let i = 0; i < 500; i++) {
      const problem = generateProblem({ tables: [2, 4, 6] })
      expect([2, 4, 6]).toContain(problem.a)
      expect([2, 4, 6]).toContain(problem.b)
    }
  })

  it('throws if no tables are selected', () => {
    expect(() => generateProblem({ tables: [] })).toThrow()
  })

  it('avoids immediately repeating the previous problem when a different one is reachable', () => {
    // tables: [2, 5] — random sequence picks indices into that array
    // first call: index 0 → a=2, index 0 → b=2 (same as previous { a:2, b:2 })
    // second call: index 0 → a=2, index 1 → b=5 (different)
    const previous: Problem = { a: 2, b: 2, answer: 4 }
    const sequence = [0, 0, 0, 0.9]
    let i = 0
    const random = () => sequence[i++]
    const problem = generateProblem({ tables: [2, 5], previous, random })
    expect(problem).toEqual({ a: 2, b: 5, answer: 10 })
  })

  it('terminates instead of looping forever if the random source keeps producing the previous problem', () => {
    const previous: Problem = { a: 2, b: 2, answer: 4 }
    const random = () => 0
    const problem = generateProblem({ tables: [2], previous, random })
    expect(problem).toEqual({ a: 2, b: 2, answer: 4 })
  })
})
