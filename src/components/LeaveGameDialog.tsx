'use client';

interface LeaveGameDialogProps {
  onCancel: () => void;
  onConfirm: () => void;
}

export default function LeaveGameDialog({ onCancel, onConfirm }: LeaveGameDialogProps) {
  return (
    <div className="fixed inset-0 bg-ink/40 flex items-center justify-center p-5 z-50">
      <div className="w-full max-w-sm bg-surface border border-border rounded-lg shadow-lg p-6">
        <h2 className="text-lg font-extrabold text-ink-red mb-2">
          Are you sure you want to leave the game?
        </h2>
        <p className="text-sm text-wood-muted mb-5">
          Your current game will be lost and this action cannot be undone.
        </p>
        <div className="flex gap-2.5 justify-end">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-surface text-ink-red border border-border rounded-lg text-sm font-semibold hover:bg-parchment transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-piece hover:bg-red-button-hover active:bg-red-button-active text-white rounded-lg text-sm font-semibold transition-colors"
          >
            Leave
          </button>
        </div>
      </div>
    </div>
  );
}
