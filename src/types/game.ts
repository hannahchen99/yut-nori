export type YutResult = 'do' | 'gae' | 'geol' | 'yut' | 'mo'

export type YutMove = {
  result: YutResult
  spaces: number
  bonusThrow: boolean
}

export type PieceId = 'r0' | 'r1' | 'r2' | 'r3' | 'b0' | 'b1' | 'b2' | 'b3'

export type PieceLocation =
  | { status: 'home' }
  | { status: 'board'; position: number; enteredFrom: number | null }
  | { status: 'finished' }

export type Piece = {
  id: PieceId
  team: 'red' | 'blue'
  location: PieceLocation
  stackedWith: PieceId[]
}

export type GamePhase =
  | 'waiting'
  | 'throwing'
  | 'moving'
  | 'finished'

export type GameState = {
  phase: GamePhase
  currentTeam: 'red' | 'blue'
  pieces: Record<PieceId, Piece>
  pendingMoves: YutMove[]
  winner: 'red' | 'blue' | null
  turnHistory: YutMove[]
}

export type GameAction =
  | { type: 'THROW_STICKS'; result: YutResult }
  | { type: 'MOVE_PIECE'; pieceId: PieceId; moveIndex: number }
  | { type: 'START_GAME' }

// Legacy helpers kept for compatibility
export const YUT_MOVES: Record<YutResult, number> = {
  do: 1,
  gae: 2,
  geol: 3,
  yut: 4,
  mo: 5,
}

export function getYutResult(sticks: number[]): YutResult {
  const flatCount = sticks.filter((s) => s === 0).length
  if (flatCount === 0) return 'mo'
  if (flatCount === 1) return 'do'
  if (flatCount === 2) return 'gae'
  if (flatCount === 3) return 'geol'
  return 'yut'
}
