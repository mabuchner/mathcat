import { useCallback, useState } from 'react'
import type { Operation } from '../game/types'
import { DEFAULT_SETTINGS, MIN_NUMBERS_BY_OPERATION, SELECTABLE_NUMBERS_BY_OPERATION, type Settings } from './types'

// Bumped from v1 because the settings shape changed (per-operation number pools
// replaced a single shared list) in a way that isn't worth migrating.
const STORAGE_KEY = 'mathcat:settings:v2'

const ALL_OPERATIONS: Operation[] = [
  'addition',
  'subtraction',
  'multiplication',
  'fractionAddition',
  'fractionSubtraction',
  'fractionSimplification',
]

function loadSettings(): Settings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw)
    const settings: Settings = { ...DEFAULT_SETTINGS, ...parsed, numbers: { ...DEFAULT_SETTINGS.numbers, ...parsed.numbers } }
    // Settings persisted by older versions may violate the minimums or contain numbers
    // that are no longer selectable (the problem generator relies on both invariants).
    for (const operation of ALL_OPERATIONS) {
      const stored = settings.numbers[operation]
      const pool = Array.isArray(stored) ? stored.filter((value) => SELECTABLE_NUMBERS_BY_OPERATION[operation].includes(value)) : []
      settings.numbers[operation] = pool.length < MIN_NUMBERS_BY_OPERATION[operation] ? DEFAULT_SETTINGS.numbers[operation] : pool
    }
    if (Array.isArray(settings.operations)) {
      settings.operations = settings.operations.filter((operation) => ALL_OPERATIONS.includes(operation))
    }
    if (!Array.isArray(settings.operations) || settings.operations.length === 0) {
      settings.operations = DEFAULT_SETTINGS.operations
    }
    return settings
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function useSettings(): { settings: Settings; setSettings: (update: Partial<Settings>) => void } {
  const [settings, setSettingsState] = useState<Settings>(loadSettings)

  const setSettings = useCallback((update: Partial<Settings>) => {
    setSettingsState((prev) => {
      const next = { ...prev, ...update }
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
      } catch {
        // Ignore write failures, e.g. private browsing storage limits.
      }
      return next
    })
  }, [])

  return { settings, setSettings }
}
