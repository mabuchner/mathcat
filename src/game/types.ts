export const GAME_DURATION_SECONDS = 60

export type Operation =
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'fractionAddition'
  | 'fractionSubtraction'
  | 'fractionSimplification'

export interface Problem {
  a: number
  b: number
  operation: Operation
  answer: number
  /** For fraction addition/subtraction: the like denominator shared by `a` and `b`. */
  denominator?: number
  /**
   * For fraction problems: the denominator of the expected answer, which the child types
   * along with the numerator (`answer`). For simplification (where `a`/`b` are the shown
   * fraction) it is the lowest-terms denominator.
   */
  answerDenominator?: number
}

export type Phase = 'question' | 'correct' | 'feedback' | 'results'

export interface GameState {
  phase: Phase
  problem: Problem
  problemId: number
  correctCount: number
  incorrectCount: number
  /** The child's wrong answer (its numerator, for fractions), present only during the feedback phase. */
  submittedAnswer?: number
  /** The denominator the child typed with a wrong simplification answer. */
  submittedDenominator?: number
}

export type GameAction =
  | { type: 'SUBMIT_ANSWER'; problemId: number; value: number; valueDenominator?: number }
  | { type: 'CONTINUE'; problem: Problem }
  | { type: 'GAME_OVER' }
