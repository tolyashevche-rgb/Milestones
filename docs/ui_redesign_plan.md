# UI/UX Redesign Plan — guided flow

Version: Stage 6 (proposed)
Date: 2026-06-08

Goal: move from the current **5-tab demo** (Watch / Play / Ask / History / Summary) to a
**guided, linear journey** matching the locked product direction (see
[../README.md](../README.md) → "Product direction"). Tabs stay available afterwards as a
**personal cabinet**, but a first-time parent is led step by step.

All copy obeys [safety_rules.md](safety_rules.md): no score/level/risk, no "weak sides",
charts are descriptive, "vision" = calm observations + "when to discuss".

---

## 1. Information architecture

```
First run (one time)
  Welcome ──> Consent / age-gate ──> Child profile (name + DOB) ──┐
                                                                   v
Returning user ───────────────────────────────────────────> HOME (cabinet)
                                                                   │
        ┌──────────────────────────────────────────────────────── ┤
        v                 v                 v                 v     v
    Today's task     Run survey ──> Results ──> Vision ──> Program   Progress
    (1 activity)     (per age)      (charts)   (notice +  (1–2 wk)   (timeline,
                                               discuss)              re-tests)
```

- **Home / cabinet** is the hub: today's task, "where you are", quick re-test, progress.
- The **survey → results → vision → program** is the core loop, run per CDC age window.
- **Progress** holds the comparison timeline across re-tests (the "two clocks": re-test by
  age window, daily task by engagement).

## 2. Screen-by-screen (mobile-first, one-handed)

**S0 — Welcome.** One promise line + "Start". Trust row (CDC/AAP/WHO/Harvard). Disclaimer.

**S1 — Consent / age-gate.** "I'm a parent/caregiver", child's age band, accept that this
is not diagnosis/screening. Required before any data is stored. (GDPR.)

**S2 — Child profile.** Name (optional) + date of birth → auto-computes current age window
(2/4/6/9/12 mo). Supports multiple children later. Stored locally (IndexedDB).

**S3 — Survey.** One question per card, **2–3 randomly selected per (age × domain)** from
the curated pool. Big Yes / Not sure / Not yet buttons. Progress dots. No "right answer"
framing — "this is observation, not a test for your child".

**S4 — Results.** Descriptive charts only: per-domain "observed X / Y", and (on re-test)
the comparison vs last snapshot. Never a single "developmental score".

**S5 — Vision.** Calm prose: strengths first, then 1–2 focus areas as *more chances to
play*, then contextual "when to discuss" notes for flagged items (the `DISCUSS_BY_ID`
layer). Clear-result path still invites joining the program.

**S6 — Program.** Seven-day plan of optional play opportunities, game-like cards (illustration + title + time +
"why it works" + stop rule). "Doing one already counts." Optional "add to calendar" (.ics).

**S7 — Home/cabinet (returning).** Today's task front and center; "next milestone check:
around N months"; shortcuts to re-test, program, progress, notes-for-doctor (PDF export).

## 3. UX principles (the "all UI/UX requirements" checklist)

- **One primary action per screen.** Big tap targets (≥44px), thumb-reachable bottom CTAs —
  parents hold a baby.
- **Calm, non-clinical tone.** Soft colors, generous spacing, no alarm red for the child's
  results. Red/urgency only never used about the child.
- **Progress made visible** without judgement (dots, "X of Y observed"), never percentile.
- **Always-on evidence + stop rules** on every activity (already a rule).
- **Accessibility:** semantic HTML, labels, focus states, `aria-*` on tabs/controls,
  contrast AA, works with text zoom, full keyboard nav.
- **Resilience:** offline-first (IndexedDB), autosave, "erase all my data" control.
- **Localization-ready:** UA-first, strings separated from logic (engine already is).
- **Reassurance pattern:** every results/vision screen ends with the calm disclaimer.

## 4. Component inventory (reusable)

`AppShell` (header + bottom nav) · `QuestionCard` · `ProgressDots` · `DomainChart`
(descriptive bars) · `ComparisonChart` (snapshot vs snapshot) · `VisionCard` ·
`DiscussNote` · `ActivityCard` (illustration slot) · `DayPlanList` · `TodayTask` ·
`ConsentForm` · `ChildProfileForm` · `EmptyState` · `Disclaimer`.

## 5. Build order (incremental, keeps the prototype working)

1. **AppShell + routing** (hash routes `#/home`, `#/survey`, …) over the existing engine.
2. **S2 child profile + IndexedDB** store (replaces flat `localStorage`); migrate snapshots.
3. **S3 survey** wired to the curated question pool (depends on the pool existing).
4. **S4/S5 results + vision** reusing `buildProfile` + `domainBars` + `DISCUSS_BY_ID`.
5. **S6 program** reusing `buildProgram` (seven-day reflection cycle), illustration slots.
6. **S7 cabinet/home** + `.ics` "today's task".
7. **S0/S1 welcome + consent**; polish, a11y pass, copy review against safety_rules.

Reuse, don't rewrite: `engine.js`, `DISCUSS_BY_ID`, `domainBars`, snapshot logic all carry
over. The redesign is mostly **new presentation + navigation**, not new logic.

## 6. Open questions for the redesign

- Keep tabs as the cabinet, or full bottom-nav app shell? (Recommend bottom-nav shell.)
- Build the redesign as a new `prototype_stage5_ua/` (clean slate, keep stage4 as
  reference) or refactor stage4 in place? (Recommend new folder to avoid destabilizing the
  working demo.)
- Illustration style/source — commission vs licensed library (copyright-safe either way).
