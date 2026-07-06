export const GAME_DURATION_SECONDS = 60

export type Operation = 'addition' | 'subtraction' | 'multiplication'

export interface Problem {
  a: number
  b: number
  operation: Operation
  answer: number
}

export type Phase = 'question' | 'correct' | 'feedback' | 'results'

export interface GameState {
  phase: Phase
  problem: Problem
  problemId: number
  correctCount: number
  incorrectCount: number
}

export type GameAction =
  | { type: 'SUBMIT_ANSWER'; problemId: number; value: number }
  | { type: 'CONTINUE'; problem: Problem }
  | { type: 'GAME_OVER' }
