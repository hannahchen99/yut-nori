'use client';

import { getYutResult, YutResult, YUT_MOVES } from '@/types/game';

interface YutSticksProps {
  result: number[] | null;
  onThrow: (sticks: number[], outcome: YutResult) => void;
  disabled?: boolean;
}

const RESULT_LABELS: Record<YutResult, string> = {
  do: '도 (Do) — Move 1',
  gae: '개 (Gae) — Move 2',
  geol: '걸 (Geol) — Move 3',
  yut: '윷 (Yut) — Move 4 + bonus throw',
  mo: '모 (Mo) — Move 5 + bonus throw',
};

export default function YutSticks({ result, onThrow, disabled = false }: YutSticksProps) {
  const outcome = result ? getYutResult(result) : null;
  const sticks: (number | null)[] = result ?? [null, null, null, null];

  function handleThrow() {
    const newSticks = Array.from({ length: 4 }, () => (Math.random() < 0.5 ? 0 : 1));
    onThrow(newSticks, getYutResult(newSticks));
  }

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex gap-4">
        {sticks.map((side, i) => (
          <div key={i} className="flex flex-col items-center gap-1">
            <div
              className={`w-10 h-24 rounded-2xl border-2 flex items-center justify-center transition-all ${
                side === null
                  ? 'bg-parchment border-border'
                  : side === 0
                  ? 'bg-paper border-wood shadow-inner'
                  : 'bg-wood-dark border-ink shadow-md'
              }`}
            >
              {side === null ? (
                <div className="w-2 h-2 rounded-full bg-faint opacity-50" />
              ) : side === 0 ? (
                <div className="w-6 h-0.5 bg-wood rounded" />
              ) : (
                <div className="w-5 h-5 rounded-full border-2 border-gold opacity-70" />
              )}
            </div>
            <span className="text-xs text-faint">{side === null ? '—' : side === 0 ? 'flat' : 'round'}</span>
          </div>
        ))}
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-wood-muted">
          {result ? `Flat up: ${result.filter((s) => s === 0).length}` : 'Ready to throw'}
        </p>
        <p className="text-base font-bold text-ink-red mt-1">
          {outcome ? RESULT_LABELS[outcome] : ' '}
        </p>
      </div>

      <button
        onClick={handleThrow}
        disabled={disabled}
        className="px-6 py-2.5 bg-red-piece hover:bg-red-button-hover active:bg-red-button-active disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold rounded-lg shadow transition-colors"
      >
        Throw Sticks
      </button>
    </div>
  );
}
