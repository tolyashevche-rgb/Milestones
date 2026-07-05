# Action Plan: CDC x Europe Milestones

> **Historical Stage 4 plan.** Do not use this file to identify the current interface or
> audit target. See [../CURRENT_BUILD.md](../CURRENT_BUILD.md) for Stage 5 UA / P2.45.

Дата старту: 2026-05-05

## Current Stage

Stage 4: Prototype and Validation Loop.

Goal: перетворити review-ready content pack у перший клікабельний продукт, landing structure і сценарій тестування з батьками.

Активний план наступного розширення продукту: [product_expansion_retention_plan_ua.md](product_expansion_retention_plan_ua.md).

## Completed

- Адаптована матриця сенсів:
  - `adapted_meaning_matrix_cdc_europe.md`
  - `adapted_meaning_matrix_cdc_europe.csv`
- Research foundation:
  - `research_foundation.md`
  - `evidence_sources.csv`
- Product architecture:
  - `product_data_model.md`
  - `milestone_schema.csv`
  - `activity_schema.csv`
  - `mvp_0_12_months_map.csv`
  - `6_months_sample_page.md`
- Review-ready content pack:
  - `expert_review_checklist.md`
  - `activity_library_0_12_months.csv`
  - `6_months_review_ready_page.md`
  - `free_starter_pack_draft.md`
- Prototype and validation:
  - `landing_structure.md`
  - `parent_test_script.md`
  - `developmental_memory_plan.md`
  - `mobile_access_plan.md`
  - `prototype_stage4/legacy-reference.html` (historical reference)
  - `prototype_stage4/styles.css`
  - `prototype_stage4/app.js`
  - `prototype_stage4_ua/legacy-reference.html` (historical reference)
  - `prototype_stage4_ua/app.js`

## Stage 1 Deliverables

| Deliverable | Status | File |
|---|---|---|
| Evidence hierarchy | Done | `research_foundation.md` |
| Source registry | Done | `evidence_sources.csv` |
| Claim safety rules | Done | `research_foundation.md` |
| Citation structure | Done | `research_foundation.md` |
| Stage 2 decision list | Done | `research_foundation.md` |

## Stage 1 Quality Criteria

Stage 1 is considered complete when:

- every primary source has a clear role;
- milestones are separated from activities;
- surveillance is separated from screening and diagnosis;
- activities use evidence buckets rather than unsupported claims;
- unsafe claims are documented and blocked;
- the team knows what to build in Stage 2.

## Key Product Rules

1. We do not diagnose.
2. We do not treat developmental delays.
3. We do not replace pediatricians, speech-language specialists, physiotherapists or other professionals.
4. We support developmental monitoring and playful learning.
5. Every milestone needs source attribution.
6. Every activity needs a mechanism and source bucket.
7. Parent language must reduce panic, not increase it.

## Stage 2 Deliverables

| Deliverable | Status | File |
|---|---|---|
| Product data model | Draft done | `product_data_model.md` |
| Milestone schema | Draft done | `milestone_schema.csv` |
| Activity schema | Draft done | `activity_schema.csv` |
| MVP 0-12 months map | Draft done | `mvp_0_12_months_map.csv` |
| 6 months sample page | Draft done | `6_months_sample_page.md` |

## Stage 2 Quality Criteria

Stage 2 is considered complete when:

- the data model can support web, PDF and Notion output;
- every MVP milestone has source IDs;
- every activity has a mechanism, source bucket and stop rules;
- the 6 months sample page feels parent-friendly and clinician-safe;
- the map is ready for expert review.

## Stage 3 Deliverables

| Deliverable | Status | File |
|---|---|---|
| Expert review checklist | Draft done | `expert_review_checklist.md` |
| Activity library 0-12 months | Draft done | `activity_library_0_12_months.csv` |
| Review-ready 6 months page | Draft done | `6_months_review_ready_page.md` |
| Free starter pack draft | Draft done | `free_starter_pack_draft.md` |

## Stage 3 Quality Criteria

Stage 3 is considered complete when:

- an expert can review the content using a clear checklist;
- every activity has source IDs, claim limits and stop rules;
- the 6 months page contains reviewer notes and source IDs;
- the starter pack clearly shows the `watch / play / ask` method;
- unsafe claims are absent.

## Stage 4 Deliverables

| Deliverable | Status | File |
|---|---|---|
| Landing structure | Draft done | `landing_structure.md` |
| Parent test script | Draft done | `parent_test_script.md` |
| Developmental memory plan | Draft done | `developmental_memory_plan.md` |
| Mobile access plan | Draft done | `mobile_access_plan.md` |
| Clickable static prototype | Historical draft | `prototype_stage4/legacy-reference.html` |
| Ukrainian clickable prototype | Historical draft | `prototype_stage4_ua/legacy-reference.html` |
| Prototype styles | Draft done | `prototype_stage4/styles.css` |
| Prototype interactions | Draft done | `prototype_stage4/app.js` |

## Stage 4 Quality Criteria

Stage 4 is considered complete when:

- a parent can open the prototype without setup;
- the prototype demonstrates `Watch / Play / Ask / Summary`;
- milestone state controls work;
- activity cards are clickable;
- local developmental memory works without account/backend;
- history is framed as parent observations, not score/diagnosis;
- pediatric summary updates from parent selections and notes;
- the landing structure has a clear free starter pack CTA;
- Ukrainian-first testing version exists for Ukrainian parent interviews;
- mobile access path is documented;
- the parent test script can be used for a first 5-parent test.

## Next Stage: Stage 5

Stage 5 should produce expert and parent feedback integration:

1. Expert review tracker.
2. Parent test results summary.
3. Revised prototype.
4. Final MVP scope decision.
5. Build plan for web MVP or PDF/Notion MVP.

## Current Testing Language Decision

First parent validation should be Ukrainian-first:

- use `prototype_stage5_ua/index.html` for Ukrainian-speaking parent interviews;
- keep `prototype_stage4/legacy-reference.html` as an English/EU historical reference;
- later combine into one bilingual product after testing the structure.

## Stage 2 First Build

Started with a complete `6 months` page because it is rich enough to test the whole product logic:

- social/emotional milestones;
- language/communication milestones;
- cognitive milestones;
- movement/physical milestones;
- activities across all domains;
- `Monitor / Discuss` block;
- `Why it works`;
- source labels;
- 7-day plan;
- pediatric summary.

## Decisions Needed Before Stage 5

1. Build language: English first, Ukrainian first, or bilingual?
2. MVP region: Luxembourg/EU-first or US/EU bridge?
3. Format: web MVP first, PDF/Notion first, or both?
4. Expert review: who reviews movement/language/social-emotional sections?
5. Claims strictness: mechanism buckets for MVP or study-level citation for every activity?
