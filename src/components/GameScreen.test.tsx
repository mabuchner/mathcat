import { act, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DEFAULT_SETTINGS } from '../settings/types'
import { GameScreen } from './GameScreen'

vi.mock('../sound/sounds', () => ({
  playCorrect: vi.fn(),
  playTryAgain: vi.fn(),
  playVictory: vi.fn(),
  playGameOver: vi.fn(),
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

    expect(screen.getByRole('button', { name: /next/i })).toBeDisabled()
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3600)
    })
    await waitFor(() => expect(screen.getByRole('button', { name: /next/i })).toBeEnabled())
  })
})
