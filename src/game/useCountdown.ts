import { useEffect, useRef, useState } from 'react'

const TICK_INTERVAL_MS = 100

export interface UseCountdownOptions {
  durationMs: number
  active: boolean
  /** Change this value (e.g. to the current problem id) to force the countdown to restart. */
  resetKey: unknown
  onExpire: () => void
}

export function useCountdown({ durationMs, active, resetKey, onExpire }: UseCountdownOptions): { remainingMs: number } {
  const [remainingMs, setRemainingMs] = useState(durationMs)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    if (!active) return

    const endTime = Date.now() + durationMs
    let fired = false
    setRemainingMs(durationMs)

    const interval = setInterval(() => {
      const remaining = Math.max(0, endTime - Date.now())
      setRemainingMs(remaining)
      if (remaining <= 0 && !fired) {
        fired = true
        onExpireRef.current()
      }
    }, TICK_INTERVAL_MS)

    return () => clearInterval(interval)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [durationMs, active, resetKey])

  return { remainingMs }
}
