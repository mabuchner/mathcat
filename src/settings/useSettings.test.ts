import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { DEFAULT_SETTINGS } from './types'
import { useSettings } from './useSettings'

const STORAGE_KEY = 'mathcat:settings:v1'

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
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...DEFAULT_SETTINGS, tables: [2, 4] }))
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings.tables).toEqual([2, 4])
  })

  it('falls back to defaults without throwing when storage contains corrupt JSON', () => {
    window.localStorage.setItem(STORAGE_KEY, '{ not valid json')
    const { result } = renderHook(() => useSettings())
    expect(result.current.settings).toEqual(DEFAULT_SETTINGS)
  })
})
