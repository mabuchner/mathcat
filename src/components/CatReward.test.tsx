import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { CatReward } from './CatReward'

describe('CatReward', () => {
  it('shows a loading placeholder until the image loads', () => {
    render(<CatReward catUrl="https://cataas.com/cat?test" onContinue={() => {}} />)
    expect(screen.getByText(/loading cat/i)).toBeInTheDocument()
    fireEvent.load(screen.getByRole('img', { name: /reward cat/i }))
    expect(screen.queryByText(/loading cat/i)).not.toBeInTheDocument()
  })

  it('falls back to the bundled cat when the image fails to load', () => {
    render(<CatReward catUrl="https://cataas.com/cat?test" onContinue={() => {}} />)
    const image = screen.getByRole('img', { name: /reward cat/i })
    fireEvent.error(image)
    // Vite inlines the bundled fallback SVG as a data URI.
    expect(image).toHaveAttribute('src', expect.stringMatching(/^data:image\/svg/))
    expect(screen.queryByText(/loading cat/i)).not.toBeInTheDocument()
  })

  it('calls onContinue when Next is clicked', async () => {
    const user = userEvent.setup()
    const onContinue = vi.fn()
    render(<CatReward catUrl="https://cataas.com/cat?test" onContinue={onContinue} />)
    await user.click(screen.getByRole('button', { name: /next/i }))
    expect(onContinue).toHaveBeenCalledOnce()
  })
})
