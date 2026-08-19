# To Do

## Must
- [ ] Examine choices in scaffolding (e.g. why SVG vs other alternatives) `#architecture`
- [ ] Learn Next.js concepts in phase 1 `#learning`
- [ ] Add back/home page button to game page `#navigation` `#ui`
- [ ] Review rules page for accuracy `#content`
- [ ] Deploy to Vercel and get a live URL `#deployment`

## Nice to Have
- [ ] Configure Prettier for consistent formatting (indentation, quote style, spacing) `#tooling`
- [ ] Update styling for board `#styling` `#board`
- [ ] Update styling for sticks `#styling` `#sticks`
- [ ] Add animation for throwing, moving, and capturing pieces (framer-motion is installed but unused) `#animation` `#sticks`
- [ ] Look for opportunities to increase efficiency (e.g. const values, math-based move functions instead of map retrieval) `#architecture` `#performance`
- [ ] Add move-preview highlighting — show the destination node before committing a move, using `Board`'s existing `highlightedPositions` prop `#ui` `#board` `#gameplay`
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
