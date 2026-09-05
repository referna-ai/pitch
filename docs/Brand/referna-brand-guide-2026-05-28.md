# Referna — Brand & Design System

*Updated: June 14, 2026 — v3.8 (lockup usage corrected: gold-on-black is primary for light surfaces; black-on-white is monochrome fallback only)*

> Dark luxury: Black + Gold + White. Premium relationship intelligence for professionals.

> **Note:** Single source of truth. Asset files live in `logo-glyphs/output/final/`. Inline SVGs render in GitHub/Notion.

---

## Brand Name & Domain

| | |
|---|---|
| **Product name** | Referna |
| **Spelling** | Always `referna` in the wordmark glyph; `Referna` in prose |
| **Domain** | referna.com |
| **Previous name** | InTouch (retired) |

---

## Color Palette

Two brand colors plus neutrals. Bronze Gold is accent — never backgrounds.

### Primary

| Token | Hex | Use |
|-------|-----|-----|
| `--black` | `#0D0D0D` | Primary text, icon container on light surfaces |
| `--gold` | `#D4A574` | Accent, CTAs, icon letterforms on dark/black containers |

### Neutrals

| Token | Hex | Use |
|-------|-----|-----|
| `--white` | `#FFFFFF` | Backgrounds, reversed text, icon container on dark surfaces |
| `--gray-100` | `#F5F5F5` | Page backgrounds, subtle cards |
| `--gray` | `#D1D1D1` | Borders, dividers |
| `--gray-mid` | `#999999` | Placeholder, whisper text, disabled |
| `--gray-dark` | `#737373` | Secondary text, captions |
| `--gray-700` | `#404040` | Body text on light backgrounds |
| `--black-mid` | `#111111` | Card surfaces on dark backgrounds |
| `--black-soft` | `#1A1A1A` | Elevated surfaces on dark backgrounds |

### Status Colors (functional only)

| Token | Hex | Use |
|-------|-----|-----|
| `--success` | `#7BC47F` | Confirmations, connected states |
| `--error` | `#D4645C` | Errors, destructive actions |

### CSS Variables — Complete `:root`

```css
:root {
  --black: #0D0D0D;
  --gold: #D4A574;
  --white: #FFFFFF;
  --gray-100: #F5F5F5;
  --gray: #D1D1D1;
  --gray-mid: #999999;
  --gray-dark: #737373;
  --gray-700: #404040;
  --black-soft: #1A1A1A;
  --black-mid: #111111;
  --success: #7BC47F;
  --error: #D4645C;
  --border: rgba(212, 165, 116, 0.25);
  --font-display: 'Manrope', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-body: 'IBM Plex Serif', Georgia, serif;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 16px;
  --shadow-dropdown: 0 4px 16px rgba(0, 0, 0, 0.45);
}
```

---

## Typography

### Fonts

| Role | Font | Weights |
|------|------|---------|
| Display, headlines, UI, buttons | Manrope | 400, 500, 600, 700, 800 |
| Body, long-form | IBM Plex Serif | 400, 600 |
| Wordmark glyph | IBM Plex Serif italic | 500 italic |

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=IBM+Plex+Serif:ital,wght@0,400;0,600;1,500&family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
```

### Type Scale

| Element | Font | Weight | Size |
|---------|------|--------|------|
| Logo wordmark | Manrope Bold | 700 | SVG asset — see Logo System |
| Display / hero | Manrope | 800 | 48–64px |
| H1 | Manrope | 700 | 36–48px |
| H2 | Manrope | 700 | 28–32px |
| H3 | Manrope | 600 | 22–24px |
| Body | IBM Plex Serif | 400 | 16–18px, line-height: 1.6 |
| Buttons | Manrope | 600–700 | 14–16px |
| Labels / captions | Manrope | 500–600 | 12–14px |
| Badge text | Manrope | 700 | 11px, letter-spacing: 0.08em, uppercase |

---

## Shape Language

Five shapes. **Shape encodes hierarchy, not decoration.** One shape per role, and the
leaf is reserved for the single most important element on a surface.

The **leaf** is the only brand-owned shape: top-left and bottom-right rounded,
top-right and bottom-left square. It carries the same 180° rotational symmetry as the
symmetric f in the mark, and matches the favicon and square-icon corner treatment.
That is why it means something — and why it stops meaning anything if used everywhere.

### Tokens

| Token | Value | Use |
|-------|-------|-----|
| `--leaf-sm` | `10px 0 10px 0` | Primary action, portrait frames, controls up to ~64px |
| `--leaf-lg` | `18px 0 18px 0` | The one hero container that is the point of the page |
| `--radius-sm` | `4px` | Tiny chips, inline code, progress bars |
| `--radius-md` | `8px` | Every non-primary button, inputs, nested surfaces, tooltips |
| `--radius-lg` | `16px` | Modals, panels, standard and repeated cards |
| `--radius-pill` | `9999px` | Badges, tags, counts, segmented selectors — state only |
| `--radius-circle` | `50%` | Circular avatars, toggle thumbs, round icon buttons |
| (literal) | `0` | Full-bleed sections, table rows, edge-to-edge bars |

### When to use what

| Role | Shape |
|------|-------|
| Primary action — one per view, gold fill | `--leaf-sm` |
| Secondary, ghost, destructive, modal submit, icon button | `--radius-md` |
| Badge, tag, chip, count, status, toggle track, segmented selector | `--radius-pill` |
| Hero container — the one card that is the point of the page | `--leaf-lg` |
| Modal, dialog, panel, repeated card in a list | `--radius-lg` |
| Surface nested inside a card, input, textarea, tooltip, dropdown | `--radius-md` |
| Avatar / portrait frame, square-ish (40–96px) | `--leaf-sm` |
| Avatar, circular | `--radius-circle` |

### Hard rules

1. **At most one leaf per visual group — a leaf never nests inside a leaf.**
   Leaf card with a rounded button, or rounded card with a leaf button. Never both.
   Portrait frames are content rather than actions, so a `--leaf-sm` avatar may sit
   inside a `--radius-lg` card — but not inside a `--leaf-lg` card.
2. **The pill is never a commit action.** Anything that submits, sends, navigates, or
   opens is `--radius-md`, or `--leaf-sm` when it is the primary action. Segmented
   selectors and filter chips stay pills because they express selection state.
   (Exception: items inside a segmented nav bar match their neighbours — a single
   rounded button in a row of pills reads as broken.)
3. **Leaf orientation is fixed** at top-left and bottom-right rounded. It is never
   mirrored for Hebrew or any RTL surface, for the same reason the logo is not mirrored.
4. **No raw `border-radius` literals** outside `public/brand.css`. Enforced in CI by
   `npm run check:radius`.
5. One-sided radii such as `0 8px 8px 0` are the **attached-edge family** — an element
   butted against another. Not a shape choice, and out of scope for these rules.

### Bars, dialogs, and third-party controls

These sit outside the page-content rules above and were the source of the first
round of mistakes.

| Surface | Shape |
|---------|-------|
| Global top bar container | `0` (full-bleed) |
| Top bar items, including sign-out | `--radius-pill` |
| Cookie notice, toast, or any full-width bar we build | container `0`, buttons `--radius-md` |
| Centred dialog or modal | `--radius-lg` |
| Third-party branded control (Google Sign-In) | the third party's own spec |

6. **The top bar is one segmented group.** Every item in it is a pill, including
   sign-out. A single rounded button in a row of pills reads as broken, so
   sign-out matches its neighbours rather than following the commit-action rule.
7. **A full-width bar follows the ordinary button rule.** The cookie notice on
   the homepage is our own component, not browser chrome. Its buttons commit an
   action, so rule 2 already covers them: `--radius-md`, not a pill. They are
   not a leaf either, because the leaf marks the one primary action of the view
   and that is the page's own CTA, not the consent prompt.
8. **A centred dialog is never a leaf.** A dialog is a symmetric object floating
   on its own; an asymmetric corner treatment on it reads as a rendering bug
   rather than a deliberate mark. Dialogs and modals are `--radius-lg`.
9. **Gold fill marks the primary action, and that is how it is checked.** When a
   page has exactly one gold-filled control, it is the primary action and takes
   `--leaf-sm`. When a page has several, they are section-level actions, not the
   page primary, and they all stay `--radius-md` - otherwise "one leaf per view"
   breaks.
10. **Third-party branded controls are exempt.** The Google Sign-In button follows
    Google's button specification, not ours. Do not restyle it to our scale.

### Verifying a change

Two checks, and they answer different questions:

- `npm run check:radius` - static. Proves no raw `border-radius` literal exists
  outside `public/brand.css`. Runs in CI.
- `npm run check:shapes <url> ...` - runtime. Classifies every visible element by
  the role it actually plays in the DOM and proves the *right* token is used.
  This is the only check that catches a card wearing the button radius, a pill on
  a commit action, or a leaf inside a leaf. It needs a running server, so it
  cannot run in CI - run it against local dev before marking a PR ready.
- `npm run check:colors [<path> ...]` - static, the colour equivalent of
  check:radius. Fails on a hex/rgb literal whose (r,g,b) doesn't match any real
  token in this file - `rgba(212,165,116,0.08)` is a legitimate custom-opacity
  wash of `--gold` and passes, `#f6d3a5` is an invented "lighter gold" and
  fails. Not CI-gated: a pre-existing site-wide backlog of non-shape colour
  literals exists, so scope it to the files a diff actually touches rather than
  the whole tree, e.g. `npm run check:colors public/onboarding/index.html`.

A text grep cannot do the second one: role only exists at runtime.

A page with internal states (a wizard, tabs, steps) has more than one shape to
check - a single load only audits whichever state happened to render. Sweep
every reachable state explicitly (a query param, a click sequence), not just
the one a fresh page load lands on. `npm run check:shapes:onboarding <base-url>`
does this for `/onboarding/`'s 10 steps.

Tokens live in `public/brand.css` (Gordy), mirrored byte-identically into
`live-meeting-agent/public/brand.css` and `pitch/shared/brand.css`.
Live reference: [/mockups/shapes/](https://referna.com/mockups/shapes/)

---

## Box Shadow

```css
--shadow-dropdown: 0 4px 16px rgba(0, 0, 0, 0.45);
```

---

## Button Styles

### Primary CTA (Solid Gold)

```css
.btn-primary {
  background: var(--gold);
  color: var(--black);
  border: none;
  border-radius: var(--leaf-sm);
  padding: 16px 32px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 16px;
  transition: opacity 0.2s;
}
.btn-primary:hover { opacity: 0.9; }
```

### Secondary (Gold Outline)

```css
.btn-secondary {
  background: transparent;
  color: var(--gold);
  border: 2px solid var(--gold);
  border-radius: var(--radius-md);
  padding: 14px 30px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 16px;
}
.btn-secondary:hover { background: var(--gold); color: var(--black); }
```

### Badge / Pill

```css
.btn-badge {
  background: transparent;
  color: var(--gold);
  border: 2px solid var(--gold);
  border-radius: var(--radius-pill);
  padding: 10px 20px;
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
```

---

## Logo System

### Overview

Three logo forms, all with **transparent backgrounds**:

1. **Lockup** *(primary)* — icon box left + `referna` wordmark right. Use wherever the brand needs to be readable: nav bars, headers, email footers, presentations.
2. **Square icon** — icon box with the symmetric f inside; `referna` label floats below on transparent background. Use for app icons, social profile pictures, and compact branded placements.
3. **Favicon** — icon box with f only, no label. Use for browser tabs and 16–48px contexts.

The standalone wordmark (`referna` text without the icon) is **retired** — do not use in new work.

### The Icon Box

The container is a square with **rounded top-left + bottom-right corners** and **sharp (90°) top-right + bottom-left corners**, reflecting the rotational symmetry of the f mark.

### Color Variants

All assets are transparent-background SVGs. Three variants — choose by surface color.

| Variant | Box fill | f (inside box) | Wordmark / label | Surface |
|---------|----------|----------------|-----------------|---------|
| Gold on black *(primary)* | `#0D0D0D` | `#D4A574` | `#0D0D0D` | Light / white — default choice |
| White on black | `#FFFFFF` | `#0D0D0D` | `#FFFFFF` | Dark / black |
| Black on white *(monochrome)* | `#0D0D0D` | `#FFFFFF` | `#0D0D0D` | Light / white — only when monochrome required |

**Gold is only used for the f letterform inside a dark box — never as a box fill or background.**

### Asset Files

All files in `logo-glyphs/output/final/`:

| File | Format | Description |
|------|--------|-------------|
| `lockup-black-on-white.svg/png` | Wide, transparent | Lockup — black box, white f, black wordmark |
| `lockup-white-on-black.svg/png` | Wide, transparent | Lockup — white box, black f, white wordmark |
| `lockup-gold-on-black.svg/png` | Wide, transparent | Lockup — black box, gold f, black wordmark |
| `icon-black-on-white.svg/png` | Square + label, transparent | Icon — black box, white f, black label |
| `icon-white-on-black.svg/png` | Square + label, transparent | Icon — white box, black f, white label |
| `icon-gold-on-black.svg/png` | Square + label, transparent | Icon — black box, gold f, black label |
| `favicon-black-on-white.svg` + PNGs | 16–512px | Favicon — black box, white f; same TL+BR rx=8, TR+BL sharp corners as icon |
| `favicon-gold-on-black.svg` + PNGs | 16–512px | Favicon — black box, gold f; same TL+BR rx=8, TR+BL sharp corners as icon |
| `favicon.ico` | ICO | Gold-on-black, 16/32/48 frames |

*Standalone wordmark files (`wordmark-*.svg/png`) are archived — do not use.*

### Visual Showcase — Lockup (Primary)

<table style="width:100%; border-collapse:collapse; margin:16px 0;">
<tr>
<td style="padding:24px; background:#FFFFFF; border:1px solid #D1D1D1; border-radius:8px; text-align:center;">
<img src="logo-glyphs/output/final/lockup-black-on-white.png" height="40" alt="lockup black on white">
<div style="margin-top:8px; font-family:'Manrope',sans-serif; font-size:10px; color:#737373; text-transform:uppercase; letter-spacing:0.08em;">Black on white</div>
</td>
<td style="padding:24px; background:#0D0D0D; border-radius:8px; text-align:center;">
<img src="logo-glyphs/output/final/lockup-white-on-black.png" height="40" alt="lockup white on black">
<div style="margin-top:8px; font-family:'Manrope',sans-serif; font-size:10px; color:#999; text-transform:uppercase; letter-spacing:0.08em;">White on black</div>
</td>
<td style="padding:24px; background:#FFFFFF; border:1px solid #D1D1D1; border-radius:8px; text-align:center;">
<img src="logo-glyphs/output/final/lockup-gold-on-black.png" height="40" alt="lockup gold on black">
<div style="margin-top:8px; font-family:'Manrope',sans-serif; font-size:10px; color:#737373; text-transform:uppercase; letter-spacing:0.08em;">Gold on black</div>
</td>
</tr>
</table>

### Visual Showcase — Square Icon

<table style="width:100%; border-collapse:collapse; margin:16px 0;">
<tr>
<td style="padding:24px; background:#FFFFFF; border:1px solid #D1D1D1; border-radius:8px; text-align:center;">
<img src="logo-glyphs/output/final/icon-black-on-white.png" height="96" alt="icon black on white">
<div style="margin-top:8px; font-family:'Manrope',sans-serif; font-size:10px; color:#737373; text-transform:uppercase; letter-spacing:0.08em;">Black on white</div>
</td>
<td style="padding:24px; background:#0D0D0D; border-radius:8px; text-align:center;">
<img src="logo-glyphs/output/final/icon-white-on-black.png" height="96" alt="icon white on black">
<div style="margin-top:8px; font-family:'Manrope',sans-serif; font-size:10px; color:#999; text-transform:uppercase; letter-spacing:0.08em;">White on black</div>
</td>
<td style="padding:24px; background:#FFFFFF; border:1px solid #D1D1D1; border-radius:8px; text-align:center;">
<img src="logo-glyphs/output/final/icon-gold-on-black.png" height="96" alt="icon gold on black">
<div style="margin-top:8px; font-family:'Manrope',sans-serif; font-size:10px; color:#737373; text-transform:uppercase; letter-spacing:0.08em;">Gold on black</div>
</td>
</tr>
</table>

### Mark Specs

| Property | Value |
|----------|-------|
| Icon viewBox | 0 0 58 58 (square, transparent) |
| Icon container | 40×40, TL+BR rx=8, TR+BL sharp; centred in viewBox |
| Favicon container | same corner geometry as icon (TL+BR rx=8, TR+BL sharp); 48×48 viewBox |
| Lockup font | Manrope Bold 700 |
| Wordmark letter order | r · e · f(custom) · e · r · n · a |
| Minimum icon display size | 24px |
| Clear space | 1× icon height on all sides |

### Custom Symmetric f

The f glyph has 180° rotational symmetry — identical when rotated about its center point. Source files:

```
logo-glyphs/output/f_symmetric_bold.svg    ← bold variant (used in all assets)
logo-glyphs/output/f_symmetric.svg         ← regular weight reference
logo-glyphs/export_final.py                ← regeneration script
```

The bold f uses **Approach B**: squish horizontally by 0.5× → apply pyclipper offset delta=14 → unsquish by 2×. This gives heavier vertical stems relative to the crossbar, matching Manrope Bold's stroke contrast, with no seams.

Do not hand-edit the path. Regenerate by running `export_final.py`.

In the wordmark, the f crossbar is vertically aligned with the e crossbar (font y≈565) and the f protrudes equally above and below the other letters.

### Usage

```html
<!-- Light surface (primary) -->
<img src="lockup-gold-on-black.svg" height="32" alt="Referna">

<!-- Dark surface -->
<img src="lockup-white-on-black.svg" height="32" alt="Referna">

<!-- Light surface, monochrome only (print, brand restrictions) -->
<img src="lockup-black-on-white.svg" height="32" alt="Referna">
```

---

## Layout

### Hero Section Padding

```css
.hero { padding: 4rem 2rem 6rem; }
```

Asymmetric vertical padding is intentional — do not make it symmetric.

---

## Decorative Accents

| Element | Style |
|---------|-------|
| Left border accent | `border-left: 2px solid var(--gold)` |

---

## Email-Specific Notes

### Visual Style

Emails use a **light background** (avoids dark-mode inversion in Gmail/Apple Mail).

- Background: `#F5F5F5`
- Body text: `#404040`
- Secondary text: `#737373`
- CTA: `#D4A574` background, `#0D0D0D` text
- Logo in email: use `lockup-gold-on-black.png` (PNG for email client compatibility)
- Headings: `#0D0D0D`

### Email Color Map

| Token | Hardcoded |
|-------|-----------|
| `--black` | `#0D0D0D` |
| `--gold` | `#D4A574` |
| `--gray-dark` | `#737373` |
| `--gray-700` | `#404040` |
| `--gray-100` | `#F5F5F5` |
| `--success` | `#7BC47F` |
| `--error` | `#D4645C` |

### Cross-Platform Font Support

| Platform | Manrope | IBM Plex Serif | Action |
|---|---|---|---|
| Web | ✅ Google Fonts | ✅ Google Fonts | None |
| Email | ⚠️ System fallback | ⚠️ Georgia fallback | Use PNG logo |
| Google Docs/Slides | ✅ "More fonts" | ✅ "More fonts" | Manual add |
| PowerPoint | ❌ | ❌ | Export to PDF |

---

## Do's and Don'ts

### ✅ DO

- Use CSS variables — no hardcoded hex
- Use the SVG/PNG assets from `logo-glyphs/output/final/`
- Use the **lockup** as the primary logo form in all contexts
- Use the **square icon** for compact / app-icon placements
- Use gold only for the f letterform inside a dark box — never as a fill
- Test all three color variants in context
- Keep clear space of 1× icon height on all sides

### ❌ DON'T

- Use the standalone wordmark (`wordmark-*.svg/png`) — it is retired
- Recreate the f mark from text characters
- Use gold as a box fill or background
- Use gold letterforms on white/light containers
- Mix color roles (e.g. gold box, gold f)
- Load fonts beyond Manrope + IBM Plex Serif (+ Roboto for Google button)
- Hardcode hex values — use CSS variables

---

*Last updated: June 14, 2026*
*Version: 3.8 — Lockup usage corrected: gold-on-black is the primary logo for light surfaces; black-on-white is monochrome fallback only (print, strict brand restrictions). White-on-black for dark surfaces unchanged.*
