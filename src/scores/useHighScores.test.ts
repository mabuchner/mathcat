import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import type { Operation } from '../game/types'
import { useHighScores } from './useHighScores'

const STORAGE_KEY = 'mathcat:highscores:v1'

function makeEntry(correctCount: number, incorrectCount = 0) {
  return {
    correctCount,
    incorrectCount,
    operations: ['multiplication'] as Operation[],
    numbers: { multiplication: [7] },
  }
}

describe('useHighScores', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it('returns an empty list when storage is empty', () => {
    const { result } = renderHook(() => useHighScores())
    expect(result.current.highScores).toEqual([])
  })

  it('records a score and persists it to localStorage', () => {
    const { result } = renderHook(() => useHighScores())

    let recordResult
    act(() => {
      recordResult = result.current.recordScore(makeEntry(10))
    })

    expect(recordResult).toEqual({ isNewHighScore: true, rank: 1 })
    expect(result.current.highScores).toHaveLength(1)
    expect(result.current.highScores[0].correctCount).toBe(10)

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')
    expect(stored).toHaveLength(1)
    expect(stored[0].correctCount).toBe(10)
  })

  it('sorts entries descending by correctCount', () => {
    const { result } = renderHook(() => useHighScores())

    act(() => {
      result.current.recordScore(makeEntry(5))
    })
    act(() => {
      result.current.recordScore(makeEntry(15))
    })
    act(() => {
      result.current.recordScore(makeEntry(10))
    })

    expect(result.current.highScores.map((entry) => entry.correctCount)).toEqual([15, 10, 5])
  })

  it('caps the list at 5 entries, dropping the lowest score', () => {
    const { result } = renderHook(() => useHighScores())

    for (const score of [10, 20, 30, 40, 50]) {
      act(() => {
        result.current.recordScore(makeEntry(score))
      })
    }

    let lastResult
    act(() => {
      lastResult = result.current.recordScore(makeEntry(5))
    })

    expect(lastResult).toEqual({ isNewHighScore: false, rank: null })
    expect(result.current.highScores).toHaveLength(5)
    expect(result.current.highScores.map((entry) => entry.correctCount)).toEqual([50, 40, 30, 20, 10])
  })

  it('reports rank and bumps out the lowest entry when a better score is added', () => {
    const { result } = renderHook(() => useHighScores())

    for (const score of [10, 20, 30, 40, 50]) {
      act(() => {
        result.current.recordScore(makeEntry(score))
      })
    }

    let newResult
    act(() => {
      newResult = result.current.recordScore(makeEntry(25))
    })

    expect(newResult).toEqual({ isNewHighScore: true, rank: 4 })
    expect(result.current.highScores.map((entry) => entry.correctCount)).toEqual([50, 40, 30, 25, 20])
  })

  it('falls back to an empty list without throwing when storage contains corrupt JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{ not valid json')
    const { result } = renderHook(() => useHighScores())
    expect(result.current.highScores).toEqual([])
  })

  it('clears the list and localStorage on resetScores', () => {
    const { result } = renderHook(() => useHighScores())

    act(() => {
      result.current.recordScore(makeEntry(10))
    })
    expect(result.current.highScores).toHaveLength(1)

    act(() => {
      result.current.resetScores()
    })

    expect(result.current.highScores).toEqual([])
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '[]')).toEqual([])
  })
})
