import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from '../settings/types'
import { useGame } from './useGame'
import type { Problem } from './types'

const generateProblem = vi.fn<(...args: unknown[]) => Problem>()
const enqueueMissedProblem = vi.fn()
const advanceMissedProblemQueue = vi.fn()
const takeDueMissedProblem = vi.fn()

vi.mock('./problemGenerator', () => ({
  generateProblem: (...args: unknown[]) => generateProblem(...args),
}))

vi.mock('./missedProblemQueue', () => ({
  enqueueMissedProblem: (...args: unknown[]) => enqueueMissedProblem(...args),
  advanceMissedProblemQueue: (...args: unknown[]) => advanceMissedProblemQueue(...args),
  takeDueMissedProblem: (...args: unknown[]) => takeDueMissedProblem(...args),
}))

const problem = (a: number): Problem => ({ a, b: a, operation: 'multiplication', answer: a * a })

describe('useGame missed-problem queue wiring', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    generateProblem.mockReturnValue(problem(1))
    advanceMissedProblemQueue.mockImplementation((queue) => queue)
    takeDueMissedProblem.mockReturnValue(null)
  })

  it('enqueues the current problem as missed on a wrong answer', () => {
    const { result } = renderHook(() => useGame(DEFAULT_SETTINGS))
    const initialProblem = result.current.state.problem

    act(() => result.current.submitAnswer(initialProblem.answer + 1))

    expect(enqueueMissedProblem).toHaveBeenCalledWith([], initialProblem)
  })

  it('does not touch the missed queue when the answer is correct', () => {
    const { result } = renderHook(() => useGame(DEFAULT_SETTINGS))

    act(() => result.current.submitAnswer(result.current.state.problem.answer))

    expect(enqueueMissedProblem).not.toHaveBeenCalled()
  })

  it('generates a fresh problem when continuing and nothing in the queue is due', () => {
    const fresh = problem(9)
    generateProblem.mockReturnValueOnce(problem(1)).mockReturnValueOnce(fresh)
    takeDueMissedProblem.mockReturnValue(null)

    const { result } = renderHook(() => useGame(DEFAULT_SETTINGS))
    act(() => result.current.continueGame())

    expect(result.current.state.problem).toEqual(fresh)
  })

  it('reuses a due missed problem instead of generating a fresh one', () => {
    const due = problem(7)
    takeDueMissedProblem.mockReturnValue({ problem: due, queue: [] })

    const { result } = renderHook(() => useGame(DEFAULT_SETTINGS))
    act(() => result.current.continueGame())

    expect(result.current.state.problem).toEqual(due)
    // Only the initial problem should have gone through generateProblem; the reused
    // miss must not also trigger a fresh generation.
    expect(generateProblem).toHaveBeenCalledTimes(1)
  })

  it('advances the queue with whatever the previous enqueue returned', () => {
    const afterEnqueue = [{ problem: problem(1), problemsUntilDue: 2 }]
    enqueueMissedProblem.mockReturnValue(afterEnqueue)

    const { result } = renderHook(() => useGame(DEFAULT_SETTINGS))
    act(() => result.current.submitAnswer(result.current.state.problem.answer + 1))
    act(() => result.current.continueGame())

    expect(advanceMissedProblemQueue).toHaveBeenCalledWith(afterEnqueue)
  })

  it('carries the remaining queue forward after a due miss is taken', () => {
    const remaining = [{ problem: problem(3), problemsUntilDue: 1 }]
    takeDueMissedProblem.mockReturnValueOnce({ problem: problem(7), queue: remaining })

    const { result } = renderHook(() => useGame(DEFAULT_SETTINGS))
    act(() => result.current.continueGame())
    act(() => result.current.continueGame())

    expect(advanceMissedProblemQueue).toHaveBeenLastCalledWith(remaining)
  })
})
