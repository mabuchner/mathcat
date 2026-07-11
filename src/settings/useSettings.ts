import { useCallback, useState } from 'react'
import { DEFAULT_SETTINGS, MIN_TABLES, type Settings } from './types'

const STORAGE_KEY = 'mathcat:settings:v1'

function loadSettings(): Settings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw)
    const settings: Settings = { ...DEFAULT_SETTINGS, ...parsed }
    // Settings persisted before the minimum was introduced may violate it.
    if (!Array.isArray(settings.tables) || settings.tables.length < MIN_TABLES) {
      settings.tables = DEFAULT_SETTINGS.tables
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
