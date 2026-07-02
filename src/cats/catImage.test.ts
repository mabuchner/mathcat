import { describe, expect, it } from 'vitest'
import { buildRandomCatUrl } from './catImage'

describe('buildRandomCatUrl', () => {
  it('targets the cataas.com cat endpoint', () => {
    const url = buildRandomCatUrl()
    expect(url.startsWith('https://cataas.com/cat?')).toBe(true)
  })

  it('includes a cache-busting query param that differs between calls', () => {
    let call = 0
    const random = () => {
      call += 1
      return call === 1 ? 0.1 : 0.9
    }
    const first = buildRandomCatUrl(random)
    const second = buildRandomCatUrl(random)
    expect(first).not.toBe(second)
  })
})
