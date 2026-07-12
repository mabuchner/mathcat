import { render } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { Confetti } from './Confetti'

describe('Confetti', () => {
  it('renders confetti pieces', () => {
    const { container } = render(<Confetti />)
    expect(container.querySelectorAll('span').length).toBeGreaterThan(0)
  })

  it('is hidden from assistive technology', () => {
    const { container } = render(<Confetti />)
    expect(container.firstElementChild).toHaveAttribute('aria-hidden', 'true')
  })
})
