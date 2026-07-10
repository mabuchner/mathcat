import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import type { Settings } from '../settings/types'
import { SettingsPanel } from './SettingsPanel'

const settings: Settings = { tables: [3, 5], operations: ['multiplication'], soundEnabled: true }

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
    expect(onChange).toHaveBeenCalledWith({ tables: [3, 4, 5] })
  })

  it('removes a table when a selected number is clicked', async () => {
    const user = userEvent.setup()
    const { onChange } = renderPanel()
    await user.click(screen.getByRole('button', { name: '3' }))
    expect(onChange).toHaveBeenCalledWith({ tables: [5] })
  })

  it('keeps at least one table selected', async () => {
    const user = userEvent.setup()
    const { onChange } = renderPanel({ tables: [3] })
    await user.click(screen.getByRole('button', { name: '3' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('adds an operation when an unselected one is clicked', async () => {
    const user = userEvent.setup()
    const { onChange } = renderPanel()
    await user.click(screen.getByRole('button', { name: '+ Add' }))
    expect(onChange).toHaveBeenCalledWith({ operations: ['multiplication', 'addition'] })
  })

  it('removes an operation when a selected one is clicked', async () => {
    const user = userEvent.setup()
    const { onChange } = renderPanel({ operations: ['multiplication', 'addition'] })
    await user.click(screen.getByRole('button', { name: '× Multiply' }))
    expect(onChange).toHaveBeenCalledWith({ operations: ['addition'] })
  })

  it('keeps at least one operation selected', async () => {
    const user = userEvent.setup()
    const { onChange } = renderPanel()
    await user.click(screen.getByRole('button', { name: '× Multiply' }))
    expect(onChange).not.toHaveBeenCalled()
  })

  it('toggles sound effects via the checkbox', async () => {
    const user = userEvent.setup()
    const { onChange } = renderPanel()
    await user.click(screen.getByRole('checkbox', { name: /sound effects/i }))
    expect(onChange).toHaveBeenCalledWith({ soundEnabled: false })
  })

  it('calls onClose when Done is clicked', async () => {
    const user = userEvent.setup()
    const { onClose } = renderPanel()
    await user.click(screen.getByRole('button', { name: /done/i }))
    expect(onClose).toHaveBeenCalledOnce()
  })
})
