'use client';

import { useReducer, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Board from '@/components/Board';
import YutSticks from '@/components/YutSticks';
import Tray from '@/components/Tray';
import GameOverBanner from '@/components/GameOverBanner';
import CaptureBanner from '@/components/CaptureBanner';
import Panel from '@/components/Panel';
import LeaveGameDialog from '@/components/LeaveGameDialog';
import { GameState, PieceId, Team, TEAM_LABEL, TEAM_TEXT_CLASS, YutResult } from '@/types/game';
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

interface GamePageProps {
  initialGameState?: GameState;
}

export default function GamePage({ initialGameState = initialState }: GamePageProps = {}) {
  const router = useRouter();
  const [state, dispatch] = useReducer(gameReducer, initialGameState);
  const [sticks, setSticks] = useState<number[] | null>(null);
  const [selectedPieceId, setSelectedPieceId] = useState<PieceId | null>(null);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const gameInProgress = state.phase !== 'waiting' && state.phase !== 'finished';

  function handleBackClick(e: React.MouseEvent) {
    if (gameInProgress) {
      e.preventDefault();
      setShowLeaveConfirm(true);
    }
  }

  function handleThrow(newSticks: number[], outcome: YutResult) {
    setSticks(newSticks);
    dispatch({ type: 'THROW_STICKS', result: outcome });
  }

  function handleStart() {
    dispatch({ type: 'START_GAME' });
    setSticks(null);
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
    <main className="min-h-screen bg-paper">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <Link
          href="/"
          onClick={handleBackClick}
          className="text-ink-red hover:text-red-button-active text-sm font-medium mb-8 inline-block"
        >
          ← Back to home
        </Link>
        <h1 className="text-3xl font-extrabold mb-8 text-center text-ink-red">
          윷놀이 — Yut Nori
        </h1>
        <div className="flex flex-col lg:flex-row gap-8 items-start justify-center">
          <div className="flex-1 min-w-0">
            <Board
              pieces={getBoardPieces()}
              onPieceClick={handlePieceClick}
              selectableTeam={state.phase === 'moving' ? state.currentTeam : undefined}
              selectedPieceId={selectedPieceId}
            />
          </div>
          <div className="flex-none flex flex-col items-center gap-6">
            {state.phase === 'waiting' && (
              <button
                onClick={handleStart}
                className="px-6 py-2.5 bg-red-piece hover:bg-red-button-hover active:bg-red-button-active text-white font-semibold rounded-lg shadow transition-colors"
              >
                Start Game
              </button>
            )}

            {state.phase === 'finished' && state.winner && (
              <GameOverBanner winner={state.winner} onPlayAgain={handleStart} />
            )}

            {gameInProgress && (
              <>
                <p className="text-center">
                  <span className={`font-bold ${TEAM_TEXT_CLASS[state.currentTeam]}`}>
                    {TEAM_LABEL[state.currentTeam]}&apos;s turn
                  </span>
                  <span className="text-faint"> — {PHASE_LABELS[state.phase]}</span>
                </p>
                {instructionText && (
                  <p className="text-center font-semibold text-ink-red">
                    {instructionText}
                  </p>
                )}
                {state.lastCapture && (
                  <CaptureBanner
                    key={state.lastCapture.id}
                    capturingTeam={state.lastCapture.capturingTeam}
                    capturedTeam={state.lastCapture.capturedTeam}
                    count={state.lastCapture.count}
                  />
                )}
                <Panel title="Yut Sticks">
                  <YutSticks
                    result={sticks}
                    onThrow={handleThrow}
                    disabled={state.phase !== 'throwing'}
                  />
                </Panel>
                {!selectedPieceId && state.pendingMoves.length > 1 && (
                  <div className="flex gap-2 justify-center">
                    {state.pendingMoves.map((move, index) => (
                      <span
                        key={index}
                        className="bg-parchment border border-border text-ink-red rounded-full px-3 py-1 text-sm font-medium"
                      >
                        {RESULT_NAMES[move.result]} {move.spaces}
                      </span>
                    ))}
                  </div>
                )}
                {selectedPieceId && state.pendingMoves.length > 1 && (
                  <Panel title="Choose a move">
                    {state.pendingMoves.map((move, index) => (
                      <button
                        key={index}
                        onClick={() => handleMoveChoice(index)}
                        className="px-3.5 py-2.5 bg-surface text-ink-red border border-border rounded-lg text-sm font-medium text-left hover:bg-parchment transition-colors"
                      >
                        {RESULT_NAMES[move.result]} — Move {move.spaces}
                      </button>
                    ))}
                  </Panel>
                )}
              </>
            )}

            {state.phase !== 'waiting' && (
              <div className="grid grid-cols-2 gap-6 p-4">
                <div className="flex flex-col gap-2">
                  <Tray
                    team="red"
                    label="Reserve"
                    pieces={filterTrayPieces("red", "reserve")}
                    onPieceClick={handlePieceClick}
                    selectable={state.phase === 'moving' && state.currentTeam === 'red'}
                    selectedPieceId={selectedPieceId}
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
                    selectedPieceId={selectedPieceId}
                  />
                  <Tray
                    team="blue"
                    label="Home"
                    pieces={filterTrayPieces("blue", "finished")}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showLeaveConfirm && (
        <LeaveGameDialog
          onCancel={() => setShowLeaveConfirm(false)}
          onConfirm={() => {
            setShowLeaveConfirm(false);
            router.push('/');
          }}
        />
      )}
    </main>
  );
}
