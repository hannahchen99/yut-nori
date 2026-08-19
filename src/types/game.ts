export type Team = 'red' | 'blue'

// Shared team display data — the single source of truth reused by every
// component that renders a team's label/color.
export const TEAM_LABEL: Record<Team, string> = { red: 'Red', blue: 'Blue' }
export const TEAM_TEXT_CLASS: Record<Team, string> = { red: 'text-red-piece-badge', blue: 'text-blue-piece-badge' }
export const TEAM_BG_CLASS: Record<Team, string> = { red: 'bg-red-piece', blue: 'bg-blue-piece' }

export type YutResult = 'do' | 'gae' | 'geol' | 'yut' | 'mo'

export type YutMove = {
  result: YutResult
  spaces: number
  bonusThrow: boolean
}

export type PieceId = 'r0' | 'r1' | 'r2' | 'r3' | 'b0' | 'b1' | 'b2' | 'b3'

export type PieceLocation =
  | { status: 'reserve' }
  | { status: 'board'; position: number; enteredFrom: number | null }
  | { status: 'finished' }

export type Piece = {
  id: PieceId
  team: Team
  location: PieceLocation
  stackedWith: PieceId[]
}

export type GamePhase =
  | 'waiting'
  | 'throwing'
  | 'moving'
  | 'finished'

export type LastCapture = {
  capturingTeam: Team
  capturedTeam: Team
  count: number
  id: number
}

export type GameState = {
  phase: GamePhase
  currentTeam: Team
  pieces: Record<PieceId, Piece>
  pendingMoves: YutMove[]
  winner: Team | null
  turnHistory: YutMove[]
  lastCapture: LastCapture | null
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
