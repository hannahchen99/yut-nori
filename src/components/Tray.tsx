import { Piece } from '@/types/game'

export type Team = 'red' | 'blue';

interface PieceStyle {
  border: string
  label: string
  background: string
}

const PIECE_STYLES: Record<Team, PieceStyle> = {
  red: { border: "border-red-300", label: "text-red-600", background: "bg-red-400" },
  blue: { border: "border-blue-300", label: "text-blue-600", background: "bg-blue-400" },
}

interface TrayProps {
  team: Team
  label: string
  pieces: Piece[]
}

export default function Tray({ team, label, pieces }: TrayProps) {

  return (
    <div className={`rounded-lg border ${PIECE_STYLES[team].border} p-4 flex flex-col gap-2`}>
      <p className={`${PIECE_STYLES[team].label}`}>{`${team.toUpperCase()} | ${label} (${pieces.length})`}</p>
      <div className="flex flex-row items-center justify-evenly min-h-6">
        {pieces.map(p => (<div className={`w-6 h-6 rounded-full ${PIECE_STYLES[team].background}`} key={p.id} />))}
      </div>
    </div>
  )
}