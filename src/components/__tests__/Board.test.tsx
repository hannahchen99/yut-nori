import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Board from '../Board'
import type { Piece, PieceId } from '@/types/game'

function boardPiece(id: PieceId, team: 'red' | 'blue', position: number): Piece {
  return {
    id,
    team,
    location: { status: 'board', position, enteredFrom: null },
    stackedWith: [],
  }
}

describe('Board pieces', () => {
  it('renders one token per occupied position, no badge for a lone piece', () => {
    const pieces = [boardPiece('r0', 'red', 3), boardPiece('b0', 'blue', 10)]
    const { container } = render(<Board pieces={pieces} />)
    expect(container.querySelectorAll('circle[fill="#ef4444"]')).toHaveLength(1)
    expect(container.querySelectorAll('circle[fill="#3b82f6"]')).toHaveLength(1)
    expect(container.querySelectorAll('circle[stroke="#ef4444"]')).toHaveLength(0)
  })

  it('renders one token plus a count badge for a stack, not one token per piece', () => {
    const pieces = [boardPiece('r0', 'red', 3), boardPiece('r1', 'red', 3)]
    const { container } = render(<Board pieces={pieces} />)
    expect(container.querySelectorAll('circle[fill="#ef4444"]')).toHaveLength(1)
    expect(container.querySelectorAll('circle[stroke="#ef4444"]')).toHaveLength(1)
    const badgeText = container.querySelector('circle[stroke="#ef4444"] + text')
    expect(badgeText?.textContent).toBe('2')
  })

  it('ignores pieces that are not on the board', () => {
    const pieces: Piece[] = [
      { id: 'r0', team: 'red', location: { status: 'reserve' }, stackedWith: [] },
      { id: 'b0', team: 'blue', location: { status: 'finished' }, stackedWith: [] },
    ]
    const { container } = render(<Board pieces={pieces} />)
    expect(container.querySelectorAll('circle[fill="#ef4444"]')).toHaveLength(0)
    expect(container.querySelectorAll('circle[fill="#3b82f6"]')).toHaveLength(0)
  })
})
