import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Settings } from '../settings/types'
import { SettingsPanel } from './SettingsPanel'

const settings: Settings = { tables: [2, 3, 5, 7], operations: ['multiplication'], soundEnabled: true }

function renderPanel(overrides: Partial<Settings> = {}) {
  const onChange = vi.fn()
  const onClose = vi.fn()
  render(<SettingsPanel settings={{ ...settings, ...overrides }} onChange={onChange} onClose={onClose} />)
  return { onChange, onClose }
}

describe('SettingsPanel', () => {
  it('adds a table when an unselected number is clicked, keeping the list sorted', async () => {
    const user = userEvent.setup()
    const { onChange } = renderPanel()
    await user.click(screen.getByRole('button', { name: '4' }))
    expect(onChange).toHaveBeenCalledWith({ tables: [2, 3, 4, 5, 7] })
  })

  it('allows deselecting freely, even below the minimum', async () => {
    const user = userEvent.setup()
    const { onChange } = renderPanel({ tables: [2, 3, 5] })
    await user.click(screen.getByRole('button', { name: '3' }))
    expect(onChange).toHaveBeenCalledWith({ tables: [2, 5] })
  })

  it('refuses to close with fewer than three numbers and explains why', async () => {
    const user = userEvent.setup()
    const { onClose } = renderPanel({ tables: [2, 3] })
    await user.click(screen.getByRole('button', { name: /done/i }))
    expect(onClose).not.toHaveBeenCalled()
    expect(screen.getByText('Pick at least 3 numbers')).toBeInTheDocument()
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
    renderPanel({ tables: [2, 3] })
    await user.click(screen.getByRole('button', { name: /done/i }))
    expect(screen.getByText('Pick at least 3 numbers')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: '9' }))
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
