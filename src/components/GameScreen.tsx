import { useEffect } from 'react'
import { useCatPreloader } from '../cats/useCatPreloader'
import { useGame } from '../game/useGame'
import { playCorrect, playTryAgain } from '../sound/sounds'
import type { Settings } from '../settings/types'
import { CatReward } from './CatReward'
import { EncouragementCard } from './EncouragementCard'
import styles from './GameScreen.module.css'
import { ProblemCard } from './ProblemCard'

export interface GameScreenProps {
  settings: Settings
  onHome: () => void
}

export function GameScreen({ settings, onHome }: GameScreenProps) {
  const { state, remainingMs, durationMs, submitAnswer, continueGame } = useGame(settings)
  const preloadedCatUrl = useCatPreloader(state.problemId)

  useEffect(() => {
    if (!settings.soundEnabled) return
    if (state.phase === 'correct') playCorrect()
    if (state.phase === 'feedback') playTryAgain()
    // Deliberately keyed on phase + problemId (not a full state diff) so this fires exactly once per transition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.phase, state.problemId, settings.soundEnabled])

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <button type="button" className={styles.homeButton} onClick={onHome} aria-label="Back to menu">
          🏠
        </button>
      </div>
      <div className={styles.screen}>
        {state.phase === 'question' && (
          <ProblemCard
            key={state.problemId}
            problem={state.problem}
            remainingMs={remainingMs}
            durationMs={durationMs}
            tickingEnabled={settings.tickingEnabled}
            onSubmit={submitAnswer}
          />
        )}
        {state.phase === 'correct' && <CatReward catUrl={preloadedCatUrl} onContinue={continueGame} />}
        {state.phase === 'feedback' && (
          <EncouragementCard reason={state.reason} problem={state.problem} onContinue={continueGame} />
        )}
      </div>
    </div>
  )
}
