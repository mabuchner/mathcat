import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { ResultsScreen } from './ResultsScreen'

describe('ResultsScreen', () => {
  it.each([
    [12, 'Amazing!'],
    [8, 'Well done!'],
    [5, 'Good effort!'],
    [0, 'Keep practicing!'],
  ])('shows the right tier message for %i correct answers', (correctCount, message) => {
    render(<ResultsScreen correctCount={correctCount} incorrectCount={1} onPlayAgain={() => {}} />)
    expect(screen.getByText(message)).toBeInTheDocument()
  })

  it('shows both score counts', () => {
    render(<ResultsScreen correctCount={7} incorrectCount={3} onPlayAgain={() => {}} />)
    expect(screen.getByText('7')).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('correct')).toBeInTheDocument()
    expect(screen.getByText('incorrect')).toBeInTheDocument()
  })

  it('shows the high score badge with the rank when given', () => {
    render(
      <ResultsScreen correctCount={9} incorrectCount={0} isNewHighScore rank={2} onPlayAgain={() => {}} />,
    )
    expect(screen.getByText('🏆 New high score! #2')).toBeInTheDocument()
  })

  it('shows confetti on a new high score', () => {
    const { container } = render(
      <ResultsScreen correctCount={9} incorrectCount={0} isNewHighScore rank={2} onPlayAgain={() => {}} />,
    )
    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument()
  })

  it('omits confetti by default', () => {
    const { container } = render(
      <ResultsScreen correctCount={9} incorrectCount={0} onPlayAgain={() => {}} />,
    )
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeInTheDocument()
  })

  it('shows the high score badge without a rank', () => {
    render(
      <ResultsScreen correctCount={9} incorrectCount={0} isNewHighScore rank={null} onPlayAgain={() => {}} />,
    )
    expect(screen.getByText('🏆 New high score!')).toBeInTheDocument()
  })

  it('omits the high score badge by default', () => {
    render(<ResultsScreen correctCount={9} incorrectCount={0} onPlayAgain={() => {}} />)
    expect(screen.queryByText(/New high score/)).not.toBeInTheDocument()
  })

  it('calls onPlayAgain when the button is clicked', async () => {
    const user = userEvent.setup()
    const onPlayAgain = vi.fn()
    render(<ResultsScreen correctCount={1} incorrectCount={0} onPlayAgain={onPlayAgain} />)
    await user.click(screen.getByRole('button', { name: /play again/i }))
    expect(onPlayAgain).toHaveBeenCalledOnce()
  })
})
