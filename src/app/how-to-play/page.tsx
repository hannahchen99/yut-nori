import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'How to Play Yut Nori (윷놀이)',
  description:
    'Learn the rules of Yut Nori, the traditional Korean board game: the yut sticks, movement, shortcuts, captures, and how to win.',
};

interface Section {
  id: string;
  title: string;
  content: React.ReactNode;
}

const sections: Section[] = [
  {
    id: 'overview',
    title: 'Overview',
    content: (
      <p>
        Yut Nori (윷놀이) is a traditional Korean board game typically played by two teams.
        Each team has four pieces (말, mal). Players take turns throwing four wooden sticks
        (윷, yut) to determine how many spaces to move. The first team to move all four
        pieces around the board and across the finish line wins.
      </p>
    ),
  },
  {
    id: 'sticks',
    title: 'The Yut Sticks & Outcomes',
    content: (
      <div className="space-y-3">
        <p>Each throw produces one of five outcomes based on how many sticks land flat-side up:</p>
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="bg-parchment">
              <th className="border border-border px-3 py-2 text-left">Flat up</th>
              <th className="border border-border px-3 py-2 text-left">Name</th>
              <th className="border border-border px-3 py-2 text-left">Hangul</th>
              <th className="border border-border px-3 py-2 text-left">Spaces moved</th>
              <th className="border border-border px-3 py-2 text-left">Bonus?</th>
            </tr>
          </thead>
          <tbody>
            {[
              { flat: 1, name: 'Do', hangul: '도', spaces: 1, bonus: '' },
              { flat: 2, name: 'Gae', hangul: '개', spaces: 2, bonus: '' },
              { flat: 3, name: 'Geol', hangul: '걸', spaces: 3, bonus: '' },
              { flat: 4, name: 'Yut', hangul: '윷', spaces: 4, bonus: '✓ extra throw' },
              { flat: 0, name: 'Mo', hangul: '모', spaces: 5, bonus: '✓ extra throw' },
            ].map((row) => (
              <tr key={row.name} className="odd:bg-white even:bg-paper">
                <td className="border border-border px-3 py-2">{row.flat}</td>
                <td className="border border-border px-3 py-2 font-medium">{row.name}</td>
                <td className="border border-border px-3 py-2">{row.hangul}</td>
                <td className="border border-border px-3 py-2">{row.spaces}</td>
                <td className="border border-border px-3 py-2 text-ink-red">{row.bonus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    ),
  },
  {
    id: 'movement',
    title: 'Movement',
    content: (
      <p>
        Pieces enter the board at the Start position and move counter-clockwise around
        the outer perimeter. On your turn, throw the sticks and move one of your pieces
        (or a stacked group) the indicated number of spaces. You may stack multiple
        pieces on the same space — they move together as a unit.
      </p>
    ),
  },
  {
    id: 'shortcuts',
    title: 'Shortcuts',
    content: (
      <p>
        When a piece lands exactly on one of the top corner positions, it may take a
        diagonal shortcut across the board on its next move, significantly cutting the
        distance to the finish.
      </p>
    ),
  },
  {
    id: 'captures',
    title: 'Captures',
    content: (
      <p>
        If your piece lands on a space occupied by an opponent&apos;s piece (or stack), those
        opponent pieces are captured and sent back to the start. Your team is rewarded
        with a bonus throw. Stacks of your own pieces are safe — pieces of the same team
        on the same space always move together.
      </p>
    ),
  },
  {
    id: 'winning',
    title: 'Winning',
    content: (
      <p>
        The first team to move all four of their pieces past the starting position wins
        the game. A piece must move at least one space past Start to finish — landing
        exactly on Start leaves it in play.
      </p>
    ),
  },
];

export default function HowToPlay() {
  return (
    <main className="min-h-screen bg-paper">
      <div className="max-w-2xl mx-auto px-4 py-12">
        <Link
          href="/"
          className="text-ink-red hover:text-red-button-active text-sm font-medium mb-8 inline-block"
        >
          ← Back to home
        </Link>
        <h1 className="text-4xl font-extrabold mb-2 text-ink-red">
          How to Play Yut Nori
        </h1>
        <p className="mb-10 text-lg text-faint">윷놀이 규칙</p>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.id} id={section.id}>
              <h2 className="text-xl font-bold mb-3 pb-1 border-b border-border text-ink-red">
                {section.title}
              </h2>
              <div className="leading-relaxed text-wood-muted">{section.content}</div>
            </section>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link
            href="/game"
            className="px-8 py-3 bg-red-piece hover:bg-red-button-hover text-white font-semibold rounded-xl shadow-lg transition-colors"
          >
            Play Now
          </Link>
        </div>
      </div>
    </main>
  );
}
