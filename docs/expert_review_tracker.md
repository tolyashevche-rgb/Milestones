# Expert Review Tracker — Stage 5

Version: Stage 5
Started: 2026-06-16
Companion to: [expert_review_checklist.md](expert_review_checklist.md) (the *questions*); this
file is the *answers + status*. It is the Stage 5 deliverable #1 from
[action_plan.md](action_plan.md).

## How to use

1. A reviewer reads the checklist, then reviews the **current files** below.
2. They sign off per domain × age in the matrix, log blocking issues, and give a verdict.
3. Nothing reaches real parents until every relevant cell is **Approved** (or
   *Approved after revisions* with the revisions done) — see `safety_rules.md` §9.

This tracker reflects the **actual UA content the parent sees** (runtime + its mirror), not
the older English content pack. Where the runtime lacks authored-safety fields, that gap is
listed in §5 so a reviewer is not asked to approve fields that do not exist yet.

---

## 1. Reviewer registry

| Reviewer | Role | Primary area (from checklist) | Date | Status |
|---|---|---|---|---|
|  | Pediatrician / family doctor | Overall safety, referral language, screening-vs-monitoring |  | ☐ not started |
|  | Pediatric physiotherapist / OT | Movement + physical activities, positioning, stop rules |  | ☐ not started |
|  | Speech-language specialist | Language + communication activities |  | ☐ not started |
|  | Child psychologist / developmental | Social-emotional framing, parent anxiety |  | ☐ not started |
|  | Early childhood educator | Usability, parent routines, low-prep |  | ☐ not started |

Status legend: ☐ not started · ◐ in progress · ✅ approved · ⚠ approved after revisions · ✗ blocked

---

## 2. Files for review (CURRENT — UA-first)

Review these, in this order. **Bold** = what the parent actually sees at runtime.

- **`prototype_stage4_ua/data_ua.js`** — milestones (54) + activities (60): the live content.
- **`data/activity_library_0_12_months_ua.csv`** — readable 1:1 mirror of the 60 activities
  (use this to review activities row-by-row; `NEEDS_REVIEW` marks fields not authored yet).
- **`prototype_stage5_ua/questions_ua.js`** — alternate survey phrasings (2 per milestone).
  *Draft — pending this review.*
- **`prototype_stage5_ua/authors_ua.js`** — Bronze "approach" notes. *Draft — pending this review.*
- `data/mvp_0_12_months_map.csv` — milestone map incl. `discuss_if` ("when to discuss").
- `docs/safety_rules.md` — the claim/guardrail rules every item must pass.
- `docs/6_months_review_ready_page.md` — a worked single-age example (reference).

> Note on language: content is **Ukrainian** (UA-first testing decision, `action_plan.md`).
> The English `data/activity_library_0_12_months.csv` (33 rows) is an older, richer-but-stale
> pack — do **not** review it as current.

---

## 3. Sign-off matrix (domain × age)

One cell per (domain × age). Covers all 54 milestones + 60 activities by group. Mark with the
status legend above; put detail in §4.

| Domain \ Age | 2 mo | 4 mo | 6 mo | 9 mo | 12 mo |
|---|---|---|---|---|---|
| Social-emotional |  |  |  |  |  |
| Language + communication |  |  |  |  |  |
| Cognitive (Навчання і мислення) |  |  |  |  |  |
| Movement + physical |  |  |  |  |  |

Cross-cutting (review once, not per cell):

| Item | Status | Reviewer | Note |
|---|---|---|---|
| Disclaimers + screening-vs-monitoring framing |  |  |  |
| `discuss_if` / "when to discuss" wording (calm, not alarming) |  |  |  |
| Survey phrasings (`questions_ua.js`) inherit milestone meaning |  |  |  |
| Author "approach" notes (`authors_ua.js`) stay inspiration-only |  |  |  |
| Charts stay descriptive (no score/percentile) |  |  |  |
| WHO motor-window mappings accurate? (esp. `ms_012_movement_001` ≈ "standing with assistance" — approximate; `who_windows.js` / `data/who_motor_windows_0_12.csv`) |  |  |  |
| WHO "typical range" wording stays reassurance, never a deadline |  |  |  |
| **Milestone priority** — CDC deliberately does NOT rank age milestones (act-early = any unmet). Should any be flagged higher-priority for an age, or stay uniform? (parent-raised) |  |  |  |

---

## 4. Blocking issues log

| # | File / id | Issue | Severity | Raised by | Resolution | Done |
|---|---|---|---|---|---|---|
| 1 |  |  | 🔴/🟠/🟡 |  |  | ☐ |

Severity: 🔴 safety-blocking · 🟠 needs revision before parents · 🟡 optional improvement.

---

## 5. NEEDS_REVIEW backlog (authoring gaps before/with review)

The runtime carries only: `title, domain, supports, duration, materials, steps, why,
stop, evidence`. The authored fields below (`setup`, `what_to_watch`, `claim_limit`,
`low_energy_option`, `adaptations`, `source_ids`) do not exist in the runtime. Status by tier:

- **Back-filled (33 activities):** these fields were translated from the EN
  `activity_library_0_12_months.csv` into the UA mirror, and `source_ids` now carries precise
  card IDs (e.g. `cdc_ltsae_6_months|who_motor_milestones`). **Translated drafts — still
  pending this review**, not yet expert-validated. Reviewers should verify wording, esp.
  `claim_limit` and `what_to_watch`.
- **Net-new (27 activities):** still `NEEDS_REVIEW` — no authored safety fields anywhere, and
  `source_ids` is only a coarse framework label (e.g. "CDC + WHO"). Must be written from
  scratch (esp. `claim_limit`, `what_not_to_do`, `what_to_watch`), then reviewed:

  ```
  act_002_social_003  act_002_language_003  act_002_cognitive_002  act_002_cognitive_003
  act_002_movement_002 act_002_movement_003  act_004_social_002    act_004_social_003
  act_004_language_003 act_004_cognitive_003 act_004_movement_002  act_004_movement_003
  act_006_social_003   act_006_language_002  act_006_language_003   act_006_cognitive_003
  act_006_movement_003 act_009_social_003    act_009_cognitive_002  act_009_cognitive_003
  act_009_language_003 act_009_movement_003  act_012_social_002     act_012_social_003
  act_012_language_003 act_012_cognitive_003 act_012_movement_003
  ```

---

## 6. Final decision

| Question | Answer |
|---|---|
| Content reviewed (scope) |  |
| Top safety concerns |  |
| Required revisions (must do) |  |
| Optional improvements |  |
| **Approved for parent testing?** | ☐ Yes · ☐ Yes after revisions · ☐ No |
| Sign-off (name / role / date) |  |
