import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { HighScoreEntry } from '../scores/types'
import { HighScoresScreen } from './HighScoresScreen'

const entries: HighScoreEntry[] = [
  { correctCount: 9, incorrectCount: 1, operations: ['multiplication'], tables: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10], dateISO: '2026-07-01T10:00:00.000Z' },
  { correctCount: 6, incorrectCount: 2, operations: ['addition', 'subtraction'], tables: [3, 5, 6, 7], dateISO: '2026-07-02T10:00:00.000Z' },
]

afterEach(() => {
  vi.restoreAllMocks()
})

describe('HighScoresScreen', () => {
  it('shows an empty state without a reset button when there are no scores', () => {
    render(<HighScoresScreen highScores={[]} onReset={() => {}} onClose={() => {}} />)
    expect(screen.getByText(/no scores yet/i)).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /reset/i })).not.toBeInTheDocument()
  })

  it('lists one row per score with counts, operations, and practiced numbers', () => {
    render(<HighScoresScreen highScores={entries} onReset={() => {}} onClose={() => {}} />)
    expect(screen.getAllByRole('listitem')).toHaveLength(2)
    expect(screen.getByText('✓ 9')).toBeInTheDocument()
    expect(screen.getByText('✗ 2')).toBeInTheDocument()
    expect(screen.getByText('× · 1–10')).toBeInTheDocument()
    expect(screen.getByText('+ − · 3, 5–7')).toBeInTheDocument()
  })

  it('resets only after the confirmation is accepted', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    render(<HighScoresScreen highScores={entries} onReset={onReset} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /reset high scores/i }))
    expect(onReset).toHaveBeenCalledOnce()
  })

  it('does not reset when the confirmation is declined', async () => {
    const user = userEvent.setup()
    const onReset = vi.fn()
    vi.spyOn(window, 'confirm').mockReturnValue(false)
    render(<HighScoresScreen highScores={entries} onReset={onReset} onClose={() => {}} />)
    await user.click(screen.getByRole('button', { name: /reset high scores/i }))
    expect(onReset).not.toHaveBeenCalled()
  })

  it('calls onClose when Back is clicked', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    render(<HighScoresScreen highScores={[]} onReset={() => {}} onClose={onClose} />)
    await user.click(screen.getByRole('button', { name: /back/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
