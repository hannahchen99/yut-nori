'use client';

import { useReducer, useState } from 'react';
import Board from '@/components/Board';
import YutSticks from '@/components/YutSticks';
import { YutResult } from '@/types/game';
import gameReducer, { initialState } from '@/lib/game/stateMachine';

const PHASE_LABELS: Record<typeof initialState.phase, string> = {
  waiting: 'Waiting to start',
  throwing: 'Throwing',
  moving: 'Moving',
  finished: 'Finished',
};

export default function GamePage() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [sticks, setSticks] = useState<number[]>([0, 0, 0, 0]);

  function handleThrow(newSticks: number[], outcome: YutResult) {
    setSticks(newSticks);
    dispatch({ type: 'THROW_STICKS', result: outcome });
  }

  function handleStart() {
    dispatch({ type: 'START_GAME' });
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
          <div className="flex-none flex flex-col items-center gap-6">
            {state.phase === 'waiting' ? (
              <button
                onClick={handleStart}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold rounded-lg shadow transition-colors"
              >
                Start Game
              </button>
            ) : (
              <>
                <p className="text-center">
                  <span
                    className={`font-bold ${state.currentTeam === 'red' ? 'text-red-600' : 'text-blue-600'}`}
                  >
                    {state.currentTeam === 'red' ? 'Red' : 'Blue'}&apos;s turn
                  </span>
                  <span className="text-gray-500"> — {PHASE_LABELS[state.phase]}</span>
                </p>
                <YutSticks
                  result={sticks}
                  onThrow={handleThrow}
                  disabled={state.phase !== 'throwing'}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
