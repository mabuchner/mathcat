import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { Problem } from '../game/types'
import { ProblemCard } from './ProblemCard'

const problem: Problem = { a: 6, b: 7, operation: 'multiplication', answer: 42 }

describe('ProblemCard', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('submits automatically once enough digits are entered, after a short delay', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onSubmit = vi.fn()
    render(<ProblemCard problem={problem} globalRemainingMs={60_000} globalDurationMs={60_000} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Digit 4' }))
    await user.click(screen.getByRole('button', { name: 'Digit 2' }))
    expect(onSubmit).not.toHaveBeenCalled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })
    expect(onSubmit).toHaveBeenCalledWith(42)
  })

  it('lets backspace remove a digit before the answer is complete', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onSubmit = vi.fn()
    render(<ProblemCard problem={problem} globalRemainingMs={60_000} globalDurationMs={60_000} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Digit 9' }))
    await user.click(screen.getByRole('button', { name: 'Backspace' }))
    await user.click(screen.getByRole('button', { name: 'Digit 4' }))
    await user.click(screen.getByRole('button', { name: 'Digit 2' }))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })
    expect(onSubmit).toHaveBeenCalledWith(42)
  })

  it('disables the keypad while a submission is pending, so no further taps register', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onSubmit = vi.fn()
    render(<ProblemCard problem={problem} globalRemainingMs={60_000} globalDurationMs={60_000} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Digit 4' }))
    await user.click(screen.getByRole('button', { name: 'Digit 2' }))

    expect(screen.getByRole('button', { name: 'Digit 1' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Backspace' })).toBeDisabled()

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })
    expect(onSubmit).toHaveBeenCalledTimes(1)
  })

  it('ignores extra digits once the expected answer length is reached', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime })
    const onSubmit = vi.fn()
    render(<ProblemCard problem={problem} globalRemainingMs={60_000} globalDurationMs={60_000} onSubmit={onSubmit} />)

    await user.click(screen.getByRole('button', { name: 'Digit 4' }))
    await user.click(screen.getByRole('button', { name: 'Digit 2' }))
    // The keypad is disabled once the answer is complete, but clicking is still possible
    // synchronously before React re-renders; appendDigit's own length guard must hold too.
    await user.click(screen.getByRole('button', { name: 'Digit 9' }))

    await act(async () => {
      await vi.advanceTimersByTimeAsync(400)
    })
    expect(onSubmit).toHaveBeenCalledTimes(1)
    expect(onSubmit).toHaveBeenCalledWith(42)
  })
})
