let audioContext: AudioContext | null = null

/**
 * Both iOS Safari and Chrome block audio until a user gesture, so the AudioContext must be
 * created lazily on first use (e.g. the first keypad tap) rather than on mount.
 */
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new AudioContext()
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (!audioContext) return
        if (document.hidden) {
          void audioContext.suspend()
        } else {
          void audioContext.resume()
        }
      })
    }
  }
  if (audioContext.state === 'suspended') {
    void audioContext.resume()
  }
  return audioContext
}

interface ToneOptions {
  frequency: number
  startTime: number
  duration: number
  type?: OscillatorType
  peakGain?: number
}

function playTone(ctx: AudioContext, { frequency, startTime, duration, type = 'sine', peakGain = 0.2 }: ToneOptions): void {
  const oscillator = ctx.createOscillator()
  const gain = ctx.createGain()
  oscillator.type = type
  oscillator.frequency.setValueAtTime(frequency, startTime)

  gain.gain.setValueAtTime(0.0001, startTime)
  gain.gain.exponentialRampToValueAtTime(peakGain, startTime + 0.02)
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration)

  oscillator.connect(gain)
  gain.connect(ctx.destination)
  oscillator.start(startTime)
  oscillator.stop(startTime + duration + 0.02)
}

/** Short ascending, celebratory arpeggio for a correct answer. */
export function playCorrect(): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  const notes = [523.25, 659.25, 783.99] // C5, E5, G5
  notes.forEach((frequency, index) => {
    playTone(ctx, { frequency, startTime: now + index * 0.1, duration: 0.18, type: 'triangle', peakGain: 0.22 })
  })
}

/** Soft, low, descending "boop" — gentle, not punitive. */
export function playTryAgain(): void {
  const ctx = getAudioContext()
  const now = ctx.currentTime
  playTone(ctx, { frequency: 392, startTime: now, duration: 0.22, type: 'sine', peakGain: 0.15 })
  playTone(ctx, { frequency: 311.13, startTime: now + 0.16, duration: 0.28, type: 'sine', peakGain: 0.15 })
}

/** A short, quiet blip, meant to be used sparingly (e.g. only the last few countdown seconds). */
export function playTick(): void {
  const ctx = getAudioContext()
  playTone(ctx, { frequency: 880, startTime: ctx.currentTime, duration: 0.05, type: 'square', peakGain: 0.08 })
}
