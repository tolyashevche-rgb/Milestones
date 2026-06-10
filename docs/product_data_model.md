# Product Data Model: CDC x Europe Milestones

Version: Stage 2 draft
Date: 2026-05-05

## Purpose

This document turns the Research Foundation into a product data structure. The goal is to make every milestone and activity traceable, safe, reusable and ready for web/PDF/Notion implementation.

The product is not a diagnostic or screening tool. It supports developmental monitoring, playful learning and preparation for conversations with healthcare professionals.

## Core Object Model

### 1. Age Page

An age page is the main parent-facing unit.

```yaml
age_page:
  id: age_006
  age_months: 6
  age_label: "6 months"
  age_window: "5-7 months"
  review_context:
    us: "well-child visit context"
    eu: "routine review / pediatric visit context varies by country"
  intro_promise: "Know what to watch, what to play, and when to ask."
  milestones:
    - milestone_id
  activities:
    - activity_id
  weekly_plan:
    - day_id
  monitor_discuss:
    - discuss_item_id
  sources:
    - source_id
```

### 2. Milestone

Milestones are observable signs. They are not exercises and not diagnoses.

```yaml
milestone:
  id: ms_006_social_001
  age_months: 6
  domain: social_emotional
  source_title: "CDC milestone, paraphrased"
  parent_title: "Recognizes familiar people"
  parent_friendly_description: "Your baby often responds differently to people they know well."
  observable_examples:
    - "smiles or settles when a familiar caregiver appears"
    - "looks longer at familiar faces"
  response_options:
    - yes
    - not_yet
    - not_sure
  typical_window_note: "Development varies; use this as an observation cue."
  discuss_if: "If you do not see this and have concerns, discuss it with your child's healthcare provider."
  source_ids:
    - cdc_ltsae_6_months
    - aap_zubler_2022
  related_activity_ids:
    - act_006_social_001
  clinician_summary_text: "Caregiver has not yet observed recognition of familiar people."
```

### 3. Activity

Activities are short playful actions that support prerequisites and everyday practice. They do not claim to produce or treat a milestone.

```yaml
activity:
  id: act_006_language_001
  age_range: "5-7 months"
  domain: language_communication
  title: "Sound Turn-Taking"
  supports_milestone_ids:
    - ms_006_language_001
  duration: "2-5 minutes"
  materials: "none"
  setup: "Hold baby where they can see your face."
  steps:
    - "Wait for a sound, smile or movement."
    - "Copy the sound or expression."
    - "Pause and let baby respond again."
  what_to_watch:
    - "baby vocalizes, smiles, kicks, looks or pauses"
  why_it_works: "Back-and-forth interaction supports early communication, attention and social learning."
  evidence_bucket: silver
  evidence_label: "Mechanism-based"
  source_ids:
    - harvard_serve_return_guide
    - who_nurturing_care
  stop_rules:
    - "Stop if baby turns away, cries, stiffens, coughs, or seems tired."
  low_energy_option: "Do this for 30 seconds during diapering."
```

### 4. Evidence Source

Sources are registered in `evidence_sources.csv`.

```yaml
source:
  source_id: cdc_ltsae_6_months
  organization: CDC
  source_type: official_guidance
  evidence_level: gold
  url: https://www.cdc.gov/act-early/milestones/6-months.html
  used_for:
    - milestone_age
    - milestone_domain
    - monitoring_language
```

### 5. Discuss Item

Discuss items are not red-flag diagnosis statements. They tell parents what to share with a professional.

```yaml
discuss_item:
  id: discuss_006_001
  age_months: 6
  category: "general"
  text: "If your baby has lost a skill, is not using both sides of the body similarly, or you have any concern, discuss it with your child's healthcare provider."
  source_ids:
    - cdc_ltsae_6_months
    - aap_surveillance_screening_2020
```

### 6. Weekly Plan

Weekly plans organize activities into small daily actions.

```yaml
weekly_plan_day:
  id: wk_006_day_1
  age_months: 6
  title: "Face and Sound Day"
  total_time: "10-15 minutes"
  activity_ids:
    - act_006_language_001
    - act_006_social_001
  low_energy_version: "Pick one activity for 2 minutes."
```

## Domains

| Domain ID | Parent Label | Notes |
|---|---|---|
| social_emotional | Social & Emotional | Relationships, attention, emotional response, interaction |
| language_communication | Language & Communication | Sounds, gestures, response to voice, turn-taking |
| cognitive | Learning & Thinking | Exploration, problem-solving, object interest |
| movement_physical | Movement & Physical | Gross motor, fine motor, feeding-related physical skills |

## Evidence Levels

| Level | Label | Used For |
|---|---|---|
| gold | Guideline-based | Milestones, monitoring/discuss logic, review framing |
| silver | Mechanism-based | Why-it-works explanations for activities |
| bronze | Inspired by | Pedagogical traditions and author-led methods |

## Parent-Facing State Logic

| State | UI Meaning | Product Response |
|---|---|---|
| yes | Parent observed it | Show encouragement and related next play idea |
| not_yet | Parent has not observed it | Suggest related play and observation cue |
| not_sure | Parent is unsure | Show examples and "watch during routine" prompt |
| discuss | Concern, lost skill, or clustered not-yet items | Suggest professional conversation and summary export |

## Claim Strength Model

| Claim Strength | Allowed Wording | Example |
|---|---|---|
| guideline | "CDC lists this as a milestone by..." | Milestone cards |
| mechanism | "This activity supports..." | Activity cards |
| practical | "Try this during..." | Daily plan |
| inspired | "Inspired by..." | Optional method notes |

## Source ID Naming

```text
organization_topic_age_or_year
```

Examples:

- `cdc_ltsae_2_months`
- `cdc_ltsae_6_months`
- `aap_zubler_2022`
- `who_motor_milestones`
- `harvard_serve_return_guide`

## File Relationship

| File | Role |
|---|---|
| `research_foundation.md` | Source hierarchy and claim rules |
| `evidence_sources.csv` | Source registry |
| `product_data_model.md` | Product architecture |
| `milestone_schema.csv` | Milestone table structure |
| `activity_schema.csv` | Activity table structure |
| `mvp_0_12_months_map.csv` | First MVP milestone map |
| `6_months_sample_page.md` | Complete sample age page |

## Stage 2 Open Decisions

1. Build the MVP data in English first or bilingual English/Ukrainian?
2. Use exact CDC age pages only, or add broader activity windows?
3. Keep source citations visible in the parent UI or behind an "Evidence" drawer?
4. Make `Discuss with professional` a button/action flow or a simple content block in MVP?

