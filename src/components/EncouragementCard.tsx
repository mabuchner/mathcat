import { useEffect, useMemo, useRef, useState } from 'react'
import { pickEncouragement } from '../game/messages'
import type { Problem } from '../game/types'
import { OPERATION_SYMBOL } from '../game/operationSymbol'
import { FractionValue } from './FractionValue'
import styles from './EncouragementCard.module.css'

export interface EncouragementCardProps {
  problem: Problem
  submittedAnswer?: number
  submittedDenominator?: number
  onContinue: () => void
}

/** The child's answer as they wrote it: the typed numerator over the typed denominator. */
function SubmittedAnswer({ problem, value, denominator }: { problem: Problem; value: number; denominator?: number }) {
  if (problem.answerDenominator !== undefined) return <FractionValue numerator={value} denominator={denominator ?? '?'} />
  return <>{value}</>
}

function AnswerReveal({ problem }: { problem: Problem }) {
  if (problem.operation === 'fractionSimplification') {
    return (
      <>
        <FractionValue numerator={problem.a} denominator={problem.b} /> ={' '}
        <strong className={styles.answerValue}>
          <FractionValue numerator={problem.answer} denominator={problem.answerDenominator} />
        </strong>
      </>
    )
  }
  if (problem.denominator !== undefined) {
    return (
      <>
        <FractionValue numerator={problem.a} denominator={problem.denominator} />{' '}
        {OPERATION_SYMBOL[problem.operation]}{' '}
        <FractionValue numerator={problem.b} denominator={problem.denominator} /> ={' '}
        <strong className={styles.answerValue}>
          <FractionValue numerator={problem.answer} denominator={problem.denominator} />
        </strong>
      </>
    )
  }
  return (
    <>
      {problem.a} {OPERATION_SYMBOL[problem.operation]} {problem.b} ={' '}
      <strong className={styles.answerValue}>{problem.answer}</strong>
    </>
  )
}

export function EncouragementCard({ problem, submittedAnswer, submittedDenominator, onContinue }: EncouragementCardProps) {
  const lastMessageRef = useRef<string | undefined>(undefined)
  const message = useMemo(() => {
    const picked = pickEncouragement(lastMessageRef.current)
    lastMessageRef.current = picked
    return picked
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem])

  // Staged reveal: headline, message, the child's answer, equation, and the
  // correct answer cascade in 0.4s steps (see the CSS animation delays), and
  // Next stays disabled until 2s after the answer appears so it registers.
  const [canContinue, setCanContinue] = useState(false)
  const [showWaitHint, setShowWaitHint] = useState(false)
  useEffect(() => {
    setCanContinue(false)
    setShowWaitHint(false)
    const timer = setTimeout(() => setCanContinue(true), 3600)
    return () => clearTimeout(timer)
  }, [problem])

  const handleContinueClick = () => {
    if (!canContinue) {
      setShowWaitHint(true)
      return
    }
    onContinue()
  }

  return (
    <div className={styles.card}>
      <p className={styles.emoji}>🤔</p>
      <p className={styles.headline}>Oops!</p>
      <p className={styles.message}>{message}</p>
      {submittedAnswer !== undefined && (
        <p className={styles.yourAnswer}>
          You answered <SubmittedAnswer problem={problem} value={submittedAnswer} denominator={submittedDenominator} />
        </p>
      )}
      <p className={styles.answerReveal}>
        <AnswerReveal problem={problem} />
      </p>
      <button
        type="button"
        className={`${styles.continueButton} ${!canContinue ? styles.continueButtonWaiting : ''}`}
        aria-disabled={!canContinue}
        onClick={handleContinueClick}
      >
        Next →
      </button>
      <p className={styles.waitHint} aria-live="polite">
        {showWaitHint && !canContinue ? 'Try to remember the correct result!' : ''}
      </p>
    </div>
  )
}
