'use client';

import { useReducer, useState } from 'react';
import Board from '@/components/Board';
import YutSticks from '@/components/YutSticks';
import Tray, { Team } from '@/components/Tray';
import { PieceId, YutResult } from '@/types/game';
import gameReducer, { initialState } from '@/lib/game/stateMachine';

const PHASE_LABELS: Record<typeof initialState.phase, string> = {
  waiting: 'Waiting to start',
  throwing: 'Throwing',
  moving: 'Moving',
  finished: 'Finished',
};

const RESULT_NAMES: Record<YutResult, string> = {
  do: '도 (Do)',
  gae: '개 (Gae)',
  geol: '걸 (Geol)',
  yut: '윷 (Yut)',
  mo: '말 (Mo)',
};

export default function GamePage() {
  const [state, dispatch] = useReducer(gameReducer, initialState);
  const [sticks, setSticks] = useState<number[]>([0, 0, 0, 0]);
  const [selectedPieceId, setSelectedPieceId] = useState<PieceId | null>(null);

  function handleThrow(newSticks: number[], outcome: YutResult) {
    setSticks(newSticks);
    dispatch({ type: 'THROW_STICKS', result: outcome });
  }

  function handleStart() {
    dispatch({ type: 'START_GAME' });
  }

  function handlePieceClick(pieceId: PieceId) {
    if (pieceId === selectedPieceId) {
      setSelectedPieceId(null);
      return;
    }
    if (state.pendingMoves.length === 1) {
      dispatch({ type: 'MOVE_PIECE', pieceId, moveIndex: 0 });
      setSelectedPieceId(null);
      return;
    }
    setSelectedPieceId(pieceId);
  }

  function handleMoveChoice(moveIndex: number) {
    if (!selectedPieceId) return;
    dispatch({ type: 'MOVE_PIECE', pieceId: selectedPieceId, moveIndex });
    setSelectedPieceId(null);
  }

  function filterTrayPieces(team: Team, status: 'reserve' | 'finished') {
    return Object.values(state.pieces).filter(p => p.team === team && p.location.status === status);
  }

  function getBoardPieces() {
    return Object.values(state.pieces).filter(p => p.location.status === 'board');
  }

  function getInstructionText(): string {
    if (state.phase === 'throwing') {
      return state.turnHistory.length > 0
        ? 'You get a bonus throw! Throw the sticks'
        : 'Throw the sticks';
    }
    if (state.phase === 'moving') {
      if (selectedPieceId) return 'Choose a move for the selected piece';
      return state.pendingMoves.length === 1
        ? `Select a piece to move ${state.pendingMoves[0].spaces}`
        : 'Select a piece to move';
    }
    return '';
  }

  const instructionText = getInstructionText();

  return (
    <main className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-extrabold text-indigo-900 mb-8 text-center">
          윷놀이 — Yut Nori
        </h1>
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          <div className="flex-1 min-w-0">
            <Board
              pieces={getBoardPieces()}
              onPieceClick={handlePieceClick}
              selectableTeam={state.phase === 'moving' ? state.currentTeam : undefined}
            />
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
                {instructionText && (
                  <p className="text-center text-indigo-700 font-semibold">
                    {instructionText}
                  </p>
                )}
                <YutSticks
                  result={sticks}
                  onThrow={handleThrow}
                  disabled={state.phase !== 'throwing'}
                />
                {!selectedPieceId && state.pendingMoves.length > 1 && (
                  <div className="flex gap-2 justify-center">
                    {state.pendingMoves.map((move, index) => (
                      <span
                        key={index}
                        className="bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full px-3 py-1 text-sm font-medium"
                      >
                        {RESULT_NAMES[move.result]} {move.spaces}
                      </span>
                    ))}
                  </div>
                )}
                {selectedPieceId && state.pendingMoves.length > 1 && (
                  <div className="rounded-lg border border-indigo-200 bg-white p-4 flex flex-col gap-2">
                    <p className="text-sm font-medium text-gray-700">Choose a move</p>
                    {state.pendingMoves.map((move, index) => (
                      <button
                        key={index}
                        onClick={() => handleMoveChoice(index)}
                        className="px-3.5 py-2.5 bg-white text-indigo-700 border border-indigo-200 rounded-lg text-sm font-medium text-left hover:bg-indigo-50 transition-colors"
                      >
                        {RESULT_NAMES[move.result]} — Move {move.spaces}
                      </button>
                    ))}
                  </div>
                )}
                <div className="flex flex-row gap-6 p-4">
                  <div className="flex flex-col gap-2">
                    <Tray
                      team="red"
                      label="Reserve"
                      pieces={filterTrayPieces("red", "reserve")}
                      onPieceClick={handlePieceClick}
                      selectable={state.phase === 'moving' && state.currentTeam === 'red'}
                    />
                    <Tray
                      team="red"
                      label="Home"
                      pieces={filterTrayPieces("red", "finished")}
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <Tray
                      team="blue"
                      label="Reserve"
                      pieces={filterTrayPieces("blue", "reserve")}
                      onPieceClick={handlePieceClick}
                      selectable={state.phase === 'moving' && state.currentTeam === 'blue'}
                    />
                    <Tray
                      team="blue"
                      label="Home"
                      pieces={filterTrayPieces("blue", "finished")}
                    />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
