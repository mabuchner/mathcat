import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from './types'
import { useSettings } from './useSettings'

const STORAGE_KEY = 'mathcat:settings:v2'

describe('useSettings', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    window.localStorage.clear()
  })

  it('returns the default settings when storage is empty', () => {
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS)
  })

  it('persists updates to localStorage and reflects them in state', () => {
    const { result } = renderHook(() => useSettings())

    act(() => {
      result.current.setSettings({ soundEnabled: false })
    })

    expect(result.current.settings.soundEnabled).toBe(false)

    const stored = JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')
    expect(stored.soundEnabled).toBe(false)
  })

  it('loads persisted settings on a fresh mount', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_SETTINGS, numbers: { ...DEFAULT_SETTINGS.numbers, multiplication: [2, 4, 6, 8] } }),
    )
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings.numbers.multiplication).toEqual([2, 4, 6, 8])
  })

  it('resets a persisted operation\'s numbers below its minimum back to the defaults', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_SETTINGS, numbers: { ...DEFAULT_SETTINGS.numbers, addition: [5] } }),
    )
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings.numbers.addition).toEqual(DEFAULT_SETTINGS.numbers.addition)
    // Other operations' numbers are untouched.
    expect(result.current.settings.numbers.multiplication).toEqual(DEFAULT_SETTINGS.numbers.multiplication)
  })

  it('keeps a single persisted multiplication table, since multiplication only needs one', () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ ...DEFAULT_SETTINGS, numbers: { ...DEFAULT_SETTINGS.numbers, multiplication: [7] } }),
    )
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings.numbers.multiplication).toEqual([7])
  })

  it('resets persisted empty operations back to the defaults', () => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, operations: [] }))
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings.operations).toEqual(DEFAULT_SETTINGS.operations)
  })

  it('falls back to defaults without throwing when storage contains corrupt JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{ not valid json')
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS)
  })
})
