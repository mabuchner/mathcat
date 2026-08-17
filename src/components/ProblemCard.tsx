import { useState } from 'react'
import type { Problem } from '../game/types'
import { OPERATION_SYMBOL } from '../game/operationSymbol'
import { FractionValue } from './FractionValue'
import { Keypad } from './Keypad'
import styles from './ProblemCard.module.css'

export interface ProblemCardProps {
  problem: Problem
  onSubmit: (value: number, valueDenominator?: number) => void
}

const SUBMIT_DELAY_MS = 400

export function ProblemCard({ problem, onSubmit }: ProblemCardProps) {
  const [input, setInput] = useState('')
  const [pendingSubmit, setPendingSubmit] = useState(false)

  const isFraction = problem.answerDenominator !== undefined
  // The typed digits fill the answer's numerator first, then its denominator.
  const numeratorLength = String(problem.answer).length
  const denominatorLength = problem.answerDenominator === undefined ? 0 : String(problem.answerDenominator).length
  const expectedLength = numeratorLength + denominatorLength

  function appendDigit(digit: number) {
    if (input.length >= expectedLength || pendingSubmit) return
    const next = input + String(digit)
    setInput(next)
    if (next.length === expectedLength) {
      setPendingSubmit(true)
      const value = Number(next.slice(0, numeratorLength))
      setTimeout(() => {
        if (denominatorLength > 0) onSubmit(value, Number(next.slice(numeratorLength)))
        else onSubmit(value)
      }, SUBMIT_DELAY_MS)
    }
  }

  function backspace() {
    if (pendingSubmit) return
    setInput((prev) => prev.slice(0, -1))
  }

  const slotsFor = (offset: number, length: number) =>
    Array.from({ length }, (_, index) => input[offset + index] ?? '')

  const renderSlots = (slots: string[]) =>
    slots.map((digit, index) => (
      <span key={index} className={`${styles.digitBox} ${digit ? styles.digitBoxFilled : ''}`}>
        {digit}
      </span>
    ))

  return (
    <div className={styles.card}>
      <div className={styles.info}>
        {problem.operation === 'fractionSimplification' ? (
          <>
            <p className={styles.simplifyHint}>Simplify!</p>
            <p className={`${styles.problem} ${styles.fractionProblem}`}>
              <FractionValue numerator={problem.a} denominator={problem.b} />
            </p>
          </>
        ) : isFraction ? (
          <p className={`${styles.problem} ${styles.fractionProblem}`}>
            <FractionValue numerator={problem.a} denominator={problem.denominator} />
            <span>{OPERATION_SYMBOL[problem.operation]}</span>
            <FractionValue numerator={problem.b} denominator={problem.denominator} />
          </p>
        ) : (
          <p className={styles.problem}>
            {problem.a} {OPERATION_SYMBOL[problem.operation]} {problem.b}
          </p>
        )}
        <div className={`${styles.answer} ${isFraction ? styles.fractionAnswer : ''}`} aria-live="polite">
          {isFraction ? (
            <FractionValue
              numerator={<span className={styles.slotRow}>{renderSlots(slotsFor(0, numeratorLength))}</span>}
              denominator={<span className={styles.slotRow}>{renderSlots(slotsFor(numeratorLength, denominatorLength))}</span>}
            />
          ) : (
            renderSlots(slotsFor(0, numeratorLength))
          )}
        </div>
      </div>
      <div className={styles.keypadColumn}>
        <Keypad onDigit={appendDigit} onBackspace={backspace} disabled={pendingSubmit} />
      </div>
    </div>
  )
}
