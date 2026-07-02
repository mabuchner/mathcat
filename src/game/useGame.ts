import { useCallback, useReducer, useRef } from 'react'
import { generateProblem } from './problemGenerator'
import { createInitialGameState, gameReducer } from './gameReducer'
import { useCountdown } from './useCountdown'
import type { GameState } from './types'
import type { Settings } from '../settings/types'

export interface UseGameResult {
  state: GameState
  remainingMs: number
  durationMs: number
  submitAnswer: (value: number) => void
  continueGame: () => void
}

export function useGame(settings: Settings): UseGameResult {
  const [state, dispatch] = useReducer(
    gameReducer,
    settings,
    (initialSettings) => createInitialGameState(generateProblem({ tables: initialSettings.tables })),
  )
  const problemRef = useRef(state.problem)
  problemRef.current = state.problem

  const durationMs = settings.countdownSeconds * 1000

  const handleExpire = useCallback(() => {
    dispatch({ type: 'TIME_UP', problemId: state.problemId })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.problemId])

  const { remainingMs } = useCountdown({
    durationMs,
    active: state.phase === 'question',
    resetKey: state.problemId,
    onExpire: handleExpire,
  })

  const submitAnswer = useCallback(
    (value: number) => {
      dispatch({ type: 'SUBMIT_ANSWER', problemId: state.problemId, value })
    },
    [state.problemId],
  )

  const continueGame = useCallback(() => {
    const problem = generateProblem({ tables: settings.tables, previous: problemRef.current })
    dispatch({ type: 'CONTINUE', problem })
  }, [settings.tables])

  return { state, remainingMs, durationMs, submitAnswer, continueGame }
}
