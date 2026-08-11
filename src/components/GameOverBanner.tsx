'use client';

import { Team } from './Tray';

interface GameOverBannerProps {
  winner: Team;
  onPlayAgain: () => void;
}

const WINNER_STYLES: Record<Team, { label: string; pieceClass: string; badgeClass: string }> = {
  red: { label: 'Red', pieceClass: 'bg-red-piece', badgeClass: 'text-red-piece-badge' },
  blue: { label: 'Blue', pieceClass: 'bg-blue-piece', badgeClass: 'text-blue-piece-badge' },
};

export default function GameOverBanner({ winner, onPlayAgain }: GameOverBannerProps) {
  const style = WINNER_STYLES[winner];

  return (
    <>
      <div className="flex flex-col items-center gap-2.5">
        <div className={`w-14 h-14 rounded-full border-2 border-ink ${style.pieceClass}`} />
        <p className={`text-2xl font-extrabold text-center ${style.badgeClass}`}>
          {style.label} Wins!
        </p>
      </div>
      <button
        onClick={onPlayAgain}
        className="px-6 py-2.5 bg-red-piece hover:bg-red-button-hover active:bg-red-button-active text-white font-semibold rounded-lg shadow transition-colors"
      >
        Play Again
      </button>
    </>
  );
}
