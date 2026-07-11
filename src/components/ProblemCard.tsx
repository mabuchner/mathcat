import { useState } from 'react'
import type { Problem } from '../game/types'
import { OPERATION_SYMBOL } from '../game/operationSymbol'
import { CountdownRing } from './CountdownRing'
import { Keypad } from './Keypad'
import styles from './ProblemCard.module.css'

export interface ProblemCardProps {
  problem: Problem
  globalRemainingMs: number
  globalDurationMs: number
  onSubmit: (value: number) => void
}

const SUBMIT_DELAY_MS = 400

function formatMinSec(ms: number): string {
  const totalSeconds = Math.ceil(ms / 1000)
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60
  return `${minutes}:${String(seconds).padStart(2, '0')}`
}

export function ProblemCard({ problem, globalRemainingMs, globalDurationMs, onSubmit }: ProblemCardProps) {
  const [input, setInput] = useState('')
  const [pendingSubmit, setPendingSubmit] = useState(false)
  const expectedLength = String(problem.answer).length

  function appendDigit(digit: number) {
    if (input.length >= expectedLength || pendingSubmit) return
    const next = input + String(digit)
    setInput(next)
    if (next.length === expectedLength) {
      setPendingSubmit(true)
      setTimeout(() => onSubmit(Number(next)), SUBMIT_DELAY_MS)
    }
  }

  function backspace() {
    if (pendingSubmit) return
    setInput((prev) => prev.slice(0, -1))
  }

  const digitSlots = Array.from({ length: expectedLength }, (_, index) => input[index] ?? '')

  return (
    <div className={styles.card}>
      <div className={styles.info}>
        <div className={styles.header}>
          <CountdownRing
            remainingMs={globalRemainingMs}
            durationMs={globalDurationMs}
            label={formatMinSec(globalRemainingMs)}
            size={96}
          />
        </div>
        <p className={styles.problem}>
          {problem.a} {OPERATION_SYMBOL[problem.operation]} {problem.b}
        </p>
        <div className={styles.answer} aria-live="polite">
          {digitSlots.map((digit, index) => (
            <span key={index} className={`${styles.digitBox} ${digit ? styles.digitBoxFilled : ''}`}>
              {digit}
            </span>
          ))}
        </div>
      </div>
      <div className={styles.keypadColumn}>
        <Keypad onDigit={appendDigit} onBackspace={backspace} disabled={pendingSubmit} />
      </div>
    </div>
  )
}
