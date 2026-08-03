import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import GamePage from '../page'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function mockThrow(flats: boolean[]) {
  const spy = vi.spyOn(Math, 'random')
  for (const flat of flats) {
    spy.mockReturnValueOnce(flat ? 0.1 : 0.9)
  }
}

function trayCard(label: string) {
  return screen.getByText(new RegExp(label)).parentElement as HTMLElement
}

describe('GamePage move selection', () => {
  it('clicking a reserve piece with one pending move dispatches the move immediately', () => {
    render(<GamePage />)
    fireEvent.click(screen.getByRole('button', { name: 'Start Game' }))

    mockThrow([true, false, false, false]) // flatCount 1 -> 'do', non-bonus
    fireEvent.click(screen.getByRole('button', { name: 'Throw Sticks' }))

    const redCircles = trayCard('RED \\| Reserve').querySelectorAll('.piece-dot')
    expect(redCircles).toHaveLength(4)
    fireEvent.click(redCircles[0])

    expect(trayCard('RED \\| Reserve').querySelectorAll('.piece-dot')).toHaveLength(3)
    expect(document.querySelectorAll('circle.fill-red-piece')).toHaveLength(1)
  })

  it('multiple pending moves open a chooser instead of moving immediately', () => {
    render(<GamePage />)
    fireEvent.click(screen.getByRole('button', { name: 'Start Game' }))

    mockThrow([true, true, true, true]) // flatCount 4 -> 'yut', bonus
    fireEvent.click(screen.getByRole('button', { name: 'Throw Sticks' }))
    mockThrow([true, true, false, false]) // flatCount 2 -> 'gae', non-bonus
    fireEvent.click(screen.getByRole('button', { name: 'Throw Sticks' }))

    fireEvent.click(trayCard('RED \\| Reserve').querySelectorAll('.piece-dot')[0])

    // no move applied yet — the chooser should appear instead
    expect(trayCard('RED \\| Reserve').querySelectorAll('.piece-dot')).toHaveLength(4)
    expect(document.querySelectorAll('circle.fill-red-piece')).toHaveLength(0)

    fireEvent.click(screen.getByRole('button', { name: /Move 4/ }))

    expect(trayCard('RED \\| Reserve').querySelectorAll('.piece-dot')).toHaveLength(3)
    expect(document.querySelectorAll('circle.fill-red-piece')).toHaveLength(1)
    expect(screen.queryByText('Choose a move')).toBeNull()
  })

  it('pieces belonging to the other team are not clickable', () => {
    render(<GamePage />)
    fireEvent.click(screen.getByRole('button', { name: 'Start Game' }))

    mockThrow([true, false, false, false]) // 'do', non-bonus -> red's turn, phase moving
    fireEvent.click(screen.getByRole('button', { name: 'Throw Sticks' }))

    const blueCircles = trayCard('BLUE \\| Reserve').querySelectorAll('.piece-dot')
    fireEvent.click(blueCircles[0])

    expect(trayCard('BLUE \\| Reserve').querySelectorAll('.piece-dot')).toHaveLength(4)
    expect(document.querySelectorAll('circle.fill-blue-piece')).toHaveLength(0)
  })
})
