import Link from 'next/link';

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-indigo-50 to-white px-4">
      <div className="max-w-lg text-center space-y-6">
        <h1 className="text-5xl font-extrabold text-indigo-900 tracking-tight">
          윷놀이
        </h1>
        <h2 className="text-2xl font-semibold text-indigo-700">Yut Nori</h2>
        <p className="text-gray-600 text-lg leading-relaxed">
          A traditional Korean board game played with four wooden sticks. Race your
          pieces around the board — use shortcuts, capture opponents, and be the
          first team to bring all pieces home.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center pt-2">
          <Link
            href="/game"
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg transition-colors text-lg"
          >
            Create Game
          </Link>
          <Link
            href="/how-to-play"
            className="px-8 py-3 bg-white hover:bg-gray-50 text-indigo-700 font-semibold rounded-xl shadow border border-indigo-200 transition-colors text-lg"
          >
            How to Play
          </Link>
        </div>
      </div>
    </main>
  );
}
