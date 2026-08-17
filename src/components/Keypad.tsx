import styles from './Keypad.module.css'

export interface KeypadProps {
  onDigit: (digit: number) => void
  onBackspace: () => void
  /** When set, a ✓ key appears in the keypad's free corner (used by fraction answers). */
  onConfirm?: () => void
  disabled?: boolean
}

const DIGIT_ROWS = [
  [1, 2, 3],
  [4, 5, 6],
  [7, 8, 9],
]

export function Keypad({ onDigit, onBackspace, onConfirm, disabled }: KeypadProps) {
  return (
    <div className={styles.keypad}>
      {DIGIT_ROWS.flat().map((digit) => (
        <button
          key={digit}
          type="button"
          className={styles.key}
          disabled={disabled}
          onClick={() => onDigit(digit)}
          aria-label={`Digit ${digit}`}
        >
          {digit}
        </button>
      ))}
      <button
        type="button"
        className={`${styles.key} ${styles.backspace}`}
        disabled={disabled}
        onClick={onBackspace}
        aria-label="Backspace"
      >
        ⌫
      </button>
      <button
        type="button"
        className={styles.key}
        disabled={disabled}
        onClick={() => onDigit(0)}
        aria-label="Digit 0"
      >
        0
      </button>
      {onConfirm && (
        <button
          type="button"
          className={`${styles.key} ${styles.confirm}`}
          disabled={disabled}
          onClick={onConfirm}
          aria-label="Confirm"
        >
          ✓
        </button>
      )}
    </div>
  )
}
