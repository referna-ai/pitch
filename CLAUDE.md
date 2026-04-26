# InTouch Pitch — Claude Instructions

## PR workflow
Before giving a PR link at the end of any task:
1. Check whether the last PR on this repo is already merged: `gh pr list --state merged --limit 1` or `gh pr view <number> --json state`
2. If the previous PR was merged, pull main first (`git checkout main && git pull origin main`), then create a new branch and open a fresh PR for the current work
3. Always give the PR link at the end of the response

## Branch naming
Use descriptive kebab-case: `s1-270m-rewrite`, `s4-value-generated`, etc.

## File structure
- `index.html` — root redirect to the active deck version (currently `v3/`). Change the `<meta http-equiv="refresh">` URL to swap.
- `v1/` — original 7-slide deck (index + slide-1…slide-7, plus its own `styles.css`, `nav.js`, `analytics.js`, `copy-deck.js`, `favicon.svg`)
- `v2/` — second iteration deck (same structure as v1)
- `v3/` — current 10-slide deck (index + slide-1…slide-10, plus its own assets)
- `ab.html` — A/B variant picker
- `scripts/` — server-side code (not deployed as slides)
- `docs/` — internal documentation
- `backup/` — archived versions, do not modify

Each version directory is self-contained — its slides reference its own `styles.css`, `nav.js`, etc. via relative paths.

## Navigation system
See **`docs/navigation.md`** for a full explanation of how navigation works, the three files that must stay in sync, and the common sed double-replace pitfall that has bitten us before.

## Copy HTML button
See **`docs/copy-deck.md`**. The button on each version's `index.html` collects slides via `.deck-tabs .deck-tab` — if you rename that CSS class or restructure the nav, update the selector in every version's `copy-deck.js` (`v1/`, `v2/`, `v3/`) or the button breaks silently.
