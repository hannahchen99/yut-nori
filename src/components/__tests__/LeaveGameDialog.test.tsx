import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import LeaveGameDialog from '../LeaveGameDialog'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('LeaveGameDialog', () => {
  it('shows the confirmation wording', () => {
    render(<LeaveGameDialog onCancel={() => {}} onConfirm={() => {}} />)
    expect(screen.getByText('Are you sure you want to leave the game?')).toBeTruthy()
    expect(screen.getByText('Your current game will be lost and this action cannot be undone.')).toBeTruthy()
  })

  it('calls onCancel when Cancel is clicked', () => {
    const onCancel = vi.fn()
    render(<LeaveGameDialog onCancel={onCancel} onConfirm={() => {}} />)
    fireEvent.click(screen.getByRole('button', { name: 'Cancel' }))
    expect(onCancel).toHaveBeenCalledOnce()
  })

  it('calls onConfirm when Leave is clicked', () => {
    const onConfirm = vi.fn()
    render(<LeaveGameDialog onCancel={() => {}} onConfirm={onConfirm} />)
    fireEvent.click(screen.getByRole('button', { name: 'Leave' }))
    expect(onConfirm).toHaveBeenCalledOnce()
  })
})
