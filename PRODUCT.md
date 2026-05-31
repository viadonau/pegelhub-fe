# Product

## Register

product

## Users

viadonau operators monitoring Danube water levels at a desk during shifts. They sit in front of a real monitor, often for long stretches, switching between an overview of many supplier stations and a deep-dive into one station's measurement history. The interface is part of their working environment, not something they visit; it must be readable for hours, scannable at a glance, and unambiguous when something looks off.

## Product Purpose

PegelHub is an internal frontend for the viadonau water-gauge data hub. It loads runtime config, authenticates against Keycloak, and renders supplier stations and their measurements from the Core API. The job it does for the operator: surface what each station is currently reporting, let them drill into one station's history (chart + table), and stay out of the way while they're reading numbers.

The project is intentionally early-stage. Today's surfaces are login, supplier overview, and supplier detail. The product purpose has to support adding more (anomaly views, configuration, source management) without rewriting the shell each time.

## Brand Personality

Calm, trustworthy, official. The voice of a public waterway authority, not a startup. Quiet by default; the data is the point. No marketing energy, no exclamation, no "powered by AI" framing. Tone in copy is matter-of-fact and operational: labels say what they do, errors say what went wrong, empty states say what's missing.

The viadonau corporate identity already exists (Leitfarbe `#4691af`, Pendantfarbe `#003c50`, Auszeichnungsfarbe Cyan `#00a0e1`, plus secondary green and brown). Those colors carry the institutional feel; the UI's job is to use them with restraint, not redecorate them.

PegelHub has its own sub-brand identity nested under viadonau: a stylized water-gauge mark (Leitblau ruler with Pendant-navy tick marks and three wavy water lines) paired with a **serif wordmark** "pegel hub" set all-lowercase, stacked. The serif choice is intentional: it grounds PegelHub in the authority/civic-record register (think public record, instrument scale, hydrographic chart annotation) rather than the sans-serif tech-product look. The viadonau parent identity stays sans-serif; the PegelHub child surface is serif-led for display and brand moments, sans-serif for UI/data.

Source assets live in `Pegelhub_CSS_Farbschema_viadonau/` (`Pegelhub-rgb_cut2.png` for the PegelHub mark+wordmark, `viadonau_Web.png` for the parent wordmark). They need to be promoted into `public/` as the real logo, replacing the `PH` placeholder square in the toolbar.

## Anti-references

- **Typical AI-generated UI slop**: tinted near-white "cream" body backgrounds, gradient text, identical icon-heading-text card grids, tiny uppercase tracked eyebrows above every section, oversized rounded cards, decorative glassmorphism, hand-drawn / sketchy SVG illustrations, "actually X / not just Y" copy. None of it.
- **Generic SaaS dashboards**: purple-and-pink accents, hero metric tiles, marketing-shaped empty states. PegelHub is an operations tool, not a product launch.
- **Consumer / playful tooling**: no whimsical motion, no mascot, no celebratory micro-interactions on routine actions.
- **The flashy data-viz dashboard reflex**: dark-navy "command center" with neon cyan everywhere. Use the brand cyan as an accent for emphasis, not as the surface.

## Design Principles

1. **The data is the interface.** Numbers, station names, timestamps, and chart lines are the loudest things on screen. Chrome (toolbar, headings, kickers, cards) recedes so the operator's eye lands on the values first.
2. **Quiet over clever.** Calm spacing, restrained color, predictable layout. Surprise is a defect in an operations tool; the operator should feel the same shape on every screen.
3. **Brand-correct, not brand-loud.** Viadonau's Leitfarbe is the primary, used for actionable elements and key emphasis. The Pendant navy carries text and structure. Cyan is reserved for state and emphasis, not background. The palette is institutional, used at low intensity. The PegelHub serif wordmark and gauge mark are reserved for brand surfaces (toolbar, login, empty hero); inside data surfaces, sans-serif and tokens do the work.
4. **Designed for hours, not seconds.** Body contrast on the strict side of WCAG AA, line lengths capped, type scale calm. Nothing strobes, pulses, or animates without a reason.
5. **Built to grow.** The shell, page header, and `ph-*` UI primitives are the contract every new surface (anomalies, configuration, source management) plugs into. New screens conform to the existing rhythm; they don't redesign it.

## Accessibility & Inclusion

No formal requirement set yet. Working defaults until that's decided:

- WCAG AA contrast minimums for body text (≥4.5:1) and large text / UI (≥3:1), including muted/secondary copy.
- Full keyboard reachability for navigation, table rows, and detail entry; visible focus rings on every interactive element.
- `prefers-reduced-motion: reduce` honored on any animation introduced later.
- Color is never the only signal for state (loading / error / empty / value-out-of-range).
- German and English copy supported as the product grows; labels written so they survive translation length differences.

Revisit this section once a formal accessibility target is set.
