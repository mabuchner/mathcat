import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { MainMenu } from './MainMenu'

describe('MainMenu', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('shows the title', () => {
    render(<MainMenu onPlay={() => {}} onSettings={() => {}} onHighScores={() => {}} />)
    expect(screen.getByRole('heading', { name: 'MathCat' })).toBeInTheDocument()
  })

  it('shows the build date and commit hash', () => {
    render(<MainMenu onPlay={() => {}} onSettings={() => {}} onHighScores={() => {}} />)
    expect(
      screen.getByText(/^Build: \d{4}-\d{2}-\d{2} \d{2}:\d{2} UTC · \w+$/),
    ).toBeInTheDocument()
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

  it('invokes the Web Share API when available', async () => {
    const user = userEvent.setup()
    const share = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { ...navigator, share })
    render(<MainMenu onPlay={() => {}} onSettings={() => {}} onHighScores={() => {}} />)

    await user.click(screen.getByRole('button', { name: /share with friends/i }))

    expect(share).toHaveBeenCalledOnce()
  })

  it('falls back to copying the link when the Web Share API is unavailable', async () => {
    // userEvent.setup() installs its own clipboard polyfill on navigator, so it
    // must run before we stub navigator.clipboard, or it clobbers our stub.
    const user = userEvent.setup()
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { ...navigator, share: undefined, clipboard: { writeText } })
    render(<MainMenu onPlay={() => {}} onSettings={() => {}} onHighScores={() => {}} />)

    await user.click(screen.getByRole('button', { name: /share with friends/i }))

    expect(writeText).toHaveBeenCalledOnce()
    expect(await screen.findByRole('button', { name: /link copied/i })).toBeInTheDocument()
  })
})
