import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from '../settings/types'
import { GameScreen } from './GameScreen'
import { playTick } from '../sound/sounds'

vi.mock('../sound/sounds', () => ({
  playCorrect: vi.fn(),
  playTryAgain: vi.fn(),
  playVictory: vi.fn(),
  playGameOver: vi.fn(),
  playTick: vi.fn(),
}))

vi.mock('../cats/catImage', () => ({
  buildRandomCatUrl: () => 'https://cataas.com/cat?test',
}))

const settings = { ...DEFAULT_SETTINGS, tables: [7] }
const recordScore = () => ({ isNewHighScore: false, rank: null })

function getProblemText() {
  return screen.getByText(/×/).textContent ?? ''
}

async function typeDigits(user: ReturnType<typeof userEvent.setup>, digits: string) {
  for (const digit of digits) {
    await user.click(screen.getByRole('button', { name: `Digit ${digit}` }))
  }
}

/** Same digit-length as `correct` but guaranteed not to equal it (flips the last digit). */
function wrongDigitsSameLength(correct: number): string {
  const correctStr = String(correct)
  const lastIndex = correctStr.length - 1
  const flippedLastDigit = (Number(correctStr[lastIndex]) + 1) % 10
  return correctStr.slice(0, lastIndex) + String(flippedLastDigit)
}

describe('GameScreen', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    vi.mocked(playTick).mockClear()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('shows a cat reward after a correct answer', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<GameScreen settings={settings} recordScore={recordScore} onHome={() => {}} />)

    const problemText = getProblemText()
    const [a, b] = problemText.split('×').map((part) => Number(part.trim()))
    await typeDigits(user, String(a * b))

    expect(await screen.findByText(/Correct!/)).toBeInTheDocument()
    expect(screen.getByAltText('A reward cat')).toBeInTheDocument()
  })

  it('shows encouragement after a wrong answer', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    render(<GameScreen settings={settings} recordScore={recordScore} onHome={() => {}} />)

    const problemText = getProblemText()
    const [a, b] = problemText.split('×').map((part) => Number(part.trim()))
    const correct = a * b

    const wrongAnswer = wrongDigitsSameLength(correct)
    await typeDigits(user, wrongAnswer)

    expect(
      await screen.findByText(
        (_, element) => element?.tagName === 'P' && element.textContent === `${a} × ${b} = ${correct}`,
      ),
    ).toBeInTheDocument()
    expect(screen.getByText('Oops!')).toBeInTheDocument()
    expect(screen.getByText(`You answered ${Number(wrongAnswer)}`)).toBeInTheDocument()

    const nextButton = screen.getByRole('button', { name: /next/i })
    expect(nextButton).toHaveAttribute('aria-disabled', 'true')
    await user.click(nextButton)
    expect(screen.getByText('Try to remember the correct result!')).toBeInTheDocument()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(3600)
    })
    await waitFor(() => expect(nextButton).toHaveAttribute('aria-disabled', 'false'))
    expect(screen.queryByText('Try to remember the correct result!')).not.toBeInTheDocument()
  })

  it('shows the results screen when the global timer runs out', async () => {
    render(<GameScreen settings={settings} recordScore={recordScore} onHome={() => {}} />)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(61_000)
    })

    expect(screen.getByRole('button', { name: /play again/i })).toBeInTheDocument()
    expect(screen.getByText('Keep practicing!')).toBeInTheDocument()
  })

  it('only plays the tick sound during the final 10 seconds of the countdown', async () => {
    render(<GameScreen settings={settings} recordScore={recordScore} onHome={() => {}} />)

    // 60s total; advancing 49s leaves 11s remaining, just outside the tick window.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(49_000)
    })
    expect(playTick).not.toHaveBeenCalled()

    // Crossing into the final 10 seconds should start ticking, but at most roughly
    // once per second rather than on every 100ms timer update.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(2_000)
    })
    expect(playTick).toHaveBeenCalled()
    expect(vi.mocked(playTick).mock.calls.length).toBeLessThanOrEqual(3)
  })

  it('never plays the tick sound when sound is disabled', async () => {
    render(
      <GameScreen
        settings={{ ...settings, soundEnabled: false }}
        recordScore={recordScore}
        onHome={() => {}}
      />,
    )

    await act(async () => {
      await vi.advanceTimersByTimeAsync(55_000)
    })
    expect(playTick).not.toHaveBeenCalled()
  })
})
