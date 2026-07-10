import { beforeEach, describe, expect, it, vi } from 'vitest'
import { playCorrect, playGameOver, playTick, playTryAgain, playVictory } from './sounds'

class FakeAudioParam {
  setValueAtTime = vi.fn()
  exponentialRampToValueAtTime = vi.fn()
}

class FakeOscillator {
  type = 'sine'
  frequency = new FakeAudioParam()
  connect = vi.fn()
  start = vi.fn()
  stop = vi.fn()
}

class FakeGain {
  gain = new FakeAudioParam()
  connect = vi.fn()
}

const oscillators: FakeOscillator[] = []
const contexts: FakeAudioContext[] = []

class FakeAudioContext {
  currentTime = 0
  state = 'running'
  destination = {}
  resume = vi.fn()
  suspend = vi.fn()
  constructor() {
    contexts.push(this)
  }
  createOscillator() {
    const oscillator = new FakeOscillator()
    oscillators.push(oscillator)
    return oscillator
  }
  createGain() {
    return new FakeGain()
  }
}

vi.stubGlobal('AudioContext', FakeAudioContext)

// The module keeps one lazily-created context; all tests share it.
function sharedContext(): FakeAudioContext {
  return contexts[0]
}

beforeEach(() => {
  oscillators.length = 0
})

describe('sounds', () => {
  it.each([
    ['playCorrect', playCorrect, 3],
    ['playTryAgain', playTryAgain, 2],
    ['playTick', playTick, 1],
    ['playVictory', playVictory, 4],
    ['playGameOver', playGameOver, 3],
  ])('%s plays %i tones, each started and stopped', (_name, play, expectedTones) => {
    play()
    expect(oscillators).toHaveLength(expectedTones)
    for (const oscillator of oscillators) {
      expect(oscillator.start).toHaveBeenCalledOnce()
      expect(oscillator.stop).toHaveBeenCalledOnce()
      expect(oscillator.connect).toHaveBeenCalledOnce()
    }
  })

  it('creates a single shared context across all sounds', () => {
    playTick()
    playCorrect()
    expect(contexts).toHaveLength(1)
  })

  it('suspends the context when the page is hidden and resumes it when visible again', () => {
    playTick() // ensure the lazily-created context and its listener exist
    const context = sharedContext()

    Object.defineProperty(document, 'hidden', { value: true, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(context.suspend).toHaveBeenCalledOnce()

    Object.defineProperty(document, 'hidden', { value: false, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
    expect(context.resume).toHaveBeenCalledOnce()
  })

  it('resumes a suspended context before playing', () => {
    playTick()
    const context = sharedContext()
    context.resume.mockClear()
    context.state = 'suspended'
    playTick()
    expect(context.resume).toHaveBeenCalledOnce()
    context.state = 'running'
  })
})
