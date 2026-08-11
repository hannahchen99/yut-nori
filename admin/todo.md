# To Do

## Must
- [ ] Examine choices in scaffolding (e.g. why SVG vs other alternatives) `#architecture`
- [ ] Learn Next.js concepts in phase 1 `#learning`
- [ ] Add back/home page button to game page `#navigation` `#ui`
- [ ] Review rules page for accuracy `#content`
- [ ] Fix: when two same-team pieces merge into a stack at the center junction (node 22) having arrived via different diagonals, the stack's future movement direction is governed by whichever piece's `enteredFrom` the player happens to dispatch with — the two pieces genuinely disagree about which diagonal they came from, and the board graph has no way to represent a stack with two valid exit directions `#bug` `#gameplay`
- [ ] Fix game-over dead end: `state.winner` is never read and the Start button only renders when `phase === 'waiting'` — a won game just freezes with no announcement or replay option `#bug` `#gameplay`
- [ ] Fix "HOME" naming collision in the UI: the board's entry square (`Board.tsx`) and the finished-pieces tray both display "Home" for unrelated concepts — same shape of bug as the `home`/`reserve` data-model collision fixed in `07f2bce`, resurfaced in the UI layer `#bug` `#ui` `#naming`
- [ ] Fix misleading initial dice state: `sticks` initializes to `[0,0,0,0]`, which `getYutResult` reads as a real "윷 (Yut)" throw before the player has thrown anything — use `null` as a not-yet-thrown sentinel `#bug` `#ui`
- [ ] Remove debug node-number labels from the board — the `{i}` text drawn on every node (`Board.tsx:179-207`) was for development only `#ui` `#board` `#cleanup`
- [ ] Deploy to Vercel and get a live URL `#deployment`
- [ ] Add feedback when a piece is captured — reserve/board counts just silently change with no toast, message, or animation, so a capture is easy to miss `#ui` `#gameplay`
- [ ] Make move-selection order discoverable — clicking a pending-move chip first does nothing; you have to click a piece first, then a "Choose a move" list appears. The status line also highlights only one move even while two are pending, implying it's already selected `#ui` `#gameplay`

## Nice to Have
- [ ] Configure Prettier for consistent formatting (indentation, quote style, spacing) `#tooling`
- [ ] Update styling for board `#styling` `#board`
- [ ] Update styling for sticks `#styling` `#sticks`
- [ ] Add animation for throwing, moving, and capturing pieces (framer-motion is installed but unused) `#animation` `#sticks`
- [ ] Look for opportunities to increase efficiency (e.g. const values, math-based move functions instead of map retrieval) `#architecture` `#performance`
- [ ] Add move-preview highlighting — show the destination node before committing a move, using `Board`'s existing `highlightedPositions` prop `#ui` `#board` `#gameplay`
- [ ] Highlight the selected piece on the board — `selectedPieceId` is tracked in state but never passed to `Board`/`Tray`, so nothing visually shows which piece is selected `#ui` `#board`
- [ ] Memoize `filterTrayPieces`/`getBoardPieces` in `page.tsx` — recomputed every render, fine at current scale but worth `useMemo` if this pattern grows `#performance`
- [ ] Use `GamePhase` type from `@/types/game` instead of `Record<typeof initialState.phase, string>` in `page.tsx` — more conventional, doesn't tie the type to a specific value's shape `#tooling`
- [ ] Add `role="status"`/`aria-live="polite"` to the winner announcement so screen readers are notified when the game ends `#accessibility`
- [ ] Add a comment on the `' '` placeholder in `YutSticks.tsx` (prevents layout shift when there's no result yet) — easy for a future edit to mistake as a stray character and delete `#cleanup`
- [ ] Add accessible roles/labels to board pieces and pending-move chips — currently bare SVG circles / unlabeled divs, unreachable by keyboard or screen reader `#accessibility` `#board`
- [ ] Increase on-board piece click targets (currently 12px, 9px for the front piece in a stack) with hit-area padding and hover/miss feedback `#ui` `#board`
- [ ] Add feedback when a piece reaches Home — counts just silently increment with no toast, message, or animation `#ui` `#gameplay` `#animation`
- [ ] Fix stale dice/result display on turn handoff — the previous player's sticks and result label linger through the next player's "Throwing" phase until they throw again `#ui` `#gameplay`
- [ ] Improve piece/board-node color contrast — pieces can visually blend into similarly-colored nodes (e.g. a red piece on the orange corner) `#board` `#accessibility` `#styling`
- [ ] Use available desktop viewport width — board and controls are confined to a narrow left column, leaving roughly half the screen blank, which reads as unfinished for a portfolio piece `#styling` `#ui`
- [ ] Fix page title clipping at the top of the viewport on load (no top padding) — requires scrolling to read it in full `#styling` `#ui`

## Someday
- [ ] Online/remote multiplayer, persistence, and accounts `#architecture` `#multiplayer`
- [ ] Add the traditional "backdo" (백도) rule — a special throw result (one stick shows the marked/back side) that moves a piece backward 1 space instead of forward `#gameplay` `#feature`
