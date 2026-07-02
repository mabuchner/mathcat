import { describe, expect, it } from 'vitest'
import { createInitialGameState, gameReducer } from './gameReducer'
import type { GameState, Problem } from './types'

const problem: Problem = { a: 7, b: 8, answer: 56 }

function initial(): GameState {
  return createInitialGameState(problem)
}

describe('gameReducer', () => {
  it('moves to correct phase on a right answer', () => {
    const state = gameReducer(initial(), { type: 'SUBMIT_ANSWER', problemId: 0, value: 56 })
    expect(state.phase).toBe('correct')
  })

  it('moves to feedback with reason "wrong" on an incorrect answer', () => {
    const state = gameReducer(initial(), { type: 'SUBMIT_ANSWER', problemId: 0, value: 55 })
    expect(state.phase).toBe('feedback')
    expect(state.reason).toBe('wrong')
  })

  it('moves to feedback with reason "timeout" on TIME_UP', () => {
    const state = gameReducer(initial(), { type: 'TIME_UP', problemId: 0 })
    expect(state.phase).toBe('feedback')
    expect(state.reason).toBe('timeout')
  })

  it('ignores SUBMIT_ANSWER for a stale problemId', () => {
    const state = gameReducer(initial(), { type: 'SUBMIT_ANSWER', problemId: 99, value: 56 })
    expect(state.phase).toBe('question')
  })

  it('ignores TIME_UP for a stale problemId', () => {
    const state = gameReducer(initial(), { type: 'TIME_UP', problemId: 99 })
    expect(state.phase).toBe('question')
  })

  it('ignores SUBMIT_ANSWER after the phase has already left "question" (e.g. answer racing a timeout)', () => {
    const afterTimeout = gameReducer(initial(), { type: 'TIME_UP', problemId: 0 })
    const afterLateAnswer = gameReducer(afterTimeout, { type: 'SUBMIT_ANSWER', problemId: 0, value: 56 })
    expect(afterLateAnswer).toBe(afterTimeout)
  })

  it('ignores TIME_UP after the phase has already left "question" (e.g. timer racing an answer)', () => {
    const afterCorrect = gameReducer(initial(), { type: 'SUBMIT_ANSWER', problemId: 0, value: 56 })
    const afterLateTimeout = gameReducer(afterCorrect, { type: 'TIME_UP', problemId: 0 })
    expect(afterLateTimeout).toBe(afterCorrect)
  })

  it('CONTINUE starts a new question with an incremented problemId and a fresh problem', () => {
    const nextProblem: Problem = { a: 3, b: 4, answer: 12 }
    const state = gameReducer(initial(), { type: 'CONTINUE', problem: nextProblem })
    expect(state).toEqual({ phase: 'question', problem: nextProblem, problemId: 1, reason: undefined })
  })
})
