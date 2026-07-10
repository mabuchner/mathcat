import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { MainMenu } from './MainMenu'

describe('MainMenu', () => {
  it('shows the title', () => {
    render(<MainMenu onPlay={() => {}} onSettings={() => {}} onHighScores={() => {}} />)
    expect(screen.getByRole('heading', { name: 'MathCat' })).toBeInTheDocument()
  })

  it.each([
    [/play/i, 'onPlay'],
    [/high scores/i, 'onHighScores'],
    [/settings/i, 'onSettings'],
  ] as const)('the %s button fires %s', async (buttonName, callbackName) => {
    const user = userEvent.setup()
    const callbacks = { onPlay: vi.fn(), onSettings: vi.fn(), onHighScores: vi.fn() }
    render(<MainMenu {...callbacks} />)
    await user.click(screen.getByRole('button', { name: buttonName }))
    expect(callbacks[callbackName]).toHaveBeenCalledOnce()
  })
})
