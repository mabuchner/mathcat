import { useEffect, useRef, useState } from 'react'
import { useCatPreloader } from '../cats/useCatPreloader'
import { useGame } from '../game/useGame'
import { playCorrect, playTryAgain, playTick, playVictory, playGameOver } from '../sound/sounds'
import type { Settings } from '../settings/types'
import type { RecordScoreResult } from '../scores/useHighScores'
import type { HighScoreEntry } from '../scores/types'
import { CatReward } from './CatReward'
import { EncouragementCard } from './EncouragementCard'
import { ResultsScreen } from './ResultsScreen'
import styles from './GameScreen.module.css'
import { ProblemCard } from './ProblemCard'

export interface GameScreenProps {
  settings: Settings
  recordScore: (entry: Omit<HighScoreEntry, 'dateISO'>) => RecordScoreResult
  onHome: () => void
}

export function GameScreen({ settings, recordScore, onHome }: GameScreenProps) {
  const { state, globalRemainingMs, globalDurationMs, submitAnswer, continueGame } = useGame(settings)
  const preloadedCatUrl = useCatPreloader(state.problemId)
  const lastTickSecondRef = useRef<number | null>(null)
  const recordedResultRef = useRef(false)
  const [highScoreResult, setHighScoreResult] = useState<RecordScoreResult | null>(null)

  useEffect(() => {
    if (!settings.soundEnabled) return
    if (state.phase === 'correct') playCorrect()
    if (state.phase === 'feedback') playTryAgain()
    if (state.phase === 'results' && state.correctCount >= 8) playVictory()
    else if (state.phase === 'results') playGameOver()
    // Deliberately keyed on phase + problemId so this fires exactly once per transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.problemId, settings.soundEnabled])

  useEffect(() => {
    if (state.phase !== 'results') {
      recordedResultRef.current = false
      return
    }
    if (recordedResultRef.current) return
    recordedResultRef.current = true
    setHighScoreResult(
      recordScore({
        correctCount: state.correctCount,
        incorrectCount: state.incorrectCount,
        operations: settings.operations,
        numbers: Object.fromEntries(settings.operations.map((operation) => [operation, settings.numbers[operation]])),
      }),
    )
  }, [state.phase, state.correctCount, state.incorrectCount, settings.operations, settings.numbers, recordScore])

  useEffect(() => {
    if (!settings.soundEnabled || state.phase !== 'question') return
    if (globalRemainingMs > 10_000 || globalRemainingMs <= 0) return
    const currentSecond = Math.ceil(globalRemainingMs / 1000)
    if (lastTickSecondRef.current !== currentSecond) {
      lastTickSecondRef.current = currentSecond
      playTick()
    }
  }, [globalRemainingMs, state.phase, settings.soundEnabled])

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <button type="button" className={styles.homeButton} onClick={onHome} aria-label="Back to menu">
          🏠
        </button>
        <div className={styles.headerStats}>
          <span className={styles.scoreCorrect}>✓ {state.correctCount}</span>
          <span className={styles.scoreIncorrect}>✗ {state.incorrectCount}</span>
        </div>
      </div>
      <div className={styles.screen}>
        {state.phase === 'question' && (
          <ProblemCard
            key={state.problemId}
            problem={state.problem}
            globalRemainingMs={globalRemainingMs}
            globalDurationMs={globalDurationMs}
            onSubmit={submitAnswer}
          />
        )}
        {state.phase === 'correct' && <CatReward catUrl={preloadedCatUrl} onContinue={continueGame} />}
        {state.phase === 'feedback' && (
          <EncouragementCard
            problem={state.problem}
            submittedAnswer={state.submittedAnswer}
            onContinue={continueGame}
          />
        )}
        {state.phase === 'results' && (
          <ResultsScreen
            correctCount={state.correctCount}
            incorrectCount={state.incorrectCount}
            isNewHighScore={highScoreResult?.isNewHighScore}
            rank={highScoreResult?.rank}
            onPlayAgain={onHome}
          />
        )}
      </div>
    </div>
  )
}
