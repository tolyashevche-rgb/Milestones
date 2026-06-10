# Author Base — governance and structure

Version: Stage 5 (scaffold)
Date: 2026-06-01

This is the home for **author-derived content** (Montessori, Pikler, Doman, Suzuki,
books, named methods). It exists so author ideas can enter the product **only inside
the evidence-first rules** of [safety_rules.md](safety_rules.md) §6.

Canonical location: this folder, inside the Milestones repo, so it feeds the same
CSV → `data.js` → prototype pipeline. Do not maintain a second copy elsewhere — one
source of truth.

---

## The one rule that makes this safe

> **An author idea may be used only if it maps onto a Silver mechanism or a Gold
> guideline.** "Author X says so" is never enough on its own.

This is why every author record has a required `maps_to` / `maps_to_mechanism` field.
That field is the bridge that keeps the product evidence-first: CDC/AAP/WHO set the
boundary, the mechanism explains *why* it works, and the author only contributes the
*form* of the play.

---

## Files

| File | What it holds |
|---|---|
| `author_research_inventory.md` | **CANONICAL** human inventory: authors by section, role, priority, works, best use, problem map, ingestion rule |
| `authors_registry.csv` | Machine companion **derived from the inventory**, adding `caution`, `use_as`, `maps_to_mechanism`, `status` |
| `author_works_inventory.csv` | Start list of specific books/articles/tools to extract into atomic source cards, with project use, caution and verification links |
| `problem_to_author_map.csv` | Machine version of the inventory's Problem-To-Author map, with a `scope` flag |
| `author_source_cards/` | One atomic card per author idea — a **paraphrased principle**, never a quote |
| `author_source_cards/_TEMPLATE.md` | Copy this to start a new card |
| `recommendation_author_map.csv` | concern/focus → author → idea → mechanism it maps to → resulting activity ids |

Single source of truth: `author_research_inventory.md` is canonical. The two CSVs are
faithful, machine-ingestable derivatives of it — if they disagree, fix the CSV.

### Registry legend (`authors_registry.csv`)

- **section / role / priority**: copied from the canonical inventory.
- **use_as**: `boundary` (limits/referral only, never an activity author) ·
  `mechanism_support` (may inform an activity *if* it maps to a mechanism) ·
  `inspiration_form_only` (form/environment idea only, never evidence).
- **maps_to_mechanism**: the required bridge to a Silver mechanism / Gold guideline.
  Blank only for `boundary` authors. No mechanism → not usable as a recommendation.
- **caution**: `high` authors carry claims that conflict with `safety_rules.md` — usable
  **only** as inspiration, never as proof, always with hedged framing.
- **status**: `needs_verification` must be confirmed before ingestion.

The map links authors to the existing activity library
(`activity_library_0_12_months.csv`) and milestone map, so nothing floats free.

---

## How to add an author idea (workflow)

1. Read the author's principle and **paraphrase** it (no verbatim text, no reproduced
   exercises — copyright).
2. Find the **mechanism** (Silver) or **guideline** (Gold) it aligns with. If none —
   stop. It cannot be used as a recommendation.
3. Create a card in `author_source_cards/` from the template.
4. Write `allowed_framing` and `not_allowed_framing` per safety_rules §6.
5. Add a row to `recommendation_author_map.csv` linking it to the focus area and, if it
   informs an activity, the `activity_id`(s).
6. Mark `status: draft`. It is **not** shown to users until expert review
   ([expert_review_checklist.md](expert_review_checklist.md)).

---

## What this base must never do

- Present an author method as clinical proof or as a cure/guarantee.
- Reproduce copyrighted text or exercises verbatim.
- Drive a recommendation without a mechanism/guideline mapping.
- Produce a score, level, or "your child is behind" framing (see safety_rules §2, §4).
