# Linear-Adapted Redesign Delivery

## Code System
- Stack remains static: `index.html`, `styles.css`, `script.js`, `.nojekyll`, and `assets/`.
- The design system now centers on semantic CSS tokens for:
  - background layers
  - surfaces
  - text
  - accent
  - borders
  - radii
  - spacing
  - shadows
  - motion and easing
- Reusable HTML/CSS primitives should stay aligned around:
  - `surface`
  - `surface-interactive`
  - `section-header`
  - `button-primary`
  - `button-secondary`
  - `button-ghost`
  - `lang-switch`
  - `project-card`
  - `note-card`
  - `contact-card`

## Interaction Contract
- Keep `data-set-lang` as the bilingual source of truth.
- Use the following behavior hooks consistently:
  - `data-nav-toggle`
  - `data-mobile-menu`
  - `data-parallax-hero`
  - `data-reveal`
  - `data-spotlight`
- `script.js` owns:
  - language persistence
  - mobile menu state
  - reveal-on-scroll
  - hero parallax
  - spotlight cursor tracking
- `prefers-reduced-motion` must disable or simplify nonessential animation.

## Homepage Mapping
- Hero: cinematic two-column composition with restrained gradient type, glass surfaces, and current-direction panel.
- Research: disciplined three-card grid with no inflated academic claims.
- Build: asymmetric bento layout with `ai-visibility-auditor` as the featured repository.
- Notes: three-card system with one featured note stream and two secondary cards.
- About / Contact: split identity panel and public-entry card with GitHub as the only contact path.

## Figma Handoff
- This session did not expose a Figma write endpoint, so this section is the implementation-ready handoff for later Figma creation.
- Figma file structure:
  - `Cover`
  - `Foundations`
  - `Components`
  - `Homepage`
- Foundations should mirror CSS token names exactly:
  - `--color-bg-deep`
  - `--color-bg-base`
  - `--color-bg-elevated`
  - `--color-surface`
  - `--color-surface-hover`
  - `--color-text-primary`
  - `--color-text-muted`
  - `--color-text-subtle`
  - `--color-accent`
  - `--color-accent-bright`
  - `--color-border-default`
  - `--color-border-hover`
  - `--shadow-card`
  - `--shadow-card-hover`
  - `--shadow-accent`
  - `--ease-expo-out`
- Components page should include:
  - header / desktop nav
  - mobile menu
  - primary / secondary / ghost buttons
  - language toggle
  - section header block
  - hero panel
  - base surface shell
  - featured repo card
  - standard repo card
  - featured note card
  - standard note card
  - contact card
- Homepage page should include frames for:
  - desktop `1440`
  - tablet `1024`
  - mobile `390`

## QA Checklist
- No horizontal overflow at `1440`, `1024`, `768`, and `390`.
- Language toggle persists after reload.
- Mobile menu exposes correct `aria-expanded` state and closes via Escape and link click.
- Hero, Research, Build, Notes, and About / Contact remain in the same order.
- GitHub links remain valid.
- No fabricated publications, awards, institutions, or contact details are introduced.
