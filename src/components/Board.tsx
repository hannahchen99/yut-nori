'use client';

import type { Piece, PieceId } from '@/types/game';

type NodeType = 'regular' | 'corner' | 'center' | 'diag1' | 'diag2';

interface BoardPos {
  x: number;
  y: number;
  type: NodeType;
}

export const POSITIONS: BoardPos[] = [
  // Perimeter — counter-clockwise from bottom-right, up the right side first
  { x: 500, y: 500, type: 'corner'  }, // 0  HOME
  { x: 500, y: 400, type: 'regular' }, // 1
  { x: 500, y: 300, type: 'regular' }, // 2
  { x: 500, y: 200, type: 'regular' }, // 3
  { x: 500, y: 100, type: 'regular' }, // 4
  { x: 500, y:   0, type: 'corner'  }, // 5  top-right
  { x: 400, y:   0, type: 'regular' }, // 6
  { x: 300, y:   0, type: 'regular' }, // 7
  { x: 200, y:   0, type: 'regular' }, // 8
  { x: 100, y:   0, type: 'regular' }, // 9
  { x:   0, y:   0, type: 'corner'  }, // 10 top-left
  { x:   0, y: 100, type: 'regular' }, // 11
  { x:   0, y: 200, type: 'regular' }, // 12
  { x:   0, y: 300, type: 'regular' }, // 13
  { x:   0, y: 400, type: 'regular' }, // 14
  { x:   0, y: 500, type: 'corner'  }, // 15 bottom-left
  { x: 100, y: 500, type: 'regular' }, // 16
  { x: 200, y: 500, type: 'regular' }, // 17
  { x: 300, y: 500, type: 'regular' }, // 18
  { x: 400, y: 500, type: 'regular' }, // 19
  // Diagonal 1 — corner 5 (top-right) to corner 15 (bottom-left)
  { x: 417, y:  83, type: 'diag1'   }, // 20
  { x: 333, y: 167, type: 'diag1'   }, // 21
  { x: 250, y: 250, type: 'center'  }, // 22 — shared center
  { x: 167, y: 333, type: 'diag1'   }, // 23
  { x:  83, y: 417, type: 'diag1'   }, // 24
  // Diagonal 2 — corner 10 (top-left) to corner 0 (bottom-right)
  { x:  83, y:  83, type: 'diag2'   }, // 25
  { x: 167, y: 167, type: 'diag2'   }, // 26
  // 22 is the shared center
  { x: 333, y: 333, type: 'diag2'   }, // 27
  { x: 417, y: 417, type: 'diag2'   }, // 28
];

export const DIAG_EDGES: [number, number][] = [
  [5, 20], [20, 21], [21, 22], [22, 23], [23, 24], [24, 15],
  [10, 25], [25, 26], [26, 22], [22, 27], [27, 28], [28, 0],
];

const PERIMETER_EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3], [3, 4], [4, 5],
  [5, 6], [6, 7], [7, 8], [8, 9], [9, 10],
  [10, 11], [11, 12], [12, 13], [13, 14], [14, 15],
  [15, 16], [16, 17], [17, 18], [18, 19], [19, 0],
];

interface NodeStyle {
  r: number;
  fillClass: string;
  strokeClass: string;
  strokeWidth: number;
}

const NODE_STYLES: Record<NodeType, NodeStyle> = {
  regular: { r: 14, fillClass: 'fill-paper',      strokeClass: 'stroke-wood',    strokeWidth: 2 },
  corner:  { r: 20, fillClass: 'fill-gold',        strokeClass: 'stroke-ink-red', strokeWidth: 3 },
  center:  { r: 20, fillClass: 'fill-jade',        strokeClass: 'stroke-gold',    strokeWidth: 3 },
  diag1:   { r: 14, fillClass: 'fill-parchment',   strokeClass: 'stroke-ink-red', strokeWidth: 2 },
  diag2:   { r: 14, fillClass: 'fill-parchment',   strokeClass: 'stroke-jade',    strokeWidth: 2 },
};

function highlightRadius(type: NodeType): number {
  return type === 'corner' || type === 'center' ? 26 : 20;
}

const TOKEN_RADIUS = 12;
const TOKEN_OFFSET = 12; // shifts the piece token up-right from the position node's center

interface TokenStyle {
  fillClass: string;
  strokeClass: string;
  badgeClass: string;
}

const TOKEN_STYLES: Record<Piece['team'], TokenStyle> = {
  red: { fillClass: 'fill-red-piece', strokeClass: 'stroke-red-piece', badgeClass: 'fill-red-piece-badge' },
  blue: { fillClass: 'fill-blue-piece', strokeClass: 'stroke-blue-piece', badgeClass: 'fill-blue-piece-badge' },
};

// sort pieces on the board by position
function groupBoardPiecesByPosition(pieces: Piece[]): Map<number, Piece[]> {
  const groups = new Map<number, Piece[]>();
  for (const piece of pieces) {
    if (piece.location.status !== 'board') continue;
    const group = groups.get(piece.location.position) ?? [];
    group.push(piece);
    groups.set(piece.location.position, group);
  }
  return groups;
}

interface BoardProps {
  highlightedPositions?: number[];
  pieces?: Piece[];
  onPieceClick?: (pieceId: PieceId) => void;
  selectableTeam?: Piece['team'];
}

export default function Board({
  highlightedPositions = [],
  pieces = [],
  onPieceClick,
  selectableTeam,
}: BoardProps) {
  const highlighted = new Set(highlightedPositions);
  const pieceGroups = groupBoardPiecesByPosition(pieces);

  return (
    <div className="flex items-center justify-center w-full">
      <svg
        viewBox="-50 -50 600 600"
        className="w-full max-w-[600px] aspect-square"
        aria-label="Yut Nori board"
      >
        {/* 1. Diagonal edges */}
        {DIAG_EDGES.map(([a, b]) => (
          <line
            key={`d-${a}-${b}`}
            x1={POSITIONS[a].x} y1={POSITIONS[a].y}
            x2={POSITIONS[b].x} y2={POSITIONS[b].y}
            className="stroke-wood"
            strokeWidth={2.5}
          />
        ))}

        {/* 2. Perimeter edges */}
        {PERIMETER_EDGES.map(([a, b]) => (
          <line
            key={`p-${a}-${b}`}
            x1={POSITIONS[a].x} y1={POSITIONS[a].y}
            x2={POSITIONS[b].x} y2={POSITIONS[b].y}
            className="stroke-wood"
            strokeWidth={2.5}
          />
        ))}

        {/* 3. Circles */}
        {POSITIONS.map((pos, i) => {
          const s = NODE_STYLES[pos.type];
          return (
            <g key={`c-${i}`}>
              {highlighted.has(i) && (
                <circle
                  cx={pos.x} cy={pos.y}
                  r={highlightRadius(pos.type)}
                  fill="none"
                  className="stroke-gold"
                  strokeWidth={3}
                />
              )}
              <circle
                cx={pos.x} cy={pos.y}
                r={s.r}
                className={`${s.fillClass} ${s.strokeClass}`}
                strokeWidth={s.strokeWidth}
              />
            </g>
          );
        })}

        {/* 4. Home label */}
        <text
          x={POSITIONS[0].x}
          y={POSITIONS[0].y + NODE_STYLES.corner.r + 14}
          textAnchor="middle"
          fontSize={12}
          fontWeight="bold"
          className="fill-ink-red"
        >
          HOME
        </text>

        {/* 5. Pieces */}
        {Array.from(pieceGroups.entries()).map(([position, group]) => {
          const pos = POSITIONS[position];
          const style = TOKEN_STYLES[group[0].team];
          const cx = pos.x + TOKEN_OFFSET;
          const cy = pos.y - TOKEN_OFFSET;
          const clickable = group[0].team === selectableTeam;
          return (
            <g
              key={`piece-${position}`}
              onClick={clickable ? () => onPieceClick?.(group[0].id) : undefined}
              style={clickable ? { cursor: 'pointer' } : undefined}
            >
              <circle
                cx={cx} cy={cy}
                r={TOKEN_RADIUS}
                className={`${style.fillClass} stroke-ink`}
                strokeWidth={2}
              />
              {group.length > 1 && (
                <>
                  <circle
                    cx={cx + 10} cy={cy - 10}
                    r={9}
                    className={`fill-paper ${style.strokeClass}`}
                    strokeWidth={1.5}
                  />
                  <text
                    x={cx + 10} y={cy - 10}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize={11}
                    fontWeight="bold"
                    className={style.badgeClass}
                  >
                    {group.length}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
