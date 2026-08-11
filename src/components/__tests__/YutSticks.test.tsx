import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import YutSticks from '../YutSticks'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('YutSticks', () => {
  it('shows a neutral placeholder and no result label before the first throw', () => {
    render(<YutSticks result={null} onThrow={() => {}} />)
    expect(screen.getByText('Ready to throw')).toBeTruthy()
    expect(screen.getAllByText('—')).toHaveLength(4)
    expect(screen.queryByText(/Move \d/)).toBeNull()
  })

  it('shows the flat/round sticks and result label for a real throw', () => {
    render(<YutSticks result={[0, 0, 0, 0]} onThrow={() => {}} />)
    expect(screen.getByText(/Flat up: 4/)).toBeTruthy()
    expect(screen.getByText(/윷 \(Yut\)/)).toBeTruthy()
  })

  it('calls onThrow with a fresh 4-value array when clicked', () => {
    const onThrow = vi.fn()
    render(<YutSticks result={null} onThrow={onThrow} />)
    fireEvent.click(screen.getByRole('button', { name: 'Throw Sticks' }))
    expect(onThrow).toHaveBeenCalledOnce()
    const [sticks, outcome] = onThrow.mock.calls[0]
    expect(sticks).toHaveLength(4)
    expect(typeof outcome).toBe('string')
  })
})
