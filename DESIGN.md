---
name: PegelHub
description: Internal water-gauge data hub for viadonau operators
colors:
  leitblau: "#4691af"
  leitblau-deep: "#003c50"
  cyan-accent: "#00a0e1"
  green: "#007d69"
  green-accent: "#96be0f"
  brown: "#6e463c"
  ink: "#0b1820"
  surface-0: "#ffffff"
  surface-50: "#f6f8fa"
  surface-100: "#eef2f5"
  surface-200: "#dbe3e9"
  surface-600: "#5b6b75"
  surface-900: "#101820"
  state-error: "#b0231a"
  state-error-bg: "#fdecea"
typography:
  display:
    fontFamily: "'Source Serif 4', 'Source Serif Pro', 'PT Serif', Georgia, 'Times New Roman', serif"
    fontSize: "1.75rem"
    fontWeight: 600
    lineHeight: 1.15
    letterSpacing: "-0.005em"
  wordmark:
    fontFamily: "{typography.display.fontFamily}"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1
    letterSpacing: "0"
  title:
    fontFamily: "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "normal"
  body:
    fontFamily: "{typography.title.fontFamily}"
    fontSize: "0.9375rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
  label:
    fontFamily: "{typography.title.fontFamily}"
    fontSize: "0.8125rem"
    fontWeight: 500
    lineHeight: 1.35
    letterSpacing: "normal"
  kicker:
    fontFamily: "{typography.title.fontFamily}"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.04em"
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "normal"
rounded:
  sm: "4px"
  md: "8px"
  lg: "12px"
  pill: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "1rem"
  lg: "1.5rem"
  xl: "2rem"
components:
  app-shell:
    backgroundColor: "{colors.surface-50}"
    textColor: "{colors.surface-900}"
    padding: "2rem"
    width: "min(100%, 1180px)"
  brand-logo:
    backgroundColor: "transparent"
    textColor: "{colors.leitblau}"
    height: "2.25rem"
  brand-wordmark:
    typography: "{typography.wordmark}"
    textColor: "{colors.leitblau}"
  page-title:
    typography: "{typography.display}"
    textColor: "{colors.surface-900}"
  kicker:
    typography: "{typography.kicker}"
    textColor: "{colors.leitblau}"
  muted-text:
    typography: "{typography.body}"
    textColor: "{colors.surface-600}"
  button-primary:
    backgroundColor: "{colors.leitblau}"
    textColor: "{colors.surface-0}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.leitblau-deep}"
  button-secondary:
    backgroundColor: "{colors.surface-0}"
    textColor: "{colors.surface-900}"
    rounded: "{rounded.md}"
    padding: "0.5rem 1rem"
  table-row:
    backgroundColor: "{colors.surface-0}"
    textColor: "{colors.surface-900}"
    typography: "{typography.body}"
  table-row-hover:
    backgroundColor: "{colors.surface-100}"
  table-header:
    backgroundColor: "{colors.surface-50}"
    textColor: "{colors.surface-600}"
    typography: "{typography.label}"
  message-error:
    backgroundColor: "{colors.state-error-bg}"
    textColor: "{colors.state-error}"
    rounded: "{rounded.md}"
    padding: "0.75rem 1rem"
  chart-line-primary:
    backgroundColor: "{colors.leitblau}"
  chart-line-accent:
    backgroundColor: "{colors.cyan-accent}"
---

## Overview

PegelHub is an Angular 21 frontend for a public waterway authority (viadonau). Its job is to render water-gauge measurement data from the Core API to operators monitoring the Danube. The visual system is **operational, not editorial**: data first, chrome quiet, brand correct without being loud.

The aesthetic is institutional and calm. Two identity layers stack:

- **Parent (viadonau)**: a sans-serif corporate identity in Leitblau (`#4691af`), Pendant navy (`#003c50`), and Cyan (`#00a0e1`). All viadonau-branded surfaces obey this.
- **Child (PegelHub)**: a serif-led sub-brand. The PegelHub wordmark "pegel hub" is set in a classical humanist serif, all-lowercase, stacked next to a stylized water-gauge mark (Leitblau ruler, Pendant tick marks, three Pendant water lines). The serif grounds PegelHub in the authority / civic-record register: instrument scale, hydrographic chart, public record. Inside the application, **serif is reserved for the wordmark and page-title display moments**; UI, data, tables, charts, forms, and labels stay sans-serif (Inter or equivalent).

**Stack today**: PrimeNG with the **Viadonau preset** (`src/app/core/theme/viadonau.preset.ts`, built on Aura via `definePreset`; light + dark colour schemes wired but only light is used). Self-hosted variable fonts via `@fontsource-variable/source-sans-3` and `@fontsource-variable/source-serif-4`, registered in `angular.json` `styles[]` so no `@import` deprecation warnings. Tailwind v4 with `tailwindcss-primeui` so Tailwind utilities resolve against the runtime PrimeNG `--p-*` tokens. Chart.js renders the line chart on the supplier detail route.

**Shipped**:
1. **Custom PrimeNG preset** with two primitive ramps generated in OKLCH:
   - `leitblau` (50–950): `500` anchored to `#4691af`. Fed into `semantic.primary`.
   - `pendant` (0–950): `800` anchored to `#003c50`. Fed into `semantic.colorScheme.light.surface` so the entire neutral chrome carries the brand hue at `chroma 0.005–0.04`.
   - `cyanAccent.500 = #00a0e1` reserved for opt-in spotlight use; not wired into a semantic token by default.
2. **Type system**: Source Serif 4 Variable for the `display` role (`.ph-title`); Source Sans 3 Variable for everything else (body, table, label, kicker). `font-feature-settings: "ss02", "cv05"` on `<html>` selects Source Sans 3's stylistic alternates for clearer numerals + lowercase `g`.
3. **Real PegelHub logo** at `public/brand/pegelhub-logo.png` (downsized to 800px wide, 81 KB), rendered in the toolbar via `<img class="ph-brand-logo">` and wrapped in a `routerLink="/"` anchor. The `PH` placeholder square is gone.
4. **AA contrast trade-off**: `colorScheme.light.primary.color` resolves to `{primary.600}` (≈4.6:1 on white) instead of brand `500` (3.36:1) so primary-action button labels and primary-coloured copy meet WCAG AA. The literal Leitblau hex remains available as `{primary.500}` for non-text accents (logo, chart strokes).

**Not in this system** (anti-references, see PRODUCT.md): tinted near-white "cream" body backgrounds, gradient text, identical icon-card grids, all-caps tracked eyebrows above every section, oversized rounded cards (>16px on cards), decorative glassmorphism, hand-drawn SVG, generic SaaS purple/pink, dark "command center" navy with neon cyan everywhere.

## Colors

The palette is **restrained**: surface neutrals dominate, the brand Leitblau carries primary action and key emphasis, the brand Cyan is a sparing accent reserved for state and emphasis (never a background fill).

**Primary (viadonau Leitfarbe)** · `#4691af`
A muted mid-tone water blue. Used for: the brand mark fill, primary button backgrounds, the page kicker, focused link color, the primary chart line. It is not used as a body background.

**Pendant (viadonau Pendantfarbe)** · `#003c50`
A near-black deep navy with blue-green undertone. Used for: ink-heavy emphasis (titles where the default `surface-900` is not enough), primary-button hover, deep chart fills.

**Accent Cyan (viadonau Auszeichnungsfarbe)** · `#00a0e1`
A bright, saturated cyan. Used for: a secondary chart line, "current value" emphasis on a single tile, focus highlights on data rows. Never as a section background. Treat as a spotlight, not a wash.

**Secondary green** · `#007d69` and `#96be0f`
Reserved for "ok / within range" semantic state in measurements and badges. Not a UI accent.

**Brown** · `#6e463c`
Reserved for status that needs to feel non-alarming but distinct from green/cyan (e.g. "stale data", "manual entry"). Used very rarely.

**Neutrals**
- `surface-0` `#ffffff` — card / table / dialog surfaces.
- `surface-50` `#f6f8fa` — page background, table-header band.
- `surface-100` `#eef2f5` — table-row hover, subtle dividers.
- `surface-200` `#dbe3e9` — borders.
- `surface-600` `#5b6b75` — muted body / secondary copy. Hits ≥4.5:1 against `surface-0` and `surface-50`.
- `surface-900` `#101820` — body ink.
- `ink` `#0b1820` — display ink for tightest emphasis.

**State**
- `state-error` `#b0231a` on `state-error-bg` `#fdecea` — the bootstrap error and message-error wrapper. AA-compliant pair.

**Color strategy**: *Restrained*. One primary (Leitblau) carries actionable elements; everything else is tinted neutrals. The full viadonau palette exists for semantic state, not decoration.

## Typography

A **serif + sans pair**, with a strict scope split: serif carries identity and display moments; sans carries everything operational.

- **Display (serif)** — `1.75rem / 600 / 1.15`. Reserved for: the page title on brand-leading surfaces (login hero, future marketing-leaning empty states), and the largest H1 inside data surfaces when the page deserves a brand cue. Stack: Source Serif 4 (candidate; finalize in shape step), PT Serif, Georgia fallback.
- **Wordmark (serif)** — `1.25rem / 600 / lowercase`. The "pegel hub" lockup in the toolbar. Pairs with the gauge mark.
- **Title (sans)** — `1.125rem / 600`. Section titles (`ph-section-title`), card headings, dialog headings.
- **Body (sans)** — `0.9375rem / 400 / 1.5`. Default copy, table cells, chart labels.
- **Label (sans)** — `0.8125rem / 500`. Buttons, tags, table headers.
- **Kicker (sans)** — `0.75rem / 700 / uppercase / 0.04em tracking`. Used **once per page**, above the page title (`ph-kicker`). Not above every section.
- **Mono** — system mono, `0.875rem / 500`. Reserved for raw measurement values, station codes, timestamps where alignment matters.

**Sans family** is currently Inter (already loaded via Tailwind theme). Source Sans 3 is an alternate that pairs more naturally with Source Serif 4; pick one in the shape step.

**Rules**:
- Serif is a brand signal, not a body voice. Body copy, table cells, form labels, button labels, and chart annotations are always sans. A serif paragraph in a data table reads as a typesetting accident.
- Body line length capped at 65–75ch. Long-form copy is rare in this product; data tables are the dense surface.
- Body contrast ≥4.5:1 against any background (including `surface-50`); muted body (`surface-600`) verified against both `surface-0` and `surface-50`.
- No all-caps body copy. Uppercase reserved for the kicker and short labels (≤4 words).
- Numbers in tables and charts: tabular-nums where supported, mono fallback when alignment is critical.
- Wordmark is **rendered as an image** (the existing PNG, ideally exported to SVG) in the toolbar, not as live text. The serif font load is reserved for Display headings.

## Elevation

**Flat with tonal layering, not shadows.** Surfaces are distinguished by neutral steps (`surface-0` over `surface-50`) and 1px borders (`surface-200`), not drop shadows. The product reads as a flat operations console; soft drop shadows are an editorial flourish that doesn't fit the register.

Two exceptions:
- **Modal / dialog** (when introduced): a single defined shadow (`0 8px 24px rgba(11, 24, 32, 0.12)`), no border. Modals are events; flat surfaces are the norm.
- **Sticky toolbar** (when introduced): a 1px bottom border on `surface-200` to anchor it, not a shadow.

**Forbidden**: pairing a 1px border AND a soft wide drop shadow on the same element (the "ghost-card" pattern). Pick one.

## Components

### App shell (`ph-app-shell` + `ph-toolbar`)
Top toolbar with brand on the left (`PH` mark + "PegelHub" wordmark), user identity + logout on the right. Main content centered at `min(100%, 1180px)` with `2rem` padding (collapses to `1.25rem` below `40rem`). Background `surface-50`.

### Brand mark + wordmark (`ph-brand` + `ph-brand-logo`)
Anchor of the toolbar. Source asset: `public/brand/pegelhub-logo.png` (800px wide, ~81 KB, downsized from the original 2664×1965 viadonau-supplied raster). Composition:
- A stylized water-gauge ruler in Leitblau on the left, with three Pendant-navy horizontal tick marks across it, and two Pendant-navy wavy water lines crossing the lower portion.
- The serif wordmark "pegel hub" set in a classical humanist serif (visually consistent with Source Serif 4), all-lowercase, stacked: `pegel` riding the top of the gauge, `hub` sitting below the water lines. Rendered as part of the image, **not** assembled from live `<text>` glyphs.
- Toolbar height: `2.5rem` desktop, collapses to `2rem` below 40rem. `width: auto` preserves the gauge-and-wordmark ratio.
- The whole lockup is wrapped in `<a routerLink="/">` so clicking the logo always returns to the overview, the standard product convention.
- **Pending**: SVG export. The current PNG is fine at retina, but an SVG would scale crisply, halve the byte cost, and let dark-mode recolour the gauge + wordmark via `currentColor`. The trace requires either viadonau's original vector source or a careful manual rebuild keyed to Source Serif 4.

### Page header (`ph-page-header`, `ph-page-heading`)
Stacks vertically below 40rem; horizontal flex (heading left, actions right) above. Heading block: optional kicker (Leitblau, uppercase, `0.04em` tracking) + page title + optional muted subtitle.

### Buttons (`ph-button`)
Wrapper around PrimeNG's button. Two real variants:
- **Primary** — Leitblau bg, white text, `rounded.md`, `0.5rem 1rem` padding, label typography. Hover: Pendantfarbe bg.
- **Secondary** — `surface-0` bg, `surface-900` text, 1px `surface-200` border, same padding and rounding.

Buttons never carry `border-radius` greater than `12px`. No "pill" cards; pill rounding is reserved for tags and toggles.

### Tables (`ph-table`)
Default density. Header band on `surface-50` with `surface-600 / 500` label-typography column titles. Rows on `surface-0`, `0.625rem 1rem` cell padding, 1px `surface-200` row separator. Hover: `surface-100`. Selected: 1px Leitblau left indicator (the only place a single-side colored border is permitted, because it indicates state, not decoration). No zebra striping.

### Messages (`ph-message`)
Used for inline errors and empties. `state-error-bg` background with `state-error` text + icon for errors. Empty / informational variants use `surface-100` background with `surface-900` text and a `surface-600` body line.

### Loading (`ph-loading`)
Inline spinner + label, centered in the surface area it replaces. No skeleton shimmer at this stage; the data sets are small and the perceived-speed tradeoff isn't worth the additional motion.

### Charts (`ph-line-chart`)
Chart.js wrapper. Primary line in Leitblau (2px stroke); accent / secondary line in Cyan when a second series is shown. Grid lines at 1px `surface-200`; axis labels at body typography in `surface-600`. No fill under the line by default; a Pendant-tinted fill (10% opacity) is allowed on the primary series when the chart is the only thing on the page.

### Toolbar slots (`ph-toolbar`)
`ph-toolbar-start` (brand) and `ph-toolbar-end` (actions, identity). Toolbar height tuned to the brand mark size (2.5rem internal) so the eye holds a single horizontal axis across the whole shell.

## Do's and Don'ts

**Do**
- Use Leitblau for primary action and key emphasis; Cyan as a spotlight only.
- Compose new screens from `ph-page`, `ph-page-header`, and the existing `ph-*` UI primitives. Add new primitives only when an existing one cannot be styled into the new use.
- Verify body contrast against the actual background (`surface-50` for the page body, not `surface-0`); muted gray on tinted near-white is the most common contrast failure.
- Cap card / surface rounding at `rounded.lg` (12px). Pill (`9999px`) is for tags and toggles.
- Pair flexbox for 1D layouts and grid for 2D; default to `repeat(auto-fit, minmax(280px, 1fr))` for responsive tile rows without breakpoints.
- Use `text-wrap: balance` on h1–h3 and `text-wrap: pretty` on long muted descriptions.

**Don't**
- Don't gradient-fill text. Single solid color for headings.
- Don't add a tiny uppercase tracked eyebrow above every section. The kicker appears **once per page**, above the page title.
- Don't use numbered section markers (`01 / 02 / 03`) as scaffolding. Numbers earn their place only when the section actually IS a sequence.
- Don't pair 1px borders with soft drop shadows on the same element.
- Don't use side-stripe `border-left` greater than 1px as decoration. The Leitblau row indicator on a selected table row is state, not decoration; that's the only exception.
- Don't introduce a third typeface. One Inter, in five roles, with weight contrast doing the work.
- Don't use Cyan as a section background. It's a spotlight, not a wash.
- Don't ship hand-drawn / sketchy SVG illustrations. If the scene can't be rendered with real assets, ship no illustration.
- Don't write marketing copy. Labels are verb + object ("Open station", "Sign out"); errors say what went wrong; empties say what's missing.
- Don't animate without a reason; honor `prefers-reduced-motion: reduce` whenever motion is added.
