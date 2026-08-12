import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, fireEvent, cleanup } from '@testing-library/react'
import GamePage from '../page'
import type { GameState } from '@/types/game'

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

function wonState(): GameState {
  return {
    phase: 'finished',
    currentTeam: 'red',
    winner: 'red',
    pendingMoves: [],
    turnHistory: [],
    pieces: {
      r0: { id: 'r0', team: 'red', location: { status: 'finished' }, stackedWith: [] },
      r1: { id: 'r1', team: 'red', location: { status: 'finished' }, stackedWith: [] },
      r2: { id: 'r2', team: 'red', location: { status: 'finished' }, stackedWith: [] },
      r3: { id: 'r3', team: 'red', location: { status: 'finished' }, stackedWith: [] },
      b0: { id: 'b0', team: 'blue', location: { status: 'reserve' }, stackedWith: [] },
      b1: { id: 'b1', team: 'blue', location: { status: 'reserve' }, stackedWith: [] },
      b2: { id: 'b2', team: 'blue', location: { status: 'board', position: 3, enteredFrom: 2 }, stackedWith: [] },
      b3: { id: 'b3', team: 'blue', location: { status: 'reserve' }, stackedWith: [] },
    },
  }
}

describe('GamePage game-over wiring', () => {
  it('shows the winner banner instead of the mid-game panel when a team has won', () => {
    render(<GamePage initialGameState={wonState()} />)

    expect(screen.getByText('Red Wins!')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Play Again' })).toBeTruthy()
    expect(screen.queryByRole('button', { name: 'Throw Sticks' })).toBeNull()
    expect(trayCard('RED \\| Home').querySelectorAll('.piece-dot')).toHaveLength(4)
  })

  it('Play Again resets to a fresh throwing phase with no stale dice result', () => {
    render(<GamePage initialGameState={wonState()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Play Again' }))

    expect(screen.queryByText('Red Wins!')).toBeNull()
    expect(screen.getByText('Ready to throw')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Throw Sticks' })).toBeTruthy()
  })
})

describe('GamePage panel treatment', () => {
  it('wraps the yut sticks in a titled Panel', () => {
    render(<GamePage />)
    fireEvent.click(screen.getByRole('button', { name: 'Start Game' }))

    const heading = screen.getByRole('heading', { name: 'Yut Sticks' })
    expect(heading.closest('section')?.className).toContain('bg-surface')
  })

  it('lays out the red/blue tray columns on a two-column grid so both stay equal width', () => {
    render(<GamePage />)
    fireEvent.click(screen.getByRole('button', { name: 'Start Game' }))

    const trayContainer = trayCard('RED \\| Reserve').closest('.grid') as HTMLElement
    expect(trayContainer).toBeTruthy()
    expect(trayContainer.className).toContain('grid-cols-2')
  })
})

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
