import { useCallback, useReducer, useRef } from 'react'
import { generateProblem } from './problemGenerator'
import { createInitialGameState, gameReducer } from './gameReducer'
import { useGlobalTimer } from './useGlobalTimer'
import type { GameState } from './types'
import type { Settings } from '../settings/types'

export interface UseGameResult {
  state: GameState
  globalRemainingMs: number
  globalDurationMs: number
  submitAnswer: (value: number) => void
  continueGame: () => void
}

export function useGame(settings: Settings): UseGameResult {
  const [state, dispatch] = useReducer(
    gameReducer,
    settings,
    (initialSettings) =>
      createInitialGameState(
        generateProblem({ tables: initialSettings.tables, operations: initialSettings.operations }),
      ),
  )
  const problemRef = useRef(state.problem)
  problemRef.current = state.problem

  const globalDurationMs = settings.gameDurationSeconds * 1000

  const handleGameOver = useCallback(() => {
    dispatch({ type: 'GAME_OVER' })
  }, [])

  const { remainingMs: globalRemainingMs } = useGlobalTimer({
    totalMs: globalDurationMs,
    paused: state.phase !== 'question',
    onExpire: handleGameOver,
  })

  const submitAnswer = useCallback(
    (value: number) => {
      dispatch({ type: 'SUBMIT_ANSWER', problemId: state.problemId, value })
    },
    [state.problemId],
  )

  const continueGame = useCallback(() => {
    const problem = generateProblem({
      tables: settings.tables,
      operations: settings.operations,
      previous: problemRef.current,
    })
    dispatch({ type: 'CONTINUE', problem })
  }, [settings.tables, settings.operations])

  return { state, globalRemainingMs, globalDurationMs, submitAnswer, continueGame }
}
