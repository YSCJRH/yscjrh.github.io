# Public Surface Verification

Date: 2026-04-22  
Scope: static markup verification for the current public surfaces

This report captures what was verified directly from repository files on 2026-04-22. It is intentionally narrower than a full browser QA pass.

## Surfaces Checked

1. `index.html`
2. `notes/index.html`
3. `notes/build-logs-homepage-second-pass.html`
4. `styles.css`
5. `script.js`

## Confirmed Metadata

- Homepage
  - title: `HJR / YSCJRH - Fluorescence Research, Build, Notes`
  - canonical: `https://yscjrh.github.io/`
  - description present
- Notes hub
  - title: `Notes / HJR / YSCJRH`
  - canonical: `https://yscjrh.github.io/notes/`
  - description present
- First note
  - title: `Build Logs / Why The Homepage Needed A Second Pass`
  - canonical: `https://yscjrh.github.io/notes/build-logs-homepage-second-pass.html`
  - description present

## Confirmed Navigation Paths In Markup

- Homepage -> featured note
  - `href="notes/build-logs-homepage-second-pass.html"`
- Homepage -> notes hub
  - `href="notes/"`
- Notes hub -> featured note
  - `href="./build-logs-homepage-second-pass.html"`
- Notes hub -> homepage notes section
  - `href="../index.html#notes"`
- First note -> notes hub
  - `href="./index.html"`
- First note header -> homepage sections
  - header links back to homepage anchors such as `../index.html#research`

## Confirmed Static Resource Resolution

After stripping hash fragments from local links, the current local references resolve:

- homepage references to favicon, stylesheet, script, featured note, and `notes/`
- notes hub references to shared favicon, stylesheet, script, homepage, and featured note
- first note references to shared favicon, stylesheet, script, homepage, and notes hub

This confirms that the current file layout supports the checked relative paths.

## Confirmed Scripted Behavior Hooks

From `script.js`, the following behavior hooks are present in code:

- `localStorage` persistence for `siteLang`
- `Escape` closes the mobile menu
- outside click closes the mobile menu
- reduced-motion media query handling exists
- `IntersectionObserver` reveal behavior exists

This is a code-level verification only. It does not replace an actual browser interaction pass.

## Important Clarification

The homepage does include a `notes/` link today, but it is not the primary notes CTA inside the main notes card. The more visible notes action on the homepage still points to the first published note.

That means the current question is not whether a notes hub path exists. The real question is whether its discoverability is strong enough for the intended public experience.

## Not Verified In This Report

These still require manual browser QA:

- sticky-header anchor landing quality
- real mobile menu behavior
- keyboard flow and visible focus states
- language switching persistence across navigation
- reduced-motion feel in an actual browser
- desktop and mobile visual hierarchy

## Live Verification Note

Live reachability for `/`, `/notes/`, and the first note page was verified in the earlier intake pass and recorded in `docs/handoff-brief.md`.

During this 2026-04-22 pass, direct shell-based live rechecks were unstable at the transport layer, so this report records static verification only and does not claim a fresh live availability check.

