'use client';

import { Team, TEAM_LABEL, TEAM_BG_CLASS, TEAM_TEXT_CLASS } from '@/types/game';

interface GameOverBannerProps {
  winner: Team;
  onPlayAgain: () => void;
}

const WINNER_STYLES: Record<Team, { label: string; pieceClass: string; badgeClass: string }> = {
  red: { label: TEAM_LABEL.red, pieceClass: TEAM_BG_CLASS.red, badgeClass: TEAM_TEXT_CLASS.red },
  blue: { label: TEAM_LABEL.blue, pieceClass: TEAM_BG_CLASS.blue, badgeClass: TEAM_TEXT_CLASS.blue },
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
