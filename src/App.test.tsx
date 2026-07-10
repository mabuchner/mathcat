import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import App from './App'

vi.mock('./sound/sounds', () => ({
  playCorrect: vi.fn(),
  playTryAgain: vi.fn(),
  playTick: vi.fn(),
  playVictory: vi.fn(),
  playGameOver: vi.fn(),
}))

vi.mock('./cats/catImage', () => ({
  buildRandomCatUrl: () => 'https://cataas.com/cat?test',
}))

describe('App', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('starts on the main menu', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'MathCat' })).toBeInTheDocument()
  })

  it('navigates to settings and back', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /settings/i }))
    expect(screen.getByRole('heading', { name: 'Settings' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /done/i }))
    expect(screen.getByRole('heading', { name: 'MathCat' })).toBeInTheDocument()
  })

  it('navigates to high scores and back', async () => {
    const user = userEvent.setup()
    render(<App />)
    await user.click(screen.getByRole('button', { name: /high scores/i }))
    expect(screen.getByText(/no scores yet/i)).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(screen.getByRole('heading', { name: 'MathCat' })).toBeInTheDocument()
  })

  it('starts a game and returns home via the home button', async () => {
    const user = userEvent.setup()
    const { unmount } = render(<App />)
    await user.click(screen.getByRole('button', { name: /play/i }))
    expect(screen.getByRole('button', { name: 'Digit 1' })).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: /back to menu/i }))
    expect(screen.getByRole('heading', { name: 'MathCat' })).toBeInTheDocument()
    unmount()
  })
})
