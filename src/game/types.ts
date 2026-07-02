export interface Problem {
  a: number
  b: number
  answer: number
}

export type Phase = 'question' | 'correct' | 'feedback'

export type FeedbackReason = 'wrong' | 'timeout'

export interface GameState {
  phase: Phase
  problem: Problem
  problemId: number
  reason?: FeedbackReason
}

export type GameAction =
  | { type: 'SUBMIT_ANSWER'; problemId: number; value: number }
  | { type: 'TIME_UP'; problemId: number }
  | { type: 'CONTINUE'; problem: Problem }
