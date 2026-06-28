# Milestones — personalized child-development assistant

**One line:** a calm, evidence-first guide for parents (0–12 months) that turns a
milestone check into a personalized focus + a weekly play plan, while never diagnosing,
scoring, or replacing a professional.

> Method: **Watch → Play → Ask.** Frameworks: CDC / AAP (surveillance), WHO nurturing
> care, Harvard serve-and-return. Personalization model: **Profile-of-focus (option A)** —
> no scores, no risk labels.

> **Resuming work or switching assistants?** Start with [HANDOFF.md](HANDOFF.md) — current
> state, decisions, what's next, and how to run/verify, in one place.

---

## Folder structure

```
Milestones/
├── README.md                  ← this file: plan, structure, sequence
├── AGENT.md                   ← guide for AI agents: rules, architecture, decisions
├── prototype_stage4/          ← WORKING web prototype (EN). Self-contained — do not move
│   ├── index.html  styles.css
│   ├── data.js                ← all milestones + activities (5 ages)
│   ├── engine.js              ← personalization engine (buildProfile, buildProgram)
│   └── app.js                 ← UI wiring
├── prototype_stage4_ua/       ← WORKING web prototype (UA, testing artifact)
│   └── data_ua.js  engine.js  app.js  index.html  (now also DISCUSS_BY_ID)
├── prototype_stage5_ua/       ← NEW guided UA app (bottom-nav shell, redesign)
│   └── index.html app5.js styles5.css questions_ua.js illustrations.js authors_ua.js (reuses stage4 data+engine)
├── docs/                      ← project documentation
│   ├── safety_rules.md        ← SINGLE SOURCE OF TRUTH for claims/guardrails
│   ├── router_logic.md        ← how the engine turns answers into a plan
│   ├── research_foundation.md ← evidence hierarchy, sources, disclaimers
│   ├── developmental_memory_plan.md  action_plan.md
│   ├── expert_review_checklist.md    parent_test_script.md
│   ├── landing_structure.md   mobile_access_plan.md  product_data_model.md
│   ├── ui_redesign_plan.md    ← guided-flow IA, screens, UX, build order
│   └── 6_months_sample_page.md  6_months_review_ready_page.md  free_starter_pack_draft.md
├── data/                      ← content + schemas (source of truth, not read at runtime)
│   ├── mvp_0_12_months_map.csv        milestone_schema.csv
│   ├── activity_library_0_12_months.csv  activity_schema.csv
│   └── evidence_sources.csv  adapted_meaning_matrix_cdc_europe.csv
├── knowledge_base/            ← author / recommendation base
│   ├── author_base_README.md          ← governance + workflow
│   ├── author_research_inventory.md   ← CANONICAL author inventory
│   ├── authors_registry.csv           ← machine companion (caution, maps_to_mechanism)
│   ├── problem_to_author_map.csv      recommendation_author_map.csv
│   └── author_source_cards/           ← atomic paraphrased cards
├── sources/                   ← raw research materials (PDFs, book, images, xlsx)
└── archive/                   ← stale exports of an older prototype
```

---

## Logical sequence — how we got here

1. **Stages 1–4 (earlier):** evidence foundation → data model → review-ready content →
   first clickable prototype + landing/test docs. (See `docs/action_plan.md`.)
2. **Prototype completed to 5 ages:** wired `data.js` so the age switcher (2/4/6/9/12 mo)
   actually works across the whole first year.
3. **Product pivot → personalized assistant:** chose **option A (Profile-of-focus)** over
   clinical scoring. Built `engine.js` (profile + weekly program). Added `supports` links
   so focus → activities works.
4. **Content floor:** grew to **40 activities**, ≥2 per (age × domain), each with a visible
   evidence level + source. Programs stopped repeating.
5. **Safety + governance:** extracted `docs/safety_rules.md` (single source of truth) and
   `docs/router_logic.md` (documents the engine). Extended the activity schema.
6. **Author base:** built the scaffold + `authors_registry.csv` (21 authors by role,
   with caution + verification), reconciled with the canonical inventory, verified names
   (removed Donna Sasse Wittmer; confirmed Sassé/Luria/Marks/Poon), and extracted the
   first atomic cards (Glascoe, Hirsh-Pasek & Golinkoff, Lieberman, Pikler).
7. **Organized** everything into folders + this plan.
8. **Product direction set (2026-06-08):** confirmed the app as a per-milestone survey →
   focus/"vision" → weekly play program → personal cabinet with re-tests over time. Locked
   three decisions (see below). Fixed the `allClear` maintenance bug (added `partialClear`),
   surfaced `discuss_if` as a calm "when to discuss" layer in the UA prototype, and added
   [AGENT.md](AGENT.md) as the agent-facing guide.

---

## Product direction & locked decisions (2026-06-08)

The app: parent registers a child → runs a short survey covering **every milestone for the
age** (CDC-aligned; wording varies per re-test, nothing is sampled out) → gets a focus
**"vision"** (what to notice, calm "when to discuss") + a
**1–2 week daily play program** (game-like) → results shown as **descriptive charts** →
re-tests over time build a **comparison timeline** → a **personal cabinet** serves a daily
task. Even a clear result still invites the parent to keep playing (maintenance mode).

Decisions that gate the build:

- **Platform:** stay a **web prototype** for now (native/hybrid deferred).
- **Survey questions:** **curated, reviewed pool** — the survey asks **all** milestones for
  the age (none sampled out — CDC treats the whole age checklist as worth reviewing); the only
  randomness is *which phrasing* of a milestone is shown, never LLM *generation* (keeps
  traceability + the review gate).
- **Data:** **local-first**, no account for MVP; stored object designed so an **optional
  account** for sync can be added later. Child data is sensitive (GDPR).

Guardrail reminders that constrain these features (see [docs/safety_rules.md](docs/safety_rules.md)):
charts stay **descriptive** ("what you observed"), never a developmental score/percentile;
"focus areas" never "weak sides to train"; illustrations must be original/licensed, not
copied from books or competitor apps (codified in [safety_rules.md](docs/safety_rules.md) §10).

---

## Current state (works today)

- **P2.13 guarded local storage:** blocked, corrupt, or full browser storage no longer throws
  through the parent’s active action. A rare “Not saved” appbar status explains that the tab
  should stay open and points to local backup; a later successful write clears it automatically.
  Failed erase/restore operations no longer report false success.
- **P2.12 user-approved PWA updates:** a newly installed service worker waits instead of
  interrupting an active task. A quiet “Update now” action appears only in collapsed settings;
  the page reloads exactly once and only after that explicit action. First install never causes
  an unsolicited reload.
- **P2.11 calm install guidance:** collapsed data settings explain how to add Milestones to a
  home screen on browsers without a programmable prompt. When the browser does offer its
  native install flow, one explicit button appears; dismissing it stays pressure-free, and all
  install guidance disappears in standalone mode.
- **P2.10 private backup and restore:** hidden data controls can download a versioned local
  JSON backup and restore it after explicit confirmation. Files never leave the device through
  the app, malformed structures and unknown answer states are rejected, and the UI warns that
  the backup contains private observations.
- **P2.9 installable offline app:** Stage5 now ships with a web app manifest, original
  192/512/SVG icons, a versioned service-worker app shell, and a quiet offline indicator.
  After one successful online load, the core guided flow and curated content can reopen without
  a connection; local child data remains in the same browser storage.
- **P2.8 accessibility hardening:** route changes now focus the relevant heading without
  announcing the whole page, survey status updates are concise and atomic, dynamic program
  controls retain keyboard focus after re-rendering, helper text is larger, and forced-colors
  plus reduced-motion preferences have explicit support.
- **P2.7 unified navigation icons:** the four bottom destinations now use one original
  outline-SVG family: home, observation eye, play kite, and specialist pencil. Every icon uses
  the same 20×20 grid, stroke weight, rounded joins, active color, and accessible text label.
- **P2.6 emotion-aware copy guardrails:** the most negative observation label is now “Ще не
  помічаю” rather than “Поки ні”. Sensitive discussion sections explicitly say that one answer
  is not a conclusion, discourage immediate re-checking, and suggest noting an ordinary example
  for a later conversation. Survey copy now makes pausing and returning explicit. These are UX
  guardrails, not a substitute for the pending clinician and parent-review gates.
- **P2.5 one-thumb pass:** survey answers now save and advance with one tap while Back remains
  available. Home no longer repeats the active child and age, today's activity opens directly
  on the title and steps, and the main actions on results, program, and specialist prep stay in
  a thumb-reachable bar above bottom navigation. Optional specialist notes are collapsed and
  visible numerical “discussion” badges were removed.
- **P2.4 visit-ready specialist prep:** the specialist tab now turns the latest observation
  into one compact overview, keeps detailed discussion prompts collapsed, and separates the
  parent's notes into “noticed / tried / questions”. The copyable summary includes the child,
  date, observation groups, and those notes; legacy free-form notes migrate without loss.
- **P2.3 today-first game:** the program screen now opens one complete activity for today,
  formats its steps as a short numbered sequence, and keeps the single completion control in
  view. Alternative activities and the next six days remain available in collapsed sections
  instead of competing with today's instruction.
- **P2.2 contextual home:** Stage5 now shows one calm next step based on the active child's
  state: start or continue the observation, play today's game, or stop after today's game is
  done. Secondary destinations and destructive data controls are collapsed into clearly named
  disclosures, so the home screen no longer presents every action at equal priority.
- **P2.1 observation history:** Stage5 now keeps the history descriptive and useful without
  turning it into a score. Each saved observation shows the date and three answer counts,
  compares it with the previous record for the same age, calls out newly observed and changed
  answers, and lets the parent expand the full answer list. Legacy snapshots remain readable.
- **P1 guided-flow hardening + QA:** the primary Stage5 build shows one observation at a time,
  routes completed observations to a calm summary, exposes the nearest 7 days of the 14-day
  play cycle, and supports a reversible “done today” state. `node tools/test_p1_qa.js` now
  regression-tests all five ages, content integrity, deterministic plans, re-tests, legacy
  migration, and multi-child isolation.
- EN + UA prototypes: survey → **focus profile** → **weekly play plan** → progress charts
  by domain → re-assessment prompt. Open `prototype_stage4_ua/index.html` to try.
- Engine is pure, traceable, **never generates content at runtime** — it only selects from
  the curated, sourced activity set.
- **`allClear` fixed:** maintenance/celebration now triggers only when every milestone is
  marked; a new `partialClear` state handles "nothing flagged but not all marked yet".
- **`discuss_if` surfaced (UA):** `DISCUSS_BY_ID` in `data_ua.js` drives a contextual
  "when to discuss" block in the Ask tab, shown only for items marked *not sure / not yet*.
- **Author "approach" layer (stage5):** `authors_ua.js` surfaces a Bronze/inspiration
  "Підхід" note on activities (Pikler, Hirsh-Pasek & Golinkoff, Lieberman, Harvard).
  Seeded from `recommendation_author_map.csv`, then broadened to **all 40 activities** by
  mechanism (each activity rests on one Silver mechanism). A "Підхід" badge marks days that
  carry one. Framed as inspiration, never a guarantee. **Draft — pending expert review.**
- **Multi-domain days:** each program day keeps a **primary** focus activity plus up to
  `bonusPerDay` (2) **optional cross-domain** "bonus" ideas (`day.bonus`), so a day can touch
  several developmental areas — framed as optional ("якщо є настрій"), never a dose. Engine
  change mirrored to both `engine.js` copies; documented in `router_logic.md`.
- **Activity library grown 40 → 60:** a 3rd activity per (age × domain), appended as
  `ACTIVITIES_EXTRA` in `data_ua.js` (originals untouched), each with an author note. A
  focus domain now cycles ~4 distinct activities over a week instead of repeating 2.
- Author base scaffold with 4 cards and a verified 21-author registry.

## Key principles (must always hold — see `docs/safety_rules.md`)

1. **No score / level / risk** ever leaves the engine (internal `weight` only orders focus).
2. The plan = **opportunities for play**, never a treatment dose.
3. **Two clocks:** milestone re-check follows CDC age windows; the weekly cycle is engagement.
4. **Author bridge:** an author idea is usable only if it `maps_to_mechanism` (Silver) or a
   guideline (Gold). "Author says so" is never enough. High-caution authors = inspiration only.

---

## Open gaps

- Expert review of content (gate before real users) — **not done**, but the package is now
  ready: a generated, plain-language **review packet**
  ([docs/expert_review_packet_ua.md](docs/expert_review_packet_ua.md) — all 54 milestones + 60
  activities per age, no code; rebuild with `node tools/build_review_packet.js`), a tracker
  ([docs/expert_review_tracker.md](docs/expert_review_tracker.md)), checklist, and an operational
  [validation launch kit](docs/validation_launch_kit_ua.md) with outreach, scope, sign-off,
  parent-recruitment, and scheduling templates. A source-checked
  [E01–E05 shortlist](docs/expert_candidate_shortlist_ua.md) identifies the first outreach
  routes and reserves; [send-ready drafts](docs/expert_outreach_drafts_ua.md) cover the four
  first-wave messages and follow-up. Needs live reviewers.
- Parent test with 5 parents — live sessions not done. The ready-to-run Ukrainian facilitator
  pack (neutral script, short consent, observation sheet, severity rubric, synthesis) is in
  [docs/parent_test_facilitator_pack_ua.md](docs/parent_test_facilitator_pack_ua.md); use only
  after the expert-review tracker approves parent testing.
- Author cards: **8 done** (Glascoe, Lieberman, Pikler, Hirsh-Pasek & Golinkoff, Harvard
  serve-return, Harvard brain-building-play, Mooney, Marks). Remaining are mostly
  moderate/high-caution authors (Montessori, Doman, Sears, Maté…) needing careful framing.
- `discuss_if` surfaced in **both UA and EN** — `DISCUSS_BY_ID` (54 entries, pulled from the
  canonical `mvp_0_12_months_map.csv`) now in `prototype_stage4/data.js`, with `#discussList`
  + `renderDiscuss()` in the EN Ask tab, mirroring the UA prototype.
- Author base anticipates concerns beyond 0–12 mo (tantrums, screens, separation) — the
  current engine covers 0–12 mo only. Scope decision pending.
- **Canonical CSV drift (largely resolved):** runtime `data_ua.js` (60) is mirrored 1:1 into
  `data/activity_library_0_12_months_ua.csv` (60 rows, UA). For the **33** activities that the
  EN `data/activity_library_0_12_months.csv` also covers, the authored fields (`setup`,
  `what_to_watch`, `claim_limit`, `low_energy_option`, `adaptations`) are now **back-filled**
  (translated from EN; `source_ids` carries precise card IDs) — translated drafts pending the
  expert gate. The remaining **27 net-new** activities keep `NEEDS_REVIEW` (no authored safety
  fields anywhere) with a coarse `source_ids` label. See
  [docs/expert_review_tracker.md](docs/expert_review_tracker.md) §5.

## Next steps

| # | Step | Status |
|---|---|---|
| A | Integrate inventory + verify author names | **done** |
| B | Surface "when to discuss" in the UI (reuse `discuss_if`) | **done (UA + EN)** |
| B2 | Fix `allClear` maintenance bug (+ `partialClear`) | **done** |
| C | Extract the remaining author cards (no-caution first, high-caution last) | in progress (8/26; no-caution authors done) |
| D | Expert review + parent test (validation gates) | **packs ready; live reviews/sessions pending** |

### Product roadmap (from the 2026-06-08 direction)

| # | Step | Notes |
|---|---|---|
| 1 | Curated **question pool** — multiple phrasings per milestone | **done** in `prototype_stage5_ua/questions_ua.js` (54 milestones, **3 phrasings each** = text + 2 alternates; survey asks **all** milestones for the age, re-test reshuffles only the wording, keeps milestone ids for comparison) |
| 2 | Extend program to **14 days**, allow multiple sessions/day | **done** — `cycleDays` 7→14 in both engines + "week" copy updated; multiple-sessions/day still pending |
| 3 | **IndexedDB** + child profile (DOB → age window), multi-child | **multi-child done** (localStorage `children[]` + appbar switcher + add/delete, lossless migration from the old single-child shape); **DOB→age window** already done (`monthsSince`/`ageWindowFor`, now derived live); **IndexedDB deferred** (low-value async backend swap — store is already per-child, sync-ready) |
| 4 | **`.ics` notifications** for "today's task" | calendar without a server |
| 5 | **Guided interface redesign** (onboarding → survey → results → program → cabinet) | **scaffolded** in `prototype_stage5_ua/` (bottom-nav shell) |
| 6 | Exercise **illustrations** (original/licensed) | **interim done**: original inline-SVG per domain (`illustrations.js`); designer-made art still a later upgrade |
| 7 | Consent / age-gate screen + data-erasure control | **done** in stage5 (consent + "erase all") |
| 8 | P1 regression QA + edge-case hardening | **done** — automated five-age suite, idempotent finish, clean re-test state, mobile accessibility audit |
| 9 | P2.1 descriptive observation history | **done** — dated records, same-age comparison, full answer details, legacy snapshot support, mobile QA |
| 10 | P2.2 contextual home | **done** — one state-aware next step, resumable observation progress, calm done state, collapsed secondary/data controls, mobile QA |
| 11 | P2.3 today-first game | **done** — one open activity, numbered steps, collapsed alternatives and next six days, single completion control, mobile QA |
| 12 | P2.4 visit-ready specialist prep | **done** — compact observation overview, collapsed discussion prompts, three structured notes, copyable visit summary, legacy-note migration, mobile QA |
| 13 | P2.5 one-thumb pass | **done** — one-tap survey advance, compact activity, thumb-reachable primary actions, optional collapsed notes, calmer specialist overview, mobile QA |
| 14 | P2.6 emotion-aware copy guardrails | **done** — gentler observation label, non-conclusion reassurance before sensitive notes, explicit pause/return language, larger helper text, mobile QA; live validation still pending |
| 15 | P2.7 unified navigation icons | **done** — original home/eye/kite/pencil outline SVG set with consistent sizing, stroke, active state, labels, and regression QA |
| 16 | P2.8 accessibility hardening | **done** — focused question announcements, atomic live statuses, restored focus after program updates, larger helper text, forced-colors/reduced-motion support, regression QA |
| 17 | P2.9 installable offline app | **done** — manifest, original 192/512/SVG icons, versioned app-shell service worker, quiet offline status, lifecycle/fallback regression QA |
| 18 | P2.10 private backup and restore | **done** — versioned local JSON export, validated restore with replacement confirmation, privacy warning, malformed-file and round-trip regression QA |
| 19 | P2.11 calm install guidance | **done** — fallback home-screen instructions, user-triggered native prompt when supported, dismissal/installed states, install-flow regression QA |
| 20 | P2.12 user-approved PWA updates | **done** — waiting service worker, hidden update action, explicit activation, one controlled reload, first-install protection, lifecycle regression QA |
| 21 | P2.13 guarded local storage | **done** — non-throwing read/write failures, accessible unsaved status, backup recovery path, accurate erase/restore feedback, recovery regression QA |

Stage5 status: working guided flow (welcome → consent → child profile → contextual home/cabinet →
survey → calm descriptive summary → today-first game → descriptive history with same-age changes → visit-ready specialist prep), local-first storage with **multi-child**
(`children[]`, appbar switcher, add/delete, lossless migration), a per-age survey that asks
**all** milestones for the age (fixed set a re-test reuses), a **curated question pool**
(multiple phrasings per milestone, reshuffled on re-test), descriptive charts, `.ics`
daily-task export. Open: IndexedDB backend (deferred), exercise illustrations, expert review gate.
Decisions for the redesign live in [docs/ui_redesign_plan.md](docs/ui_redesign_plan.md).
