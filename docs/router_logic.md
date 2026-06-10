# Router Logic — how answers become a recommendation

Version: Stage 5
Date: 2026-06-01

This documents the **existing** routing engine (`prototype_stage4/engine.js`, copied
identically to `prototype_stage4_ua/engine.js`). It is not a separate or planned
system — it is the working code, written down. If the code and this file diverge,
the code is authoritative; update this file to match.

The engine obeys `safety_rules.md` (option A, Profile-of-focus). No score, level, or
risk ever leaves it.

---

## Inputs

- `states`: `{ milestoneId: "yes" | "not_sure" | "not_yet" }` — what the parent marked
  in the "Watch" checklist for one age.
- `age`: one of `2, 4, 6, 9, 12` (months).
- Data globals from `data.js`: `MILESTONES_BY_AGE`, `ACTIVITIES_BY_AGE`. Each activity
  carries `supports: [milestoneIds]`, `evidence`, `source`.

A stable, language-independent domain key is parsed from the id:
`ms_006_social_001` → `social`. Domains: `social, language, cognitive, movement`.

---

## Step 1 — `buildProfile(states, age)`

1. Group the age's milestones into the four domains.
2. Per domain, tally `yes`, `not_sure`, `not_yet`, and collect the ids the parent did
   not confirm (`notYetIds`, then `notSureIds`) as `targetMilestoneIds`.
3. Internal ordering weight per domain:

   ```
   weight = not_yet * 2 + not_sure * 1        (notYetWeight=2, notSureWeight=1)
   ```

   **This weight is internal only — never shown to the parent.** It just orders focus.
4. `focus` = domains with `weight > 0`, sorted descending, capped at `maxFocus` (2).
5. `strengths` = domains with the most `yes`, top 2.
6. Flags: `notStarted` (nothing marked), `allClear` (everything marked, nothing flagged).

Output: `{ age, answered, allClear, notStarted, strengths, focus, stats }`.

---

## Step 2 — `buildProgram(profile, age)`

Produces a day-by-day list: `[{ day, domain, options: [activityId, ...] }]`.

1. **Maintenance mode** (`allClear`): light rotation through all activities of the age,
   flagged `maintenance: true`, no pressure framing.
2. Otherwise, `allocateDays(focus, cycleDays)` spreads `cycleDays` (7) across the focus
   domains **proportional to weight**, with a minimum of 1 day each (largest-remainder
   method). A domain with more "not yet / not sure" therefore appears on more days —
   this is the adaptivity, expressed as *more chances to play*, not a higher dose.
3. For each focus domain, `candidatesForDomain` picks activities whose `supports`
   intersect the flagged milestones first, then other same-domain activities for
   variety.
4. Days are interleaved (heavier focus more often, but not all clumped together).
5. Each day offers up to `optionsPerDay` (2) **primary** same-domain options, plus up to
   `bonusPerDay` (2) **optional cross-domain "bonus"** ideas (`bonus: [{domain, id}]`) drawn
   from other domains on a rotating index, so a day can touch several developmental areas
   while keeping its primary focus. Bonus is explicitly optional — doing one already counts,
   never a dose. Maintenance-mode days carry bonus too.

---

## Tunable parameters (`ENGINE_CONFIG`)

| Param | Default | Meaning |
|---|---|---|
| `cycleDays` | 7 | Length of the weekly play cycle (engagement clock) |
| `maxFocus` | 2 | Max primary focus domains shown |
| `optionsPerDay` | 2 | Primary same-domain activity options offered per day |
| `bonusPerDay` | 2 | Optional cross-domain "bonus" ideas added per day (breadth, not a dose) |
| `notYetWeight` | 2 | Weight of a "not yet" when ordering focus |
| `notSureWeight` | 1 | Weight of a "not sure" |

These are **starting hypotheses**, not proven optima. They are tuned by the parent
test and expert review, deliberately kept out of the core logic so they can change
without rewriting the engine. None of them is an evidence-based dosage.

---

## What the router does NOT do

- It never generates activities at runtime. It only selects from the curated,
  sourced set in `ACTIVITIES_BY_AGE`. No live LLM generation, so every recommendation
  is traceable to a source and reviewable.
- It never computes or exposes a score, level, percentile, or risk.
- It does not set the milestone re-assessment schedule — that follows CDC age windows
  (the UI shows "next milestone check: around N months").

---

## Re-assessment cycle (UI)

`nextCheckAge(age)` returns the next CDC age window (`2 → 4 → 6 → 9 → 12`). The Play
tab shows it as a gentle prompt. The weekly play cycle and the milestone re-check are
two separate clocks (see `safety_rules.md` §4).
