import { describe, it, expect } from 'vitest'
import gameReducer, {
  getNextPosition,
  getSpaces,
  isBonusThrow,
  canStack,
  isCapture,
  initialState,
} from '../stateMachine'
import type { GameState, PieceId, Piece, PieceLocation } from '@/types/game'

// ─── Fixtures ─────────────────────────────────────────────────────────────────

function boardLoc(position: number, enteredFrom: number | null = null): PieceLocation {
  return { status: 'board', position, enteredFrom }
}

function startedState(): GameState {
  return gameReducer(initialState, { type: 'START_GAME' })
}

function withThrow(state: GameState, result: 'do' | 'gae' | 'geol' | 'yut' | 'mo'): GameState {
  return gameReducer(state, { type: 'THROW_STICKS', result })
}

function withMove(state: GameState, pieceId: PieceId, moveIndex = 0): GameState {
  return gameReducer(state, { type: 'MOVE_PIECE', pieceId, moveIndex })
}

function setPiece(state: GameState, id: PieceId, patch: Partial<Piece>): GameState {
  return {
    ...state,
    pieces: { ...state.pieces, [id]: { ...state.pieces[id], ...patch } },
  }
}

function inMoving(
  state: GameState,
  spaces: number,
  result: 'do' | 'gae' | 'geol' | 'yut' | 'mo' = 'do',
): GameState {
  return {
    ...state,
    phase: 'moving',
    pendingMoves: [{ result, spaces, bonusThrow: result === 'yut' || result === 'mo' }],
  }
}

// ─── getSpaces / isBonusThrow ─────────────────────────────────────────────────

describe('getSpaces', () => {
  it('returns correct spaces for each result', () => {
    expect(getSpaces('do')).toBe(1)
    expect(getSpaces('gae')).toBe(2)
    expect(getSpaces('geol')).toBe(3)
    expect(getSpaces('yut')).toBe(4)
    expect(getSpaces('mo')).toBe(5)
  })
})

describe('isBonusThrow', () => {
  it('is true only for yut and mo', () => {
    expect(isBonusThrow('yut')).toBe(true)
    expect(isBonusThrow('mo')).toBe(true)
    expect(isBonusThrow('do')).toBe(false)
    expect(isBonusThrow('gae')).toBe(false)
    expect(isBonusThrow('geol')).toBe(false)
  })
})

// ─── Movement ─────────────────────────────────────────────────────────────────

describe('getNextPosition – outer perimeter', () => {
  it('do from home (start=0) lands on position 1', () => {
    expect(getNextPosition(0, null, 1)).toEqual({ position: 1, enteredFrom: 0 })
  })

  it('mo from home (start=0) lands on position 5', () => {
    expect(getNextPosition(0, null, 5)).toEqual({ position: 5, enteredFrom: 4 })
  })

  it('piece reaching position 0 after a full loop is finished', () => {
    expect(getNextPosition(19, 18, 1)).toEqual({ finished: true })
  })

  it('piece overshooting position 0 after a full loop is finished', () => {
    // 18→19→finished; movement stops once finished regardless of remaining steps
    expect(getNextPosition(18, 17, 3)).toEqual({ finished: true })
  })
})

describe('getNextPosition – corner 5 shortcut (diagonal 1)', () => {
  it('piece on corner 5 departs to 20, not 6', () => {
    expect(getNextPosition(5, 4, 1)).toEqual({ position: 20, enteredFrom: 5 })
  })

  it('piece passing through corner 5 mid-move does NOT take shortcut', () => {
    // 4→5(pass-through)→6
    expect(getNextPosition(4, 3, 2)).toEqual({ position: 6, enteredFrom: 5 })
  })

  it('piece on corner 5 reaches center (22) in 3 steps via diagonal 1', () => {
    // 5→20→21→22  (enteredFrom at 22 = 21, enabling diagonal-1 exit)
    expect(getNextPosition(5, 4, 3)).toEqual({ position: 22, enteredFrom: 21 })
  })
})

describe('getNextPosition – corner 10 shortcut (diagonal 2)', () => {
  it('piece on corner 10 departs to 25, not 11', () => {
    expect(getNextPosition(10, 9, 1)).toEqual({ position: 25, enteredFrom: 10 })
  })

  it('piece passing through corner 10 mid-move does NOT take shortcut', () => {
    // 9→10(pass-through)→11
    expect(getNextPosition(9, 8, 2)).toEqual({ position: 11, enteredFrom: 10 })
  })

  it('piece on corner 10 reaches center (22) in 3 steps via diagonal 2', () => {
    // 10→25→26→22  (enteredFrom at 22 = 26, enabling diagonal-2 exit)
    expect(getNextPosition(10, 9, 3)).toEqual({ position: 22, enteredFrom: 26 })
  })
})

describe('getNextPosition – center junction (22)', () => {
  it('piece on diagonal 1 at 22 continues to 23, not 27', () => {
    expect(getNextPosition(22, 21, 1)).toEqual({ position: 23, enteredFrom: 22 })
  })

  it('piece on diagonal 2 at 22 continues to 27, not 23', () => {
    expect(getNextPosition(22, 26, 1)).toEqual({ position: 27, enteredFrom: 22 })
  })
})

describe('getNextPosition – corner 15', () => {
  it('corner 15 does NOT trigger a shortcut — piece continues on perimeter', () => {
    expect(getNextPosition(15, 14, 1)).toEqual({ position: 16, enteredFrom: 15 })
  })

  it('diagonal-1 piece arriving at 15 via 24 continues on perimeter', () => {
    // 24→15→16
    expect(getNextPosition(24, 23, 2)).toEqual({ position: 16, enteredFrom: 15 })
  })
})

describe('getNextPosition – diagonal 2 finishes', () => {
  it('piece at 28 finishes', () => {
    expect(getNextPosition(28, 27, 1)).toEqual({ finished: true })
  })
})

// ─── Throws ───────────────────────────────────────────────────────────────────

describe('THROW_STICKS', () => {
  it('yut adds to pendingMoves and stays in throwing phase', () => {
    const s = withThrow(startedState(), 'yut')
    expect(s.pendingMoves).toHaveLength(1)
    expect(s.pendingMoves[0]).toMatchObject({ result: 'yut', spaces: 4, bonusThrow: true })
    expect(s.phase).toBe('throwing')
  })

  it('mo adds to pendingMoves and stays in throwing phase', () => {
    const s = withThrow(startedState(), 'mo')
    expect(s.pendingMoves).toHaveLength(1)
    expect(s.pendingMoves[0]).toMatchObject({ result: 'mo', spaces: 5, bonusThrow: true })
    expect(s.phase).toBe('throwing')
  })

  it('gae adds to pendingMoves and moves to moving phase', () => {
    const s = withThrow(startedState(), 'gae')
    expect(s.pendingMoves).toHaveLength(1)
    expect(s.pendingMoves[0]).toMatchObject({ result: 'gae', spaces: 2, bonusThrow: false })
    expect(s.phase).toBe('moving')
  })

  it('two consecutive yut throws give pendingMoves length 2', () => {
    let s = startedState()
    s = withThrow(s, 'yut')
    s = withThrow(s, 'yut')
    expect(s.pendingMoves).toHaveLength(2)
    expect(s.phase).toBe('throwing')
  })
})

// ─── Stacking ─────────────────────────────────────────────────────────────────

describe('canStack', () => {
  it('returns true when a friendly piece is at the target position', () => {
    const s = setPiece(
      setPiece(startedState(), 'r0', { location: boardLoc(3) }),
      'r1', { location: boardLoc(3) },
    )
    expect(canStack(s.pieces['r0'], 3, s)).toBe(true)
  })

  it('returns false when only an enemy piece is at the target', () => {
    const s = setPiece(
      setPiece(startedState(), 'r0', { location: boardLoc(3) }),
      'b0', { location: boardLoc(3) },
    )
    expect(canStack(s.pieces['r0'], 3, s)).toBe(false)
  })
})

describe('isCapture', () => {
  it('returns true when an enemy piece is at the target position', () => {
    const s = setPiece(
      setPiece(startedState(), 'r0', { location: boardLoc(3) }),
      'b0', { location: boardLoc(3) },
    )
    expect(isCapture(s.pieces['r0'], 3, s)).toBe(true)
  })

  it('returns false when only a friendly piece is at the target', () => {
    const s = setPiece(
      setPiece(startedState(), 'r0', { location: boardLoc(3) }),
      'r1', { location: boardLoc(3) },
    )
    expect(isCapture(s.pieces['r0'], 3, s)).toBe(false)
  })
})

describe('MOVE_PIECE – stacking', () => {
  it('friendly piece landing on friendly piece stacks', () => {
    // r1 is at position 2; red throws do (1) to move r0 from home via position 1
    // Set r0 at 1, r1 at 1, then stack
    let s = startedState()
    s = setPiece(s, 'r0', { location: boardLoc(1) })
    s = setPiece(s, 'r1', { location: boardLoc(1) })
    s = inMoving(s, 1, 'do')  // move 1 space
    // r2 is at home; move it 2 spaces → lands on 2, not 1. Let's directly move r0 onto r1:
    // Instead, put r0 at position 0 and move it 1 step → lands on 1 where r1 is
    s = setPiece(s, 'r0', { location: { status: 'home' } })
    s = inMoving(s, 1, 'do')
    const after = withMove(s, 'r0')
    expect(after.pieces['r0'].location).toEqual(boardLoc(1, 0))
    expect(after.pieces['r0'].stackedWith).toContain('r1')
    expect(after.pieces['r1'].stackedWith).toContain('r0')
  })

  it('stacked pieces move together', () => {
    let s = startedState()
    s = setPiece(s, 'r0', {
      location: boardLoc(3),
      stackedWith: ['r1'],
    })
    s = setPiece(s, 'r1', {
      location: boardLoc(3),
      stackedWith: ['r0'],
    })
    s = inMoving(s, 2, 'gae')
    const after = withMove(s, 'r0')
    expect(after.pieces['r0'].location).toEqual(boardLoc(5, 4))
    expect(after.pieces['r1'].location).toEqual(boardLoc(5, 4))
  })

  it('stacked pieces all return home on capture', () => {
    // b0 and b1 stacked at position 5; red r0 at 3 moves gae (2) → lands on 5
    let s = startedState()
    s = setPiece(s, 'r0', { location: boardLoc(3) })
    s = setPiece(s, 'b0', { location: boardLoc(5), stackedWith: ['b1'] })
    s = setPiece(s, 'b1', { location: boardLoc(5), stackedWith: ['b0'] })
    s = inMoving(s, 2, 'gae')
    const after = withMove(s, 'r0')
    expect(after.pieces['b0'].location).toEqual({ status: 'home' })
    expect(after.pieces['b1'].location).toEqual({ status: 'home' })
    expect(after.pieces['b0'].stackedWith).toEqual([])
    expect(after.pieces['b1'].stackedWith).toEqual([])
  })
})

// ─── Captures ─────────────────────────────────────────────────────────────────

describe('MOVE_PIECE – capture', () => {
  it('landing on enemy piece sends enemy to home', () => {
    let s = startedState()
    s = setPiece(s, 'r0', { location: boardLoc(4) })
    s = setPiece(s, 'b0', { location: boardLoc(5) })
    s = inMoving(s, 1, 'do')
    const after = withMove(s, 'r0')
    expect(after.pieces['r0'].location).toEqual(boardLoc(5, 4))
    expect(after.pieces['b0'].location).toEqual({ status: 'home' })
  })

  it('capture grants a bonus throw — phase returns to throwing, same team', () => {
    let s = startedState()
    s = setPiece(s, 'r0', { location: boardLoc(4) })
    s = setPiece(s, 'b0', { location: boardLoc(5) })
    s = inMoving(s, 1, 'do')
    const after = withMove(s, 'r0')
    expect(after.phase).toBe('throwing')
    expect(after.currentTeam).toBe('red')
    expect(after.pendingMoves).toHaveLength(0)
  })

  it('capturing a stack of 2 sends both enemy pieces home', () => {
    let s = startedState()
    s = setPiece(s, 'r0', { location: boardLoc(3) })
    s = setPiece(s, 'b0', { location: boardLoc(5), stackedWith: ['b1'] })
    s = setPiece(s, 'b1', { location: boardLoc(5), stackedWith: ['b0'] })
    s = inMoving(s, 2, 'gae')
    const after = withMove(s, 'r0')
    expect(after.pieces['b0'].location).toEqual({ status: 'home' })
    expect(after.pieces['b1'].location).toEqual({ status: 'home' })
  })
})

// ─── mo from home takes diagonal 1 ───────────────────────────────────────────

describe('MOVE_PIECE – mo from home lands on corner 5 and takes diagonal 1', () => {
  it('mo from home places piece at position 5', () => {
    let s = startedState()
    s = inMoving(s, 5, 'mo')
    const after = withMove(s, 'r0')
    expect(after.pieces['r0'].location).toEqual(boardLoc(5, 4))
  })

  it('from corner 5, next move departs via diagonal 1 to position 20', () => {
    let s = startedState()
    s = setPiece(s, 'r0', { location: boardLoc(5, 4) })
    s = inMoving(s, 1, 'do')
    const after = withMove(s, 'r0')
    expect(after.pieces['r0'].location).toEqual(boardLoc(20, 5))
  })
})

// ─── Win condition ────────────────────────────────────────────────────────────

describe('Win condition', () => {
  it('finishing the 4th piece sets phase to finished and records the winner', () => {
    let s = startedState()
    s = setPiece(s, 'r1', { location: { status: 'finished' } })
    s = setPiece(s, 'r2', { location: { status: 'finished' } })
    s = setPiece(s, 'r3', { location: { status: 'finished' } })
    // r0 at position 19, 1 step → finished
    s = setPiece(s, 'r0', { location: boardLoc(19, 18) })
    s = inMoving(s, 1, 'do')
    const after = withMove(s, 'r0')
    expect(after.phase).toBe('finished')
    expect(after.winner).toBe('red')
  })

  it('finishing the 3rd piece does not set a winner', () => {
    let s = startedState()
    s = setPiece(s, 'r1', { location: { status: 'finished' } })
    s = setPiece(s, 'r2', { location: { status: 'finished' } })
    // r3 still at home
    s = setPiece(s, 'r0', { location: boardLoc(19, 18) })
    s = inMoving(s, 1, 'do')
    const after = withMove(s, 'r0')
    expect(after.phase).not.toBe('finished')
    expect(after.winner).toBeNull()
  })
})

// ─── Turn switching ───────────────────────────────────────────────────────────

describe('Turn switching', () => {
  it('switches team when pendingMoves are exhausted with no bonus', () => {
    let s = startedState()
    s = setPiece(s, 'r0', { location: boardLoc(1) })
    s = inMoving(s, 1, 'do')
    const after = withMove(s, 'r0')
    expect(after.currentTeam).toBe('blue')
    expect(after.phase).toBe('throwing')
  })

  it('stays on same team when pendingMoves remain after move', () => {
    let s = startedState()
    s = {
      ...startedState(),
      phase: 'moving',
      pendingMoves: [
        { result: 'yut', spaces: 4, bonusThrow: true },
        { result: 'do',  spaces: 1, bonusThrow: false },
      ],
    }
    const after = withMove(s, 'r0', 0)
    expect(after.currentTeam).toBe('red')
    expect(after.phase).toBe('moving')
    expect(after.pendingMoves).toHaveLength(1)
  })

  it('lone bonus-derived move applied last does NOT grant another bonus throw', () => {
    let s = startedState()
    s = {
      ...s,
      phase: 'moving',
      pendingMoves: [{ result: 'yut', spaces: 4, bonusThrow: true }],
    }
    const after = withMove(s, 'r0')
    expect(after.phase).toBe('throwing')
    expect(after.currentTeam).toBe('blue')
  })

  it('mixed bonus/non-bonus queue: applying the non-bonus move last still ends the turn', () => {
    // Rolled [yut, gae] -> pendingMoves = [yut(4, bonus), gae(2, non-bonus)].
    // Applying gae last (the non-bonus one) must not re-grant a bonus throw
    // just because an earlier move in the same turn happened to be bonus-derived.
    let s = startedState()
    s = setPiece(s, 'r0', { location: boardLoc(1) })
    s = setPiece(s, 'r1', { location: boardLoc(1) })
    s = {
      ...s,
      phase: 'moving',
      pendingMoves: [
        { result: 'yut', spaces: 4, bonusThrow: true },
        { result: 'gae', spaces: 2, bonusThrow: false },
      ],
    }
    s = withMove(s, 'r0', 0) // apply the bonus-derived move first
    expect(s.pendingMoves).toHaveLength(1)
    const after = withMove(s, 'r1', 0) // apply the non-bonus move last
    expect(after.currentTeam).toBe('blue')
    expect(after.phase).toBe('throwing')
    expect(after.pendingMoves).toHaveLength(0)
  })
})
