'use client';

type NodeType = 'regular' | 'corner' | 'center' | 'diag1' | 'diag2';

interface BoardPos {
  x: number;
  y: number;
  type: NodeType;
}

const POSITIONS: BoardPos[] = [
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
  // Diagonal 1 — corner 15 (bottom-left) to corner 5 (top-right)
  { x:  83, y: 417, type: 'diag1'   }, // 20
  { x: 167, y: 333, type: 'diag1'   }, // 21
  { x: 250, y: 250, type: 'center'  }, // 22 — shared center
  { x: 333, y: 167, type: 'diag1'   }, // 23
  { x: 417, y:  83, type: 'diag1'   }, // 24
  // Diagonal 2 — corner 10 (top-left) to corner 0 (bottom-right)
  { x:  83, y:  83, type: 'diag2'   }, // 25
  { x: 167, y: 167, type: 'diag2'   }, // 26
  // 22 is the shared center
  { x: 333, y: 333, type: 'diag2'   }, // 27
  { x: 417, y: 417, type: 'diag2'   }, // 28
];

const DIAG_EDGES: [number, number][] = [
  [15, 20], [20, 21], [21, 22], [22, 23], [23, 24], [24, 5],
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
  fill: string;
  stroke: string;
  strokeWidth: number;
  labelFill: string;
  fontSize: number;
  fontWeight: 'normal' | 'bold';
}

const NODE_STYLES: Record<NodeType, NodeStyle> = {
  regular: { r: 14, fill: '#ffffff', stroke: '#d1d5db', strokeWidth: 1.5, labelFill: '#6b7280', fontSize: 9,  fontWeight: 'normal' },
  corner:  { r: 20, fill: '#fef3c7', stroke: '#d97706', strokeWidth: 2,   labelFill: '#92400e', fontSize: 11, fontWeight: 'bold'   },
  center:  { r: 20, fill: '#fdf4ff', stroke: '#a21caf', strokeWidth: 2,   labelFill: '#6b21a8', fontSize: 11, fontWeight: 'bold'   },
  diag1:   { r: 14, fill: '#f5f3ff', stroke: '#7c3aed', strokeWidth: 1.5, labelFill: '#5b21b6', fontSize: 9,  fontWeight: 'normal' },
  diag2:   { r: 14, fill: '#ecfeff', stroke: '#0891b2', strokeWidth: 1.5, labelFill: '#155e75', fontSize: 9,  fontWeight: 'normal' },
};

function highlightRadius(type: NodeType): number {
  return type === 'corner' || type === 'center' ? 26 : 20;
}

interface BoardProps {
  highlightedPositions?: number[];
}

export default function Board({ highlightedPositions = [] }: BoardProps) {
  const highlighted = new Set(highlightedPositions);

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
            stroke="#d1d5db"
            strokeWidth={2}
          />
        ))}

        {/* 2. Perimeter edges */}
        {PERIMETER_EDGES.map(([a, b]) => (
          <line
            key={`p-${a}-${b}`}
            x1={POSITIONS[a].x} y1={POSITIONS[a].y}
            x2={POSITIONS[b].x} y2={POSITIONS[b].y}
            stroke="#d1d5db"
            strokeWidth={2}
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
                  stroke="#3b82f6"
                  strokeWidth={3}
                />
              )}
              <circle
                cx={pos.x} cy={pos.y}
                r={s.r}
                fill={s.fill}
                stroke={s.stroke}
                strokeWidth={s.strokeWidth}
              />
            </g>
          );
        })}

        {/* 4. Labels */}
        {POSITIONS.map((pos, i) => {
          const s = NODE_STYLES[pos.type];
          return (
            <g key={`l-${i}`}>
              <text
                x={pos.x} y={pos.y}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize={s.fontSize}
                fontWeight={s.fontWeight}
                fill={s.labelFill}
              >
                {i}
              </text>
              {i === 0 && (
                <text
                  x={pos.x}
                  y={pos.y + s.r + 14}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight="bold"
                  fill="#d97706"
                >
                  HOME
                </text>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
