---
name: site-accessibility-bilingual-review
description: Use when editing visitor-facing copy, navigation, ARIA labels, JavaScript-generated labels, focus behavior, mobile menu behavior, or Chinese-English bilingual UI on this personal website.
---

# Site Accessibility Bilingual Review

Preserve accessible, paired English/Chinese public UI. This site treats bilingual consistency as part of quality, including dynamic JavaScript text.

## Required Sources

Read the current relevant parts of:

- `AGENTS.md` bilingual public UI rules
- `ACCESSIBILITY_CHECKLIST.md`
- affected HTML files
- `script.js` and `instrument/instrument.js` when labels, statuses, diagnostics, or fallbacks are generated dynamically

## Review Steps

1. Check that edited visitor-facing labels, buttons, tabs, panel titles, statuses, errors, diagnostics, and fallbacks remain paired English / Chinese unless they are proper nouns, code ids, units, DOI, repo names, or citations.
2. Add `lang="zh-CN"` to substantial Chinese sentence blocks, not to every compact slash label.
3. Verify each public page still has one `h1`, a skip link to `#main`, and visible focus states.
4. Check navigation orientation when nav content changes, including removed or moved `aria-current` states. A route may use a local current-state cue instead of a primary-nav current pill, but visitors should not lose orientation.
5. Check mobile navigation with keyboard when header/menu code changes: open from toggle, focus moves into menu, Escape closes and restores focus.
6. Keep touch targets at least 40px where practical for visible interactive controls.
7. Run `python tools/check_site.py` and `git diff --check` after edits.

If acting as a read-only reviewer or subagent, do not edit files. Report regressions, evidence, missing validation, and recommended fixes instead.

## Quick Searches

Use these as starting points, then inspect results manually:

```powershell
rg -n "aria-label|aria-live|aria-pressed|data-|Error|Loading|Status|诊断|状态|错误|加载" *.html */*.html script.js instrument/instrument.js
rg -n "class=\"[^\"]*-zh|lang=\"zh-CN\"" *.html */*.html
```

## Common Mistakes

- Updating visible English text but leaving the Chinese counterpart stale.
- Treating JavaScript-generated diagnostics or fallback messages as non-public.
- Adding `aria-label` that contradicts visible bilingual text.
- Replacing concise slash labels with verbose text inside tight controls.
- Claiming accessibility is fine from screenshots alone.
