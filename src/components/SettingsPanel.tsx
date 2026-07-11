import { useState } from 'react'
import type { Operation } from '../game/types'
import { MIN_TABLES, type Settings } from '../settings/types'
import styles from './SettingsPanel.module.css'

export interface SettingsPanelProps {
  settings: Settings
  onChange: (update: Partial<Settings>) => void
  onClose: () => void
}

const ALL_TABLES = Array.from({ length: 12 }, (_, index) => index + 1)

const ALL_OPERATIONS: { value: Operation; label: string }[] = [
  { value: 'addition',       label: '+ Add' },
  { value: 'subtraction',    label: '− Subtract' },
  { value: 'multiplication', label: '× Multiply' },
]

interface Hints {
  operations?: string
  tables?: string
}

export function SettingsPanel({ settings, onChange, onClose }: SettingsPanelProps) {
  // Chips toggle freely; the minimums are only validated when leaving via Done,
  // so rearranging a selection mid-edit never fights back.
  const [hints, setHints] = useState<Hints>({})

  function toggleTable(table: number) {
    const isSelected = settings.tables.includes(table)
    const nextTables = isSelected
      ? settings.tables.filter((selected) => selected !== table)
      : [...settings.tables, table].sort((a, b) => a - b)
    if (nextTables.length >= MIN_TABLES) setHints((previous) => ({ ...previous, tables: undefined }))
    onChange({ tables: nextTables })
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
    if (settings.tables.length < MIN_TABLES) nextHints.tables = `Pick at least ${MIN_TABLES} numbers`
    if (nextHints.operations || nextHints.tables) {
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

      <section>
        <h3>
          Numbers to practice <span className={styles.headingNote}>(pick {MIN_TABLES} or more)</span>
        </h3>
        <div className={styles.chipGrid}>
          {ALL_TABLES.map((table) => (
            <button
              key={table}
              type="button"
              className={`${styles.chip} ${settings.tables.includes(table) ? styles.chipSelected : ''}`}
              onClick={() => toggleTable(table)}
              aria-pressed={settings.tables.includes(table)}
            >
              {table}
            </button>
          ))}
        </div>
        {hints.tables && (
          <p className={styles.hint} role="status">
            {hints.tables}
          </p>
        )}
      </section>

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
