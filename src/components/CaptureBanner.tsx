import { Team, TEAM_LABEL, TEAM_TEXT_CLASS } from '@/types/game';

interface CaptureBannerProps {
  capturingTeam: Team;
  capturedTeam: Team;
  count: number;
}

const TEAM_STYLES: Record<Team, { label: string; textClass: string; borderClass: string }> = {
  red: { label: TEAM_LABEL.red, textClass: TEAM_TEXT_CLASS.red, borderClass: 'border-l-red-piece' },
  blue: { label: TEAM_LABEL.blue, textClass: TEAM_TEXT_CLASS.blue, borderClass: 'border-l-blue-piece' },
};

export default function CaptureBanner({ capturingTeam, capturedTeam, count }: CaptureBannerProps) {
  const capturing = TEAM_STYLES[capturingTeam];
  const captured = TEAM_STYLES[capturedTeam];
  const pieceText = count === 1 ? `a ${captured.label} piece` : `${count} ${captured.label} pieces`;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`w-full bg-parchment border border-border border-l-4 ${capturing.borderClass} rounded-lg px-3 py-2.5`}
    >
      <p className="text-sm text-ink">
        <span className={`font-semibold ${capturing.textClass}`}>{capturing.label}</span> captured{' '}
        <span className={`font-semibold ${captured.textClass}`}>{pieceText}</span>!
      </p>
      <p className="text-xs text-wood-muted mt-0.5">Sent back to Reserve</p>
    </div>
  );
}
