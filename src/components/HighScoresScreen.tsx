import type { HighScoreEntry } from '../scores/types'
import type { Operation } from '../game/types'
import styles from './HighScoresScreen.module.css'

export interface HighScoresScreenProps {
  highScores: HighScoreEntry[]
  onReset: () => void
  onClose: () => void
}

const OPERATION_SYMBOLS: Record<Operation, string> = {
  addition: '+',
  subtraction: '−',
  multiplication: '×',
}

function formatOperations(operations: Operation[]): string {
  return operations.map((operation) => OPERATION_SYMBOLS[operation]).join(' ')
}

/** Compact display of the practiced numbers: [1,2,3,4,7] → "1–4, 7". */
function formatTables(tables: number[]): string {
  const sorted = [...tables].sort((a, b) => a - b)
  const parts: string[] = []
  let start = sorted[0]
  let end = sorted[0]
  for (const value of sorted.slice(1)) {
    if (value === end + 1) {
      end = value
      continue
    }
    parts.push(start === end ? `${start}` : `${start}–${end}`)
    start = end = value
  }
  parts.push(start === end ? `${start}` : `${start}–${end}`)
  return parts.join(', ')
}

function formatDate(dateISO: string): string {
  return new Date(dateISO).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export function HighScoresScreen({ highScores, onReset, onClose }: HighScoresScreenProps) {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>🏆 High Scores</h2>

      {highScores.length === 0 ? (
        <p className={styles.empty}>No scores yet — give it a try!</p>
      ) : (
        <ol className={styles.list}>
          {highScores.map((entry, index) => (
            <li key={entry.dateISO} className={styles.row}>
              <span className={styles.rank}>{index + 1}</span>
              <span className={styles.details}>
                <span className={styles.counts}>
                  <span className={styles.correct}>✓ {entry.correctCount}</span>
                  <span className={styles.incorrect}>✗ {entry.incorrectCount}</span>
                </span>
                <span className={styles.config}>
                  {`${formatOperations(entry.operations)} · ${formatTables(entry.tables)}`}
                </span>
              </span>
              <span className={styles.date}>{formatDate(entry.dateISO)}</span>
            </li>
          ))}
        </ol>
      )}

      {highScores.length > 0 && (
        <button
          type="button"
          className={styles.resetButton}
          onClick={() => {
            if (window.confirm('Clear all high scores? This cannot be undone.')) {
              onReset()
            }
          }}
        >
          Reset high scores
        </button>
      )}

      <button type="button" className={styles.closeButton} onClick={onClose}>
        Back
      </button>
    </div>
  )
}
