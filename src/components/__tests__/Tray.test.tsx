import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, cleanup } from '@testing-library/react'
import Tray from '../Tray'
import type { Piece } from '@/types/game'

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

function reservePiece(id: Piece['id'], team: 'red' | 'blue'): Piece {
  return { id, team, location: { status: 'reserve' }, stackedWith: [] }
}

describe('Tray selectedPieceId', () => {
  it('applies the gold ring classes only to the selected piece dot', () => {
    const pieces = [reservePiece('r0', 'red'), reservePiece('r1', 'red')]
    const { container } = render(
      <Tray team="red" label="Reserve" pieces={pieces} selectedPieceId="r0" />
    )
    const dots = container.querySelectorAll('.piece-dot')
    expect(dots[0].className).toContain('ring-gold')
    expect(dots[1].className).not.toContain('ring-gold')
  })

  it('applies no ring classes when selectedPieceId is unset', () => {
    const pieces = [reservePiece('r0', 'red'), reservePiece('r1', 'red')]
    const { container } = render(<Tray team="red" label="Reserve" pieces={pieces} />)
    const dots = container.querySelectorAll('.piece-dot')
    dots.forEach(dot => expect(dot.className).not.toContain('ring-gold'))
  })
})
