# Spec: Wire the Game Board to the State Machine

## Objective

The `/game` page currently renders a static board and a stick-thrower that only
updates local component state — it never touches `gameReducer`. The engine
itself (`src/lib/game/stateMachine.ts`) is complete and fully tested (38
passing tests): board graph, shortcuts, stacking, capturing, bonus throws, win
detection.

This spec covers making `/game` a real, playable, pass-and-play (same-screen,
two-player) game by connecting the existing UI components to the existing
reducer. **No new game-logic rules are introduced here** — this is UI/state
wiring only, with one exception: a pre-existing reducer bug (see Phase 0
below) that this spec's own UI design would otherwise expose to players, so
it must be fixed first rather than wired around.

**User:** two people sharing one screen/device, taking turns as red and blue.

**Success looks like:** a full game can be played start to finish in the
browser — start game, throw, move a piece, watch captures/stacks/bonus throws
happen, see a winner declared — with no console-only behavior left over from
the current demo.

## Scope — narrowed to a first slice

To keep this reviewable, the work is split into a **Phase 1 (this spec)** set
that makes the game actually playable, and a **Deferred** set of polish items
that build on top of it later.

### Phase 0 — bug fix, do this first

Found during adversarial spec review, confirmed by tracing the code (not
speculative):

**Bug:** a yut/mo bonus throw can be double-granted (or wrongly withheld)
depending on the order pending moves are applied — even though the bonus
was already fully resolved during the throwing phase.

- What actually happens: rolling 윷/모 immediately grants one extra roll —
  handled correctly in `THROW_YUT` (`stateMachine.ts:198`), which keeps
  `phase: 'throwing'` until a non-bonus result is rolled. By the time
  `pendingMoves` is complete and `phase` becomes `'moving'`, every bonus
  roll for the turn has already happened. No further roll is owed once
  you're placing those numbers on the board.
- The bug: `MOVE_PIECE` (`stateMachine.ts:302`) re-checks
  `usedMove.bonusThrow` — the flag of whichever pending move happens to be
  applied *last* — and grants *another* fresh bonus throw if it's a
  yut/mo-derived move. That's wrong: moving a piece should never itself
  grant a new roll; only rolling yut/mo (already handled) or **capturing**
  an enemy piece (a real, separate rule) should.
- Concretely: turn rolls `[yut, gae]` → `pendingMoves = [yut(4, bonus),
  gae(2, non-bonus)]`. Apply `gae` first, `yut` last → the team wrongly
  gets an extra unearned roll. Apply `yut` first, `gae` last → turn
  correctly ends. Same two rolls, same turn — the outcome shouldn't depend
  on which one the player happens to move last, but right now it does.
- **Fix:** in `MOVE_PIECE`'s end-of-move phase transition
  (`stateMachine.ts:302`), the bonus-throw continuation should be dropped
  from that check — only `wasCapture` should grant a new `'throwing'`
  phase there. (`usedMove.bonusThrow` at this point reflects a roll that's
  already been "spent"; it's not evidence of a new bonus.)
- **Required test:** add a case to `stateMachine.test.ts`'s "Turn
  switching" describe block — given `pendingMoves = [yut(4, bonus: true),
  gae(2, bonus: false)]` (no capture involved), applying the **non-bonus
  move last** must switch teams and NOT re-enter `'throwing'` for the same
  team. This is the ordering the existing tests never cover (they only test
  each pending-move shape in isolation, never a mixed bonus/non-bonus queue
  resolved in the "wrong" order).
- This is a one-line reducer fix plus a test — small, but it changes actual
  game behavior, so: run it by yourself before committing, same as any
  other reducer change, and don't fold it silently into a UI-wiring commit.

### Phase 1 — in scope
1. **Start / reset flow** — a "Start Game" control dispatches `START_GAME`;
   replaces the current "always ready to throw" demo state.
2. **Real throw** — "Throw Sticks" dispatches `THROW_YUT` with the rolled
   result instead of only calling `setSticks`/`console.log`. Sticks visual
   stays as-is.
3. **Turn / phase indicator** — show whose turn it is (red/blue) and the
   current phase (`throwing` / `moving`), so the UI state is never ambiguous.
4. **Piece rendering** — render all 8 pieces on `Board` at their real
   positions from `GameState.pieces`, plus two per-team trays to the right of
   the board (see Layout below):
   - pieces not yet placed — shown in a **"Reserve"** tray
   - pieces `finished` — shown in a **"Home"** tray
   - stacked pieces at the same board node (visually grouped/badged, not just
     overlapping)

   **Naming fix (small exception to the `stateMachine.ts` boundary):** the
   reducer's `PieceLocation` status was originally named `'home'` for "not
   yet placed," which directly contradicts the UI's "Home" tray meaning
   finished pieces. Rename that status literal `'home'` → `'reserve'`
   throughout `src/types/game.ts`, `src/lib/game/stateMachine.ts`, and
   `src/lib/game/__tests__/stateMachine.test.ts`. This is a pure rename — no
   behavior change, no test assertions change meaning, just the literal
   string — so it doesn't conflict with "keep `gameReducer` pure" or "no
   game-logic changes" above. `status: 'finished'` is untouched. Board
   position 0's existing "HOME" label (`Board.tsx`) also stays as-is and is
   unrelated to the finished-pieces tray — don't conflate the two when
   implementing.
5. **Move selection** — moves are picked only after the turn's full throw
   sequence ends (`phase === 'moving'`, i.e. no more pending bonus throws).
   At that point: click a piece first; if exactly one pending move remains,
   apply it immediately; if more than one is queued (from a bonus-throw
   streak), show a small choice of the pending move values for that piece
   before dispatching `MOVE_PIECE`.
6. **Capture/bonus feedback** — no new logic needed (reducer already handles
   it), but the UI must reflect the result: captured pieces visibly return
   home, bonus throws visibly return to the `throwing` phase for the same
   team.
7. **Win screen** — when `phase === 'finished'`, show which team won and a
   button to start a new game.

### Deferred — explicitly out of scope for this spec
- Animations for throws, moves, or captures (`framer-motion` is installed but
  unused — future spec).
- Board/stick restyling (`admin/todo.md` "nice to have" items).
- Back/home navigation button on `/game` (small, unrelated UI nit — can be a
  separate one-line fix, not worth a spec).
- Any online/remote multiplayer, persistence, or account system.
- Move-preview highlighting (showing the destination node before committing)
  — nice follow-up once basic move selection works, uses the existing
  `Board` `highlightedPositions` prop.

## Tech Stack

- Next.js 16 (App Router), React 19, TypeScript (strict mode)
- Tailwind CSS v4
- State: local reducer via `useReducer(gameReducer, initialState)` — no
  external state library needed for pass-and-play (zustand is a dependency
  but not yet used; stay on `useReducer` unless Plan phase finds a concrete
  reason to switch)
- Testing: Vitest + Testing Library (jsdom environment)

## Commands

```
Dev:   npm run dev
Build: npm run build
Start: npm run start
Lint:  npm run lint
Test:  npm test            # vitest run
Watch: npm run test:watch  # vitest
```

## Project Structure

```
src/app/game/page.tsx                 → game screen (client component) — main wiring target
src/components/Board.tsx              → SVG board renderer (currently node-only, no pieces)
src/components/YutSticks.tsx          → stick-throw UI, calls onThrow(sticks, outcome)
src/lib/game/stateMachine.ts          → reducer + pure movement/board-graph logic (done, tested)
src/lib/game/__tests__/               → vitest tests for the reducer
src/types/game.ts                     → shared types (GameState, GameAction, Piece, ...)
admin/                                → personal log/todo, not app code
```

New files anticipated in Plan phase: a `Piece`/token rendering component, a
`Tray` component (Reserve/Home, one per team), and possibly a small hook or
component to house move-selection UI state (e.g. "which piece is currently
selected", "pending move choice popover").

### Layout

Two-team, single-device layout, right-hand column split by team (chosen over
one long stacked column of both teams' trays, to avoid a crowded single
column):

```
┌─────────────┬───────────────────┐
│             │  Turn / phase     │
│             │  Yut Sticks       │
│    Board    ├─────────┬─────────┤
│             │ Red      │ Blue    │
│             │ Reserve  │ Reserve │
│             │ Red Home │ Blue Home│
└─────────────┴─────────┴─────────┘
```

## Code Style

Existing conventions to follow (from `Board.tsx` / `YutSticks.tsx` /
`stateMachine.ts`):

```tsx
'use client';

interface SomeProps {
  someValue: number;
  onSomeEvent: (x: number) => void;
}

export default function SomeComponent({ someValue, onSomeEvent }: SomeProps) {
  // implementation
}
```

- Default-export function components, `PascalCase` filenames matching the
  component name.
- Props typed with a local `interface X Props` (components) or `type`
  (pure/game logic in `stateMachine.ts` uses `type`, not `interface`).
- No comments except where a non-obvious invariant needs explaining (see the
  board-graph comments at the top of `stateMachine.ts` for the bar to meet).
- Tailwind utility classes directly in JSX; no CSS modules or styled-components.
- Reducer logic stays pure and side-effect-free (`gameReducer` takes
  `(state, action) → state`); UI components own all interaction state
  (selection, hover) locally.

## Testing Strategy

- **Unit (existing):** `stateMachine.test.ts` already covers reducer/engine
  logic — no *behavioral* changes expected from the UI-wiring work itself,
  but two exceptions touch it directly: the Phase 0 bonus-throw fix (new
  test, real behavior change — see Phase 0) and the `status: 'home'` →
  `'reserve'` rename (see Phase 1 item 4, a mechanical find/replace across
  the test file's `status: 'home'` literals — assertions don't change
  meaning there).
- **New unit/component tests to add in Plan phase:**
  - Piece-rendering component: given a `GameState`, renders the correct
    number of tokens at the correct positions (including stacked and
    home/finished cases).
  - `/game` page: clicking a valid piece during `moving` phase dispatches
    `MOVE_PIECE` with the right `pieceId`/`moveIndex` (can test the reducer
    integration without a full browser, using Testing Library).
- **Manual verification:** after implementation, play a full game start-to-
  finish in the browser preview (start → throw → move → capture/bonus →
  win) per this repo's `verify` skill — this is a UI feature, so it must be
  checked live, not just type-checked/tested.
- Coverage bar: every new branch in move-selection logic (valid piece vs.
  invalid, single vs. multiple pending moves) should have a test.

## Boundaries

- **Always do:** run `npm test` and `npm run lint` before considering a task
  in the eventual task list done; keep `gameReducer` pure (no UI code creeps
  into `stateMachine.ts`); keep new game-logic changes out of this
  effort beyond the two explicitly approved exceptions below — if any
  *other* rule bug is found, flag it separately rather than fixing it
  inline here.
- **Ask first:** introducing any new dependency (e.g. actually wiring up
  `zustand` or `framer-motion`); changing the board coordinate system in
  `Board.tsx`; any change to `stateMachine.ts` beyond what's needed to expose
  data the UI needs, the approved `'home'` → `'reserve'` status rename, or
  the approved Phase 0 bonus-throw fix above (e.g. adding a selector helper
  is fine, changing move rules beyond those two approved items is not).
- **Never do:** implement the Deferred list above as part of this effort;
  commit directly to `main` without the user reviewing the diff first project
  convention has been small direct commits, but confirm before push, as
  we've been doing; remove/weaken the existing 38 passing tests.

## Success Criteria

- Phase 0's bonus-throw bug is fixed and covered by the new regression
  test described above, before any Phase 1 UI work is considered started.
- A user can, entirely through the browser UI: start a game, throw sticks,
  move a piece (including from home and onto the board), see a capture send
  an enemy piece home, see a bonus throw grant another throw to the same
  team, and see a win screen when one team finishes all 4 pieces.
- No leftover demo-only behavior (`console.log('Throw result...')`,
  always-throwable stick UI regardless of phase) remains in `/game`.
- `npm test` and `npm run lint` both pass.
- Manually verified in the browser preview, not just type/lint clean.

## Open Questions

All open questions were resolved during spec review:

- ~~Move-selection UX~~ → resolved: pick after the full throw sequence ends,
  piece first, then move if multiple are pending (see Phase 1 item 5).
- ~~Tray naming/placement~~ → resolved: "Reserve" / "Home", split-by-team
  columns to the right of the board (see Layout).
- ~~`zustand` vs `useReducer`~~ → resolved: stick with plain `useReducer` in
  the `/game` page component. `zustand` stays an unused dependency for now;
  revisit only if a future feature needs game state outside `/game`'s
  component tree.
