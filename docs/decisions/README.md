# Decisions

Use this directory to record major decisions that affect:

- brand direction
- information architecture
- notes publishing model
- bilingual strategy
- public GitHub alignment
- tooling or migration thresholds

## When To Add A Decision Record

Create a decision file when a choice has non-obvious consequences and should not live only in chat history, commit messages, or `PLANS.md`.

Good candidates in this repo:

- whether the homepage should expose the notes hub more directly
- whether the current client-side bilingual model should stay in place
- when static hand-maintenance stops being enough
- whether a generator such as Astro becomes justified

## Suggested Format

Use a simple file name such as:

```text
YYYY-MM-DD-short-title.md
```

And keep the document short:

```md
# Decision Title

- Date:
- Status:
- Context:
- Decision:
- Consequences:
- Follow-up:
```

## Current Status

This directory now contains dated decision records for site architecture, information architecture, public project positioning, content systems, and Instrument Lab boundaries. Add a new record when a later change materially alters those decisions instead of silently rewriting their history.
