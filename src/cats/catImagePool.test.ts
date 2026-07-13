import { beforeEach, describe, expect, it, vi } from 'vitest'

describe('catImagePool', () => {
  beforeEach(() => {
    vi.resetModules()
  })

  it('preloads a pool of images on import and serves them in FIFO order', async () => {
    let next = 0
    vi.doMock('./catImage', () => ({
      buildRandomCatUrl: () => `https://cataas.com/cat?${next++}`,
    }))
    const { consumeFromPool } = await import('./catImagePool')

    expect(consumeFromPool()).toBe('https://cataas.com/cat?0')
    expect(consumeFromPool()).toBe('https://cataas.com/cat?1')
    expect(consumeFromPool()).toBe('https://cataas.com/cat?2')
  })

  it('refills after every consume so the pool never runs dry under normal use', async () => {
    let next = 0
    vi.doMock('./catImage', () => ({
      buildRandomCatUrl: () => `https://cataas.com/cat?${next++}`,
    }))
    const { consumeFromPool } = await import('./catImagePool')

    // Far more than the pool's capacity, to prove each consume triggers a same-tick refill
    // rather than the pool being a fixed batch that eventually empties out.
    for (let i = 0; i < 20; i++) {
      expect(consumeFromPool()).toBe(`https://cataas.com/cat?${i}`)
    }
  })
})
