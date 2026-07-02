import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useCountdown } from './useCountdown'

describe('useCountdown', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fires onExpire exactly once when the duration elapses, even if time keeps advancing', () => {
    const onExpire = vi.fn()
    renderHook(() => useCountdown({ durationMs: 1000, active: true, resetKey: 'a', onExpire }))

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(onExpire).toHaveBeenCalledTimes(1)

    act(() => {
      vi.advanceTimersByTime(1000)
    })
    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  it('decreases remainingMs monotonically down to exactly 0 with no double-fire at the boundary', () => {
    const onExpire = vi.fn()
    const { result } = renderHook(() => useCountdown({ durationMs: 500, active: true, resetKey: 'a', onExpire }))

    const readings: number[] = [result.current.remainingMs]
    for (let i = 0; i < 5; i++) {
      act(() => {
        vi.advanceTimersByTime(100)
      })
      readings.push(result.current.remainingMs)
    }

    for (let i = 1; i < readings.length; i++) {
      expect(readings[i]).toBeLessThanOrEqual(readings[i - 1])
    }
    expect(readings[readings.length - 1]).toBe(0)
    expect(onExpire).toHaveBeenCalledTimes(1)
  })

  it('restarts the countdown when resetKey changes', () => {
    const onExpire = vi.fn()
    const { result, rerender } = renderHook(
      ({ resetKey }) => useCountdown({ durationMs: 1000, active: true, resetKey, onExpire }),
      { initialProps: { resetKey: 'first' } },
    )

    act(() => {
      vi.advanceTimersByTime(800)
    })
    expect(result.current.remainingMs).toBeLessThanOrEqual(200)

    act(() => {
      rerender({ resetKey: 'second' })
    })
    expect(result.current.remainingMs).toBe(1000)
    expect(onExpire).not.toHaveBeenCalled()
  })

  it('does not tick or expire while inactive', () => {
    const onExpire = vi.fn()
    renderHook(() => useCountdown({ durationMs: 1000, active: false, resetKey: 'a', onExpire }))

    act(() => {
      vi.advanceTimersByTime(2000)
    })
    expect(onExpire).not.toHaveBeenCalled()
  })
})
