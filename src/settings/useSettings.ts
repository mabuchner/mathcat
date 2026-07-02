import { useCallback, useState } from 'react'
import { DEFAULT_SETTINGS, type Settings } from './types'

const STORAGE_KEY = 'mathcat:settings:v1'

function loadSettings(): Settings {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_SETTINGS, ...parsed }
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
