import { useCallback, useState } from 'react'
import { MAX_HIGH_SCORES, type HighScoreEntry } from './types'

const STORAGE_KEY = 'mathcat:highscores:v1'

function loadHighScores(): HighScoreEntry[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function saveHighScores(scores: HighScoreEntry[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(scores))
  } catch {
    // Ignore write failures, e.g. private browsing storage limits.
  }
}

export interface RecordScoreResult {
  isNewHighScore: boolean
  rank: number | null
}

export function useHighScores(): {
  highScores: HighScoreEntry[]
  recordScore: (entry: Omit<HighScoreEntry, 'dateISO'>) => RecordScoreResult
  resetScores: () => void
} {
  const [highScores, setHighScores] = useState<HighScoreEntry[]>(loadHighScores)

  const recordScore = useCallback(
    (entry: Omit<HighScoreEntry, 'dateISO'>): RecordScoreResult => {
      const newEntry: HighScoreEntry = { ...entry, dateISO: new Date().toISOString() }
      const sorted = [...highScores, newEntry].sort((a, b) => b.correctCount - a.correctCount)
      const truncated = sorted.slice(0, MAX_HIGH_SCORES)
      const rankIndex = truncated.indexOf(newEntry)

      setHighScores(truncated)
      saveHighScores(truncated)

      return { isNewHighScore: rankIndex !== -1, rank: rankIndex === -1 ? null : rankIndex + 1 }
    },
    [highScores],
  )

  const resetScores = useCallback(() => {
    setHighScores([])
    saveHighScores([])
  }, [])

  return { highScores, recordScore, resetScores }
}
