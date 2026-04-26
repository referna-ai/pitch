# Navigation system

## How it works

`nav.js` is loaded by every slide and drives all navigation. It maintains a single ordered array of filenames (`slides[]`). It detects the current slide by reading the `data-slide` attribute on `<body>`, appending `.html`, and finding that value in the array. Forward/back move ±1 in the array.

## The three places that must stay in sync

When adding, removing, or renaming a slide, update **all three**:

| File | What to change |
|------|---------------|
| `<version>/nav.js` (e.g. `v1/`, `v2/`, `v3/`) | The `slides[]` array — order determines navigation sequence |
| `<version>/analytics.js` | The `SLIDES` map — keys are filenames, values are display names sent to the spreadsheet |
| Every `<body>` tag | `data-slide` must equal the filename without `.html` |

The nav tabs inside each HTML file (`<nav class="deck-tabs">`) are cosmetic — they don't affect keyboard/click/swipe navigation, only the top tab bar.

## Versions

The repo holds multiple deck versions in parallel — each lives in its own directory (`v1/`, `v2/`, `v3/`) and is fully self-contained. The root `index.html` is a redirect that points to whichever version is "live" — change the meta-refresh URL there to swap.

## Current slide order (v3 — live)

| # | File | Title |
|---|------|-------|
| 0 | `v3/index.html` | Cover |
| 1 | `v3/slide-1.html` | The Thesis |
| 2 | `v3/slide-2.html` | The Networkers |
| 3 | `v3/slide-3.html` | The Trend |
| 4 | `v3/slide-4.html` | The Gap |
| 5 | `v3/slide-5.html` | The Distinction |
| 6 | `v3/slide-6.html` | The Positioning |
| 7 | `v3/slide-7.html` | The Network |
| 8 | `v3/slide-8.html` | The Wedge |
| 9 | `v3/slide-9.html` | The Plan |
| 10 | `v3/slide-10.html` | The Team |

## Adding a new slide (within a version)

1. Create `<version>/slide-N.html` with `<body data-slide="slide-N">`
2. Add `'slide-N.html'` to `slides[]` in `<version>/nav.js` at the right position
3. Add `'slide-N.html': 'NN · Title'` to `SLIDES` in `<version>/analytics.js`
4. Add the nav tab link to every slide's `<nav class="deck-tabs">` block in that version

## Common bug: sequential sed replacements

When bulk-renaming slides with `sed -e s/A/B/ -e s/B/C/`, a file renamed A→B in the first pass will be renamed again B→C in the second pass in the same invocation. Always rename in reverse order (highest number first) or use separate sed calls per file.
