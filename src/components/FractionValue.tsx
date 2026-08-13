import type { ReactNode } from 'react'
import styles from './FractionValue.module.css'

export interface FractionValueProps {
  numerator: ReactNode
  denominator: ReactNode
}

/** A vertically stacked fraction (numerator over a bar over denominator), sized in em
 * so it follows the surrounding text. The parts can be plain numbers or richer content
 * like the answer's digit boxes. */
export function FractionValue({ numerator, denominator }: FractionValueProps) {
  return (
    <span className={styles.fraction}>
      <span className={styles.numerator}>{numerator}</span>
      <span className={styles.denominator}>{denominator}</span>
    </span>
  )
}
