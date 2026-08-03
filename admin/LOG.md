# Project Log

---

## 2026-07-27

### Lessons Learned
- Clarify game logic in plain conversation *before* building, especially for rules with edge cases (e.g. the center-junction departure rule in commit `631d2f3`) — talking through exact examples surfaced a second, related bug (ambiguous stack direction at a shared junction) that would've been easy to miss otherwise. Saved that one to `admin/todo.md` instead of fixing it inline, so it doesn't get lost.
- Manual play-testing in the browser is what actually caught the center-junction bug in the first place — the automated test suite was fully green the whole time; the bug only became visible by actually moving a piece through the diagonal shortcut and watching where it landed.
- Need to actively think about UI/UX, not just correctness — non-intuitive states (e.g. "what am I supposed to do right now?") need explicit, plain-language guidance, like the turn instructions added in commit `4cca771`. That gap wasn't obvious until playing the game and feeling confused mid-turn.
- For future specs: add a dedicated UX section to capture these improvements up front, rather than discovering them ad hoc during/after implementation.

---

## 2026-07-21

### Lessons Learned
- Going phase by phase, and step by step within a phase, made review and debugging much easier — keep working this way.
- Save git preferences: review the diff and the exact commit message and approve *before* committing, not just before pushing.
- When I don't understand code, ask Claude for a pseudocode explanation.
- Ran into repeated naming collisions (`THROW_YUT` action vs. `'yut'` result value; `'home'` status vs. the UI's "Home" tray) — be more mindful of name choices before proposing them.

---

## 2026-06-16

### Accomplished
- Completed Phase 2 commands
- Pushed to GitHub

### Next Steps
- Check test cases
- Push admin files to Git

---

## 2026-06-01

### Accomplished
- Correct setup of the board and pieces
- Learned basics of server vs client components in Next.js
- Set up admin files: project log, lessons learned, to-dos

### Next Steps
- Learn remaining Next.js concepts from Phase 1
- Move onto Phase 2

---

<!-- Add new entries at the top, below this line -->

## 2026-08-03

### Lessons Learned
- When proposing a way to solve a problem, state the goal first (e.g. "one place to define colors"), then the suggested approach, and explicitly ask for feedback or alternatives — especially whether an existing library already has a built-in feature for it, instead of defaulting to a custom solution. The Malpan color palette went to JS constants first; only after asking "is there a better way using Tailwind's theme system?" did it turn out Tailwind's `@theme` block does this natively, causing a full rework of `Board.tsx`, `Tray.tsx`, `YutSticks.tsx`, and three page files.

---
