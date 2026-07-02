import type { GameAction, GameState } from './types'

export function createInitialGameState(problem: GameState['problem']): GameState {
  return { phase: 'question', problem, problemId: 0 }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SUBMIT_ANSWER': {
      if (state.phase !== 'question' || action.problemId !== state.problemId) return state
      if (action.value === state.problem.answer) {
        return { ...state, phase: 'correct', reason: undefined }
      }
      return { ...state, phase: 'feedback', reason: 'wrong' }
    }
    case 'TIME_UP': {
      if (state.phase !== 'question' || action.problemId !== state.problemId) return state
      return { ...state, phase: 'feedback', reason: 'timeout' }
    }
    case 'CONTINUE': {
      return { phase: 'question', problem: action.problem, problemId: state.problemId + 1, reason: undefined }
    }
    default:
      return state
  }
}
