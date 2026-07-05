import { useEffect, useRef, useState } from 'react'

export interface UseGlobalTimerOptions {
  totalMs: number
  paused: boolean
  onExpire: () => void
}

/**
 * Pauseable countdown that preserves remaining time across pause/resume cycles.
 * Unlike useCountdown, pausing does not reset the timer back to totalMs.
 */
export function useGlobalTimer({ totalMs, paused, onExpire }: UseGlobalTimerOptions): { remainingMs: number } {
  const [remainingMs, setRemainingMs] = useState(totalMs)
  const remainingRef = useRef(totalMs)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    if (paused) return

    const startTime = Date.now()
    const startRemaining = remainingRef.current
    let fired = false

    const interval = setInterval(() => {
      const remaining = Math.max(0, startRemaining - (Date.now() - startTime))
      remainingRef.current = remaining
      setRemainingMs(remaining)
      if (remaining <= 0 && !fired) {
        fired = true
        onExpireRef.current()
      }
    }, 100)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paused])

  return { remainingMs }
}
