import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-paper px-4">
      <div className="max-w-lg text-center space-y-6">
        <h1 className="text-5xl font-extrabold tracking-tight text-ink-red">
          윷놀이
        </h1>
        <h2 className="text-2xl font-semibold text-heading">Yut Nori</h2>
        <p className="text-lg leading-relaxed text-wood-muted">
          A traditional Korean board game played with four wooden sticks. Race your
          pieces around the board — use shortcuts, capture opponents, and be the
          first team to bring all pieces home.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Link
            href="/game"
            className="px-8 py-3 bg-red-piece hover:bg-red-button-hover text-white font-semibold rounded-xl shadow-lg transition-colors text-lg"
          >
            Play Game
          </Link>
          <Link
            href="/how-to-play"
            className="px-8 py-3 bg-surface hover:bg-parchment text-ink-red font-semibold rounded-xl shadow border border-border transition-colors text-lg"
          >
            How to Play
          </Link>
        </div>
      </div>
    </main>
  );
}
