import styles from './ResultsScreen.module.css'

export interface ResultsScreenProps {
  correctCount: number
  incorrectCount: number
  gameDurationSeconds: number
  onPlayAgain: () => void
}

function getTier(correctCount: number, gameDurationSeconds: number): { emoji: string; message: string } {
  const correctPerMinute = correctCount / (gameDurationSeconds / 60)
  if (correctPerMinute >= 12) return { emoji: '🌟', message: 'Amazing!' }
  if (correctPerMinute >= 8) return { emoji: '⭐', message: 'Well done!' }
  if (correctPerMinute >= 5) return { emoji: '😊', message: 'Good effort!' }
  return { emoji: '💪', message: 'Keep practicing!' }
}

export function ResultsScreen({ correctCount, incorrectCount, gameDurationSeconds, onPlayAgain }: ResultsScreenProps) {
  const { emoji, message } = getTier(correctCount, gameDurationSeconds)

  return (
    <div className={styles.container}>
      <div className={styles.tierEmoji}>{emoji}</div>
      <h2 className={styles.message}>{message}</h2>

      <div className={styles.scores}>
        <div className={styles.scoreItem}>
          <span className={styles.scoreCount + ' ' + styles.correct}>{correctCount}</span>
          <span className={styles.scoreLabel}>correct</span>
        </div>
        <div className={styles.scoreDivider} />
        <div className={styles.scoreItem}>
          <span className={styles.scoreCount + ' ' + styles.incorrect}>{incorrectCount}</span>
          <span className={styles.scoreLabel}>incorrect</span>
        </div>
      </div>

      <button type="button" className={styles.playAgainButton} onClick={onPlayAgain}>
        Play again
      </button>
    </div>
  )
}
