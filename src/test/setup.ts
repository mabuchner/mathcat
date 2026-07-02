import '@testing-library/jest-dom/vitest'

class MockAudioContext {
  state = 'running'
  currentTime = 0
  destination = {}
  createOscillator() {
    return {
      type: 'sine',
      frequency: { setValueAtTime: () => {}, exponentialRampToValueAtTime: () => {} },
      connect: () => {},
      start: () => {},
      stop: () => {},
    }
  }
  createGain() {
    return {
      gain: {
        setValueAtTime: () => {},
        linearRampToValueAtTime: () => {},
        exponentialRampToValueAtTime: () => {},
      },
      connect: () => {},
    }
  }
  resume() {
    return Promise.resolve()
  }
  close() {
    return Promise.resolve()
  }
}

// jsdom doesn't implement the Web Audio API; stub it so importing sounds.ts in tests doesn't throw.
;(globalThis as unknown as { AudioContext: typeof MockAudioContext }).AudioContext = MockAudioContext
