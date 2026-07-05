import type { Operation } from '../game/types'
import type { Settings } from '../settings/types'
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

export function SettingsPanel({ settings, onChange, onClose }: SettingsPanelProps) {
  function toggleTable(table: number) {
    const isSelected = settings.tables.includes(table)
    if (isSelected && settings.tables.length === 1) return
    const nextTables = isSelected
      ? settings.tables.filter((selected) => selected !== table)
      : [...settings.tables, table].sort((a, b) => a - b)
    onChange({ tables: nextTables })
  }

  function toggleOperation(op: Operation) {
    const isSelected = settings.operations.includes(op)
    if (isSelected && settings.operations.length === 1) return
    const next = isSelected
      ? settings.operations.filter((o) => o !== op)
      : [...settings.operations, op]
    onChange({ operations: next })
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
      </section>

      <section>
        <h3>Tables to practice</h3>
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
      </section>

      <section>
        <h3>Time limit: {settings.countdownSeconds}s</h3>
        <input
          type="range"
          min={5}
          max={20}
          value={settings.countdownSeconds}
          onChange={(event) => onChange({ countdownSeconds: Number(event.target.value) })}
        />
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
        <label>
          <input
            type="checkbox"
            checked={settings.tickingEnabled}
            onChange={(event) => onChange({ tickingEnabled: event.target.checked })}
          />
          Countdown ticking
        </label>
      </section>

      <button type="button" className={styles.doneButton} onClick={onClose}>
        Done
      </button>
    </div>
  )
}
