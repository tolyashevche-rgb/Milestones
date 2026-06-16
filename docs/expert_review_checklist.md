# Expert Review Checklist: CDC x Europe Milestones

Version: Stage 3 draft
Date: 2026-05-05

## Purpose

This checklist is for pediatric, movement, speech/language, occupational therapy, psychology, and early childhood experts who review the first `CDC x Europe Milestones` content pack.

The review goal is not to approve the product as a medical device. The goal is to confirm that the content is accurate, safe, parent-friendly, and clear about its limits.

## Reviewer Roles

| Reviewer | Primary Review Area | Must Check |
|---|---|---|
| Pediatrician / family doctor | Overall safety and referral language | Disclaimers, discuss prompts, screening vs monitoring distinction |
| Pediatric physiotherapist / OT | Movement and physical activities | Motor expectations, safe positioning, stop rules |
| Speech-language specialist | Language and communication activities | Sound, gesture, joint attention, referral wording |
| Child psychologist / developmental specialist | Social-emotional framing | Parent anxiety, attachment language, no guilt/shame |
| Early childhood educator | Usability and parent routines | Practicality, clarity, low-prep activities |

## Global Review Questions

For each age page:

- Are milestones clearly separated from activities?
- Does the page avoid diagnosis, treatment, and guaranteed outcomes?
- Does the language reduce panic rather than increase it?
- Are the activities realistic for tired parents?
- Are stop rules clear enough?
- Are source labels accurate?
- Are `Monitor / Discuss` prompts strong enough without sounding alarming?
- Could a parent misinterpret any wording as medical advice?
- Could a clinician understand the parent summary quickly?

## Milestone Review

For each milestone, reviewer should mark:

| Question | Yes | Needs Revision | Notes |
|---|---|---|---|
| Is it observable by a parent? |  |  |  |
| Is it age-appropriate for the stated window? |  |  |  |
| Is the domain correct? |  |  |  |
| Does wording avoid pass/fail language? |  |  |  |
| Is `discuss_if` appropriate and not too weak? |  |  |  |
| Is source attribution appropriate? |  |  |  |

## Activity Review

For each activity, reviewer should mark:

| Question | Yes | Needs Revision | Notes |
|---|---|---|---|
| Is the activity safe for the age range? |  |  |  |
| Are materials safe and realistic? |  |  |  |
| Are steps clear enough for a non-expert parent? |  |  |  |
| Does the activity support the listed milestone prerequisites? |  |  |  |
| Is the `why it works` mechanism accurate? |  |  |  |
| Are stop rules sufficient? |  |  |  |
| Is the low-energy option useful and safe? |  |  |  |
| Does wording avoid treatment/guarantee claims? |  |  |  |

## Claim Safety Review

Flag immediately if content implies:

- diagnosis;
- treatment of delays;
- prevention of autism or developmental disability;
- guaranteed faster development;
- replacement of a pediatrician, speech-language specialist, physiotherapist, psychologist, OT, or early intervention service;
- shame toward parents who did not do activities earlier;
- "critical window" panic.

Preferred wording:

- supports prerequisites;
- helps you observe;
- may support;
- brief supervised play;
- if you have concerns, discuss with a professional;
- development varies, but concerns deserve attention.

## Movement Safety Checklist

For movement activities:

- Is awake supervision stated where needed?
- Is sleep safety protected?
- Are choking hazards excluded?
- Is there no forced positioning?
- Is there no pressure to sit, stand, or walk before baby shows readiness?
- Are asymmetry concerns referred to a professional?
- Are fatigue and distress stop cues included?

## Feeding-Related Activity Checklist

For any feeding-related activity:

- Is choking risk mentioned where relevant?
- Is baby-led cueing respected?
- Is the activity framed as observation and responsive caregiving?
- Is there a referral prompt for painful, stressful, unsafe, or growth-related feeding concerns?

## Language and Communication Checklist

For communication activities:

- Are activities based on interaction, not drilling?
- Is joint attention or turn-taking described correctly?
- Is hearing concern language included when relevant?
- Are gestures treated as communication, not as a substitute for speech intervention when concerns exist?

## Parent Anxiety Checklist

Review whether the content might make a parent feel:

- "I am late";
- "I harmed my child by not doing this";
- "My baby failed";
- "I must do every activity every day";
- "This replaces a professional."

If yes, revise toward calm observation and one small next step.

## Review Output Format

Reviewer should return:

```text
Reviewer name:
Role:
Date:
Content reviewed:

Top safety concerns:
1.
2.
3.

Required revisions:
1.
2.
3.

Optional improvements:
1.
2.
3.

Approved for parent testing:
Yes / No / Yes after revisions
```

## Files for Review

Record findings in [expert_review_tracker.md](expert_review_tracker.md). Review the
**current UA content the parent actually sees** (not the older English pack):

- `prototype_stage4_ua/data_ua.js` — milestones (54) + activities (60), the live content
- `data/activity_library_0_12_months_ua.csv` — readable 1:1 mirror of the 60 activities
  (`NEEDS_REVIEW` marks fields not authored yet — see tracker §5)
- `prototype_stage5_ua/questions_ua.js` — alternate survey phrasings (draft)
- `prototype_stage5_ua/authors_ua.js` — Bronze "approach" notes (draft)
- `data/mvp_0_12_months_map.csv` — milestone map incl. `discuss_if`
- `docs/safety_rules.md` — claim/guardrail rules every item must pass
- `docs/6_months_review_ready_page.md` — worked single-age example (reference)

Background (not current content): `research_foundation.md`, `product_data_model.md`,
`free_starter_pack_draft.md`. The English `activity_library_0_12_months.csv` (33 rows) is
stale — do not review it as current.

