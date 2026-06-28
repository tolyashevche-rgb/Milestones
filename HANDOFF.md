# HANDOFF — read this first to continue

Purpose: let **any** assistant (or person) resume this project in minutes, without the user
re-explaining. This is the single "where are we / what next / how to work here" file.

> **Standing rule — keep this current, unprompted.** After any meaningful unit of work, *or*
> whenever a decision or direction changes, append a dated bullet to the **Work log** below
> (what changed + why; for a course change, what we moved away from and why) and update
> **What's next** / **Key decisions** if they shifted. This is **in-file record-keeping** —
> saving the plan and its changes in the docs — **not** a git step (commits/push are the
> owner's call). Treat it as part of finishing the task, not an extra step.

Stable references (read once): [README.md](README.md) = plan & structure ·
[AGENT.md](AGENT.md) = rules + architecture + how-to · [docs/safety_rules.md](docs/safety_rules.md)
= the law for what the product may say (**if anything conflicts, that file wins**).

---

## 30-second orientation

**Milestones** — a calm, evidence-first developmental assistant for parents of **0–12-month**
children. Parent runs a short milestone check per age → app returns a **focus profile** + a
**1–2 week play plan** + calm "when to discuss" notes. Method: **Watch → Play → Ask**. Frameworks:
CDC/AAP surveillance, WHO nurturing care, Harvard serve-and-return.

**It is NOT diagnosis / screening / treatment and never replaces a professional.** Never
introduce a score / level / percentile / risk / "behind-advanced" framing. All parent-facing
developmental content is **draft pending an expert-review gate**. (Full rules: AGENT.md "lines
you must never cross".)

## How to run & verify (don't re-derive this)

- **Env:** Windows. Use `py` (not `python`). A Bash tool (Git Bash) and PowerShell are available.
- **Run the app:** from repo root `py -m http.server 8000`, then open
  `http://127.0.0.1:8000/prototype_stage5_ua/index.html` (stage5 = the primary build).
- **Syntax check:** `node --check <file.js>`.
- **Product regression suite:** `node tools/test_p1_qa.js` — all 5 ages, content links,
  deterministic plans, re-tests, descriptive history comparison, legacy migration, and
  multi-child isolation.
- **Headless logic test:** load `prototype_stage4_ua/data_ua.js` + `engine.js` in a Node `vm`
  (pure, no DOM). For `app5.js`, stub `document`/`localStorage`/`window` (see how earlier
  multi-child / coverage tests were run — vm + fake DOM).
- **After any milestone/activity content edit:** regenerate the expert packet —
  `node tools/build_review_packet.js` (writes `docs/expert_review_packet_ua.md`).
- **Git:** solo repo; commit to **main** directly (no feature branches — owner's choice).
  `sources/`, `Book and Articals/`, `Apps/`, `archive/` are gitignored (copyright) — never commit them.

## Current state (what works now)

Stage5 UA is a complete MVP loop: onboarding → consent → **multi-child** profile → cabinet →
survey (full coverage + phrasing variants + WHO windows) → results/vision → 1–2 week program →
descriptive history with same-age change details → ask/notes → `.ics` export. Local-first (`localStorage`), GDPR-minded
(consent + erase). Engine is pure and traceable — it **selects** from curated, sourced content,
never generates at runtime. P1 now uses one question per screen, a calm descriptive summary,
the nearest 7 days of the 14-day cycle, a reversible “done today” state, and automated regression QA.
P2.1 adds dated history cards, previous-observation comparison, expandable full answers, and
legacy snapshot support without scores, levels, or developmental conclusions.
P2.2 makes the home contextual: it shows at most one primary action for start/continue/play,
switches to a calm no-action state after today's game is complete, and collapses secondary
destinations plus destructive data controls.

## Key decisions & findings (do NOT re-litigate)

- **CDC does not rank milestones.** The 2021/22 framework treats every age milestone as
  equal; "act early" = *any* unmet milestone / lost skill / concern. So a "must-have vs
  secondary" importance tier **cannot be sourced** and must not be fabricated. The only sourced
  differentiator is the **WHO motor windows** (6 gross-motor milestones, timing ranges), added
  as calm *reassurance*, never a ranking/deadline. ("Flag any milestone as higher-priority?" is
  a logged question for the expert — tracker §3.)
- **Survey asks ALL milestones for the age** (no sampling); the only randomness is *which
  phrasing* is shown. (Replaced an old "≤3 per domain" cap that skipped milestones.)
- **IndexedDB deferred** — low value; `localStorage` is fine; the store is already per-child and
  sync-ready. Storage shape: `{ consent, children: [], activeChildId }`; `cc()` = active child;
  `migrate()` folds the old single-child shape losslessly. Age derived live from each child's DOB.
- **27 net-new activities** carry `NEEDS_REVIEW` safety fields (`claim_limit`, `what_to_watch`,
  …) — they need expert *authoring*, not invention by an assistant. (Tracker §5.)
- Two `engine.js` copies (stage4 EN, stage4_ua) must stay identical.

## What's next (prioritized)

> **Assistant told only "continue" / "давай продовжимо"? Do this:** the remaining gates need
> people, not more feature code. The operational path and ready-to-send templates are in
> `docs/validation_launch_kit_ua.md`; the source-checked candidates are in
> `docs/expert_candidate_shortlist_ua.md`; the four first-wave messages are ready in
> `docs/expert_outreach_drafts_ua.md`. The registry is populated but nobody has been contacted.
> Obtain the owner’s sender identity, compensation wording, timeline, and explicit Send approval.
> After
> approval in `docs/expert_review_tracker.md`, recruit and run
> five sessions using `docs/parent_test_facilitator_pack_ua.md`. Do not simulate feedback or call
> the product validated without live reviewers and parents.

1. **Expert review** (gate before real users) — fully prepped. Hand a clinician
   `docs/expert_review_packet_ua.md`; they review against `docs/expert_review_checklist.md`;
   record in `docs/expert_review_tracker.md`. Outreach, scope, follow-up, and sign-off workflow:
   `docs/validation_launch_kit_ua.md`. **Needs live reviewers — an assistant cannot do this.**
2. **Parent test, 5 parents** (second gate) — ready-to-run Ukrainian facilitator pack,
   short consent, observation sheet, severity rubric, and five-session synthesis are in
   `docs/parent_test_facilitator_pack_ua.md`. **Prepared; needs expert approval + real parents.**
3. **Author cards** — 8/26 done; the rest are moderate/high-caution authors needing careful,
   gated framing.
4. **Owner decision:** author-base scope beyond 0–12 mo (tantrums / screens / separation)?
5. **Deferred / low-value:** IndexedDB backend; EN parity for WHO windows + coverage fix;
   designer-made illustrations (interim inline-SVG in place).

> The buildable, non-gated engineering backlog is essentially clear. The next real milestones
> need **people** (expert + parents), not more code.

## Key files

- App (primary): `prototype_stage5_ua/` — `app5.js` (UI/nav + storage), `index.html`,
  `styles5.css`, `questions_ua.js` (phrasings), `authors_ua.js` (Bronze notes), `who_windows.js`.
- Canonical data + logic (reused by stage5): `prototype_stage4_ua/data_ua.js`, `engine.js`.
- EN reference prototype: `prototype_stage4/`.
- Content source of truth (not read at runtime): `data/*.csv`, `knowledge_base/`.
- Review gate: `docs/expert_review_packet_ua.md` (+ `_checklist` / `_tracker`),
  `tools/build_review_packet.js`.

---

## Work log (newest first)

### 2026-06-28 — P2.2 contextual home and action hierarchy
- Replaced the equal-weight home dashboard with `homeNextStep()`: first observation, resumable
  in-progress observation with saved-answer progress, today's game, and a calm “done today”
  state. Start/continue/play states expose exactly one primary action; done exposes none.
- Moved history, all games, specialist notes, re-observation, and calendar export under
  “Інші можливості”; moved child deletion and full data erasure under a separate collapsed
  “Керування профілем і даними” control.
- Added regression coverage for all four contextual states and primary-action counts. Browser
  QA at 390×844 found no overflow, undersized visible controls, duplicate ids, or console errors;
  both disclosures remain keyboard-sized and collapsed by default.

### 2026-06-28 — P2.1 descriptive observation history
- Rebuilt the Stage5 history screen around dated observation cards with calm counts for
  “Бачу”, “Ще спостерігаю”, and “Поки ні”; no score or developmental rating is introduced.
- Added same-age comparison against the previous saved observation, including newly observed
  items and changed answers, plus an expandable full-answer view. New snapshots retain their
  milestone ids while legacy snapshots continue to render from stored counts/state.
- Extended `tools/test_p1_qa.js` with history-comparison and legacy-snapshot coverage. The suite,
  syntax checks, and `git diff --check` pass. Browser QA at 390×844 found no horizontal overflow,
  undersized visible controls, duplicate ids, or console errors; full-answer disclosure works.

### 2026-06-28 — First-wave expert outreach drafts ready
- Added `docs/expert_outreach_drafts_ua.md`: complete Ukrainian emails for UAPS, the Early
  Intervention Association, the Speech and Language Therapy Society, and the NAES early-
  development center, plus response snippets, one neutral follow-up, send checklist, and log.
- Drafts deliberately leave only sender identity, compensation wording, timeframe, and share
  link unresolved. No external message has been sent; explicit owner approval is still required.

### 2026-06-28 — E01–E05 expert shortlist researched
- Added `docs/expert_candidate_shortlist_ua.md` using current official sources: UAPS for
  pediatric safety, the Ukrainian Early Intervention Association for physical therapy and
  psychology, the Ukrainian Society for Speech and Language Therapy for infant communication,
  and the NAES early-development center for parent routines/digital clarity.
- Populated the launch-kit registry with verified-but-not-contacted routes, specific review
  scopes, public professional channels, personalized opening lines, and reserves.
- No outreach was sent. Next external step requires the owner’s sender identity, compensation
  approach, and preferred review timeline.

### 2026-06-28 — Validation launch workflow ready
- Added `docs/validation_launch_kit_ua.md`: expert-role coverage, candidate registry,
  short/long outreach templates, scope confirmation, kickoff agenda, issue handling,
  follow-up, approval gate, gated parent screener, invitation, and definition of done.
- Updated the expert checklist from stale Stage3 metadata to Stage5 and cross-linked the
  tracker, facilitator pack, README, and launch kit into one operational path.
- The remaining work is deliberately human: populate expert candidates, send personalized
  invitations, obtain sign-off, then recruit five parents. No feedback may be simulated.

### 2026-06-28 — Stage5 parent-test facilitator pack ready
- Replaced the Stage4-only testing path with `docs/parent_test_facilitator_pack_ua.md`: a
  30–40 minute neutral script, fictional profile/data rules, short consent draft, task sheet,
  moderator prompts, P0–P3 issue rubric, and synthesis table for five sessions.
- Explicitly gated live parent testing on expert approval and prohibited real child data in
  prototype sessions; the old Stage4 script now points to the current pack.
- Next action changed from “prepare the pack” to “obtain expert approval, then recruit and run
  five live sessions”; feedback must not be simulated.

### 2026-06-28 — P1.3 regression QA and edge-case hardening
- Added `tools/test_p1_qa.js`: covers all 2/4/6/9/12-month content, question/discuss/author
  links, deterministic 14-day plans, EN/UA engine parity, legacy migration, re-test behavior,
  duplicate-finish prevention, and per-child isolation.
- Hardened re-tests so a new observation clears the active age’s plan choice and stale
  “done today” marker while preserving history; made survey finishing idempotent.
- Mobile browser audit at 390×844 found no horizontal overflow, undersized visible controls,
  duplicate IDs, missing page heading, or duplicate active navigation state; console had no errors.
- The previous P1 interaction package was committed as `2b6b5d8` before this QA unit.

### 2026-06-26 — Closed the "what does 'continue' mean" gap
- Added an explicit **default next action** at the top of "What's next": if an assistant is told
  only to "continue", it should propose preparing the parent-test facilitator pack (the one
  doable, non-gated task), since the top milestones need people. Removes the ambiguity that would
  otherwise make a fresh assistant stop and ask.

### 2026-06-26 — Progress/decision logging made a standing rule (in-file)
- Standing rule (AGENT.md how-to step 7 + top note here): after any meaningful work *or* course
  change, append a Work-log entry and update What's next / Key decisions — recorded **in the
  files** so progress and direction changes are captured by whichever assistant is working.
  Git commits/push are the owner's call, deliberately **not** part of this rule.

### 2026-06-26 — MVP build-out complete; both gates prepped
- Safety §10 (original/licensed-only image policy) codified in `safety_rules.md`.
- Activity CSV reconciled to runtime (60); 33 back-filled with authored safety fields,
  27 net-new left `NEEDS_REVIEW`; `Навчання`→`Мислення` domain normalized.
- Program → 1–2 weeks (`cycleDays` 7→14, both engines).
- `discuss_if` EN parity (`DISCUSS_BY_ID` + Ask-tab render in the EN prototype).
- Multi-child storage (children[] + appbar switcher + add/delete + lossless migration).
- Survey coverage fix (ask all milestones; fixed `allClear` unreachable at 9 mo).
- WHO motor windows reassurance layer (sourced; 3 mapped milestones).
- Expert-review packet generator + linked from tracker/checklist/README.
- AGENT.md synced; this HANDOFF.md created.
