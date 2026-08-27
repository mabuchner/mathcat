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

  it('keeps the dev menu hidden until the logo is tapped 10 times', async () => {
    const user = userEvent.setup()
    render(<MainMenu onPlay={() => {}} onSettings={() => {}} onHighScores={() => {}} />)
    const logo = screen.getByText('🐱')

    expect(screen.queryByRole('button', { name: /confetti/i })).not.toBeInTheDocument()

    for (let tap = 0; tap < 9; tap++) {
      await user.click(logo)
    }
    expect(screen.queryByRole('button', { name: /confetti/i })).not.toBeInTheDocument()

    await user.click(logo)
    expect(screen.getByRole('button', { name: /confetti/i })).toBeInTheDocument()
  })

  it('spawns confetti when the dev menu button is clicked', async () => {
    const user = userEvent.setup()
    const { container } = render(
      <MainMenu onPlay={() => {}} onSettings={() => {}} onHighScores={() => {}} />,
    )
    const logo = screen.getByText('🐱')
    for (let tap = 0; tap < 10; tap++) {
      await user.click(logo)
    }

    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: /confetti/i }))

    const confetti = container.querySelector('[aria-hidden="true"]')
    expect(confetti).toBeInTheDocument()
    expect(confetti?.querySelectorAll('span').length).toBeGreaterThan(0)
  })
})
