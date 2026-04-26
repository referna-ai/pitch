# Navigation system

## How it works

`nav.js` is loaded by every slide and drives all navigation. It maintains a single ordered array of `{ file, title }` objects (`slides[]`) and **renders the `<nav class="deck-tabs">` tab strip itself** — the slide HTML files no longer contain that markup. It detects the current slide by reading the `data-slide` attribute on `<body>`, appending `.html`, and finding that value in the array. Forward/back move ±1 in the array.

## The places that must stay in sync

When adding, removing, or renaming a slide, update:

| File | What to change |
|------|---------------|
| `nav.js` (and `v2/nav.js`, `v3/nav.js`) | The `slides[]` array — order determines navigation sequence; `title` is the tab label |
| `analytics.js` (and `v2/analytics.js`, `v3/analytics.js`) | The `SLIDES` map — keys are filenames, values are display names sent to the spreadsheet |
| Every `<body>` tag | `data-slide` must equal the filename without `.html` |

The tab strip is generated from `slides[]` at page load — there is no per-slide tab markup to keep in sync anymore. Active tab is set by matching the detected current slide.

## Current slide order

| # | File | Title |
|---|------|-------|
| 0 | `index.html` | Cover |
| 1 | `slide-1.html` | The Market |
| 2 | `slide-2.html` | The Trend |
| 3 | `slide-3.html` | The Network |
| 4 | `slide-4.html` | The AI Trust Layer |
| 5 | `slide-5.html` | The Agent Network |
| 6 | `slide-6.html` | The Plan |
| 7 | `slide-7.html` | The Team |

## Adding a new slide

1. Create `slide-N.html` with `<body data-slide="slide-N">` (no `<nav class="deck-tabs">` block — it's injected by `nav.js`)
2. Add `{ file: 'slide-N.html', title: 'The thing' }` to `slides[]` in `nav.js` **and** `v2/nav.js` / `v3/nav.js` at the right position
3. Add `'slide-N.html': 'NN · Title'` to `SLIDES` in `analytics.js` **and** `v2/analytics.js` / `v3/analytics.js`

## Common bug: sequential sed replacements

When bulk-renaming slides with `sed -e s/A/B/ -e s/B/C/`, a file renamed A→B in the first pass will be renamed again B→C in the second pass in the same invocation. Always rename in reverse order (highest number first) or use separate sed calls per file.
