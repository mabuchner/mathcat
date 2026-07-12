import { useCallback, useReducer, useRef } from 'react'
import { generateProblem } from './problemGenerator'
import { advanceMissedProblemQueue, enqueueMissedProblem, takeDueMissedProblem } from './missedProblemQueue'
import { createInitialGameState, gameReducer } from './gameReducer'
import { useGlobalTimer } from './useGlobalTimer'
import { GAME_DURATION_SECONDS } from './types'
import type { GameState } from './types'
import type { MissedProblem } from './missedProblemQueue'
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
  const missedQueueRef = useRef<MissedProblem[]>([])

  const globalDurationMs = GAME_DURATION_SECONDS * 1000

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
      if (value !== state.problem.answer) {
        missedQueueRef.current = enqueueMissedProblem(missedQueueRef.current, state.problem)
      }
      dispatch({ type: 'SUBMIT_ANSWER', problemId: state.problemId, value })
    },
    [state.problem, state.problemId],
  )

  const continueGame = useCallback(() => {
    // Every new problem counts down the queue, whether or not it ends up being a reused miss.
    const dueQueue = advanceMissedProblemQueue(missedQueueRef.current)
    const dueMiss = takeDueMissedProblem(dueQueue)

    const problem =
      dueMiss?.problem ??
      generateProblem({
        tables: settings.tables,
        operations: settings.operations,
        previous: problemRef.current,
      })
    missedQueueRef.current = dueMiss?.queue ?? dueQueue

    dispatch({ type: 'CONTINUE', problem })
  }, [settings.tables, settings.operations])

  return { state, globalRemainingMs, globalDurationMs, submitAnswer, continueGame }
}
