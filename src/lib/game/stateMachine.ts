import type {
  GameState,
  GameAction,
  YutResult,
  YutMove,
  PieceId,
  Piece,
  PieceLocation,
} from '@/types/game'

// ─── Board adjacency graph ────────────────────────────────────────────────────
//
// 29 positions (0–28).
// Outer perimeter (counter-clockwise): 0→1→…→19→finished
// Diagonal 1 (corner 5):  5→20→21→22→23→24→15→(perimeter)
// Diagonal 2 (corner 10): 10→25→26→22→27→28→finished
// Center node 22 is a junction: exit depends on which diagonal the piece arrived from.
// Corner 15 has no shortcut — piece continues on the perimeter.

type SimpleNode   = { kind: 'simple';   next: number | 'finished' }
type JunctionNode = { kind: 'junction'; exits: Record<number, number | 'finished'> }
type BoardNode    = SimpleNode | JunctionNode

const BOARD: Record<number, BoardNode> = {
  // Outer perimeter
  0:  { kind: 'simple', next: 1  },
  1:  { kind: 'simple', next: 2  },
  2:  { kind: 'simple', next: 3  },
  3:  { kind: 'simple', next: 4  },
  4:  { kind: 'simple', next: 5  },
  5:  { kind: 'simple', next: 6  },  // pass-through edge; departure uses CORNER_SHORTCUTS
  6:  { kind: 'simple', next: 7  },
  7:  { kind: 'simple', next: 8  },
  8:  { kind: 'simple', next: 9  },
  9:  { kind: 'simple', next: 10 },
  10: { kind: 'simple', next: 11 },  // pass-through edge; departure uses CORNER_SHORTCUTS
  11: { kind: 'simple', next: 12 },
  12: { kind: 'simple', next: 13 },
  13: { kind: 'simple', next: 14 },
  14: { kind: 'simple', next: 15 },
  15: { kind: 'simple', next: 16 },  // corner 15: no shortcut, stays on perimeter
  16: { kind: 'simple', next: 17 },
  17: { kind: 'simple', next: 18 },
  18: { kind: 'simple', next: 19 },
  19: { kind: 'simple', next: 'finished' },
  // Diagonal 1: 5→20→21→22→23→24→15
  20: { kind: 'simple', next: 21 },
  21: { kind: 'simple', next: 22 },
  22: { kind: 'junction', exits: { 21: 23, 26: 27 } },  // center — exit depends on entry
  23: { kind: 'simple', next: 24 },
  24: { kind: 'simple', next: 15 },
  // Diagonal 2: 10→25→26→22→27→28→finished
  25: { kind: 'simple', next: 26 },
  26: { kind: 'simple', next: 22 },
  27: { kind: 'simple', next: 28 },
  28: { kind: 'simple', next: 'finished' },
}

// Shortcuts taken only when a piece *departs* from these corners (not when passing through).
const CORNER_SHORTCUTS: Record<number, number> = { 5: 20, 10: 25 }

// ─── Pure movement functions ──────────────────────────────────────────────────

export function getSpaces(result: YutResult): number {
  const MAP: Record<YutResult, number> = { do: 1, gae: 2, geol: 3, yut: 4, mo: 5 }
  return MAP[result]
}

export function isBonusThrow(result: YutResult): boolean {
  return result === 'yut' || result === 'mo'
}

type PositionResult =
  | { position: number; enteredFrom: number | null }
  | { finished: true }

function stepOnce(
  position: number,
  enteredFrom: number | null,
  departing: boolean,
): PositionResult {
  // Corner shortcut: only when the piece is departing from that position
  if (departing && position in CORNER_SHORTCUTS) {
    return { position: CORNER_SHORTCUTS[position], enteredFrom: position }
  }

  const node = BOARD[position]
  if (node === undefined) throw new Error(`Unknown board position: ${position}`)

  if (node.kind === 'junction') {
    const key = enteredFrom ?? -1
    const next = node.exits[key]
    if (next === undefined) {
      throw new Error(`Junction ${position}: no exit for enteredFrom=${enteredFrom}`)
    }
    return next === 'finished' ? { finished: true } : { position: next, enteredFrom: position }
  }

  return node.next === 'finished'
    ? { finished: true }
    : { position: node.next, enteredFrom: position }
}

export function getNextPosition(
  currentPosition: number,
  enteredFrom: number | null,
  steps: number,
): PositionResult {
  let pos = currentPosition
  let from = enteredFrom

  for (let i = 0; i < steps; i++) {
    const result = stepOnce(pos, from, i === 0)
    if ('finished' in result) return { finished: true }
    pos = result.position
    from = result.enteredFrom
  }

  return { position: pos, enteredFrom: from }
}

export function canStack(piece: Piece, targetPosition: number, state: GameState): boolean {
  const movingGroup = new Set<PieceId>([piece.id, ...piece.stackedWith])
  return Object.values(state.pieces).some(
    p =>
      !movingGroup.has(p.id) &&
      p.team === piece.team &&
      p.location.status === 'board' &&
      p.location.position === targetPosition,
  )
}

export function isCapture(piece: Piece, targetPosition: number, state: GameState): boolean {
  return Object.values(state.pieces).some(
    p =>
      p.team !== piece.team &&
      p.location.status === 'board' &&
      p.location.position === targetPosition,
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ALL_PIECE_IDS: PieceId[] = ['r0', 'r1', 'r2', 'r3', 'b0', 'b1', 'b2', 'b3']

function freshPiece(id: PieceId): Piece {
  return {
    id,
    team: id.startsWith('r') ? 'red' : 'blue',
    location: { status: 'home' },
    stackedWith: [],
  }
}

function freshPieces(): Record<PieceId, Piece> {
  return Object.fromEntries(ALL_PIECE_IDS.map(id => [id, freshPiece(id)])) as Record<PieceId, Piece>
}

// ─── Initial state ────────────────────────────────────────────────────────────

export const initialState: GameState = {
  phase: 'waiting',
  currentTeam: 'red',
  pieces: freshPieces(),
  pendingMoves: [],
  winner: null,
  turnHistory: [],
}

// ─── Reducer ──────────────────────────────────────────────────────────────────

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'START_GAME': {
      return {
        phase: 'throwing',
        currentTeam: 'red',
        pieces: freshPieces(),
        pendingMoves: [],
        winner: null,
        turnHistory: [],
      }
    }

    case 'THROW_YUT': {
      if (state.phase !== 'throwing') return state

      const move: YutMove = {
        result: action.result,
        spaces: getSpaces(action.result),
        bonusThrow: isBonusThrow(action.result),
      }

      return {
        ...state,
        pendingMoves: [...state.pendingMoves, move],
        turnHistory: [...state.turnHistory, move],
        phase: move.bonusThrow ? 'throwing' : 'moving',
      }
    }

    case 'MOVE_PIECE': {
      if (state.phase !== 'moving') return state
      if (action.moveIndex < 0 || action.moveIndex >= state.pendingMoves.length) return state

      const usedMove = state.pendingMoves[action.moveIndex]
      const leader = state.pieces[action.pieceId]
      if (!leader || leader.location.status === 'finished') return state

      // Resolve start position (home pieces enter via position 0)
      const [startPos, startFrom]: [number, number | null] =
        leader.location.status === 'home'
          ? [0, null]
          : [leader.location.position, leader.location.enteredFrom]

      const moveResult = getNextPosition(startPos, startFrom, usedMove.spaces)
      const newLocation: PieceLocation =
        'finished' in moveResult
          ? { status: 'finished' }
          : { status: 'board', position: moveResult.position, enteredFrom: moveResult.enteredFrom }

      const groupIds: PieceId[] = [action.pieceId, ...leader.stackedWith]

      // Apply move to every piece in the group
      let pieces: Record<PieceId, Piece> = { ...state.pieces }
      for (const id of groupIds) {
        pieces[id] = { ...pieces[id], location: newLocation }
      }

      // Clear stackedWith for pieces that just finished
      if (newLocation.status === 'finished') {
        for (const id of groupIds) {
          pieces[id] = { ...pieces[id], stackedWith: [] }
        }
      }

      let wasCapture = false

      if (newLocation.status === 'board') {
        const targetPos = newLocation.position

        if (isCapture(leader, targetPos, { ...state, pieces })) {
          // Collect enemy pieces (and their stacks) at targetPos
          const toHome = new Set<PieceId>()
          for (const p of Object.values(pieces) as Piece[]) {
            if (
              p.team !== leader.team &&
              p.location.status === 'board' &&
              p.location.position === targetPos
            ) {
              toHome.add(p.id)
              for (const sid of p.stackedWith) toHome.add(sid)
            }
          }
          for (const id of toHome) {
            pieces[id] = { ...pieces[id], location: { status: 'home' }, stackedWith: [] }
          }
          wasCapture = true
        } else if (canStack(leader, targetPos, { ...state, pieces })) {
          // Collect all friendly pieces at targetPos not already in the moving group
          const allied: PieceId[] = []
          for (const p of Object.values(pieces) as Piece[]) {
            if (
              !groupIds.includes(p.id) &&
              p.team === leader.team &&
              p.location.status === 'board' &&
              p.location.position === targetPos
            ) {
              allied.push(p.id)
            }
          }
          const fullStack = [...new Set([...groupIds, ...allied])] as PieceId[]
          for (const id of fullStack) {
            pieces[id] = {
              ...pieces[id],
              location: newLocation,
              stackedWith: fullStack.filter(x => x !== id),
            }
          }
        }
      }

      const pendingMoves = state.pendingMoves.filter((_, i) => i !== action.moveIndex)

      // Win check
      const teamIds = ALL_PIECE_IDS.filter(id => pieces[id].team === state.currentTeam)
      if (teamIds.every(id => pieces[id].location.status === 'finished')) {
        return {
          ...state,
          pieces,
          pendingMoves: [],
          phase: 'finished',
          winner: state.currentTeam,
        }
      }

      // Next phase
      if (pendingMoves.length > 0) {
        return { ...state, pieces, pendingMoves, phase: 'moving' }
      }

      if (wasCapture || usedMove.bonusThrow) {
        // Bonus throw: same team throws again
        return { ...state, pieces, pendingMoves: [], phase: 'throwing' }
      }

      // End of turn: switch team
      const nextTeam: 'red' | 'blue' = state.currentTeam === 'red' ? 'blue' : 'red'
      return {
        ...state,
        pieces,
        pendingMoves: [],
        phase: 'throwing',
        currentTeam: nextTeam,
        turnHistory: [],
      }
    }

    default:
      return state
  }
}

export default gameReducer
