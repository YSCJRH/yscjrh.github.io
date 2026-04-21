# First Shippable Website Plan

## Execution Order
1. Bootstrap
2. Markup
3. Styling
4. QA

## Deliverables
- `index.html`
- `styles.css`
- `script.js`
- `.nojekyll`
- `assets/favicon.svg`

## Implementation Notes
- Keep the site as a single static page for GitHub Pages.
- Maintain the section order: Hero, Research, Build, Notes, About/Contact.
- Use bilingual copy in one HTML document with a client-side language toggle.
- Use only verified public project names and descriptions.
- Do not add contact details beyond GitHub.

## Acceptance Checklist
- Root `index.html` exists and loads without a build step.
- Metadata includes title, description, Open Graph, viewport, and canonical URL.
- Language toggle switches between Chinese and English and persists the preference.
- Desktop and mobile layouts remain readable at common breakpoints.
- All external links point to the intended GitHub profile or repositories.
- No publications, awards, affiliations, metrics, or unsupported claims are invented.
