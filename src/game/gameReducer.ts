import type { GameAction, GameState, Problem } from './types'

/**
 * A submission matches when the typed numerator equals the expected answer, and — for
 * fraction problems, where the child also types a denominator — that matches too.
 * Simplification demands the exact lowest-terms form (that is the skill being practiced),
 * but addition and subtraction accept any fraction of equal value: a child who writes
 * 1/2 where 2/4 was expected has already simplified, not made a mistake.
 */
export function isCorrectAnswer(problem: Problem, value: number, valueDenominator?: number): boolean {
  if (problem.answerDenominator === undefined) return value === problem.answer
  if (valueDenominator === undefined || valueDenominator <= 0) return false
  if (problem.operation === 'fractionSimplification') {
    return value === problem.answer && valueDenominator === problem.answerDenominator
  }
  return value * problem.answerDenominator === problem.answer * valueDenominator
}

export function createInitialGameState(problem: GameState['problem']): GameState {
  return { phase: 'question', problem, problemId: 0, correctCount: 0, incorrectCount: 0 }
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SUBMIT_ANSWER': {
      if (state.phase !== 'question' || action.problemId !== state.problemId) return state
      if (isCorrectAnswer(state.problem, action.value, action.valueDenominator)) {
        return { ...state, phase: 'correct', correctCount: state.correctCount + 1 }
      }
      return {
        ...state,
        phase: 'feedback',
        incorrectCount: state.incorrectCount + 1,
        submittedAnswer: action.value,
        submittedDenominator: action.valueDenominator,
      }
    }
    case 'CONTINUE': {
      return {
        ...state,
        phase: 'question',
        problem: action.problem,
        problemId: state.problemId + 1,
        submittedAnswer: undefined,
        submittedDenominator: undefined,
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
