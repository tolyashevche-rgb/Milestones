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
- **Public validation preview is paused by owner decision (2026-06-30):** GitHub Pages remains
  disabled and `.github/workflows/pages.yml` is `workflow_dispatch` only, so a push cannot publish
  the app. If the owner re-authorizes public review later, it runs `tools/test_p1_qa.js` and uploads
  only `prototype_stage5_ua/` plus the two required Stage 4 UA runtime files.

## Current state (what works now)

Stage5 UA is a complete MVP loop: onboarding → consent → **multi-child** profile → cabinet →
survey (full coverage + phrasing variants + WHO windows) → results/vision → 1–2 week program →
descriptive history with same-age change details → visit-ready specialist prep → `.ics` export. Local-first (`localStorage`), GDPR-minded
(consent + erase). Engine is pure and traceable — it **selects** from curated, sourced content,
never generates at runtime. P1 now uses one question per screen, a calm descriptive summary,
the nearest 7 days of the 14-day cycle, a reversible “done today” state, and automated regression QA.
P2.1 adds dated history cards, previous-observation comparison, expandable full answers, and
legacy snapshot support without scores, levels, or developmental conclusions.
P2.2 makes the home contextual: it shows at most one primary action for start/continue/play,
switches to a calm no-action state after today's game is complete, and collapses secondary
destinations plus destructive data controls.
P2.3 makes the program today-first: one complete activity stays open with numbered steps and
one completion control; alternative activities and the next six days are collapsed by default.
P2.4 makes the specialist tab visit-ready: one compact observation overview, collapsed
discussion prompts, three short note fields, and a copyable summary. Existing free-form notes
migrate into “Що ви помітили?” and all preparation remains isolated per child.
P2.5 adds a one-thumb interaction pass: answer selection auto-advances, repeated home profile
content is gone, activity instructions begin above the fold, and the primary actions on
results/program/specialist screens stay directly above the bottom navigation. Optional notes
and secondary explanations remain collapsed.
P2.6 adds emotion-aware copy guardrails without rewriting the clinical source layer: “Поки ні”
became “Ще не помічаю”; sensitive discussion blocks first explain that one answer is not a
conclusion and no immediate re-check is needed; survey copy explicitly permits pausing and
returning. This reduces avoidable pressure but does not replace expert or parent validation.
P2.7 replaces the mixed Unicode bottom-nav glyphs with one original outline-SVG family:
home, observation eye, play kite, and specialist pencil. All four share one grid, stroke,
rounded geometry, active color, and visible text labels.
P2.8 hardens accessibility: focused route/question announcements replace a noisy live main
region; live statuses are atomic; program controls regain focus after dynamic updates; helper
text is larger; forced-colors and reduced-motion preferences are explicitly supported.
P2.9 makes Stage5 installable and offline-capable after one complete online load: manifest,
original SVG/192/512 icons, a versioned service-worker app shell, and a quiet offline status.
The core curated flow is cached; child data remains local in browser storage.
P2.10 adds private local backup/restore under collapsed data controls. Exports are versioned
JSON files containing sensitive observations; restore validates structure and answer states,
requires replacement confirmation, and never uploads the file.
P2.11 adds calm install discovery inside those same collapsed controls: a cross-browser
home-screen instruction, a user-triggered native prompt only when the browser provides it,
and no redundant guidance once running standalone.
P2.12 makes PWA updates user-approved: a new worker waits, the hidden settings expose one
«Оновити зараз» action, and the app reloads once only after that action. First install does
not trigger an unsolicited reload.
P2.16 adds a compact «Підібрати під момент» control inside the existing Game tab. «До 3 хв»
and «Без речей» use literal duration/material metadata; «Мало сил» selects only among the 33
authored `low_energy_option` variants mirrored in `activity_context_ua.js` (all remaining
`NEEDS_REVIEW` rows stay unavailable). The chooser searches only the active child's personalized
plan, changes today's idea, persists per child, never touches observation answers, and locks after
completion until the parent explicitly undoes it.
P2.15 makes the calm shell more ownable without adding navigation or content density: the
original kite is now the visible brand mark, restrained apricot/blush accents warm the paper,
and teal remains the action/trust color. A derived seven-day recap appears only after at least
one completed game and says one/several shared moments without exposing a count, streak,
target, progress bar, or second home-screen action. It uses existing local completion/reaction
data and stores nothing new.
P2.14 adds an optional expected due date to the local child profile. When it is more than three
weeks after the birth date, Stage5 uses corrected age only to choose the nearest available CDC age block; the
header labels that basis and the UI explicitly says it is not an evaluation. This wording and
routing are draft pending expert review. The same release adds per-child saved games and an
optional «Сподобалося / Не сьогодні» reflection after completion, with no streak, score, or
claim of automatic personalization. Legacy data and version-1 backups receive safe defaults.
P2.13 guards local storage failures: read/write errors no longer break the active action, a
rare accessible «Не збережено» status points to backup without discarding in-memory data,
successful recovery clears it, and erase/restore cannot report false persistence.

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

> **Assistant told only "continue" / "давай продовжимо"? Do this:** do not enable GitHub Pages;
> public preview is paused. Continue the author-card backlog as review-only source work, without
> adding moderate/high-caution claims to the parent-facing app. The remaining validation gates need
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
   record in `docs/expert_review_tracker.md`. P2.14 adds a cross-cutting review item for the
   corrected-age input/routing and its Ukrainian wording. Outreach, scope, follow-up, and sign-off workflow:
   `docs/validation_launch_kit_ua.md`. **Needs live reviewers — an assistant cannot do this.**
2. **Parent test, 5 parents** (second gate) — ready-to-run Ukrainian facilitator pack,
   short consent, observation sheet, severity rubric, and five-session synthesis are in
   `docs/parent_test_facilitator_pack_ua.md`. **Prepared; needs expert approval + real parents.**
3. **Author cards** — 26/26 done; the planned set is complete. Michelle Macias and Jennifer Poon
   complete the no-caution clinical boundary set; Jill Stamm, Maria Montessori, Lise Eliot, John Medina, and the
   joint Daniel Siegel/Tina Payne Bryson record are moderate-caution review-only cards; A. R.
   Luria and N. A. Bernstein are historical internal-only guardrails with no activities;
   Margaret Sassé, Shinichi Suzuki, Gordon Neufeld, Gabor Maté, William Sears, Makoto Shichida,
   Glenn Doman, and Masaru Ibuka are high-caution review-only with no activity IDs. All records
   have explicit claim limits; moderate/high-caution content still requires expert review before
   any parent-facing use.
4. **Owner decision:** author-base scope beyond 0–12 mo (tantrums / screens / separation)?
5. **Deferred / low-value:** IndexedDB backend; EN parity for WHO windows + coverage fix;
   designer-made illustrations (interim inline-SVG in place).

> The buildable, non-gated engineering backlog is essentially clear. The next real milestones
> need **people** (expert + parents), not more code.

## Key files

- App (primary): `prototype_stage5_ua/` — `app5.js` (UI/nav + storage), `index.html`,
  `styles5.css`, `questions_ua.js` (phrasings), `authors_ua.js` (Bronze notes), `who_windows.js`,
  `activity_context_ua.js` (authored low-energy variants only).
- Canonical data + logic (reused by stage5): `prototype_stage4_ua/data_ua.js`, `engine.js`.
- EN reference prototype: `prototype_stage4/`.
- Content source of truth (not read at runtime): `data/*.csv`, `knowledge_base/`.
- Review gate: `docs/expert_review_packet_ua.md` (+ `_checklist` / `_tracker`),
  `tools/build_review_packet.js`.
- Public preview: `.github/workflows/pages.yml` + `.github/pages-index.html`; its artifact allowlist
  intentionally excludes the rest of the repository.

---

## Work log (newest first)

### 2026-07-02 — Masaru Ibuka deadline and caregiver-blame boundary audit (26/26)
- Searched the complete 230-page local Russian edition of *Kindergarten Is Too Late!* by topic and
  visually checked PDF pages 23, 30–31, 45, 53, 86, and 200. They confirm age-three deadlines,
  fixed brain percentages, deterministic stimulation/environment claims, effortless native-like
  language, infant swimming, maternal-singing causation, and maternal-duty framing.
- Added the final high-caution review-only card, retaining only optional ordinary books, songs,
  family languages, safe objects, and movement without a deadline under WHO/Harvard/AAP
  boundaries. Blocked early-skill promises, passive/sleep learning, infant swimming, discipline
  optimization, character and social predictions, gendered care roles, and caregiver blame. No
  activity ID or runtime content was added. The planned author-card roadmap is now complete 26/26.

### 2026-07-02 — Glenn Doman early-academics and treatment boundary audit (25/26)
- Searched all three complete local PDFs: 199-page *How to Multiply Your Baby's Intelligence*,
  200-page *Teach Your Baby Math*, and a 22-page third-party method guide. Rendered and visually
  checked key pages covering IQ 200+, accelerated brain age, frequency/intensity/duration,
  instruction from birth, word/dot cards, multiple daily sessions, neurological organization,
  forced developmental sequences, and the transfer of brain-injury claims to healthy babies.
- Added one high-caution review-only card retaining only enjoyable shared reading at the baby's
  pace under the current AAP literacy report and WHO/Harvard responsive-interaction boundaries.
  Blocked cards and doses, infant reading/math, tests, IQ and brain-growth claims, critical-window
  pressure, treatment, forced movement/patterning, superiority, commercial programs, conditional
  affection, and caregiver blame. No activity ID or runtime content was added.

### 2026-07-02 — Makoto Shichida pseudoscience boundary audit (24/26)
- Searched both complete local PDFs: a 9-page secondary article and a 31-page commercial manual
  that mixes Shichida, Heguru, and Doman. Rendered and visually checked article pages 2–7 and
  manual pages 3–9 and 17. The materials confirm global left/right-brain claims, zero-to-three
  dominance, alpha-state learning, rapid mass input, ESP/prenatal telepathy, photographic memory,
  infant calculation, speed reading, intensive flash cards, and unsupported disability treatment.
- Added one high-caution review-only card retaining only an optional shared look at one ordinary
  picture at the baby's pace under WHO/Harvard responsive-interaction boundaries. Blocked brain
  activation, all flash-card doses and tests, extraordinary abilities, critical-window pressure,
  commercial curricula, treatment, predictions, and caregiver blame. No activity ID or runtime
  content was added.

### 2026-07-02 — William Sears full-source safety boundary (23/26)
- Searched the complete local 1,611-page *The Baby Book* text, reviewed its attachment-parenting,
  carrying, sleep, SIDS, feeding, vaccination, and medicine sections, and visually checked PDF
  pages 16, 20, 31–32, 253–254, and 755–756. Current AAP, CPSC, CDC, WHO, and Harvard guidance
  replaces the book wherever safety, health, or developmental evidence is involved.
- Added one high-caution review-only card retaining only a warm cue-responsive tone. Blocked the
  seven-B checklist, bed-sharing and outdated adult-bed precautions, attachment parenting as SIDS
  prevention, carrier/feeding/sleep prescriptions, attachment assessment, intelligence or
  development outcomes, medical advice, gendered care roles, and caregiver blame. No activity ID
  or runtime content was added.

### 2026-07-02 — Neufeld + Maté full-source boundary audit (22/26)
- Reviewed the complete local *Hold On to Your Kids* OCR and checked pages 113–118 against source
  images. Neufeld’s previous moderate/mechanism-support label was raised to high-caution
  inspiration-only; Maté remains high caution. The book is mainly about older-child peer
  orientation, discipline and dependence, not infant evidence.
- Added one joint review-only card retaining only warm presence without required reciprocity.
  Blocked “collecting”, elicited eye contact/smile/nod/grasp, attachment judgments, dependence and
  peer-orientation claims, hierarchy/control, separation or childcare judgments, future-behavior
  predictions, and caregiver blame. No activity ID or runtime content was added.

### 2026-07-02 — Suzuki full-source audit and caution escalation (20/26)
- Reviewed both complete local OCR sets and selected source images for *Nurtured by Love* and
  *Ability Development from Age Zero*. The earlier moderate label was raised to high caution after
  confirming training-from-birth, constant repetition, talent/memorization, family-environment
  causation, caregiver blame, bottle-versus-breast, and unsupported treatment claims.
- Added a review-only card that retains only an optional short shared song as responsive enjoyment
  under current WHO/Harvard boundaries. Blocked repertoire/dose, response testing, pitch or talent
  judgment, early-achievement pressure, character/brain/language outcomes, health treatment,
  passive playback replacing interaction, and all caregiver blame. No activity ID or runtime
  content was added.

### 2026-07-02 — How Babies Talk integration + Smart Start safety audit (19/26)
- Reviewed the complete 272-page *How Babies Talk* OCR and selected scans. Expanded the existing
  Hirsh-Pasek/Golinkoff card from 2–12 months around natural sound, gaze, gesture, response, and
  pause; explicitly converted the book’s “Try This” experiments into non-testable observations
  and blocked deliberate ignoring, misunderstanding, frustration, performance, or eye contact.
- Reviewed the complete 162-page *Smart Start* OCR and selected scans. Added Sassé as high-caution
  review-only: retained only a WHO/AAP-bounded awake, supervised, infant-led floor-play setup.
  Blocked pull-ups, passive/forced movement, balls, swings, spinning, ladders, assisted standing,
  crawling correction, reflex/brain-pathway claims, critical periods, flash cards, and diagnosis.
- No Smart Start activity entered runtime. Existing language activities remain unchanged; only
  their traceable supporting-source mapping expanded. Source wording is paraphrased, never copied.

### 2026-06-30 — Macias + Poon clinical workflow boundaries (18/26)
- Added separate no-caution boundary cards using the AAP report (reaffirmed with updates in 2024),
  current CDC monitoring/screening guidance, and the verified professional-handbook record.
  Macias keeps informal longitudinal observation strictly separate from validated screening;
  Poon limits summaries to factual, editable preparation and continuity.
- Explicitly blocked scores, risk/pass-fail labels, “all clear”, clinical impressions, referral or
  eligibility conclusions, and claims that saving/exporting a note completes follow-up or care.
  Both cards have no activity IDs and introduce no runtime changes.

### 2026-06-30 — Luria + Bernstein internal-theory boundary cards (16/26)
- Added separate review records for A. R. Luria and N. A. Bernstein after confirming that no
  local full books are available. Bibliographic records support only historical internal context;
  neither author supplies a new parent action, activity ID, milestone, or runtime claim.
- Luria now blocks brain-location, lesion-to-infant, speech-causation, diagnosis, and acceleration
  claims. Bernstein blocks perfect-pattern grading, forced movement, unsupported practice/dose,
  diagnosis, and motor-acceleration claims. Current WHO guidance remains the parent-facing
  boundary for responsive interaction and supervised infant activity.

### 2026-06-30 — Siegel + Bryson infant-safe co-regulation audit (14/26)
- Added one joint review-only card for *The Whole-Brain Child* and *No-Drama Discipline* after
  checking both local OCR sources and relevant page images. Retained only a relationship-first
  caregiver pause, reframed through current WHO responsive-care and Harvard serve-and-return
  guidance: an infant’s crying or fussing is a signal, not misbehavior.
- Explicitly excluded discipline, correction, redirection, tantrum framing, left/right and
  upstairs/downstairs brain metaphors, integration/rewiring claims, attachment or outcome
  guarantees, and caregiver blame. The card has no activity IDs and changes no runtime content.

### 2026-06-30 — John Medina good-enough caregiver-support card (12/26)
- Added a paraphrased review-only card from *Brain Rules for Baby*, checked against local page
  images and the author’s book record. Retained only the limits of one-size-fits-all advice,
  good-enough responsiveness, and the need for caregiver support; WHO/Harvard remain the boundary.
- Explicitly blocked one “proven” parenting style, IQ/genetic percentages, academic predictors,
  brain optimization, family-structure prescriptions, causal household claims, and caregiver blame.
  The cross-cutting map row has no activity IDs and John Medina was not added to the runtime.

### 2026-06-30 — Lise Eliot dated-claim audit and review card (11/26)
- Added a paraphrased, review-only card from *What's Going On in There?* after checking the local
  scan and publisher metadata. Retained only the low-pressure maturation-plus-experience and
  wide-range-resilience framing; WHO nurturing care remains the current evidence boundary.
- Explicitly excluded precise synapse/pruning numbers, neurotimelines, direct animal-to-child
  enrichment claims, permanence, critical-window loss, IQ, early-reading, sex-difference, and
  parent-guilt framing. The map row is draft and Lise Eliot was not added to the runtime.

### 2026-06-30 — Montessori prepared-environment review card (10/26)
- Added one paraphrased Bronze source card from *The Secret of Childhood*, checked against local
  page images and current AMI/Montessori work records. The usable idea is limited to a simple,
  safe, accessible setup, slow minimal demonstration, observation, and room for the child’s response.
- Mapped the form to existing cognitive-play activities but kept it outside the runtime. Explicitly
  prohibited intelligence, concentration, early-independence, sensitive-period deadline,
  method-superiority, developmental-acceleration, and unattended “child-led” claims.

### 2026-06-30 — Jill Stamm review-only author card (9/26)
- Added one paraphrased source card from *Bright from the Start*, verified against local page
  images and the publisher record. It uses Stamm only as a low-pressure wrapper for ordinary
  attention, warm response, and communication; Harvard serve-and-return and WHO nurturing care
  remain the mechanism/guideline boundary.
- Explicitly prohibited brain-wiring, IQ, attention-span, attachment-security, milestone-speed,
  and parent-perfection claims found or implied in stronger popular-neuroscience framing. Added a
  draft recommendation-map row but did not add Stamm to the parent-facing runtime.

### 2026-06-30 — public preview paused; internal source work resumes
- Owner chose not to make the prototype public yet. Removed the push trigger from the Pages
  workflow; it is now manual-only and Pages remains disabled, so future commits cannot publish it.
- Kept the narrow allowlisted workflow as dormant infrastructure. Next internal work moves to the
  author-card backlog, with all moderate/high-caution additions kept review-only until expert sign-off.

### 2026-06-30 — QA-gated public validation preview
- Added a GitHub Pages workflow for the external-review build. Every deployment runs the full
  Stage 5 regression suite before upload and uses the documented `pages: write` / `id-token: write`
  permissions and `github-pages` environment.
- The artifact is assembled from an explicit allowlist: the Stage 5 UA app, the canonical UA data
  and engine it imports, and a small root redirect. It does not publish the repository root,
  research inputs, competitor screenshots, internal review docs, or local browser data.
- Added regression assertions for the deployment allowlist and root route. Pages was previously
  unconfigured (public URL returned 404); the first successful workflow run still needs verification
  before the URL is placed in expert outreach.

### 2026-06-30 — P2.16 context-aware game choice
- Added a single optional context picker above today's game: default recommendation, up to
  three minutes, no materials, or low-energy. It stays inside the Game tab and never creates a
  competing home action or changes survey observations.
- Matching is deterministic and limited to activities already present in the personalized
  14-day plan. Duration/material filters use runtime metadata; low-energy selection and the
  visible «Коли сил мало» card use only 33 authored CSV variants. Missing `NEEDS_REVIEW`
  adaptations are not inferred. Manual activity/favorite selection calmly returns to default.
- Persisted the preference per child, extended backup validation/migration, disabled switching
  after completion, cached the new context file offline, and added content/coverage/UX regression
  checks. Validation baseline moved to P2.16 because external review has not started.

### 2026-06-30 — P2.15 warm identity and pressure-free weekly recap
- Replaced the anonymous gradient square with the existing original kite across the app bar and
  welcome state. Added a restrained warm palette, subtle page atmosphere, warmer cards, and a
  small kite-led weekly memory while keeping teal as the only primary interaction color.
- Added a derived seven-day play summary on Home. It appears only after a completion, uses
  «one / several moments» instead of a score, contains no progress, streak, target, or action,
  and reassures that one calm moment is enough. Optional reactions can add a private, neutral note.
- Added regression coverage for date filtering, reaction aggregation, no competing CTA/progress,
  original brand markup, warm styles, offline cache P2.15, and old-cache cleanup. Moved the
  unstarted expert/parent validation baseline to P2.15 and added tone/color review prompts.

### 2026-06-29 — P2.14 corrected-age routing and calm return loop
- Added an optional expected due date under a collapsed early-birth profile question. A valid
  date more than three weeks after birth selects the existing age block by corrected age, including a compact
  «скориг.» header label; it does not change milestone content, score development, or bypass
  the expert-review gate. Added explicit corrected-age questions to the expert checklist/tracker.
- Added per-child saved activities, a collapsed saved-games list inside the existing Game tab,
  and optional «Сподобалося / Не сьогодні» feedback only after a game is completed. Feedback
  stays local and does not claim to personalize recommendations yet.
- Extended migration, backup validation, multi-child isolation, one-thumb focus restoration,
  styling, cache versioning, and regression coverage. Validation baseline moved to P2.14 because
  expert outreach and parent sessions have not started.

### 2026-06-29 — P2.13 guarded local storage
- Replaced throwing `localStorage` reads/writes with safe operations that retain in-memory
  state and return persistence success. A rare appbar status gives a short visible label and a
  fuller accessible recovery message pointing to private backup.
- A later successful write clears the stale warning automatically. Failed full erasure leaves
  the current store intact; backup restore distinguishes “opened in memory” from persistently saved.
- Added regression coverage that forces storage failure and recovery. Updated the offline cache
  and unstarted validation baseline to P2.13; syntax, full QA, HTTP, and diff checks pass.

### 2026-06-29 — P2.12 user-approved PWA updates
- Removed automatic `skipWaiting` during service-worker installation. New shells may download
  in the background but cannot interrupt an observation, note, or activity in progress.
- Added a hidden-settings update card that appears only for a waiting worker. Tapping
  «Оновити зараз» sends one explicit activation message; `controllerchange` reloads exactly
  once and only when that action was requested.
- Extended lifecycle tests for waiting, explicit activation, first-install no-reload, and
  duplicate controller changes. Updated cache and the unstarted validation baseline to P2.12.

### 2026-06-29 — P2.11 calm install discovery
- Added a short «Додати на головний екран» fallback inside collapsed data settings. It
  does not compete with the primary home action.
- On browsers that emit `beforeinstallprompt`, one explicit install button appears and opens
  the native prompt only after the parent taps it. Dismissal copy is pressure-free; the prompt
  is never reused; installed/standalone mode hides the controls.
- Added an isolated install-flow test covering deferred prompt, dismissal, installed state,
  and service-worker registration. Updated the cache and unstarted validation baseline to P2.11.

### 2026-06-29 — P2.10 private local backup and restore
- Added a versioned JSON backup download under collapsed data settings with a plain privacy
  warning. The app does not upload the file or require an account.
- Restore accepts only the current Milestones schema, caps file size, validates child ids,
  profiles, storage containers, survey answer states, history, and specialist notes, then asks
  before replacing the current local store. Invalid files leave existing data untouched.
- Added round-trip and deliberate tampering regression coverage, updated the PWA cache to
  P2.10, and moved the unstarted validation baseline to P2.10. Syntax, full regression, and
  diff checks pass.

### 2026-06-29 — P2.9 installable offline app
- Added a standards-based web manifest, theme/install metadata, and an original kite icon in
  SVG plus 192/512 PNG sizes. No third-party artwork or external runtime dependency is used.
- Added a versioned service worker that pre-caches the complete Stage5 shell and canonical UA
  content, removes only older Stage5 caches, uses network-first navigation, and falls back to
  cached `index.html` offline. A small appbar status appears only while offline.
- Added manifest/icon assertions and an isolated service-worker lifecycle test covering install,
  activate, old-cache cleanup, and offline navigation. Syntax, regression, HTTP/MIME, and diff
  checks pass. The in-app browser connection timed out during live registration inspection, so
  that browser-only check is not claimed. Validation baseline moved to P2.9 before outreach.

### 2026-06-28 — P2.8 accessibility hardening
- Removed `aria-live` from the entire changing main region and focused the relevant heading or
  current survey question instead. Survey and copy feedback now use concise atomic statuses.
- Preserved keyboard focus after completion, accordion, and activity-choice re-renders. Added
  semantic progress values to the resumable home card and enlarged key helper, label, and
  navigation text.
- Added forced-colors active-state support while retaining reduced-motion rules. Updated the
  validation baseline from P2.7 to P2.8 because external review has not started. Automated QA,
  syntax checks, diff checks, and localhost asset checks pass; the in-app browser connection
  timed out twice during post-change visual verification, so no visual pass is claimed.

### 2026-06-28 — Validation materials synchronized to P2.7
- Updated the parent facilitator pack to v1.1 so its scripted answers and controls match the
  live interface: «Ще не помічаю», one-tap survey advance with Back, the fixed game
  action, and optional collapsed specialist notes.
- Added explicit one-hand, one-glance, interruption-recovery, and emotional-safety observations
  plus first-round thresholds. The test must never ask a participant to hold a real child.
- Locked expert review and the first parent round to the Stage 5 UA / P2.7 baseline. Added
  expert checks for gentle wording, reassurance-vs-urgency, collapsed sensitive guidance, and
  the copied specialist summary. No outreach or live testing has been started.

### 2026-06-28 — P2.7 unified bottom-navigation icon family
- Replaced the unrelated `⌂ / ◎ / ◇ / ✎` glyphs with four original inline SVG icons: house,
  eye, kite, and pencil. They share a 20×20 view box, 1.7 px stroke, round caps/joins, and inherit
  the existing inactive/active navigation color.
- Kept icons decorative for assistive technology while preserving the four visible button
  labels and 48 px tap targets. Added a regression invariant requiring all four SVGs and
  rejecting the legacy glyphs.

### 2026-06-28 — P2.6 emotion-aware copy guardrails
- Changed the parent-facing `not_yet` label from “Поки ні” to “Ще не помічаю” across survey,
  history, discussion cards, and the copied specialist summary while preserving the stored
  state key and all comparison logic.
- Added one shared reassurance block before sensitive “discuss” guidance: one answer is not a
  conclusion, the parent need not re-check the child immediately, and a normal example can be
  noted for a later conversation. The underlying clinician-review text remains unchanged.
- Extended the one-tap transition to 450 ms and made pause/return behavior explicit. Increased
  small navigation, helper, discussion-meta, and history-label text. Regression coverage now
  protects the gentler label and non-conclusion framing. This remains a UX hypothesis pending
  live clinician and parent validation.

### 2026-06-28 — P2.5 one-thumb and low-attention pass
- Reduced the survey interaction from answer + Next to one answer tap with a short saved state,
  automatic advance, and Back on subsequent questions. Added a regression simulation that
  verifies the state is saved and the question index advances without a separate Next button.
- Removed repeated child/age/profile controls from home and moved profile editing into data
  management. Removed the large activity illustration and repeated rationale from the primary
  game flow so the title and all four steps fit in the first 390×844 viewport.
- Added one consistent thumb action above bottom navigation for results, today's completion,
  and specialist-summary copy. Specialist note fields are now optional and collapsed;
  numerical discussion badges and visible answer counts were removed from that screen.
- Browser QA at 390×844 found no horizontal overflow, duplicate ids, undersized visible
  controls, console warnings, or errors. Fixed actions sit above navigation; home, game, and
  specialist secondary sections stay collapsed by default.

### 2026-06-28 — P2.4 visit-ready specialist preparation
- Replaced the long specialist page with a compact latest-observation card showing the child,
  age, date, and descriptive answer counts. “When to discuss” guidance remains available under
  one collapsed disclosure and no new developmental conclusion or medical claim was added.
- Split the single notes textarea into “Що ви помітили?”, “Що вже пробували?”, and “Що хочете
  запитати?”. The copy action now creates a visit-ready plain-text summary from the current
  child only; legacy notes migrate into the first field without loss.
- Extended regression coverage for markup, summary output, migration, and child isolation.
  Browser QA at 390×844 found three textareas, one copy action, no overflow, undersized visible
  controls, duplicate ids, console warnings, or errors; the five discussion items are collapsed
  by default and expand correctly.

### 2026-06-28 — P2.3 today-first game screen
- Replaced the seven-day accordion-first layout with one always-open activity for today.
  Activity steps now render as a compact numbered sequence with the stop guidance and one
  completion control kept in the main flow.
- Moved alternative activities under “Хочете іншу гру?” and the remaining six days under
  “Наступні 6 днів”. Existing activity selection, future-day details, evidence notes, and
  completion persistence remain available.
- Extended the product regression suite with today/future markup invariants. Browser QA at
  390×844 found one today card, one completion button, no overflow, undersized controls,
  duplicate ids, or console errors; both secondary sections are collapsed by default.

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
  “Бачу”, “Ще спостерігаю”, and “Ще не помічаю”; no score or developmental rating is introduced.
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
