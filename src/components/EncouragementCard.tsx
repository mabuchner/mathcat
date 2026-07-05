import { useMemo, useRef } from 'react'
import { pickEncouragement } from '../game/messages'
import type { Problem } from '../game/types'
import { OPERATION_SYMBOL } from '../game/operationSymbol'
import styles from './EncouragementCard.module.css'

export interface EncouragementCardProps {
  problem: Problem
  onContinue: () => void
}

export function EncouragementCard({ problem, onContinue }: EncouragementCardProps) {
  const lastMessageRef = useRef<string | undefined>(undefined)
  const message = useMemo(() => {
    const picked = pickEncouragement(lastMessageRef.current)
    lastMessageRef.current = picked
    return picked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem])

  return (
    <div className={styles.card}>
      <p className={styles.emoji}>🙂</p>
      <p className={styles.message}>{message}</p>
      <p className={styles.answerReveal}>
        {problem.a} {OPERATION_SYMBOL[problem.operation]} {problem.b} = {problem.answer}
      </p>
      <button type="button" className={styles.continueButton} onClick={onContinue}>
        Next →
      </button>
    </div>
  )
}
