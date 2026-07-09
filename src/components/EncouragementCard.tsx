import { useEffect, useMemo, useRef, useState } from 'react'
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

  // Staged reveal: emoji, message, equation, and answer cascade in 0.4s steps
  // (see the CSS animation delays), and Next stays disabled until 2s after the
  // answer appears so it registers.
  const [canContinue, setCanContinue] = useState(false)
  useEffect(() => {
    setCanContinue(false)
    const timer = setTimeout(() => setCanContinue(true), 3200)
    return () => clearTimeout(timer)
  }, [problem])

  return (
    <div className={styles.card}>
      <p className={styles.emoji}>🙂</p>
      <p className={styles.message}>{message}</p>
      <p className={styles.answerReveal}>
        {problem.a} {OPERATION_SYMBOL[problem.operation]} {problem.b} ={' '}
        <strong className={styles.answerValue}>{problem.answer}</strong>
      </p>
      <button type="button" className={styles.continueButton} disabled={!canContinue} onClick={onContinue}>
        Next →
      </button>
    </div>
  )
}
