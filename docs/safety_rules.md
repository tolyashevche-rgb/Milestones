# Safety Rules — single source of truth

Version: Stage 5
Date: 2026-06-01

This file is the **single source of truth** for what the product may and may not say.
It consolidates the claim-safety rules previously embedded in `research_foundation.md`
and the engine guardrails from `developmental_memory_plan.md` / `engine.js`.
Any recommendation, activity, author card, or router output must pass these rules.

If this file and any other document disagree, **this file wins**.

---

## 1. Product position (non-negotiable)

The product supports **developmental monitoring** and **playful learning**. It is:

- NOT a diagnostic tool.
- NOT a screening tool.
- NOT a treatment for developmental delay.
- NOT a replacement for a pediatrician, health visitor, speech-language therapist,
  physiotherapist, or any other professional.

CDC milestones are used for *surveillance/monitoring*, not pass/fail testing.

---

## 2. Forbidden claims (never say)

- "This will cure / fix / treat a delay."
- "This guarantees / ensures faster development."
- "This prevents autism / developmental delay."
- "Your child is behind / late / delayed / advanced."
- "Your child failed / passed."
- "The critical window is closing."
- "You don't need a specialist / do this instead of seeing a professional."
- "Clinically proven …" — unless one specific cited study supports that exact claim.
- Any score, level, percentile, percentage, or risk rating about the child.
- Any statistic ("80% of …") without a direct, qualified source.

## 3. Preferred language (say instead)

- "supports the prerequisites for …"
- "helps you observe …"
- "may support …"
- "is aligned with …"
- "evidence-informed"
- "brief, supervised play"
- "development varies — concerns still deserve attention"
- "if you have concerns, discuss them with a professional"
- "this is not a diagnostic or screening tool"

---

## 4. Engine guardrails (Profile-of-focus / option A)

The personalization engine must hold these three lines at all times:

1. **No score leaves the engine.** The internal `weight` (`not_yet*2 + not_sure*1`)
   only orders focus areas. It is never shown to the parent as a number, bar of
   "how far behind," or comparison.
2. **The program is *opportunities*, not a dose.** Never imply "do N repetitions for
   M days and the gap closes." Frame plans as chances to play, woven into the day.
   One short interaction already counts.
3. **Two separate clocks.** Milestone re-assessment follows real CDC age windows
   (months). The weekly play cycle is engagement only — never framed as re-screening.

"Complexity of the situation" = how many focus areas / how much support a parent
wants. It NEVER means severity of delay or a risk level.

---

## 5. Evidence levels (every recommendation must carry one)

| Level | Meaning | May be used for |
|---|---|---|
| **Gold** | CDC / AAP / WHO guideline or surveillance framework | Milestones, age windows, "when to discuss" logic |
| **Silver** | Known developmental mechanism (serve-and-return, tummy time, responsive caregiving, joint attention, repetition) | The "why it works" of activities |
| **Bronze** | Pedagogical tradition / named author method (Montessori, Pikler, Doman, Suzuki) | Inspiration for an activity's *form* only — never as proof |

A recommendation must show its evidence level and source to the parent.

---

## 6. Rules for author-derived content (Bronze)

The product is moving toward author-informed activities. Authors are allowed only
inside these limits:

- An author idea may be used **only if it maps onto a Silver mechanism or a Gold
  guideline.** "Author X says so" is never sufficient on its own.
- Allowed framing: "inspired by Montessori principles of a prepared environment",
  "aligned with respectful, free movement (Pikler)".
- Forbidden framing: "clinically proven Montessori protocol", "Doman proves …",
  "guarantees motor development", "makes your child advanced".
- **Copyright:** author source cards are **paraphrased principles**, not verbatim
  quotes or reproduced exercises from a book. No copying of copyrighted text.
- Every author card records: author, work, the idea taken, the mechanism it maps to,
  and the evidence level (Bronze, unless it also has Silver/Gold backing).

---

## 7. "Concern" must never drift into screening

A `concern` in this product means **a parent's worry or a focus area** — not a
detected deficit. Therefore:

- A concern routes to **support + observation**, and to the "Ask" tab to prepare a
  conversation. It never produces a verdict about the child.
- "When to discuss with a professional" guidance is encouraged (this is CDC
  *act-early*), but it is framed as preparation, not alarm:
  > "If this worries you, it is not a reason to panic — it is a reason to note it
  > and ask a professional."

---

## 8. Standard disclaimers

**Short (EN):**
> This tool supports developmental monitoring and playful learning. It is not a
> diagnostic or screening tool and does not replace advice from your child's
> healthcare provider.

**Short (UA):**
> Цей продукт допомагає спостерігати розвиток і підтримувати навички через гру. Він
> не є діагностичним або скринінговим інструментом і не замінює консультацію
> педіатра чи іншого фахівця.

**Parent-friendly (UA):**
> Якщо ви щось не бачите у дитини або маєте відчуття, що щось не так, це не привід
> панікувати. Це привід зафіксувати спостереження і поговорити з фахівцем.

---

## 9. Review gate

No author-derived content and no "when to discuss" wording reaches real users before
expert review (see `expert_review_checklist.md`). Mechanism-based (Silver) activities
are evidence-informed but **not yet expert-validated** until that review is done.
