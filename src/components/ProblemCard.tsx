import { useEffect, useRef, useState } from 'react'
import type { Problem } from '../game/types'
import { playTick } from '../sound/sounds'
import { CountdownRing } from './CountdownRing'
import { Keypad } from './Keypad'
import styles from './ProblemCard.module.css'

export interface ProblemCardProps {
  problem: Problem
  remainingMs: number
  durationMs: number
  tickingEnabled: boolean
  onSubmit: (value: number) => void
}

const TICK_WINDOW_MS = 3000
const SUBMIT_DELAY_MS = 400

export function ProblemCard({ problem, remainingMs, durationMs, tickingEnabled, onSubmit }: ProblemCardProps) {
  const [input, setInput] = useState('')
  const [pendingSubmit, setPendingSubmit] = useState(false)
  const lastTickSecondRef = useRef<number | null>(null)
  const expectedLength = String(problem.answer).length

  useEffect(() => {
    if (!tickingEnabled || remainingMs > TICK_WINDOW_MS || remainingMs <= 0) return
    const currentSecond = Math.ceil(remainingMs / 1000)
    if (lastTickSecondRef.current !== currentSecond) {
      lastTickSecondRef.current = currentSecond
      playTick()
    }
  }, [remainingMs, tickingEnabled])

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
      <div className={styles.header}>
        <CountdownRing remainingMs={remainingMs} durationMs={durationMs} />
      </div>
      <p className={styles.problem}>
        {problem.a} × {problem.b}
      </p>
      <div className={styles.answer} aria-live="polite">
        {digitSlots.map((digit, index) => (
          <span key={index} className={`${styles.digitBox} ${digit ? styles.digitBoxFilled : ''}`}>
            {digit}
          </span>
        ))}
      </div>
      <Keypad onDigit={appendDigit} onBackspace={backspace} disabled={pendingSubmit} />
    </div>
  )
}
