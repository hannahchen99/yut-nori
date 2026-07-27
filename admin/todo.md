# To Do

## Must
- [ ] Examine choices in scaffolding (e.g. why SVG vs other alternatives) `#architecture`
- [ ] Learn Next.js concepts in phase 1 `#learning`
- [ ] Add back/home page button to game page `#navigation` `#ui`
- [ ] Review rules page for accuracy `#content`
- [ ] Fix: when two same-team pieces merge into a stack at the center junction (node 22) having arrived via different diagonals, the stack's future movement direction is governed by whichever piece's `enteredFrom` the player happens to dispatch with — the two pieces genuinely disagree about which diagonal they came from, and the board graph has no way to represent a stack with two valid exit directions `#bug` `#gameplay`

## Nice to Have
- [ ] Configure Prettier for consistent formatting (indentation, quote style, spacing) `#tooling`
- [ ] Update styling for board `#styling` `#board`
- [ ] Update styling for sticks `#styling` `#sticks`
- [ ] Add animation for throwing, moving, and capturing pieces (framer-motion is installed but unused) `#animation` `#sticks`
- [ ] Look for opportunities to increase efficiency (e.g. const values, math-based move functions instead of map retrieval) `#architecture` `#performance`
- [ ] Add move-preview highlighting — show the destination node before committing a move, using `Board`'s existing `highlightedPositions` prop `#ui` `#board` `#gameplay`

## Someday
- [ ] Online/remote multiplayer, persistence, and accounts `#architecture` `#multiplayer`
