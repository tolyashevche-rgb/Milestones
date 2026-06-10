# Research Foundation: CDC x Europe Milestones

Версія: Stage 1 foundation
Дата: 2026-05-05

## Мета етапу 1

Побудувати доказову і безпечну основу для продукту `CDC x Europe Milestones`: які джерела використовуємо, яку роль має кожне джерело, як маркуємо доказовість, як формулюємо claims, і як цитуємо milestones та activities.

Цей документ є базою для етапу 2: структури продукту, data model, milestone map і activity library.

## Product Thesis

Ми створюємо не діагностичний інструмент і не курс лікування затримок, а спокійну evidence-informed карту розвитку для батьків у Європі:

> Know what to watch, what to play, and when to ask.

Українською:

> Знати, що спостерігати, у що грати і коли варто поставити питання фахівцю.

## Scope

### MVP

- Вік: 0-12 місяців.
- Контрольні віки: 2, 4, 6, 9, 12 months.
- Домени: social/emotional, language/communication, cognitive, movement/physical.
- На кожен вік:
  - 8-12 milestones;
  - 8-10 activities;
  - 7-day plan;
  - `Monitor / Discuss with professional`;
  - `Why it works`;
  - джерела.

### Later Scope

- 15, 18, 24, 30, 36, 48, 60 months.
- Multilingual: EN, FR, DE, PT, UA.
- Caregiver sharing.
- Pediatric visit summary.
- Domain-specific packs: movement, language, social-emotional.

## Source Hierarchy

### Gold: Authoritative Guidelines and Surveillance Frameworks

Використовуються для milestones, review windows, referral logic і disclaimers.

| Source | Role in Product | Notes |
|---|---|---|
| CDC Learn the Signs. Act Early. milestones | Primary milestone structure for 2 months to 5 years | CDC milestones are intended for developmental monitoring/surveillance, not diagnosis. |
| AAP / Pediatrics 2022 milestone revision paper | Methodology behind CDC milestone update | Supports 75% threshold, plain language, observable milestones, surveillance use. |
| AAP developmental surveillance and screening policy | Screening/surveillance distinction | Supports validated screening tools at target visits and when concerns arise. |
| AAP Bright Futures | Health supervision visit framing | Useful for US-style visit schedule and anticipatory guidance logic. |
| WHO motor development milestones | Gross motor windows | Useful for motor windows and percentiles, especially for motor-domain nuance. |
| WHO Nurturing Care Framework | Global ECD framing | Defines nurturing care: health, nutrition, safety/security, responsive caregiving, early learning. |
| WHO Europe ECD Framework | European adaptation | Adds EU framing: monitoring development, responding to concerns, social/environmental risks. |

### Silver: Mechanism-Based Evidence

Використовується для `Why it works` у вправах.

| Mechanism | Product Use | Example |
|---|---|---|
| Serve and return | Language, social-emotional, cognitive activities | Responding to babbling, facial expressions, turn-taking games. |
| Tummy time / prone play | Movement/physical activities | Head control, shoulder girdle, trunk activation. |
| Responsive caregiving | Parent-child interaction, low-pressure daily play | Following baby's cue, naming what baby sees/does. |
| Sensory-motor exploration | Cognitive and motor foundations | Reaching, grasping, texture play, visual tracking. |
| Joint attention / shared attention | Language and social communication | Looking at object together, pointing/naming, shared routines. |
| Repetition and routine | Learning and regulation | Same short play repeated across the week. |

### Bronze: Pedagogical Traditions and Author-Led Methods

Можна використовувати як натхнення для вправ, але не як клінічний доказ.

| Approach | Allowed Framing | Not Allowed |
|---|---|---|
| Montessori | "inspired by Montessori principles of prepared environment and independence" | "clinically proven Montessori protocol" |
| Pikler | "aligned with respectful movement and free exploration" | "guarantees motor development" |
| Doman | "inspired by structured early stimulation traditions" | "Doman proves..." or diagnostic/medical claims |
| Suzuki | "inspired by repetition, environment and parental involvement" | "proven to make child advanced" |

## Rules for Milestones

Milestones in the product must:

1. Be observable by a parent or caregiver.
2. Use plain language.
3. Be answerable as `Yes / Not yet / Not sure`.
4. Be mapped to one developmental domain.
5. Have source attribution.
6. Avoid "must", "should already", "behind", "late" unless in professional/referral context.
7. Include "what to do next" if not observed.

Recommended state model:

| State | Meaning | User-Facing Tone |
|---|---|---|
| Yes | Parent observed the milestone | Celebrate and continue supporting related skills. |
| Not yet | Parent has not observed it | Watch, try related play, and consider discussing if age-appropriate. |
| Not sure | Parent is uncertain | Give examples and suggest observing during routine play. |
| Discuss | Concern or missed expected milestone | Encourage conversation with pediatrician/health visitor/specialist. |

## Rules for Activities

Each activity must include:

- title;
- age range;
- domain;
- milestone supported;
- materials;
- duration;
- steps;
- what to watch;
- why it works;
- evidence bucket;
- source(s);
- stop rules;
- adaptation/low-energy option.

Activity format:

```yaml
id: act_006_movement_001
title: Supported Tummy Reach
age_range: 4-6 months
domain: movement_physical
supports_milestone: cdc_006_movement_001
duration: 3-5 minutes
materials: small toy, blanket
steps:
  - Place baby on tummy while awake and supervised.
  - Put a toy slightly in front and to one side.
  - Encourage looking, reaching or shifting weight.
why_it_works: Supports head control, shoulder stability and early reaching through brief supervised prone play.
evidence_bucket: silver
sources:
  - WHO motor development milestones
  - AAP/CDC developmental monitoring
stop_rules:
  - Stop if baby is distressed, tired, hungry or shows breathing/comfort concerns.
  - Never use tummy play during sleep.
```

## Citation Structure

Every milestone/activity should have compact source metadata:

```yaml
source_id: cdc_ltsae_milestones_2026
source_type: guideline
organization: CDC
title: Learn the Signs. Act Early. Developmental Milestones
url: https://www.cdc.gov/act-early/milestones/
used_for:
  - milestone wording
  - age placement
  - monitoring/discuss logic
confidence: gold
notes: Not a diagnostic or screening tool.
```

For activities:

```yaml
activity_evidence:
  primary_mechanism: responsive_caregiving
  mechanism_source: Harvard Center on the Developing Child
  guideline_alignment:
    - WHO Nurturing Care Framework
    - CDC developmental promotion
  claim_strength: mechanism-based
  claim_limit: Supports prerequisites; does not treat or diagnose delays.
```

## Claim Safety Rules

### Do Not Say

- "This fixes delay."
- "This prevents autism/developmental delay."
- "This guarantees faster development."
- "Your child is late."
- "Critical window will close."
- "Do this instead of a pediatrician/logopedist/therapist."
- "Clinically proven" unless the exact claim is supported by a specific study.
- "80% of language problems are caused by..." unless directly sourced and qualified.

### Prefer

- "supports prerequisites";
- "helps you observe";
- "may support";
- "is aligned with";
- "evidence-informed";
- "brief supervised play";
- "if you have concerns, discuss with a professional";
- "not a diagnostic or screening tool";
- "development varies, but concerns deserve attention."

## Standard Disclaimer

Short version:

> This tool supports developmental monitoring and playful learning. It is not a diagnostic or screening tool and does not replace advice from your child's healthcare provider.

Ukrainian version:

> Цей продукт допомагає спостерігати розвиток і підтримувати навички через гру. Він не є діагностичним або скринінговим інструментом і не замінює консультацію педіатра чи іншого фахівця.

Parent-friendly version:

> Якщо ви щось не бачите у дитини або маєте відчуття, що щось не так, це не привід панікувати. Це привід зафіксувати спостереження і поговорити з фахівцем.

## Evidence Labels for UI

| Label | Meaning | Where to Use |
|---|---|---|
| Guideline-based | Milestone or recommendation comes from CDC/AAP/WHO-style guidance | Milestone cards, Discuss blocks |
| Mechanism-based | Activity is based on known developmental mechanism | Activity cards |
| Expert-reviewed | Reviewed by domain specialist | Paid product, trust layer |
| Parent-friendly | Simplified explanation of source-backed concept | Free content |
| Inspired by | Based on pedagogical tradition, not clinical proof | Montessori/Pikler/Doman/Suzuki references |

## EU Adaptation Logic

Europe should not be presented as "better" or "stricter" than CDC/AAP. The adaptation is about framing:

- CDC gives a clear milestone checklist structure.
- AAP supports surveillance/screening distinction.
- WHO/WHO Europe gives nurturing care and European public-health framing.
- NHS/European review windows help structure parent-facing "next review" language.
- Local country systems differ, so product should say "local health professional" rather than naming only one system.

Recommended phrasing:

> CDC-style milestones adapted for European parenting contexts: less pressure, more observation, play, and preparation for routine health reviews.

## Data Model Draft for Stage 2

```yaml
milestone:
  id:
  age_months:
  age_window:
  domain:
  title:
  parent_friendly_description:
  observable_examples:
  source_ids:
  state_options:
    - yes
    - not_yet
    - not_sure
  discuss_if:
  related_activities:
  clinician_summary_text:

activity:
  id:
  age_range:
  domain:
  title:
  supports_milestone_ids:
  duration:
  materials:
  steps:
  what_to_watch:
  why_it_works:
  evidence_bucket:
  source_ids:
  stop_rules:
  low_energy_option:
```

## Stage 1 Decisions Before Stage 2

These decisions should be made before building the first milestone map:

1. Primary MVP language: English first, or Ukrainian/English parallel?
2. Primary market: Luxembourg/EU-first or US/EU bridge?
3. Age granularity: exact CDC ages only, or broader windows such as 0-3, 4-6, 7-9, 10-12 months for activities?
4. Activity claim strictness: source every activity with a paper, or use mechanism buckets for MVP?
5. Expert review: who reviews movement, speech/language and social-emotional sections?
6. Product format: Notion/PDF starter pack, web MVP, or both?

## Recommended Stage 2 Output

For the next stage, create:

1. `product_data_model.md`
2. `milestone_schema.csv`
3. `activity_schema.csv`
4. `mvp_0_12_months_map.csv`
5. One complete sample page: `6_months_sample_page.md`

## References

- CDC. Learn the Signs. Act Early. Developmental Milestones and Key Points. https://www.cdc.gov/act-early/milestones/key-points.html
- CDC. About Learn the Signs. Act Early. https://www.cdc.gov/act-early/about/index.html
- Zubler JM, Wiggins LD, Macias MM, et al. Evidence-Informed Milestones for Developmental Surveillance Tools. Pediatrics. 2022;149(3):e2021052138. https://publications.aap.org/pediatrics/article/149/3/e2021052138/184748/Evidence-Informed-Milestones-for-Developmental
- AAP. Promoting Optimal Development: Identifying Infants and Young Children With Developmental Disorders Through Developmental Surveillance and Screening. https://publications.aap.org/pediatrics/article/145/1/e20193449/36971/Promoting-Optimal-Development-Identifying-Infants
- AAP. Bright Futures Guidelines and Pocket Guide. https://www.aap.org/en/practice-management/bright-futures/bright-futures-materials-and-tools/bright-futures-guidelines-and-pocket-guide/
- WHO. Motor development milestones. https://www.who.int/tools/child-growth-standards/standards/motor-development-milestones
- WHO. Nurturing care for early childhood development. https://www.who.int/publications/i/item/9789241514064
- WHO Europe. Framework on Early Childhood Development in the WHO European Region. https://www.who.int/europe/publications/i/item/WHO-EURO-2020-504-40239-53897
- Harvard Center on the Developing Child. Serve and Return. https://developingchild.harvard.edu/topic/serve-and-return/
- Harvard Center on the Developing Child. A Guide to Serve & Return. https://developingchild.harvard.edu/guide/a-guide-to-serve-and-return-how-your-interaction-with-children-can-build-brains/
