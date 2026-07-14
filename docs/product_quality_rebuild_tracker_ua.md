# План і трекер якісної перебудови Stage 5 UA

Дата старту: 2026-07-14  
Baseline: Stage 5 UA / P2.52 / `20260708-p2-52-r1` / commit `a6418877237accc2c7ee81cf2c984ba31d3ac8ab`

Мета: перетворити функціонально багатий прототип на стриманий, зрозумілий і безпечний
продукт, придатний спочатку для закритої перевірки, а надалі — для чесної моделі
free + subscription.

## Як ведеться робота

- Один завершений логічний крок = один окремий git-коміт.
- Після кожного кроку оновлюються статус, перевірки, виконане й залишок.
- Нові можливості заморожені, доки не закриті P0/P1 нижче.
- Parent-facing developmental content залишається чернеткою до реального expert sign-off.
- Публічний preview не вмикається без окремого рішення власника.
- Після кожної зміни коду мінімум: syntax check, `node tools/test_p1_qa.js`,
  `git diff --check`; UI-кроки додатково потребують browser/device smoke.

Позначки: `✅` виконано · `🔄` у роботі · `⬜` залишилось · `⛔` залежить від людей/рішення.

## Послідовність

| № | Статус | Крок | Критерій завершення | Коміт / реліз |
|---:|:---:|---|---|---|
| 0 | ✅ | Зафіксувати baseline і робочий трекер | Baseline QA проходить; план збережено в repo | `060175a` |
| 1 | ✅ | Виправити вікову маршрутизацію | Між CDC-вікнами завжди молодший checklist; до 2 міс окремий стан; тести 0–12 + corrected age | P2.53 · `a51b4b8` |
| 2 | ✅ | Усунути втрату даних при повторному спостереженні | Нове спостереження не стирає play diary, reactions, notes або completions | P2.54 · `eaef86f` |
| 3 | ✅ | Додати release gates і видиму safety-смугу | Draft-вміст не видається за approved; safety/stop видно до Start | P2.55 · `b675669` |
| 4 | ✅ | Спростити Home і маршрути | Один контекстний next step; без deck/nested scroll; стабільна навігація | P2.56 · `b4ea9dd` |
| 5 | ✅ | Спростити Game і дизайн-систему | Одна основна гра; одна primary action; узгоджені кнопки, іконки, кольори, градієнти | P2.57 · `cbba1bf`; P2.58 · `c2ad968` |
| 6 | ✅ | Accessibility, responsive, recovery і PWA | Touch/contrast/zoom/keyboard; tablet layout; recovery states; lean safe cache | P2.59 · `431c667` |
| 7 | ✅ | Закрити вікові межі, route prerequisites і доступ до даних | До 2 міс доступні data controls; після 12 міс немає нового 12-міс flow; incomplete Results → Survey | P2.60 · `a5e4b71` |
| 8 | ✅ | Закрити import/startup schema й XSS | Один strict validator; canonical IDs/timestamps; malformed local data → recovery | P2.61 · `ae1dafe` |
| 9 | ✅ | Виправити multi-play attribution | Кожна нотатка/реакція належить конкретній грі; undo іншої гри її не стирає | P2.62 · `706c6d2` |
| 10 | ✅ | Захистити кілька вкладок/PWA від silent overwrite | Store revision, conflict detection і зовнішнє оновлення без втрати | P2.63 · `a85a23d` |
| 11 | ✅ | Item-level content gate і age-safe Library | 27 `NEEDS_REVIEW` не потрапляють у parent Game; Library age-first | P2.64 · `edd4388` |
| 12 | ✅ | Повна автоматизована регресія й незалежний source-аудит | QA/syntax/diff зелені; опубліковано фінальний реєстр рекомендацій | `docs: publish independent product quality audit` |
| 13 | ⛔ | Live UI/device/accessibility matrix | Mobile/tablet/desktop, keyboard, zoom і assistive tech пройдені реально | Runtime без браузера; потрібні фізичні/живі середовища |
| 14 | ⛔ | Expert review | Реальні рішення для 54 milestones, 60 activities, 60 visual guides (59 Motion Cards + 1 tummy-time guide) і 13 library drafts | Нічого не симулюється |
| 15 | ⛔ | 5 moderated parent sessions | Core tasks виконані без критичної допомоги; safety зрозуміла | Після expert permission + live smoke |
| 16 | ⛔ | Підготовка subscription | Перевірено recurring value/WTP; визначено free safety floor; backend/entitlements/privacy спроєктовані | Після longitudinal validation |

## Зафіксовані продуктові рішення

1. Ядро продукту: **Watch → Play → Ask**, а не енциклопедія чи трекер продуктивності.
2. Home відповідає на одне питання: **«Що доречно зробити зараз?»**
3. Одна завершена спокійна взаємодія достатня; без streak, score, target або провини.
4. Safety, red flags, шлях до фахівця, експорт і видалення даних не можуть бути paywalled.
5. Підписка може продавати зручність, різноманітність, sync/sharing і регулярне
   експертно перевірене розширення — не «кращий розвиток дитини».
6. До появи повторюваної цінності після 12 місяців subscription не запускається.

## Поточна перевірка

- `node tools/test_p1_qa.js`: ✅ baseline passed 2026-07-14.
- `node --check prototype_stage5_ua/app5.js`: ✅.
- `node --check prototype_stage5_ua/library_ua.js`: ✅.
- `node --check prototype_stage5_ua/sw.js`: ✅.
- `git diff --check`: ✅ before tracker changes.
- P2.53 age matrix `-1…12`, corrected-age routing and pre-2 render/storage gate: ✅.
- P2.54 repeated survey reset with byte-for-byte preserved play state: ✅.
- P2.55 canonical-only prompts, hidden draft author notes, isolated 60-card review and
  pre-Start safety ordering/blocking: ✅.
- P2.56 one contextual Home action, stable secondary routes, four-destination primary
  navigation and removal of nested Home scrolling: ✅.
- P2.57 one visible safe activity, optional alternatives, active/unsaved flow lock and
  primary “На сьогодні все” with preserved diary lifecycle: ✅.
- P2.58 semantic visual tokens, solid controls, one outline icon family, restrained elevation,
  contrast calculations and 44–48 px touch-target guards: ✅.
- P2.59 route/focus/ARIA hardening, ≤400 px source-level reflow, pre-onboarding restore,
  strict backup diary IDs and a 452,488-byte core shell with lazy visual caching: ✅.
- P2.60 pre-2 data controls, post-12 completion state, editable aged-out profiles and
  Results/unknown-route canonicalization: ✅.
- P2.61 shared startup/import schema, canonical ID/time allowlists, corrupt-storage recovery and
  adversarial snapshot-XSS protection: ✅.
- P2.62 activity-specific note/reaction keys, legacy migration and two-game attribution/undo
  regression: ✅.
- P2.63 monotonic store revisions, pre-write conflict detection, safe external tab/PWA refresh
  and malformed external-payload rejection: ✅.
- P2.64 CSV-verified 33/27 activity gate, fail-closed future release, safe stale-data handling and
  age-scoped Library defaults/search/suggestions with an explicit all-ages action: ✅.
- Незалежний source-аудит усіх заявлених параметрів і пріоритетний реєстр рекомендацій: ✅.
- Live browser/device pass: ⛔ 2026-07-14 runtime не надав жодного доступного браузера;
  автоматизований code/DOM QA пройдено, але pixel-perfect pass не заявляється.

## Залишається після автоматизованої перебудови

- Реальний clinician/expert sign-off для всього parent-facing developmental content.
- Рішення експертів для 27 `NEEDS_REVIEW` activity safety rows.
- Review 60 visual guides: 59 Motion Cards + 1 окремий tummy-time guide, із provenance.
- П’ять перших parent sessions за готовим facilitator pack.
- Юридичний/privacy review перед cloud sync, акаунтами або оплатою.
- Willingness-to-pay і retention evidence перед реалізацією subscription.
