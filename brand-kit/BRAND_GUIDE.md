# Grounded Warriors — Brand Kit

Men's wilderness expeditions. Ontario, Canada.
Tone: capable, direct, adventure-forward. No wellness/therapy language.

## Logos (`/logos`)

| File | Use |
|---|---|
| gw-logo-light-256 | Primary logo for dark backgrounds (site header) |
| gw-logo-dark-512 | Logo for light backgrounds (print, invoices) |
| gw-logo-primary-256 | Full-color primary lockup |
| gw-logo-simplified-256 | Small sizes / low-detail contexts |
| gw-badge-400 | Badge / stamp mark (merch, watermarks) |
| gw-icon-180 / gw-icon-512 | Standalone icon mark |

Rules: keep clear space equal to the icon height around the logo; never stretch,
recolor, or place on busy photos without a dark overlay.

## Icons (`/icons`)

favicon.png, apple-touch-icon.png, icon-192.png, icon-512-maskable.png —
ready for web, PWA, and app-store use.

## Social (`/social`)

- gw-social-avatar-256 / 512 / 1024 — profile pictures (Instagram, X, etc.)
- opengraph.jpg — link-preview image (1200x630)

## Color Palette

| Name | Hex | HSL | Use |
|---|---|---|---|
| Night Forest | #0F1A14 | hsl(147 27% 8%) | Background |
| Deep Pine | #1E3328 | hsl(149 26% 16%) | Cards / surfaces |
| Birch | #C8B898 | hsl(40 30% 69%) | Primary / headings / logo tone |
| Forest Floor | #3E5B48 | hsl(141 19% 30%) | Secondary / accents |
| Sage | #91A691 | hsl(120 11% 61%) | Muted text |
| Ember Red | #7C1D1D | hsl(0 62% 30%) | Errors / destructive only |

Contrast: Birch on Night Forest passes WCAG AA for all text sizes.
Sage is for secondary text only — don't use it below 16px on Night Forest.

## Typography

- **Headings:** Cormorant Garamond (serif) — Google Fonts. Weight 500–600, generous letter-spacing on uppercase labels.
- **Body/UI:** Inter (sans-serif) — Google Fonts. Weight 400–600. Minimum 16px body.
- Uppercase + wide tracking (0.1em+) for small labels/eyebrows, in Birch.

## Voice

Capable. Direct. Grounded. Short sentences. Speak to men who want challenge, not comfort.

- Headline: "Cold water. Open fire. No excuses."
- CTA: "Reserve your spot"
- Error: "That didn't go through. Try again."
- Avoid: healing, journey, wellness, self-care, transformation-speak.

## Design tokens (`tokens.css`)

Drop-in CSS custom properties matching the live site.
