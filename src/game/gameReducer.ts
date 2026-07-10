import type { GameAction, GameState } from './types'

export function createInitialGameState(problem: GameState['problem']): GameState {
  return { phase: 'question', problem, problemId: 0, correctCount: 0, incorrectCount: 0 }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SUBMIT_ANSWER': {
      if (state.phase !== 'question' || action.problemId !== state.problemId) return state
      if (action.value === state.problem.answer) {
        return { ...state, phase: 'correct', correctCount: state.correctCount + 1 }
      }
      return {
        ...state,
        phase: 'feedback',
        incorrectCount: state.incorrectCount + 1,
        submittedAnswer: action.value,
      }
    }
    case 'CONTINUE': {
      return {
        ...state,
        phase: 'question',
        problem: action.problem,
        problemId: state.problemId + 1,
        submittedAnswer: undefined,
      }
    }
    case 'GAME_OVER': {
      if (state.phase === 'results') return state
      return { ...state, phase: 'results' }
    }
    default:
      return state
  }
}
