'use client';

import { getYutResult, YutResult, YUT_MOVES } from '@/types/game';

interface YutSticksProps {
  result: number[];
  onThrow: (sticks: number[], outcome: YutResult) => void;
  disabled?: boolean;
}

const RESULT_LABELS: Record<YutResult, string> = {
  do: '도 (Do) — Move 1',
  gae: '개 (Gae) — Move 2',
  geol: '걸 (Geol) — Move 3',
  yut: '윷 (Yut) — Move 4 + bonus throw',
  mo: '말 (Mo) — Move 5 + bonus throw',
};

export default function YutSticks({ result, onThrow, disabled = false }: YutSticksProps) {
  const outcome = getYutResult(result);

  function handleThrow() {
    const sticks = Array.from({ length: 4 }, () => (Math.random() < 0.5 ? 0 : 1));
    onThrow(sticks, getYutResult(sticks));
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <h2 className="text-lg font-semibold text-gray-700">Yut Sticks</h2>

      <div className="flex gap-4">
        {result.map((side, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`w-10 h-24 rounded-2xl border-2 flex items-center justify-center transition-all ${
                side === 0
                  ? 'bg-amber-100 border-amber-400 shadow-inner'
                  : 'bg-amber-700 border-amber-900 shadow-md'
              }`}
            >
              {side === 0 ? (
                <div className="w-6 h-0.5 bg-amber-400 rounded" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-amber-400 opacity-60" />
              )}
            </div>
            <span className="text-xs text-gray-500">{side === 0 ? 'flat' : 'round'}</span>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-gray-600">
          Flat up: {result.filter((s) => s === 0).length}
        </p>
        <p className="text-base font-bold text-indigo-700 mt-1">
          {RESULT_LABELS[outcome]}
        </p>
      </div>

      <button
        onClick={handleThrow}
        disabled={disabled}
        className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow transition-colors"
      >
        Throw Sticks
      </button>
    </div>
  );
}
