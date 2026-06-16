'use client';

import { useState } from 'react';
import Board from '@/components/Board';
import YutSticks from '@/components/YutSticks';
import { YutResult, YUT_MOVES } from '@/types/game';

export default function GamePage() {
  const [sticks, setSticks] = useState<number[]>([0, 0, 0, 0]);
  const [lastResult, setLastResult] = useState<YutResult | null>(null);

  function handleThrow(newSticks: number[], outcome: YutResult) {
    setSticks(newSticks);
    setLastResult(outcome);
    console.log('Throw result:', { sticks: newSticks, outcome, move: YUT_MOVES[outcome] });
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-indigo-900 mb-8 text-center">
          윷놀이 — Yut Nori
        </h1>
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          <div className="flex-1 min-w-0">
            <Board />
          </div>
          <div className="flex-none">
            <YutSticks result={sticks} onThrow={handleThrow} />
            {lastResult && (
              <p className="mt-4 text-center text-sm text-gray-500">
                Last throw logged to console
              </p>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
