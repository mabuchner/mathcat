import { useMemo, useRef } from 'react'
import { pickEncouragement } from '../game/messages'
import type { FeedbackReason, Problem } from '../game/types'
import styles from './EncouragementCard.module.css'

export interface EncouragementCardProps {
  reason: FeedbackReason | undefined
  problem: Problem
  onContinue: () => void
}

export function EncouragementCard({ reason, problem, onContinue }: EncouragementCardProps) {
  const lastMessageRef = useRef<string | undefined>(undefined)
  const message = useMemo(() => {
    const picked = pickEncouragement(lastMessageRef.current)
    lastMessageRef.current = picked
    return picked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem])

  return (
    <div className={styles.card}>
      <p className={styles.emoji}>{reason === 'timeout' ? '⏰' : '🙂'}</p>
      <p className={styles.message}>{message}</p>
      <p className={styles.answerReveal}>
        {problem.a} × {problem.b} = {problem.answer}
      </p>
      <button type="button" className={styles.continueButton} onClick={onContinue}>
        Next →
      </button>
    </div>
  )
}
