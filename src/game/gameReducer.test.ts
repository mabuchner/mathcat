import { describe, expect, it } from 'vitest'
import { createInitialGameState, gameReducer } from './gameReducer'
import type { GameState, Problem } from './types'

const problem: Problem = { a: 7, b: 8, operation: 'multiplication', answer: 56 }

function initial(): GameState {
  return createInitialGameState(problem)
}

describe('gameReducer', () => {
  it('moves to correct phase on a right answer', () => {
    const state = gameReducer(initial(), { type: 'SUBMIT_ANSWER', problemId: 0, value: 56 })
    expect(state.phase).toBe('correct')
  })

  it('increments correctCount on a right answer', () => {
    const state = gameReducer(initial(), { type: 'SUBMIT_ANSWER', problemId: 0, value: 56 })
    expect(state.correctCount).toBe(1)
    expect(state.incorrectCount).toBe(0)
  })

  it('moves to feedback on an incorrect answer', () => {
    const state = gameReducer(initial(), { type: 'SUBMIT_ANSWER', problemId: 0, value: 55 })
    expect(state.phase).toBe('feedback')
  })

  it('increments incorrectCount on a wrong answer', () => {
    const state = gameReducer(initial(), { type: 'SUBMIT_ANSWER', problemId: 0, value: 55 })
    expect(state.incorrectCount).toBe(1)
    expect(state.correctCount).toBe(0)
  })

  it('remembers the wrong answer and clears it on CONTINUE', () => {
    const nextProblem: Problem = { a: 3, b: 4, operation: 'multiplication', answer: 12 }
    const afterWrong = gameReducer(initial(), { type: 'SUBMIT_ANSWER', problemId: 0, value: 55 })
    expect(afterWrong.submittedAnswer).toBe(55)
    const afterContinue = gameReducer(afterWrong, { type: 'CONTINUE', problem: nextProblem })
    expect(afterContinue.submittedAnswer).toBeUndefined()
  })

  it('ignores SUBMIT_ANSWER for a stale problemId', () => {
    const state = gameReducer(initial(), { type: 'SUBMIT_ANSWER', problemId: 99, value: 56 })
    expect(state.phase).toBe('question')
  })

  it('ignores SUBMIT_ANSWER after the phase has already left "question"', () => {
    const afterCorrect = gameReducer(initial(), { type: 'SUBMIT_ANSWER', problemId: 0, value: 56 })
    const afterLateAnswer = gameReducer(afterCorrect, { type: 'SUBMIT_ANSWER', problemId: 0, value: 56 })
    expect(afterLateAnswer).toBe(afterCorrect)
  })

  it('CONTINUE starts a new question with an incremented problemId and a fresh problem', () => {
    const nextProblem: Problem = { a: 3, b: 4, operation: 'multiplication', answer: 12 }
    const state = gameReducer(initial(), { type: 'CONTINUE', problem: nextProblem })
    expect(state).toEqual({
      phase: 'question',
      problem: nextProblem,
      problemId: 1,
      correctCount: 0,
      incorrectCount: 0,
    })
  })

  it('CONTINUE preserves accumulated score', () => {
    const nextProblem: Problem = { a: 3, b: 4, operation: 'multiplication', answer: 12 }
    const afterCorrect = gameReducer(initial(), { type: 'SUBMIT_ANSWER', problemId: 0, value: 56 })
    const afterContinue = gameReducer(afterCorrect, { type: 'CONTINUE', problem: nextProblem })
    expect(afterContinue.correctCount).toBe(1)
    expect(afterContinue.incorrectCount).toBe(0)
  })

  it('GAME_OVER moves to results phase', () => {
    const state = gameReducer(initial(), { type: 'GAME_OVER' })
    expect(state.phase).toBe('results')
  })

  it('GAME_OVER is idempotent when already in results', () => {
    const afterGameOver = gameReducer(initial(), { type: 'GAME_OVER' })
    const again = gameReducer(afterGameOver, { type: 'GAME_OVER' })
    expect(again).toBe(afterGameOver)
  })
})
