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
- `slide-4-updated.html` — S4: The plan
- `slide-5.html` — S5: The team
- `backup/` — archived versions, do not modify
- `styles.css` — shared design system
