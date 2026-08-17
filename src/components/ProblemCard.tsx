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

/** Longest numerator or denominator a child can type into a fraction answer. */
const MAX_FRACTION_PART_DIGITS = 2

export function ProblemCard({ problem, onSubmit }: ProblemCardProps) {
  const [pendingSubmit, setPendingSubmit] = useState(false)

  // Whole-number answers: digits fill boxes sized to the expected answer and
  // submit themselves once the last box is filled.
  const [input, setInput] = useState('')
  const expectedLength = String(problem.answer).length

  // Fraction answers are free-form instead, so an equivalent fraction with more
  // digits (8/16 where 4/8 was expected) can be written too: the child types the
  // numerator, confirms with ✓ to move onto the denominator, and confirms again
  // to submit.
  const isFraction = problem.answerDenominator !== undefined
  const [numeratorInput, setNumeratorInput] = useState('')
  const [denominatorInput, setDenominatorInput] = useState('')
  const [activePart, setActivePart] = useState<'numerator' | 'denominator'>('numerator')

  function appendDigit(digit: number) {
    if (pendingSubmit) return
    if (isFraction) {
      const [part, setPart] =
        activePart === 'numerator'
          ? [numeratorInput, setNumeratorInput]
          : [denominatorInput, setDenominatorInput]
      if (part.length < MAX_FRACTION_PART_DIGITS) setPart(part + String(digit))
      return
    }
    if (input.length >= expectedLength) return
    const next = input + String(digit)
    setInput(next)
    if (next.length === expectedLength) {
      setPendingSubmit(true)
      setTimeout(() => onSubmit(Number(next)), SUBMIT_DELAY_MS)
    }
  }

  function backspace() {
    if (pendingSubmit) return
    if (!isFraction) {
      setInput((prev) => prev.slice(0, -1))
      return
    }
    if (activePart === 'denominator' && denominatorInput.length === 0) {
      // Deleting past the fraction bar returns to the numerator, like in a text field.
      setActivePart('numerator')
      setNumeratorInput((prev) => prev.slice(0, -1))
    } else if (activePart === 'denominator') {
      setDenominatorInput((prev) => prev.slice(0, -1))
    } else {
      setNumeratorInput((prev) => prev.slice(0, -1))
    }
  }

  function confirmFractionPart() {
    if (pendingSubmit) return
    if (activePart === 'numerator') {
      if (numeratorInput.length > 0) setActivePart('denominator')
      return
    }
    if (denominatorInput.length === 0) return
    setPendingSubmit(true)
    onSubmit(Number(numeratorInput), Number(denominatorInput))
  }

  const digitSlots = Array.from({ length: expectedLength }, (_, index) => input[index] ?? '')

  const fractionPart = (part: 'numerator' | 'denominator', digits: string) => (
    <span
      className={`${styles.partBox} ${activePart === part && !pendingSubmit ? styles.partBoxActive : ''}`}
      aria-label={part === 'numerator' ? 'Numerator' : 'Denominator'}
    >
      {digits}
    </span>
  )

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
              numerator={fractionPart('numerator', numeratorInput)}
              denominator={fractionPart('denominator', denominatorInput)}
            />
          ) : (
            digitSlots.map((digit, index) => (
              <span key={index} className={`${styles.digitBox} ${digit ? styles.digitBoxFilled : ''}`}>
                {digit}
              </span>
            ))
          )}
        </div>
      </div>
      <div className={styles.keypadColumn}>
        <Keypad
          onDigit={appendDigit}
          onBackspace={backspace}
          onConfirm={isFraction ? confirmFractionPart : undefined}
          disabled={pendingSubmit}
        />
      </div>
    </div>
  )
}
