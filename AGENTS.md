# AGENTS.md

> Version: v0.2  
> Project: `yscjrh.github.io` personal brand website  
> Primary human owner: YSCJRH  
> Primary blueprint: `personalweb.md`  
> Intended agent: Codex app working autonomously inside this repository

---

## 0. Read this first

Before doing any work in this repository, read these files in order:

1. `personalweb.md` — the canonical product and brand blueprint
2. `AGENTS.md` — this operating guide for Codex
3. `PLANS.md` — milestone / execution plan, if present
4. Existing source files and content files

If these files conflict, follow this priority order:

1. Latest direct user instruction
2. `personalweb.md`
3. `AGENTS.md`
4. `PLANS.md`
5. Existing implementation

When the conflict is about brand direction, public claims, personal facts, or long-term site strategy, pause and produce a concise blocker brief instead of guessing.

---

## 1. Project mission

Build and maintain a clean, credible personal brand website for YSCJRH.

The website should communicate one coherent identity:

> A researcher working across fluorescence analysis, intelligent algorithms, scientific instrumentation, and open-source tools.

This is not a company website, generic AI SaaS landing page, or traditional academic CV. It is a researcher-builder personal site that should become easier to polish over time.

---

## 2. Default working mode

Work autonomously after the user provides a high-level goal or blueprint.

Do not pause for routine implementation choices such as HTML structure, CSS organization, spacing, responsive breakpoints, card layout, or minor copy edits. Make a reasonable decision, implement it, validate it, and summarize what changed.

Pause only when a blocker rule in this file or `personalweb.md` is triggered.

For complex, ambiguous, multi-step, or high-impact tasks:

1. Plan first.
2. Write or update `PLANS.md` if the work spans multiple milestones.
3. Implement in small, reviewable batches.
4. Run local checks.
5. Review the diff.
6. Fix obvious issues.
7. Summarize results and remaining risks.

---

## 3. Repository assumptions

The expected repository is:

```text
yscjrh.github.io
```

For GitHub Pages user sites, use the lowercase repository name even if the GitHub username contains uppercase letters.

The first version should be a static site with no build step unless a later, explicit plan justifies upgrading.

Expected initial structure:

```text
.
├── personalweb.md
├── AGENTS.md
├── PLANS.md                 # optional, for multi-step work
├── README.md
├── index.html
├── styles.css
├── script.js
├── .nojekyll
├── assets/
│   ├── img/
│   └── icons/
├── content/
│   ├── bio.md
│   ├── research.md
│   ├── projects.md
│   └── notes/
└── docs/
    └── decisions/
```

Do not create unnecessary complexity just to fill the tree. It is acceptable for early directories to be sparse.

---

## 4. Site identity and voice

### The site should feel

- calm
- precise
- technically credible
- research-aware
- personal but not casual
- understated rather than over-marketed

### The site should avoid

- generic AI marketing language
- exaggerated founder-brand rhetoric
- fake authority signals
- heavy sales language
- visual clutter
- template-market sameness

### Core identity pillars

1. **Research** — fluorescence analysis, fluorescence + intelligent algorithms, fluorescence instrumentation
2. **Build** — GitHub projects and open-source tooling
3. **Notes** — working notes, lab notes, experiments, ideas, and reflective thinking

The website should make these three areas feel like one coherent person, not three unrelated boxes.

---

## 5. Content truthfulness rules

Truthfulness is non-negotiable.

### Allowed sources

Use information from these sources, in this priority order:

1. Direct text provided by the user
2. `personalweb.md`
3. Files in `content/`
4. Existing site copy already reviewed by the user
5. Public GitHub repository names and descriptions for YSCJRH
6. Clearly marked placeholders such as `待补充` when information is missing

### Never invent

Do not invent or imply any of the following:

- publications
- patents
- awards
- degrees
- job titles
- institutions
- collaborators
- employers
- project users
- GitHub stars, forks, or usage metrics
- research results
- instrument specifications
- contact email or social accounts
- testimonials

### When information is missing

Use one of these strategies:

- write a higher-level truthful statement
- mark the item as `待补充`
- move the item into an internal TODO
- create a blocker brief if the missing information affects public positioning

Do not “complete” the website by fabricating details.

---

## 6. First-version information architecture

The first shippable version should be a one-page site with this order:

1. Hero
2. Research
3. Build
4. Notes
5. About / Contact

Do not change this order unless `personalweb.md` is updated or a clear reason is recorded in `docs/decisions/`.

### Hero

Goal: explain who YSCJRH is within 5–10 seconds.

Include:

- one clear positioning sentence
- one supporting sentence
- one primary CTA, usually GitHub or Projects
- one secondary CTA, usually Research or Notes

### Research

Do not make this a publication list in v1.

Represent the research direction through three capability lines:

- Fluorescence analysis
- Fluorescence analysis × intelligent algorithms
- Fluorescence instrumentation

Each line should explain what the topic means and why it matters without overstating achievements.

### Build

Show real GitHub projects as project cards.

Initial priority:

1. `ai-visibility-auditor`
2. `codex-via-phone`
3. `skylattice`
4. `mirror-sim`
5. `create-double-skill`

Use the repository’s real public description where available. Rewrite lightly for clarity, but do not change factual meaning.

### Notes

This section is not a junk drawer. It should feel like a deliberate thinking space.

Acceptable labels:

- Notes
- Field Notes
- Lab Notes
- Working Notes

Acceptable initial content types:

- research reflections
- build logs
- unfinished ideas
- method notes
- short observations

### About / Contact

Keep it brief.

Allowed by default:

- a concise bio
- GitHub link
- statement of interests / working style

Do not add email, phone, institution, employer, or social links unless explicitly provided by the user.

---

## 7. Technical defaults

### Use by default

- static HTML
- static CSS
- minimal vanilla JavaScript
- `.nojekyll`
- semantic HTML
- system font stack
- responsive layout
- accessible contrast and focus states
- descriptive links and alt text

### Avoid by default

- frameworks
- package managers
- build pipelines
- client-side routing
- CMS
- analytics scripts
- tracking pixels
- contact forms
- backend services
- authentication
- databases
- unnecessary dependencies
- large animation libraries
- external fonts unless explicitly justified

### Upgrade rule

Only propose Astro or another static site generator when at least one of these is true:

- Notes has grown enough that manual HTML is painful
- multi-page templates are needed
- bilingual structure is needed
- content reuse becomes difficult
- the user asks for the upgrade

Before upgrading, create or update `PLANS.md` with:

- reason for migration
- benefits
- risks
- files affected
- rollback plan

---

## 8. Development commands

The v1 site should not require installation.

Use this local preview command for browser QA, especially on Windows where the default server may serve SVG files with the wrong MIME type:

```bash
python tools/serve.py
```

The helper uses `4173` by default and falls forward to the next available local port if that port is occupied. Set `PORT` to force a specific port.

Fallback for simple reachability checks:

```bash
python -m http.server 4173
```

Then preview:

```text
http://localhost:4173/
```

Basic repository inspection:

```bash
find . -maxdepth 3 -type f | sort
```

Check Git state before and after changes:

```bash
git status --short
git diff --stat
git diff
```

Run the site sanity checker after scoped HTML, metadata, sitemap, robots, or local-link changes:

```bash
python tools/check_site.py
```

Do not add npm, pnpm, yarn, or other tooling unless a plan justifies it.

---

## 9. Validation checklist

Before calling a task complete, check as many of these as apply:

- `index.html` exists at the repository root
- `.nojekyll` exists for plain static publishing
- page opens locally
- desktop layout is readable
- mobile layout is readable
- navigation links work
- GitHub links work
- hero section is immediately understandable
- Research / Projects / Notes feel coherent
- project cards use real projects only
- no invented personal claims
- `<title>` exists and is descriptive
- meta description exists
- images, if any, have alt text
- focus states are visible
- external links are intentional
- no secrets or private information are present
- diff is reviewable
- bilingual public UI remains paired where the site already uses paired English / Chinese copy, including dynamic JavaScript-generated labels and messages

If visual preview is available in Codex app, use the in-app browser for local or public pages that do not require login.

---

## 10. Worktrees and parallel work

Use worktrees when tasks may conflict or benefit from parallel exploration.

Good worktree candidates:

- copy / information architecture
- visual design / CSS
- QA / accessibility review
- Notes system experiments
- framework migration experiments

Keep each worktree focused. Do not mix unrelated rewrites in one thread.

When handing work back to the local checkout, summarize:

- branch / worktree purpose
- files changed
- validation run
- unresolved risks

---

## 10A. Subagents and parallel agent policy

Subagents can improve work quality when they keep noisy, bounded work out of the main thread. They can also weaken execution when used as vague extra opinions, when multiple agents edit the same files, or when recursive fan-out creates coordination overhead.

Use this policy to decide when subagents are helpful.

### Standing authorization

This repository gives Codex standing permission to use subagents when the rules below are satisfied. Treat this section as the user's explicit instruction for bounded parallel agent work inside this project.

Codex may spawn subagents only when all of these are true:

- the task is complex enough that a single thread would become noisy or unfocused
- the task can be divided into independent, bounded workstreams
- each subagent has a narrow role, file scope, and output format
- the parent agent remains the final integrator and decision-maker
- subagents return concise findings, not raw logs
- the workflow does not require publishing, secrets, account changes, or domain changes
- the workflow does not create multiple unsupervised writers touching the same files

If these conditions are not met, keep the work in the main thread.

### Default model policy

Default model for all subagents in this repository:

```toml
model = "gpt-5.4"
model_reasoning_effort = "high"
```

Do not downgrade subagents to `gpt-5.4-mini`, `spark`, or another faster / cheaper model unless the user explicitly prioritizes speed or cost for that run.

If custom agent files are created under `.codex/agents/`, each file must include the default model policy above unless a later user instruction overrides it.

### Recommended agent concurrency

Prefer this project configuration when `.codex/config.toml` is introduced:

```toml
[agents]
max_threads = 4
max_depth = 1
```

Practical defaults for this personal website:

- normal complex task: 2 subagents
- larger audit or review: 3 subagents
- maximum without explicit user approval: 4 subagents
- nested subagents: prohibited
- recursive delegation: prohibited

Do not raise `max_depth` above `1` unless the user explicitly asks after discussing the risk with GPT 5.4 Pro.

### Good uses of subagents

Use subagents for read-heavy, bounded, or review-oriented work such as:

- mapping the repository before a multi-file change
- checking copy clarity and whether the site still explains the research-builder identity
- reviewing public claims for truthfulness and unsupported assertions
- accessibility / SEO / metadata review
- responsive layout and visual QA
- finding broken links or inconsistent navigation
- comparing implementation options before a framework or content-structure change
- reviewing a branch against the main site after implementation
- diagnosing a specific UI issue where one agent can inspect the browser and another can inspect code

### Bad uses of subagents

Do not use subagents for:

- simple single-file edits
- routine copy tweaks
- formatting-only changes
- vague prompts like “make it better” without role boundaries
- brainstorming with no implementation goal
- simultaneous edits to the same files
- redesigning the whole site from multiple directions at once
- public deployment decisions
- custom domain setup
- contact form / analytics / third-party script decisions
- work involving secrets, credentials, accounts, or private personal information
- anything that would require multiple agents to invent or infer missing biographical facts

### Write access rule

Default subagents should be read-only reviewers or explorers.

Only one agent may be responsible for writing at a time. The parent agent should usually integrate subagent findings itself.

Allowed patterns:

- several read-only subagents review different concerns, then the parent edits
- one read-only explorer maps affected files, then one writer implements a narrow fix
- one browser/debugging subagent reproduces an issue, one code-mapping subagent identifies likely files, then a single writer makes the fix

Forbidden patterns:

- two or more write-enabled subagents editing the same files
- one subagent rewriting copy while another rewrites layout in the same files
- implementation subagents working without a shared plan
- subagents committing or pushing independently

When parallel write experiments are genuinely useful, use separate worktrees and require the parent agent to compare the results before merging anything.

### Required subagent prompt pattern

When using subagents, the parent agent must describe:

1. why subagents are being used
2. how many agents will be spawned
3. each agent's role
4. each agent's file scope
5. whether the agent is read-only or write-enabled
6. the model: `gpt-5.4`
7. the reasoning effort: `high`
8. the exact output format
9. whether to wait for all agents before continuing

Use a prompt shape like this:

```text
Use bounded parallel subagents for this review.

Spawn:
1. copy_reviewer — read-only; review index.html and content files for clarity, truthfulness, and unsupported claims.
2. visual_qa — read-only; inspect styles.css and the rendered page for hierarchy, mobile layout, and obvious visual issues.
3. metadata_reviewer — read-only; inspect index.html for title, meta description, Open Graph, links, and accessibility basics.

All subagents must use gpt-5.4 with high reasoning.
Do not let subagents edit files.
Wait for all results.
Return one consolidated report with:
- confirmed issues
- file references
- recommended fixes
- disagreements or uncertainty
- which fixes the parent agent will implement
```

### Suggested project-specific subagent roles

If custom agent files are later created, prefer narrow roles like these:

```text
site_explorer
- read-only
- maps structure, content sources, and affected files before changes

copy_reviewer
- read-only
- checks positioning, clarity, tone, and unsupported public claims

visual_qa
- read-only unless explicitly asked
- checks layout, spacing, responsive behavior, and rendered-page problems

metadata_reviewer
- read-only
- checks title, meta description, Open Graph, canonical URL, links, alt text, and basic accessibility

implementation_worker
- write-enabled only when assigned
- makes the smallest defensible implementation change after the parent chooses a plan
```

All custom roles should stay narrow and opinionated. Do not create generic “better agent” roles.

### Result handling

The parent agent must synthesize subagent results before editing.

The final synthesis should include:

- what each subagent checked
- which findings are actionable
- which findings were rejected and why
- conflicts between agents
- files to change
- validation to run after changes

If subagents disagree on a public claim, personal fact, architecture change, or deployment action, create a blocker brief rather than guessing.

### Subagent stop conditions

Stop the subagent workflow and return to the parent thread if:

- any agent starts editing outside its assigned scope
- multiple agents attempt to edit the same file
- the task becomes broader than the original prompt
- the result depends on missing personal facts
- the result would publish or expose private information
- the agents produce conflicting brand direction
- the agent fan-out becomes slower or noisier than a single-threaded plan

---

## 11. Git and commit guidance

Prefer small, meaningful commits.

Suggested commit prefixes:

```text
site: initialize static homepage
site: refine responsive layout
content: update project cards
docs: add personal website blueprint
docs: update agent instructions
qa: fix accessibility and metadata issues
```

Before committing:

1. Run `git status --short`
2. Review `git diff --stat`
3. Review the actual diff when practical
4. Ensure no secrets or private data were added

Pushing to GitHub Pages may publish content publicly. Only push when the user’s task clearly includes publishing, deploying, or updating the live site, or when the current milestone explicitly reaches deployment.

Never rewrite public history unless the user explicitly asks.

---

## 12. Design rules

Prefer:

- strong typography
- restrained palette
- generous spacing
- clear hierarchy
- lightweight cards
- subtle borders / shadows
- responsive sections
- accessible contrast

Avoid:

- flashy gradients as the main identity
- dense masonry walls
- carousel-heavy layouts
- animated gimmicks
- generic “AI-powered platform” visual tropes
- stock photos that do not represent the user

The design should support trust and clarity before decoration.

---

## 13. Copywriting rules

Use simple, direct language.

Prefer:

- “I work across fluorescence analysis, intelligent algorithms, and scientific instrumentation.”
- “I also build open-source tools that make ideas testable.”
- “Notes collect working thoughts, experiments, and unfinished ideas.”

Avoid:

- “revolutionizing”
- “cutting-edge AI solutions”
- “world-class”
- “industry-leading”
- “unleashing the future”
- unsupported superlatives

For Chinese copy, keep it precise and slightly literary if appropriate, but not slogan-heavy.

For English copy, keep it clear, technical, and understated.

### Bilingual public UI

This site already presents important public interface surfaces in paired English / Chinese. When adding or editing visitor-facing UI copy on those surfaces, provide a Chinese counterpart unless the text is a proper noun, unit, DOI, code identifier, repository name, brand name, or citation text.

Preferred patterns:

- short labels, buttons, tabs, and panel titles: `English / 中文`
- longer explanatory copy: English sentence first, then a natural Chinese sentence nearby or on the next line
- crowded diagram labels: short paired terms in the figure, with longer explanation in the legend or note panel

Do not treat JavaScript-generated labels, statuses, diagnostics, chart captions, fallbacks, or error messages as exceptions. They need the same bilingual review as static HTML.

---

## 14. SEO and metadata baseline

Each public page should have:

- descriptive `<title>`
- concise meta description
- viewport meta tag
- Open Graph title / description if practical
- canonical URL once the deployment URL is stable

For v1, the canonical URL may be:

```text
https://yscjrh.github.io/
```

Only add structured data after the About content is stable enough to avoid encoding weak or incomplete claims.

---

## 15. Privacy and safety boundaries

Do not publish:

- private email
- phone number
- location beyond what the user explicitly provides
- private institutional information
- personal documents
- API keys
- tokens
- analytics identifiers
- hidden drafts with sensitive content

Do not add third-party scripts without explicit approval.

Do not create contact forms or data collection flows in v1.

Treat GitHub Pages as public internet publishing.

---

## 16. Blocker conditions

Stop and create a blocker brief if any of these happen:

- a public claim lacks a trustworthy source
- an email or contact method is needed but not provided
- a framework migration seems necessary
- a third-party script is being considered
- a form, backend, database, or authentication is being considered
- a custom domain is being purchased, configured, or verified
- the brand direction becomes unclear
- Research / Build / Notes feel incoherent
- a visual direction changes the site into a generic SaaS template
- content may reveal private or sensitive information
- deployment could expose unfinished or incorrect claims
- a proposed subagent workflow would create multiple write-enabled agents touching the same files
- subagents disagree on a public claim, personal fact, architecture decision, or brand direction

Use this format:

```md
## Blocker
- Problem:
- Impact:
- What I checked:
- Option A:
- Option B:
- My recommendation:
- Decision needed from user / GPT 5.4 Pro:
```

---

## 17. Autonomous execution loop

For most tasks, follow this loop:

1. Inspect the repository.
2. Read relevant docs and content.
3. Identify the next milestone.
4. Decide whether the subagent policy applies.
5. If subagents are useful, spawn only bounded, mostly read-only agents with `gpt-5.4` and high reasoning.
6. Make a brief plan.
7. Implement the safest useful slice.
8. Preview locally when applicable.
9. Review the diff.
10. Fix obvious issues.
11. Summarize changes, checks, and next steps.

Do not ask the user to approve every small implementation choice. The user wants Codex to execute from a blueprint and bring only meaningful decisions back for discussion.

---

## 18. Relationship with `personalweb.md`

`personalweb.md` defines the product vision, identity, phases, and escalation rules.

This file translates that vision into day-to-day agent behavior.

If the website evolves, update both files when appropriate:

- update `personalweb.md` for strategy changes
- update `AGENTS.md` for execution rules and repeated workflow lessons
- update `PLANS.md` for current milestone execution
- add decision records under `docs/decisions/` for major architecture or brand decisions

---

## 19. Done criteria for the first shippable site

The first version is shippable when:

- the site is a working one-page static site
- the page opens from GitHub Pages
- the homepage clearly explains the research-builder identity
- Hero, Research, Projects / Build, Notes, and About / Contact exist
- project cards use real GitHub projects
- mobile layout is acceptable
- no invented claims are present
- the visual direction is calm and credible
- metadata is present
- future iteration paths are clear

---

## 20. Final reminder

The purpose of this repository is not to make a page look full.

The purpose is to make YSCJRH’s rare intersection legible:

> fluorescence analysis + intelligent algorithms + scientific instruments + open-source building + working notes.

When in doubt, choose clarity, truthfulness, and maintainability.
