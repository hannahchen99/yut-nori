import { Piece } from '@/types/game'

export type Team = 'red' | 'blue';

interface PieceStyle {
  borderClass: string
  labelClass: string
  backgroundClass: string
}

const PIECE_STYLES: Record<Team, PieceStyle> = {
  red: { borderClass: 'border-red-tray-border', labelClass: 'text-red-piece-badge', backgroundClass: 'bg-red-piece' },
  blue: { borderClass: 'border-blue-tray-border', labelClass: 'text-blue-piece-badge', backgroundClass: 'bg-blue-piece' },
}

interface TrayProps {
  team: Team
  label: string
  pieces: Piece[]
  onPieceClick?: (pieceId: Piece['id']) => void
  selectable?: boolean
}

export default function Tray({ team, label, pieces, onPieceClick, selectable = false }: TrayProps) {

  const style = PIECE_STYLES[team]

  return (
    <div className={`rounded-lg border bg-paper p-4 flex flex-col gap-2 ${style.borderClass}`}>
      <p className={style.labelClass}>{`${team.toUpperCase()} | ${label} (${pieces.length})`}</p>
      <div className="flex flex-row items-center justify-evenly min-h-6">
        {pieces.map(p => (
          <div
            className={`piece-dot w-6 h-6 rounded-full border-2 border-ink ${style.backgroundClass} ${selectable ? 'cursor-pointer hover:opacity-75 transition-opacity' : ''}`}
            key={p.id}
            onClick={selectable ? () => onPieceClick?.(p.id) : undefined}
          />
        ))}
      </div>
    </div>
  )
}
