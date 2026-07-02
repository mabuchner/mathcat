import { useEffect, useRef, useState } from 'react'
import { consumeFromPool } from './catImagePool'

export function useCatPreloader(problemId: number): string {
  const [url, setUrl] = useState(() => consumeFromPool())
  const isFirstRender = useRef(true)

  useEffect(() => {
    // The initial URL was already consumed in useState above; skip the first effect run.
    if (isFirstRender.current) {
      isFirstRender.current = false
      return
    }
    setUrl(consumeFromPool())
  }, [problemId])

  return url
}
