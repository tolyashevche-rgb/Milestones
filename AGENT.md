# AGENT.md — guide for AI agents working in this repo

> **Mandatory current-build check:** before any product, feature, UI/UX, accessibility,
> or content-placement audit, read [CURRENT_BUILD.md](CURRENT_BUILD.md) and
> [audit-scope.json](audit-scope.json). Audit only `prototype_stage5_ua/index.html`.
> Stage 4 HTML/app files are legacy references and must not be treated as current UI.

Read this before changing anything. It tells you what this product is, the rules it
must never break, where things live, and how to make a change safely. For **current state +
what's next** (to resume a session or switch assistants), start with [HANDOFF.md](HANDOFF.md).

> **Single source of truth for what the product may say:** [docs/safety_rules.md](docs/safety_rules.md).
> If anything here disagrees with that file, that file wins.

---

## What this is

**Milestones** — a calm, evidence-first developmental assistant for parents of children
**0–12 months**. The parent runs a short milestone check per age, and the app returns a
**focus profile** + a **1–2 week play plan** + calm "when to discuss" notes. Method:
**Watch → Play → Ask.** Frameworks: CDC/AAP surveillance, WHO nurturing care, Harvard
serve-and-return.

It is **not** a diagnostic, screening, or treatment tool, and never replaces a
professional. This positioning is the product's main asset — do not erode it.

## The lines you must never cross (from safety_rules.md)

1. **No score / level / percentile / risk** about the child ever leaves the engine. The
   internal `weight` (`not_yet*2 + not_sure*1`) only *orders* focus areas — never shown
   as a number, bar, or comparison.
2. The plan is **opportunities for play**, never a treatment dose ("do N reps for M days").
3. **Two separate clocks:** milestone re-check follows CDC age windows (2→4→6→9→12 mo);
   the play cycle (now 1–2 weeks) is engagement only, never re-screening.
4. **No deficit framing.** A "concern" / focus area is a parent's worry, not a detected
   deficit. Never say "your child is behind / late / delayed / failed". Reframe
   "weaknesses to train" as "focus areas / more chances to play".
5. **Author content (Bronze) is usable only if it maps to a Silver mechanism or Gold
   guideline.** "Author X says so" is never enough. Paraphrase only — never reproduce
   copyrighted text or exercises.
6. **Content never generated at runtime.** The engine only *selects* from the curated,
   sourced activity/milestone set, so every recommendation is traceable and reviewable.
7. **Review gate:** author-derived content and "when to discuss" wording is not validated
   for real users until expert review ([docs/expert_review_checklist.md](docs/expert_review_checklist.md)).

## Architecture (data → logic → UI, kept separate)

- **Content / source of truth:** [data/](data/) (CSV) and [knowledge_base/](knowledge_base/).
  Not read at runtime — it's compiled by hand into the prototype data files.
- **Runtime data:** `prototype_stage4/data.js` (EN), `prototype_stage4_ua/data_ua.js` (UA)
  hold `MILESTONES_BY_AGE`, `ACTIVITIES_BY_AGE`, and `DISCUSS_BY_ID` (now in **both** EN and UA).
- **Logic:** `engine.js` — pure, no DOM, language-independent. `buildProfile` →
  `buildProgram`. **Both copies must stay identical** (see [docs/router_logic.md](docs/router_logic.md)).
  If you change one, change the other.
- **Legacy UI reference:** Stage 4 retains `app.js`, `legacy-reference.html`, and the shared
  `prototype_stage4/styles.css` for history only. It is not a current audit target.
- **`prototype_stage5_ua/`** is the current guided app (bottom-nav app shell): `index.html`
  + `app5.js` + `styles5.css`. It **reuses** stage4_ua's `data_ua.js` + `engine.js` via
  relative `<script src>` — no logic/data is duplicated. `app5.js` is presentation +
  navigation only; all developmental logic stays in `engine.js`. Storage is `localStorage`
  (`milestonesMap.stage5.ua`): a `{ consent, children: [], activeChildId }` object —
  **multi-child** (per-child `surveys`/`snapshots`/`triedActivities`/`notes`; `cc()` returns
  the active child; `migrate()` losslessly folds the old single-child shape). Age is derived
  **live** from each child's DOB (`monthsSince` → `ageWindowFor`). Still shaped for a future
  sync account.
  `questions_ua.js` holds `QUESTION_VARIANTS_UA` — curated alternate phrasings per milestone
  (paraphrases of the same observable behavior, so they inherit the milestone's CDC source).
  The survey asks **every milestone for the age** (CDC-aligned — nothing sampled out) and
  shows a random *phrasing* of each; answers are keyed by milestone id, so re-tests compare
  like-for-like. These are draft pending the same review gate — not runtime-generated.
  `authors_ua.js` holds `ACTIVITY_AUTHOR_NOTES` — a Bronze/inspiration "approach" note per
  activity, inverted from `knowledge_base/recommendation_author_map.csv`. Surfaced only where
  an author maps to a Silver mechanism / Gold guideline; high-caution authors are excluded;
  framed as inspiration, never proof. Draft pending expert review.
  `who_windows.js` holds `WHO_WINDOW_BY_ID` — a calm "typical range" note (WHO windows of
  achievement, 1st–99th percentile) on the 3 mapped gross-motor milestones; reassurance only,
  never a deadline or score. Sourced from `data/who_motor_windows_0_12.csv`; draft pending review.
  `activity_context_ua.js` mirrors the 33 already-authored `low_energy_option` values from the
  canonical UA activity CSV. Rows still marked `NEEDS_REVIEW` are intentionally absent; the UI
  may select or display these authored variants but must never generate a missing adaptation.
- **Docs:** [docs/](docs/) — `safety_rules.md` (rules), `router_logic.md` (documents the
  engine), `product_data_model.md`, `research_foundation.md`, etc.

The **guided app `prototype_stage5_ua/` is the primary build**; `prototype_stage4_ua/` holds
the canonical `data_ua.js` + `engine.js` that stage5 reuses (and is the simpler tabbed
reference). The product is **UA-first**; the EN prototype (`prototype_stage4/`) is the
canonical English reference — when you add a UA feature, note EN parity as a follow-up
rather than silently diverging.

## Conventions

- IDs are stable and carry meaning: `ms_006_social_001` / `act_006_social_001`. The domain
  key (`social|language|cognitive|movement`) is parsed from position 2 — never rename ids.
- Every activity carries `evidence` + `source`, shown to the parent. Don't add an activity
  without them.
- Evidence levels: **Gold** (CDC/AAP/WHO guideline) · **Silver** (mechanism) · **Bronze**
  (named author method — inspiration for *form* only).
- Engine parameters live in `ENGINE_CONFIG` (cycleDays, maxFocus, optionsPerDay, weights).
  These are **tunable hypotheses**, not evidence-based dosages — keep them out of core logic.

## Locked product decisions (2026-06-08)

- **Platform:** stay a **web prototype** for now; native/hybrid decision deferred.
- **Survey questions:** drawn from a **curated, reviewed pool** — the survey asks **all**
  milestones for the age; the only randomness is *which phrasing* is shown, never LLM
  *generation* — preserves traceability and the review gate.
- **Data:** **local-first** (no account required for MVP); design the stored object so an
  **optional account** for sync can be added later without a rewrite. Child developmental
  data is sensitive (GDPR) — registration triggers consent, privacy policy, erasure rights.

## How to make a change safely

1. Check it against the 7 lines above and [docs/safety_rules.md](docs/safety_rules.md).
2. Keep data, engine, and UI separate. Engine stays pure (no DOM, no language).
3. If you touch `engine.js`, mirror it to the other copy and update `router_logic.md`.
4. Syntax-check JS: `node --check <file>`. The engine can be unit-tested headless by
   eval-ing `data_*.js` + `engine.js` in a `vm` context (no DOM needed).
5. Update [README.md](README.md) "Current state" / "Next steps" so the plan stays truthful.
6. If you change milestone/activity content, regenerate the expert-review packet:
   `node tools/build_review_packet.js` (writes `docs/expert_review_packet_ua.md`).
7. **Record it in the files — always, unprompted.** After finishing a meaningful unit of work,
   *or* whenever a decision or direction changes, append a dated bullet to
   [HANDOFF.md](HANDOFF.md) "Work log" (what changed + why; for a course change, note what we
   moved away from and why) and update its "What's next" / "Key decisions" if they shifted.
   This is in-file record-keeping only — saving the plan and changes — **not** a git step
   (commits/push are the owner's call). Do it without being asked; it keeps the project
   resumable across sessions and assistants.

## What NOT to do

- Don't introduce any score/level/risk/percentile, or "behind/advanced" framing.
- Don't generate parent-facing content at runtime (no live LLM copy/questions).
- Don't reproduce copyrighted book text/exercises/illustrations (the PDFs under
  `Book and Articals/` and `sources/` are private research material — never ship them).
- Don't let the two `engine.js` copies diverge.
- Don't ship author-derived or "when to discuss" content to real users before expert review.
