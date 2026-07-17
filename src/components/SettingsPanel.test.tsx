import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Settings } from '../settings/types'
import { SettingsPanel } from './SettingsPanel'

const settings: Settings = {
  operations: ['multiplication'],
  numbers: { addition: [1, 2, 3, 4], subtraction: [1, 2, 3, 4], multiplication: [2, 3, 5, 7] },
  soundEnabled: true,
}

function renderPanel(overrides: Partial<Settings> = {}) {
  const onChange = vi.fn()
  const onClose = vi.fn()
  render(<SettingsPanel settings={{ ...settings, ...overrides }} onChange={onChange} onClose={onClose} />)
  return { onChange, onClose }
}

function multiplicationGroup() {
  return within(screen.getByRole('group', { name: 'Multiplication tables' }))
}

function additionGroup() {
  return within(screen.getByRole('group', { name: 'Numbers to add' }))
}

describe('SettingsPanel', () => {
  it('shows a number grid only for currently selected operations', () => {
    renderPanel({ operations: ['multiplication'] })
    expect(screen.getByRole('group', { name: 'Multiplication tables' })).toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Numbers to add' })).not.toBeInTheDocument()
    expect(screen.queryByRole('group', { name: 'Numbers to subtract' })).not.toBeInTheDocument()
  })

  it('shows a separate number grid per selected operation', () => {
    renderPanel({ operations: ['addition', 'multiplication'] })
    expect(screen.getByRole('group', { name: 'Numbers to add' })).toBeInTheDocument()
    expect(screen.getByRole('group', { name: 'Multiplication tables' })).toBeInTheDocument()
  })

  it('adds a number to only the relevant operation, keeping the list sorted', async () => {
    const user = userEvent.setup()
    const { onChange } = renderPanel()
    await user.click(multiplicationGroup().getByRole('button', { name: '4' }))
    expect(onChange).toHaveBeenCalledWith({
      numbers: { ...settings.numbers, multiplication: [2, 3, 4, 5, 7] },
    })
  })

  it('allows deselecting freely, even below the minimum', async () => {
    const user = userEvent.setup()
    const { onChange } = renderPanel({
      operations: ['addition'],
      numbers: { ...settings.numbers, addition: [1, 2, 3] },
    })
    await user.click(additionGroup().getByRole('button', { name: '2' }))
    expect(onChange).toHaveBeenCalledWith({
      numbers: { ...settings.numbers, addition: [1, 3] },
    })
  })

  it('refuses to close with fewer than three numbers for an operation that needs them, and explains why', async () => {
    const user = userEvent.setup()
    const { onClose } = renderPanel({
      operations: ['addition'],
      numbers: { ...settings.numbers, addition: [2, 3] },
    })
    await user.click(screen.getByRole('button', { name: /done/i }))
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByText('Pick at least 3 numbers')).toBeInTheDocument()
  })

  it('closes successfully with just one selected multiplication table', async () => {
    const user = userEvent.setup()
    const { onClose } = renderPanel({
      operations: ['multiplication'],
      numbers: { ...settings.numbers, multiplication: [7] },
    })
    await user.click(screen.getByRole('button', { name: /done/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })

  it('adds an operation when an unselected one is clicked', async () => {
    const user = userEvent.setup()
    const { onChange } = renderPanel()
    await user.click(screen.getByRole('button', { name: '+ Add' }))
    expect(onChange).toHaveBeenCalledWith({ operations: ['multiplication', 'addition'] })
  })

  it('allows deselecting the last operation', async () => {
    const user = userEvent.setup()
    const { onChange } = renderPanel()
    await user.click(screen.getByRole('button', { name: '× Multiply' }))
    expect(onChange).toHaveBeenCalledWith({ operations: [] })
  })

  it('refuses to close with no operation selected and explains why', async () => {
    const user = userEvent.setup()
    const { onClose } = renderPanel({ operations: [] })
    await user.click(screen.getByRole('button', { name: /done/i }))
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByText('Pick at least one operation')).toBeInTheDocument()
  })

  it('clears the hint as soon as the selection becomes valid again', async () => {
    const user = userEvent.setup()
    renderPanel({ operations: ['addition'], numbers: { ...settings.numbers, addition: [2, 3] } })
    await user.click(screen.getByRole('button', { name: /done/i }))
    expect(screen.getByText('Pick at least 3 numbers')).toBeInTheDocument()
    await user.click(additionGroup().getByRole('button', { name: '9' }))
    expect(screen.queryByText('Pick at least 3 numbers')).not.toBeInTheDocument()
  })

  it('toggles sound effects via the checkbox', async () => {
    const user = userEvent.setup()
    const { onChange } = renderPanel()
    await user.click(screen.getByRole('checkbox', { name: /sound effects/i }))
    expect(onChange).toHaveBeenCalledWith({ soundEnabled: false })
  })

  it('closes via Done when the selection is valid', async () => {
    const user = userEvent.setup()
    const { onClose } = renderPanel()
    await user.click(screen.getByRole('button', { name: /done/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
