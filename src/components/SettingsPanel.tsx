import { useState } from 'react'
import type { Operation } from '../game/types'
import { MIN_NUMBERS_BY_OPERATION, type Settings } from '../settings/types'
import styles from './SettingsPanel.module.css'

export interface SettingsPanelProps {
  settings: Settings
  onChange: (update: Partial<Settings>) => void
  onClose: () => void
}

const ALL_NUMBERS = Array.from({ length: 12 }, (_, index) => index + 1)

const ALL_OPERATIONS: { value: Operation; label: string; numbersLabel: string }[] = [
  { value: 'addition',       label: '+ Add',      numbersLabel: 'Numbers to add' },
  { value: 'subtraction',    label: '− Subtract',  numbersLabel: 'Numbers to subtract' },
  { value: 'multiplication', label: '× Multiply',  numbersLabel: 'Multiplication tables' },
]

interface Hints {
  operations?: string
  numbers?: Partial<Record<Operation, string>>
}

export function SettingsPanel({ settings, onChange, onClose }: SettingsPanelProps) {
  // Chips toggle freely; the minimums are only validated when leaving via Done,
  // so rearranging a selection mid-edit never fights back.
  const [hints, setHints] = useState<Hints>({})

  function toggleNumber(operation: Operation, value: number) {
    const pool = settings.numbers[operation]
    const isSelected = pool.includes(value)
    const next = isSelected ? pool.filter((selected) => selected !== value) : [...pool, value].sort((a, b) => a - b)
    if (next.length >= MIN_NUMBERS_BY_OPERATION[operation]) {
      setHints((previous) => ({ ...previous, numbers: { ...previous.numbers, [operation]: undefined } }))
    }
    onChange({ numbers: { ...settings.numbers, [operation]: next } })
  }

  function toggleOperation(op: Operation) {
    const isSelected = settings.operations.includes(op)
    const next = isSelected
      ? settings.operations.filter((o) => o !== op)
      : [...settings.operations, op]
    if (next.length > 0) setHints((previous) => ({ ...previous, operations: undefined }))
    onChange({ operations: next })
  }

  function handleDone() {
    const nextHints: Hints = {}
    if (settings.operations.length === 0) nextHints.operations = 'Pick at least one operation'
    const numberHints: Partial<Record<Operation, string>> = {}
    for (const operation of settings.operations) {
      const min = MIN_NUMBERS_BY_OPERATION[operation]
      if (settings.numbers[operation].length < min) {
        numberHints[operation] = `Pick at least ${min} number${min === 1 ? '' : 's'}`
      }
    }
    if (Object.keys(numberHints).length > 0) nextHints.numbers = numberHints
    if (nextHints.operations || nextHints.numbers) {
      setHints(nextHints)
      return
    }
    onClose()
  }

  return (
    <div className={styles.panel}>
      <h2>Settings</h2>

      <section>
        <h3>Operations</h3>
        <div className={styles.operationChips}>
          {ALL_OPERATIONS.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              className={`${styles.chip} ${settings.operations.includes(value) ? styles.chipSelected : ''}`}
              onClick={() => toggleOperation(value)}
              aria-pressed={settings.operations.includes(value)}
            >
              {label}
            </button>
          ))}
        </div>
        {hints.operations && (
          <p className={styles.hint} role="status">
            {hints.operations}
          </p>
        )}
      </section>

      {ALL_OPERATIONS.filter(({ value }) => settings.operations.includes(value)).map(({ value, numbersLabel }) => (
        <section key={value}>
          <h3>
            {numbersLabel}{' '}
            <span className={styles.headingNote}>(pick {MIN_NUMBERS_BY_OPERATION[value]} or more)</span>
          </h3>
          <div className={styles.chipGrid} role="group" aria-label={numbersLabel}>
            {ALL_NUMBERS.map((number) => (
              <button
                key={number}
                type="button"
                className={`${styles.chip} ${settings.numbers[value].includes(number) ? styles.chipSelected : ''}`}
                onClick={() => toggleNumber(value, number)}
                aria-pressed={settings.numbers[value].includes(number)}
              >
                {number}
              </button>
            ))}
          </div>
          {hints.numbers?.[value] && (
            <p className={styles.hint} role="status">
              {hints.numbers[value]}
            </p>
          )}
        </section>
      ))}

      <section className={styles.toggleRow}>
        <label>
          <input
            type="checkbox"
            checked={settings.soundEnabled}
            onChange={(event) => onChange({ soundEnabled: event.target.checked })}
          />
          Sound effects
        </label>
      </section>

      <button type="button" className={styles.doneButton} onClick={handleDone}>
        Done
      </button>
    </div>
  )
}
