import { describe, expect, it } from 'vitest'
import { advanceMissedProblemQueue, enqueueMissedProblem, takeDueMissedProblem } from './missedProblemQueue'
import type { Problem } from './types'

const problem = (a: number): Problem => ({ a, b: a, operation: 'multiplication', answer: a * a })

describe('enqueueMissedProblem', () => {
  it('adds the problem with a delay between 1 and 3 problems', () => {
    const queue = enqueueMissedProblem([], problem(3), () => 0)
    expect(queue).toEqual([{ problem: problem(3), problemsUntilDue: 1 }])

    const queueAtMaxDelay = enqueueMissedProblem([], problem(3), () => 0.999)
    expect(queueAtMaxDelay).toEqual([{ problem: problem(3), problemsUntilDue: 3 }])
  })

  it('drops the oldest miss once the queue exceeds its capacity', () => {
    let queue = [
      { problem: problem(1), problemsUntilDue: 1 },
      { problem: problem(2), problemsUntilDue: 1 },
      { problem: problem(3), problemsUntilDue: 1 },
    ]
    queue = enqueueMissedProblem(queue, problem(4), () => 0)
    expect(queue.map((entry) => entry.problem.a)).toEqual([2, 3, 4])
  })
})

describe('advanceMissedProblemQueue', () => {
  it('counts every entry down by one problem, never going below zero', () => {
    const queue = [
      { problem: problem(1), problemsUntilDue: 2 },
      { problem: problem(2), problemsUntilDue: 0 },
    ]
    expect(advanceMissedProblemQueue(queue)).toEqual([
      { problem: problem(1), problemsUntilDue: 1 },
      { problem: problem(2), problemsUntilDue: 0 },
    ])
  })
})

describe('takeDueMissedProblem', () => {
  it('returns null when nothing in the queue is due yet', () => {
    const queue = [{ problem: problem(1), problemsUntilDue: 1 }]
    expect(takeDueMissedProblem(queue, () => 0)).toBeNull()
  })

  it('returns null when a due entry loses the reshow roll, leaving the queue untouched', () => {
    const queue = [{ problem: problem(1), problemsUntilDue: 0 }]
    expect(takeDueMissedProblem(queue, () => 0.9)).toBeNull()
  })

  it('pulls out the due problem and removes it from the returned queue when the reshow roll succeeds', () => {
    const queue = [
      { problem: problem(1), problemsUntilDue: 2 },
      { problem: problem(2), problemsUntilDue: 0 },
    ]
    const result = takeDueMissedProblem(queue, () => 0)
    expect(result).toEqual({
      problem: problem(2),
      queue: [{ problem: problem(1), problemsUntilDue: 2 }],
    })
  })
})
