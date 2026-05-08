# DESIGN_SYSTEM.md

## Purpose

This file records the current public design system for the static personal site. It is a maintenance guide, not a redesign brief.

The visual direction should stay calm, technical, and research-aware: dark, restrained, readable, and evidence-oriented rather than a generic AI SaaS landing page.

## Theme Tokens

The shared stylesheet currently has two token layers:

- Base tokens at the top of `styles.css`.
- Active public-theme overrides under the comment `Active public theme tokens from the visual depth pass`.

Treat the later override block as the current source of truth for public colors and shadows until the CSS is consolidated.

Core active colors:

| Token | Current value | Use |
|---|---:|---|
| `--color-bg` | `#050506` | page background |
| `--color-bg-elevated` | `#0a0a0c` | elevated dark panels |
| `--color-panel` | `rgba(10, 10, 14, 0.9)` | main surfaces |
| `--color-panel-strong` | `rgba(11, 11, 16, 0.94)` | sticky/header surfaces |
| `--color-panel-soft` | `rgba(12, 12, 18, 0.74)` | softer panels |
| `--color-line` | `rgba(255, 255, 255, 0.075)` | subtle borders |
| `--color-line-strong` | `rgba(255, 255, 255, 0.14)` | stronger borders/focus contexts |
| `--color-text` | `#ededf0` | primary text |
| `--color-text-muted` | `#9aa1ad` | body/supporting text |
| `--color-text-soft` | `rgba(237, 237, 240, 0.64)` | lower-emphasis text |
| `--color-accent` | `#5e6ad2` | primary accent |
| `--color-accent-soft` | `rgba(94, 106, 210, 0.16)` | soft accent surfaces |
| `--color-accent-strong` | `#7b84e8` | strong labels and links |
| `--color-success` | `#93c5fd` | live/status accent |

Keep the palette restrained. Avoid adding a new dominant hue for a single card or section unless it carries a real information role.

## Type

The active body font stack is:

```css
"Inter", "Geist Sans", "Aptos", "Segoe UI", "PingFang SC", "Microsoft YaHei", system-ui, sans-serif
```

Do not add external font loading in the static site without a separate decision. Keep Chinese UI text large enough to read on mobile and avoid negative letter spacing.

## Spacing And Layout

Core layout tokens:

- `--container: min(1180px, calc(100vw - 2rem))`
- `--space-section: clamp(3rem, 6vw, 5rem)`
- mobile container narrows to `100vw - 1rem` at `420px`

Primary breakpoints currently used:

- `1100px`: hero and larger grids collapse.
- `900px`: desktop navigation yields to mobile header behavior.
- `780px`: article and homepage mobile layout changes.
- `560px`: compact cards and controls tighten.
- `420px`: narrow phone guardrail.

When fixing mobile issues, prefer scoped media queries at the nearest existing breakpoint.

## Components

Use existing component classes before adding new ones:

- Surface: `.surface`, `.surface-glass`, `.surface-hero`, `.surface-interactive`
- Sections: `.section`, `.section-panel`, `.module-head`, `.module-footer`
- Typography labels: `.eyebrow`, `.surface-label`, `.panel-chrome-label`
- Buttons: `.button`, `.button-primary`, `.button-secondary`, `.button-compact`
- Cards: `.research-card`, `.project-card`, `.stream-card`, `.about-panel`, `.article-card`
- Status and tags: `.project-status`, `.project-badge`, `.note-status`, `.tag-list`
- Links: `.project-link`, `.project-repo-link`, `.article-back`

Do not nest card-like surfaces inside card-like surfaces unless the inner element is a genuine repeated item or framed tool.

## Accessibility Rules

- Keep `:focus-visible` highly visible.
- Keep skip links on public pages.
- Preserve keyboard-operable mobile navigation.
- Respect `prefers-reduced-motion`.
- Content must remain visible without JavaScript. Scroll reveal is decorative only.
- Visitor-facing bilingual UI should keep English and Chinese paired unless the string is a proper noun, code identifier, unit, or citation.

## Known Cleanup Items

- Consolidate the two `:root` token layers only after a visual regression pass.
- The current dark theme is active; do not introduce a light/dark switch without a separate plan.
- The shared stylesheet also contains route-specific `/instrument/` modules. Keep instrument changes scoped to the instrument section unless the shared component change is intentional.
