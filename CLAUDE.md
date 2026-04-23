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
- `slide-1-updated.html` — S1: The Networkers
- `slide-2.html` — S2: The trend (every channel is closing)
- `slide-3.html` — S3: The network (LinkedIn vs InTouch)
- `slide-companion.html` — S4: The companion (three futures for agent exchange)
- `slide-4-updated.html` — S5: The plan
- `slide-5.html` — S6: The team
- `backup/` — archived versions, do not modify
- `styles.css` — shared design system

## Adding or reordering slides
Navigation and analytics are wired up by file name — if you add, remove, or reorder a slide you MUST update every item below or navigation / tracking will silently break:

1. **`nav.js`** — add the new file to the `slides` array in the correct position (keyboard/click/swipe/wheel navigation all read from this array).
2. **`analytics.js`** — add a `'slide-xxx.html': 'NN · Display Name'` entry to the `SLIDES` map in the correct order (anything not in the map is tracked as `index.html`).
3. **Google Apps Script / Sheet** — the webhook receiver has its own column order. Adding a slide means the Sheet needs a new column (or a wipe + fresh start). Confirm the plan with the user before they add slides; the code here can't update the Sheet.
4. **Tab nav** — every slide file (including `index.html`) has a `<nav class="deck-tabs">` block listing all slides. Add the new `<a class="deck-tab">…</a>` in the correct position in every file, and set `active` on the current page's tab.
5. **Slide numbers** — bump `<div class="slide-number">NN / TOTAL</div>` in every slide file (e.g. `01 / 05` → `01 / 06`).
6. **`data-slide` attribute** — new slide's `<body data-slide="slide-xxx">` must match the file name minus `.html` (analytics and nav both rely on it).
