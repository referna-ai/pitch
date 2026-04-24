# Copy HTML button

The "Copy HTML" button on `index.html` lets the founders copy all slide content as a single HTML blob (used for pasting into other tools).

## How it works

`copy-deck.js` runs only on `index.html`. When clicked it:

1. Calls `collectUrls()` — reads the `href` of every `.deck-tabs .deck-tab` link, excluding `index.html` itself
2. Fetches each slide file and extracts its `.slide` element
3. Concatenates the `.slide-hero` from index plus all `.slide` elements
4. Writes the result to the clipboard

## The critical selector

```js
document.querySelectorAll('.deck-tabs .deck-tab')
```

This must match the `<nav class="deck-tabs">` / `<a class="deck-tab">` structure in `index.html`. **If you rename or restructure the nav markup, update this selector in `copy-deck.js` (and `v2/copy-deck.js`) or the button will silently collect zero slides and copy an empty string.**

## What each slide must have

Each slide file must contain exactly one element matching `.slide` at the top level of the document. `copy-deck.js` grabs the first `.slide` per file — if a slide file has no `.slide` element, that slide is silently skipped.
