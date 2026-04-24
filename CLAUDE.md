# InTouch Pitch — Claude Instructions

## PR workflow
Before giving a PR link at the end of any task:
1. Check whether the last PR on this repo is already merged: `gh pr list --state merged --limit 1` or `gh pr view <number> --json state`
2. If the previous PR was merged, pull main first (`git checkout main && git pull origin main`), then create a new branch and open a fresh PR for the current work
3. Always give the PR link at the end of the response

## Branch naming
Use descriptive kebab-case: `s1-270m-rewrite`, `s4-value-generated`, etc.

## File structure
- `index.html` — overview/nav hub
- `slide-1.html` — S1: The Market (The Networkers)
- `slide-2.html` — S2: The Trend (every channel is closing)
- `slide-3.html` — S3: The Network (LinkedIn vs InTouch)
- `slide-4.html` — S4: The AI Trust Layer
- `slide-5.html` — S5: The Agent Network
- `slide-6.html` — S6: The Plan
- `slide-7.html` — S7: The Team
- `scripts/` — server-side code (not deployed as slides)
- `docs/` — internal documentation
- `backup/` — archived versions, do not modify
- `styles.css` — shared design system

## Navigation system
See **`docs/navigation.md`** for a full explanation of how navigation works, the three files that must stay in sync, and the common sed double-replace pitfall that has bitten us before.

## Copy HTML button
See **`docs/copy-deck.md`**. The button on `index.html` collects slides via `.deck-tabs .deck-tab` — if you rename that CSS class or restructure the nav, update the selector in `copy-deck.js` and `v2/copy-deck.js` or the button breaks silently.
