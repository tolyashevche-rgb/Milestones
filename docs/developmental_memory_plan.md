# Developmental Memory Plan

> **Historical Stage 4 design note.** Current product and audit scope:
> [../CURRENT_BUILD.md](../CURRENT_BUILD.md).

Version: Stage 4 addition
Date: 2026-05-05

## Product Decision

The product should include personalization, but we should describe it as `developmental memory`, not medical personalization.

Definition:

> Developmental memory is a parent-owned timeline of observations, notes, activities tried and questions for professionals.

It is not:

- a diagnosis;
- a screening result;
- a developmental score;
- a medical record;
- a prediction model.

## MVP Approach

For MVP, use local browser storage:

- no account;
- no backend database;
- no cloud sync;
- no medical record claims;
- parent can clear history.

This gives parents continuity while reducing privacy, compliance and engineering risk.

## What We Save

| Data | MVP Storage | Purpose |
|---|---|---|
| Milestone state | localStorage | Compare parent observations over time |
| Parent notes | localStorage | Prepare pediatric summary |
| Activity opened/tried | localStorage | Show what parent explored |
| Saved snapshots | localStorage | Build timeline |
| Baby name/date of birth | Not in MVP | Avoid personal data until policy/account system exists |
| Photos/videos | Not in MVP | High privacy risk |

## Comparison Logic

Use neutral comparison:

- "Previously not sure, now observed."
- "No newly observed items yet."
- "This item is still not marked; if it concerns you, discuss it."
- "You have notes from your last snapshot."

Avoid:

- "behind";
- "delayed";
- "advanced";
- "score";
- "risk level";
- "percentile";
- "your child failed."

## Timeline States

Each milestone can be:

- `observed`;
- `not_sure`;
- `not_yet`;
- empty/unmarked.

The product can compare:

- first observed date;
- latest status;
- status changes;
- repeated `not_sure`;
- parent concerns in notes.

## Professional Summary

Summary should show:

- current age page;
- observed milestones;
- not sure items;
- not yet items;
- activities tried;
- parent notes;
- questions for professional;
- disclaimer.

Summary should not show:

- risk score;
- diagnostic suggestion;
- predicted delay;
- clinical label.

## Later Account-Based Version

Only after MVP validation:

- child profile;
- multiple children;
- caregiver sharing;
- PDF export;
- cross-device sync;
- data deletion;
- consent flow;
- privacy policy;
- security review.

## Prototype Implementation

The Stage 4 prototype now stores locally:

- milestone states;
- parent notes;
- opened activities;
- saved snapshots.

Files:

- `prototype_stage4/legacy-reference.html` (historical reference)
- `prototype_stage4/app.js`
- `prototype_stage4/styles.css`
