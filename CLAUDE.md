# InTouch Pitch — Claude Instructions

## PR workflow
Before giving a PR link at the end of any task:
1. Check whether the last PR on this repo is already merged: `gh pr list --state merged --limit 1` or `gh pr view <number> --json state`
2. If the previous PR was merged, pull main first (`git checkout main && git pull origin main`), then create a new branch and open a fresh PR for the current work
3. Always give the PR link at the end of the response
4. Always give the Cloudflare Pages preview link too — derive it from the branch name with the rule below, no need to wait for the bot comment. Append the slide path when relevant, e.g. `https://<slug>.intouch-short-deck.pages.dev/v6/slide-2`.

### Predicting the Cloudflare Pages branch preview slug

The `cloudflare-workers-and-pages[bot]` `Branch Preview URL` is a pure function of the branch name. Compute it locally — don't wait for the bot.

Algorithm:
1. Replace every `/` with `-`
2. Lowercase the whole string
3. Truncate to **28 characters**
4. Strip any trailing `-` (so a slug never ends in a hyphen)

Then the URL is `https://<slug>.intouch-short-deck.pages.dev/`.

Verified examples (branch → slug):
- `claude/update-team-slide-5HDPY` → `claude-update-team-slide-5hd` (28 chars)
- `claude/update-market-slide-aQotT` → `claude-update-market-slide-a` (28 chars)
- `claude/enlarge-biz-model-fonts-qVAw3` → `claude-enlarge-biz-model-fon` (28 chars)
- `claude/move-traction-slide-backup-Y31Q8` → `claude-move-traction-slide-b` (28 chars)
- `claude/migrate-bni-slide-v6-C4QzU` → `claude-migrate-bni-slide-v6` (27 chars after stripping trailing `-`)
- `claude/add-arrow-key-navigation-64Qeo` → `claude-add-arrow-key-navigat` (28 chars)
- Short branches (≤28 chars after slugify) are used as-is, e.g. `s5-2x2-matrix` → `s5-2x2-matrix`

If the bot's comment, when it lands, ever disagrees with the prediction, prefer the bot's value and update this rule.

## Branch naming
Use descriptive kebab-case: `s1-270m-rewrite`, `s4-value-generated`, etc.

## File structure
- `index.html` — root redirect to the active deck version (currently `v4/`). Change the `<meta http-equiv="refresh">` URL to swap.
- `v1/` — original 7-slide deck (index + slide-1…slide-7, plus its own `styles.css`, `nav.js`, `analytics.js`, `copy-deck.js`, `favicon.svg`)
- `v2/` — second iteration deck (same structure as v1)
- `v3/` — 10-slide deck (index + slide-1…slide-10, plus its own assets)
- `v4/` — current 10-slide deck (index + slide-1…slide-10, plus its own assets, including `download-pdf.js`)
- `ab.html` — A/B variant picker
- `scripts/` — server-side code (not deployed as slides)
- `docs/` — internal documentation
- `backup/` — archived versions, do not modify

Each version directory is self-contained — its slides reference its own `styles.css`, `nav.js`, etc. via relative paths.

## Navigation system
See **`docs/navigation.md`** for a full explanation of how navigation works, the three files that must stay in sync, and the common sed double-replace pitfall that has bitten us before.

## Copy HTML button
See **`docs/copy-deck.md`**. The button on each version's `index.html` collects slides via `.deck-tabs .deck-tab` — if you rename that CSS class or restructure the nav, update the selector in every version's `copy-deck.js` (`v1/`, `v2/`, `v3/`, `v4/`) or the button breaks silently.

## Data points: one per line
When a copy block contains multiple short data points / stat sentences / bullet-style claims separated by periods (e.g. "14.8% W/W growth. 6.7% cold-email to onboarded. Early signs of viral growth."), put **each sentence on its own line** — use a `<br>` inside the existing element or split into separate child elements. Don't let three short claims wrap as a single paragraph: it makes one sentence overflow while another sits short, and the reader loses the parallel structure. This applies to any slide element that reads as a list of points (column descriptions, conclusion sub-lines, callout bodies, etc.), in any version. Prose paragraphs are exempt — this is specifically for stat/claim enumerations.

## Minimum font size: 14px
No text anywhere in the deck (any version) may be set below 14px. This applies to labels, links, captions, source lines, tooltips, and any other text element — including uppercase/small-caps styles where small sizes are tempting. If a design calls for a smaller size, use 14px and adjust letter-spacing or weight instead.

## Tables: always single-font (Manrope)
The deck uses two type families: `var(--font-display)` (Manrope, sans-serif) and `var(--font-body)` (IBM Plex Serif). They have different x-heights and baselines, so **mixing them inside a single tabular layout** (a `<table>` or any grid/flex "row" pattern with aligned columns — `.channel-row`, `.bni-cheat-row`, `.s5-comparison-row`, `.transform-table`, etc.) makes the columns look misaligned even when the px sizes match.

Rule: every cell in the same table — header, label, value, name, description, sub-line — must use `var(--font-display)` (Manrope). Don't mix Manrope and IBM Plex Serif within one table. Body-font serif is fine for prose blocks (subtitles, paragraphs, quotes, conclusions); just keep it out of tabular layouts.

When adding or restyling a table, audit every `font-family` inside it — including nested cells like `.ai-desc strong`, `.cell-val .val-sub`, etc. — and pin them all to `var(--font-display)`.

## Standardized slide elements
Applies to **both `v3/` and `v4/`** (the active deck versions). Every slide must use the same four elements in the same place, with the same classes and styles. Do **not** restyle them inline or invent new class names — change the canonical rule in the version's `styles.css` if a global update is needed, and mirror the change to the other version unless the divergence is intentional.

DOM order inside `.slide` (top → bottom):
1. `.slide-number` — e.g. `<div class="slide-number">02 / 10</div>` (top-right, absolute)
2. `.slide-label` — eyebrow, e.g. `<div class="slide-label">The professionals</div>`
3. `.slide-title` — `<h2 class="slide-title">…</h2>`
4. *(slide-specific content)*
5. `.conclusion` — `<div class="conclusion">…</div>` (pinned to bottom via `margin-top: auto`)
6. `.sources` — `<div class="sources">Sources: …</div>` (last line, right-aligned)

Canonical styles live in `v3/styles.css` and `v4/styles.css` (line numbers match in both):
- `.slide-label` → lines 72–80 (Manrope 500, 13px, gold, uppercase, `letter-spacing: 0.16em`)
- `.slide-title` → lines 82–90 (Manrope 800, 42px, white, `letter-spacing: -0.02em`)
- `.conclusion` → lines 402–423 (Manrope 700, 24px, gold top border, `→` prefix via `::before`, `<strong>` is gold)
- `.sources` → lines 672–683 (Manrope 11px, `--gray-dark`, right-aligned, faint gold top border)
- Bottom-pinning: `.slide .conclusion { margin-top: auto }` and `.slide .sources { flex-shrink: 0 }` at lines 52–58

Rules:
- Always start the sources line with `Sources: ` (capital S, colon, space). Use `Source: ` only when there is genuinely one source.
- Use `<strong>` inside `.conclusion` for gold emphasis; don't add inline `style=` overrides.
- Per-slide tweaks (e.g. `.slide-title { margin-bottom: 28px }`) belong in a scoped `body[data-slide="slide-N"]` block in that slide's `<style>`, never as inline styles, and never changing color/font/size of the four standard elements.
- When adding a new slide, copy the structure from an existing slide in the same version (e.g. `v4/slide-3.html`) so the order and classes stay identical.

Never override at slide scope (these affect every slide and the bottom-docking depends on them):
- `.slide` flex-column layout and fixed height (`styles.css:40-50`) — changing `display`, `flex-direction`, or `height` breaks the bottom-pinning of `.conclusion` and `.sources`.
- `.slide .conclusion { margin-top: auto }` and `.slide .sources { flex-shrink: 0 }` (`styles.css:52-58`) — these are what pin the bottom two elements.
- `:root` CSS tokens (`styles.css:1-17`) — `--gold`, `--white`, `--gray-dark`, `--font-display`, `--font-body`, `--border`. Don't redeclare them inside a slide's scoped `<style>` block; it silently re-skins that slide and creates drift.

Don't overlap the docked elements:
- `.conclusion` is docked to the bottom with a 2px gold top border + 22px padding-top; `.sources` follows it with a 16px gap, a faint gold hairline, and 12px padding-top.
- Slide-specific content sits above the conclusion's gold rule. Don't let it visually cross or collide with `.conclusion` / `.sources` — if a slide's content runs long, shrink the content (font-size or spacing in the scoped `body[data-slide="slide-N"]` block), don't shrink the conclusion/sources or remove their top borders.
- Don't add `margin-bottom` to `.conclusion` or `margin-top` overrides to `.sources` at slide scope — it breaks the docked spacing.
