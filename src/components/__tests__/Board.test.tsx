import { describe, it, expect } from 'vitest'
import { render } from '@testing-library/react'
import Board, { POSITIONS, DIAG_EDGES } from '../Board'
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
    expect(container.querySelectorAll('circle.fill-red-piece')).toHaveLength(1)
    expect(container.querySelectorAll('circle.fill-blue-piece')).toHaveLength(1)
    expect(container.querySelectorAll('circle.stroke-red-piece')).toHaveLength(0)
  })

  it('renders one token plus a count badge for a stack, not one token per piece', () => {
    const pieces = [boardPiece('r0', 'red', 3), boardPiece('r1', 'red', 3)]
    const { container } = render(<Board pieces={pieces} />)
    expect(container.querySelectorAll('circle.fill-red-piece')).toHaveLength(1)
    expect(container.querySelectorAll('circle.stroke-red-piece')).toHaveLength(1)
    const badgeText = container.querySelector('circle.stroke-red-piece + text')
    expect(badgeText?.textContent).toBe('2')
  })

  it('ignores pieces that are not on the board', () => {
    const pieces: Piece[] = [
      { id: 'r0', team: 'red', location: { status: 'reserve' }, stackedWith: [] },
      { id: 'b0', team: 'blue', location: { status: 'finished' }, stackedWith: [] },
    ]
    const { container } = render(<Board pieces={pieces} />)
    expect(container.querySelectorAll('circle.fill-red-piece')).toHaveLength(0)
    expect(container.querySelectorAll('circle.fill-blue-piece')).toHaveLength(0)
  })
})

describe('Diagonal 1 node positions (5 -> 20 -> 21 -> 22 -> 23 -> 24 -> 15)', () => {
  it('places 20 and 21 nearer corner 5, and 23 and 24 nearer corner 15', () => {
    expect(POSITIONS[20]).toEqual({ x: 417, y: 83, type: 'diag1' })
    expect(POSITIONS[21]).toEqual({ x: 333, y: 167, type: 'diag1' })
    expect(POSITIONS[23]).toEqual({ x: 167, y: 333, type: 'diag1' })
    expect(POSITIONS[24]).toEqual({ x: 83, y: 417, type: 'diag1' })
  })

  it('connects the diagonal to corner 5 via 20, and to corner 15 via 24', () => {
    expect(DIAG_EDGES).toContainEqual([5, 20])
    expect(DIAG_EDGES).toContainEqual([24, 15])
    expect(DIAG_EDGES).not.toContainEqual([15, 20])
    expect(DIAG_EDGES).not.toContainEqual([24, 5])
  })
})
