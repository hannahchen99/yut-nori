import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import GameOverBanner from '../GameOverBanner'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

describe('GameOverBanner', () => {
  it('announces the red team as winner with red styling', () => {
    render(<GameOverBanner winner="red" onPlayAgain={() => {}} />)
    expect(screen.getByText('Red Wins!').className).toContain('text-red-piece-badge')
  })

  it('announces the blue team as winner with blue styling', () => {
    render(<GameOverBanner winner="blue" onPlayAgain={() => {}} />)
    expect(screen.getByText('Blue Wins!').className).toContain('text-blue-piece-badge')
  })

  it('calls onPlayAgain when the button is clicked', () => {
    const onPlayAgain = vi.fn()
    render(<GameOverBanner winner="red" onPlayAgain={onPlayAgain} />)
    fireEvent.click(screen.getByRole('button', { name: 'Play Again' }))
    expect(onPlayAgain).toHaveBeenCalledOnce()
  })
})
