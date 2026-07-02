import { buildRandomCatUrl } from './catImage'

const POOL_SIZE = 3

interface PoolEntry {
  url: string
}

const pool: PoolEntry[] = []

function preloadOne(): PoolEntry {
  const url = buildRandomCatUrl()
  const img = new Image()
  img.src = url
  const entry = { url }
  pool.push(entry)
  return entry
}

// Start loading images immediately when the module is first imported.
for (let i = 0; i < POOL_SIZE; i++) {
  preloadOne()
}

export function consumeFromPool(): string {
  const entry = pool.shift()
  preloadOne() // refill so the pool stays at POOL_SIZE
  return entry?.url ?? buildRandomCatUrl()
}
