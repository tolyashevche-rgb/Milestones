# Незалежний комплексний аудит Milestones — Stage 5 UA / P2.64

Дата аудиту: 2026-07-14

Кодова база: implementation baseline commit `edd4388`

Поточний реліз: P2.64 / `20260714-p2-64-r1`

Точка входу: `prototype_stage5_ua/index.html`

> P2.63 зафіксовано комітом `a85a23d`, P2.64 — `edd4388`. Обидва етапи пройшли
> syntax checks, повну Node-регресію й `git diff --check`. Це підтверджує автоматизований
> baseline, але не замінює живі device/a11y, експертні або батьківські перевірки.

## 1. Межі й чесність аудиту

Перевірено поточний Stage 5 UA, а не історичні Stage 4 екрани. Охоплено:

- продуктову обіцянку, цільову аудиторію й відмінність продукту;
- інформаційну архітектуру, маршрути та всі основні стани;
- UI/UX, кольори, кнопки, іконки, градієнти, типографіку, відступи й візуальну стриманість;
- функціональність, цілісність даних, помилки, backup/restore, PWA й офлайн;
- доступність, responsive/reflow і керування з клавіатури на рівні коду та DOM;
- зміст, safety, тон, цікавість, повернення без маніпуляцій і контентне управління;
- межу безкоштовної версії, можливу платну цінність, privacy, backend та entitlements;
- готовність до закритої перевірки, публічного запуску й підписки.

Автоматизована регресія, syntax checks і `git diff --check` зелені на `edd4388`.
У поточному середовищі не було доступного живого браузера. Тому цей
документ **не заявляє** pixel-perfect, фізичний device, screen-reader, 200% text або
400% zoom pass. Також він не замінює висновок педіатра, дитячого
фізіотерапевта/ерготерапевта, privacy-юриста чи дослідження з батьками.

Маршрути, перевірені через актуальний код, DOM-рендери й регресійні сценарії:
`#/welcome`, `#/consent`, `#/profile`, `#/home`, `#/survey`, `#/results`, `#/program`,
`#/progress`, `#/ask`, `#/library`; ізольований `visual-pilot` оцінено лише як внутрішній
review-інструмент. Перевірка маршрутів включає pre-2, 2/4/6/9/12 міс, завершений стан
після 12 міс, незавершений `#/results`, невідомий hash і recovery після невалідного storage.

## 2. Головний незалежний висновок

Milestones уже не виглядає як «поганий застосунок» на рівні концепції чи програмного
ядра. Після перебудови P2.53–P2.64 це цілісний, спокійний і виразно сфокусований
**validation build**: він допомагає пройти шлях **Спостерігати → Грати → Запитати**, не
перетворюючи розвиток дитини на оцінку, змагання або щоденний обов'язок.

Додатковий технічний аудит P2.60–P2.64 закриває вікові й route-прогалини, однакову
валідацію startup/import, parseable-XSS, прив'язку нотаток до конкретної гри, silent
overwrite між вкладками/PWA та item-level контентний gate. Це суттєво покращує надійність,
але не перетворює авторські чернетки на клінічно схвалений зміст.

Водночас це ще **не готовий публічний медичний/розвитковий продукт і не готовий
subscription business**. Головний ризик більше не в кількості кнопок чи кольорах. Він
перемістився у три зони:

1. реальна експертна перевірка всього parent-facing змісту: 54 milestones, 60 activities
   і 60 visual guides (59 Motion Cards + 1 окремий tummy-time guide);
2. перевірка зрозумілості, довіри й повторної користі з реальними батьками;
3. доказ повторюваної платної цінності, legal/privacy та серверні entitlements.

Рішення по запуску:

| Рівень | Висновок | Умова |
|---|---|---|
| Внутрішня перевірка коду й контентних пакетів | **GO** | P2.64 syntax, regression і diff checks зелені |
| Закрите експертне рев'ю | **GO** | Пакети й трекери вже підготовлені |
| П'ять moderated parent sessions | **HOLD** | Спочатку expert permission + live UI smoke |
| Публічна безкоштовна версія | **NO-GO зараз** | Expert, parent, accessibility/device і privacy gates |
| Реалізація checkout/subscription | **HOLD** | Спочатку retention, WTP, legal і backend architecture |

## 3. Зведена оцінка по всіх параметрах

| Параметр | Поточна оцінка | Підстава | Що ще потрібно |
|---|---|---|---|
| Продуктова ідея | Сильна | Одне зрозуміле ядро Watch → Play → Ask | Перевірити, чи так само це формулюють батьки |
| Інформаційна архітектура | Сильна для mobile-first | 4 стабільні нижні маршрути, guarded deep links, вікові завершальні стани | Live back/forward, deep-link і task-findability test |
| UX основного шляху | Готовий до закритої перевірки | Одна наступна дія, одне питання, одна гра, спокійне завершення | 5 реальних сесій без підказок фасилітатора |
| Візуальний дизайн | Узгоджений і стриманий | Семантична палітра, одна SVG-родина, один декоративний градієнт | Фізичні екрани, нічний сценарій, 200% text/400% zoom |
| Функціональність | Сильне ядро | Multi-child, повторні спостереження, записи, export, restore, reminders | Live E2E та production error monitoring без чутливих даних |
| Цілісність даних | Добре захищена для local-first прототипу | Shared strict validator, canonical IDs, revisions, conflict warning, backup/recovery | Live multi-tab/PWA race test; cloud conflict/retention лише з акаунтом |
| Accessibility | Source-level P0/P1 закриті | Focus, ARIA, reduced motion, touch targets, reflow guards | Клавіатура, screen reader, forced colors і zoom вручну |
| Offline/performance | Добре для validation | Lean core shell, ілюстрації lazy-cache, consent-based update | Реальний install/update/offline на iOS/Android |
| Safety і developmental content | **Не схвалено** | Item-level gate не допускає 27 `NEEDS_REVIEW` до звичайного parent Game | Реальний expert sign-off для 54 milestones, 60 activities, 60 visual guides (59 Motion Cards + 1 tummy-time guide) і 13 library drafts |
| Цікавість і повернення | Правильна гіпотеза, не доказ | Контекстна гра, favorites, recap, моменти, добровільне нагадування | 4–8 тижнів longitudinal use, без streak і pressure |
| Бібліотека | Корисний draft-пілот | 13 коротких матеріалів, age-first default, explicit other-ages view, джерела й дати | Профільне рев'ю всіх 13 і перевірка знаходження |
| Безкоштовна пропозиція | Може бути самодостатньою | Повний core flow і safety floor можна лишити free | Перевірити довіру й activation без штучного урізання |
| Підписка | **Не підтверджена** | Немає recurring value/WTP і контентного горизонту після 12 міс | One-time vs annual/monthly test, backend, legal, privacy |
| Production maintainability | Прийнятно для прототипу | Велика regression suite, явні версії й content allowlists | Розділити монолітний `app5.js` та internal review tooling |

## 4. UI/UX та логічність маршрутів

### 4.1 Маршрутна модель

Нижня навігація **Сьогодні → Спостереження → Гра → Записи** відповідає реальним
повторним задачам і не дублює кожну можливість продукту. **Короткі відповіді** та
**Для фахівця** логічно лишаються другорядними маршрутами з Home. Це стриманіше й
зрозуміліше за меню з 6–8 рівнозначних вкладок.

Системні покращення P2.59–P2.60 усунули повторне відкриття порожнього onboarding через
Back, канонізували застарілі onboarding URL після прийняття профілю, додали окремі заголовки
сторінок і відновлення фокуса після зміни маршруту. Незавершений `#/results` повертає до
спостереження, невідомий hash — до Home, а не до порожнього або неправдивого стану.

Вікові межі тепер мають окрему продуктову логіку:

- до 2 місяців немає штучного «2-місячного результату», але доступні профіль, export,
  restore і видалення даних;
- між контрольними точками використовується молодше завершене вікно, а не майбутній
  checklist;
- після 12 місяців показується чесне завершення програми 0–12 без повторного запуску
  12-місячного flow; Records, Library і data controls залишаються доступними;
- профіль дитини, що подорослішала, можна виправити, але створення нового профілю поза
  заявленим 0–12 scope блокується.

Ризик, який треба перевірити з людьми: чи знаходять батьки **Для фахівця**, **Бібліотеку**
та історичні зміни без попереднього пояснення. Не слід автоматично додавати їх до нижньої
панелі — спочатку дати користувачам конкретні пошукові задачі.

### 4.2 Аудит кожного основного екрана

| Екран/стан | Що вже якісно | Залишкова перевірка або рекомендація |
|---|---|---|
| Welcome / recovery | Короткий старт; при пошкодженому storage restore доступний до створення нового профілю | Перевірити, чи люди не плутають «продовжити без відновлення» з безпечним restore |
| Consent | Відділяє локальне зберігання й добровільний старт | Legal/privacy copy має пройти локальну правову перевірку перед публікацією |
| Profile / multi-child | Ім'я, DOB, corrected-age логіка, перемикання дітей, редагування aged-out профілю | Тест помилок дат, передчасного народження та видалення активної дитини на телефонах |
| Home | Одна контекстна головна дія; додаткові розділи не конкурують; pre-2/post-12 і destructive/data controls явні | 4/5 батьків мають назвати наступний крок за 10 секунд без допомоги |
| Observation | Одне питання на екран, великі відповіді, автозбереження, pause/resume | Перевірити втому на найдовшому віковому чеклісті й зрозумілість трьох відповідей |
| Results | Опис, а не score; одна відповідь не видається за висновок; incomplete deep link → Survey | Експертно перевірити всі формулювання `not_sure`, `not_yet`, loss-of-skill і recheck |
| Game | Одна доступна для каналу гра; safety/stop до Start; blocked IDs fail closed; Start → Finish → reflection → stop | 5/5 мають правильно переказати дію й умову зупинки без інтерпретації картинки |
| Records | Спостереження, зміни, щоденник гри й приватні моменти без score/streak; нотатка/реакція прив'язана до конкретної гри | Перевірити знаходження попередньої відповіді та відновлення фокуса після видалення |
| Library | За замовчуванням поточний вік; інші віки — явний вибір; пошук, теми, count, джерело й статус | Усі 13 матеріалів лишаються `draft`; no-results і словоформи перевірити з живими запитами |
| Ask / specialist | Компактний підсумок, три типи нотаток, copyable summary, спокійний маршрут до розмови | Тест із клініцистом: фактичність, довжина й відсутність псевдодіагностики; друк/PDF — P2 |
| Backup / offline / update | Shared strict validator; явна заміна; revision/conflict notice; оновлення лише за згодою | Реальний multi-tab, install/update, quota, offline restart і restore на фізичних пристроях |

## 5. Візуальний дизайн

### 5.1 Кольори

Поточна система стала послідовною:

- темний нейтральний текст на теплій світлій основі;
- teal використовується для primary action і активного стану;
- м'який apricot — для теплого, але не термінового акценту;
- red — лише для помилки або руйнівної дії;
- окремий blue focus token не змішує клавіатурний фокус із брендом;
- функціональні поверхні не залиті випадковими кольорами доменів.

Це правильне рішення для продукту, де доменні кольори могли б помилково виглядати як
оцінювання «сильних» і «слабких» сторін. Контраст тексту, меж контролів і primary state
перевіряється автоматично. Фінальний verdict усе одно потребує реального дисплея, сонячного
режиму, forced colors і 200% text scaling.

### 5.2 Кнопки й інтерактивні стани

Є чітка ієрархія:

- solid teal — одна primary action;
- outline/ghost — другорядна дія;
- link-like — низькопріоритетна або руйнівна дія з окремим danger-кольором;
- disabled не маскується під активний стан;
- основні targets 44–48 px, кнопки не покладаються лише на іконку.

Не рекомендується додавати нові стилі CTA під кожну функцію. Кожний новий екран має
повторно використовувати цю трирівневу систему. У живій матриці окремо перевірити
`default`, `hover`, `pressed`, `focus-visible`, `disabled`, `loading/offline`, success,
validation error і destructive-confirmation. Колір не повинен бути єдиним носієм стану;
важливе повідомлення потребує тексту й, де доречно, іконки.

### 5.3 Іконки, градієнти, картки й тіні

- Parent-facing дії використовують одну outline-SVG родину з однаковою геометрією,
  stroke, rounded joins і текстовими labels.
- Unicode-символи більше не виконують роль головної навігації.
- Єдиний декоративний градієнт лишився в малому brand mark; функціональні кнопки solid.
- Радіуси зведені до control/card tokens; тінь стримана й не створює «плаваючої колоди».
- Картки відрізняються семантикою, а не випадковим декором.
- Анімація має пояснювати зміну стану, а не винагороджувати за «продуктивність»; режим
  `prefers-reduced-motion` повинен прибирати необов'язкові переходи.

Наступна дизайнерська робота має бути не про «ще красивіше», а про реальні Motion Cards:
безпечні пози, руки, напрям руху, stop-state, однакова перспектива, provenance і ліцензія.
Для PWA також потрібна окрема перевірка maskable icon safe zone на Android launchers;
малий brand mark не варто автоматично вважати готовою app icon.

### 5.4 Типографіка, щільність і responsive

Системний sans-serif швидкий і стабільний. Заголовки, основний текст і helper-copy мають
помітну ієрархію; shell обмежений 560 px, тому desktop не розтягує інструкцію в довгий рядок.
На ≤400 px appbar, довгі labels, headers, library topics і 7-денний цикл переходять у reflow,
а safe-area додається з усіх потрібних боків.

P2 після validation:

1. перевірити темну/нічну тему як сценарій використання з немовлям, а не як декоративну фічу;
2. звести всі другорядні 11–13 px підписи до формальної type scale й не лишати істотний
   зміст нижче 14 px;
3. не робити multi-column desktop layout, доки поведінкові дані не покажуть desktop-use case.
4. перевірити довгі українські назви, dynamic text і локалізаційний запас без обрізання,
   особливо в appbar, bottom nav, topics, confirmation і system-status повідомленнях.

### 5.5 Accessibility та інклюзивний UX

На рівні source/DOM закриті головні ризики: у сторінок є заголовки, route change відновлює
фокус, controls мають labels, статуси не читаються щосекунди, touch targets достатні,
bottom nav не має перекривати focus, а reduced-motion і вузький reflow враховані.

Залишковий verdict навмисно **не закритий**. Потрібні реальні keyboard-only, VoiceOver,
TalkBack/NVDA, forced-colors, 200% text і 400% zoom проходи. Окремо перевірити:

- логічний порядок фокуса в onboarding, Survey, Game reflection, dialogs і recovery;
- що видимий focus не обрізається sticky appbar/bottom nav;
- що SVG є декоративним або має коректну доступну назву, але не дублює label;
- що live regions оголошують route, save/conflict і library count один раз;
- що red flags, stop rules, помилка й успіх зрозумілі без кольору;
- що timeout/timer не створює тиску й жодна дія не вимагає точного gesture.

## 6. Функціональність, дані й технічна якість

### 6.1 Що вже надійно

- Вікове вікно між контрольними точками бере молодший завершений checklist; до 2 місяців
  є окремий стан; після 12 місяців — чесне завершення; corrected age покритий тестами.
- Повторне спостереження не стирає play diary, reactions, notes, favorites або completions.
- Нотатки й реакції мають ключ `date:age:activityId`: друга гра того самого дня не
  перейменовує і не стирає пам'ять першої; legacy day keys мігрують.
- Multi-child дані ізольовані; старі схеми мігрують без втрати.
- Startup і backup проходять один strict validator: schema version, canonical age/milestone/
  activity IDs, keys, timestamps, довжина нотаток і unsafe object keys перевіряються до DOM.
- Parseable, але невалідний localStorage не рендериться; raw data зберігається для recovery.
  Імпортований текст екранується, тому snapshot-name XSS не доходить до Records.
- Restore вимагає явного підтвердження заміни.
- P2.63 додає revision/updatedAt, compare-before-write і `storage` listener: застаріла
  вкладка/PWA не має тихо перезаписувати новіший стан, а показує спокійне conflict notice.
- Storage failure не руйнує UI й показує recovery шлях.
- PWA precache містить 18 core entries / 482 840 bytes разом із двома URL app shell,
  тобто лишається в межах автоматизованого бюджету; Motion
  Cards кешуються після першого перегляду; quota failure не поглинає успішну network response.
- Service-worker update не перезавантажує застосунок без згоди.
- Прихованої аналітики або відправлення developmental responses у мережу в поточному
  runtime не виявлено.

### 6.2 Що треба зробити до production

1. Додати справжні browser E2E для критичних маршрутів, кількох вкладок/installed PWA,
   міграцій, offline/update і backup/restore; поточна сильна Node suite не замінює layout engine.
2. Розділити `app5.js` на router, store/migrations, backup, observation, game, records,
   library та accessibility helpers до підключення backend.
3. Винести Motion review coordinator/reviewer код із parent bundle в окремий internal build.
4. Для публічного хостингу надати застосунку ізольований origin, зафіксувати CSP, security
   headers, cache policy, error logging без текстів нотаток/відповідей та rollback procedure.
   Shared GitHub Pages origin з іншими прототипами не є прийнятною довгостроковою межею
   для чутливих локальних developmental records.
5. Не міняти localStorage на IndexedDB лише «для солідності». Робити це, якщо реальний обсяг,
   транзакційність або офлайн-asset management дадуть конкретну потребу.

### 6.3 Privacy і security межа

Local-first без акаунта зараз є перевагою: менше attack surface і немає автоматичного upload
чутливих спостережень. Але consent screen сам по собі не є юридичним висновком.

Revision/conflict guard P2.63 зменшує ризик last-write-wins у звичайному сценарії кількох
вкладок, але не є серверною транзакцією. Одночасний запис у вузькому race window та поведінку
між installed PWA і браузером треба перевірити живим E2E; майбутня синхронізація потребує
явної conflict model, а не повторного використання localStorage revision як cloud protocol.

Якщо з'являться cloud, sharing або оплата, обов'язкові:

- окремий явний opt-in до cloud; оплата не означає згоду на upload;
- household roles, безпечні caregiver invites, revoke і audit trail;
- server-authoritative entitlements, payment webhooks і restore purchase;
- encryption, retention, export, deletion, backup lifecycle і conflict resolution;
- downgrade/grace/read-only, за якого власні дані завжди читаються, експортуються й видаляються;
- GDPR/DPIA, subprocessors, transfers, marketing consent, VAT, renewal/cancellation/refund review.

## 7. Зміст, цікавість, наповнення й стриманість

### 7.1 Сильні сторони

- Зміст має функціональну форму: **що зробити → що помітити → коли зупинитися**, а не
  довгу лекцію.
- Усі milestone questions походять із curated pool; runtime не генерує медичні твердження.
- Результати описують спостереження, а не score, percentile, level або «ризик».
- Повернення будується через корисність: контекстну гру, favorites, тижневий recap,
  приватні моменти й одне добровільне нагадування.
- Немає streak, progress pressure, червоних прострочень, рейтингів, порівняння дітей або
  нескінченного feed.
- Бібліотека задумана як короткі відповіді з джерелом і датою, а не SEO-блог.

Це правильна «цікавість» для втомленого батька: не розважати будь-якою ціною, а швидко
дати одну доречну, теплу й безпечну дію.

P2.64 закріплює fail-closed item-level модель, а не довіряє лише загальній позначці
build channel:

| Канал | Доступні activities | Значення |
|---|---:|---|
| `validation-review` | 60 | Лише ізольоване внутрішнє/експертне рев'ю |
| `validation` | 33 | Авторські чернетки з повними полями; це **не expert approved** |
| майбутній public/release | 0 зараз | Лише IDs із реальним зафіксованим expert sign-off |
| невідомий канал | 0 | Fail closed |

27 rows із `NEEDS_REVIEW` не потрапляють до звичайного parent Game, favorites,
альтернатив або прямого Start. Raw lookup зберігається тільки для сумісності історії й
backup. Allowlist автоматично звіряється з canonical CSV, щоб статус не роз'їхався з
runtime.

Library у P2.64 за замовчуванням показує матеріали поточного вікового вікна. Перегляд інших
віків є явною дією. Загальні safety-матеріали лишаються видимими у всіх релевантних вікнах,
а поради про годування й ризик вдавлення зберігають власну вікову межу. Це зменшує ризик,
що батьки двомісячної дитини сприймуть матеріал для 6+ місяців як актуальну пораду.

### 7.2 Головні контентні ризики

- Увесь parent-facing developmental content залишається draft до реального expert sign-off.
- 27 net-new activity safety rows мають `NEEDS_REVIEW`; runtime gate приховує їх від
  звичайного validation channel, але не вирішує сам зміст.
- 33 доступні у validation activities є авторськими чернетками, а не клінічно схваленими.
- 60 visual guides — 59 Motion Cards і окремий tummy-time guide — потребують перевірки
  положень, рухів, stop conditions, оригінальності, provenance і ліцензій.
- Усі 13 library materials мають draft-статус.
- П'ять вікових вікон 2/4/6/9/12 не створюють чесної обіцянки «щомісячного оновлення».
- Після 12 місяців немає підтвердженого контентного/сервісного горизонту для recurring plan.
- Favorites, history і library можуть бути корисними, але їхня реальна знаходжуваність ще
  не доведена.

### 7.3 Рекомендації по наповненню

1. Не додавати нові теми, доки не закриті 54 milestones, 60 activities, 60 visual guides
   (59 Motion Cards + 1 tummy-time guide) і 13 library drafts.
2. Для кожного parent-facing елемента зберігати status, version, source, reviewer role,
   review date та умову повторного перегляду.
3. Підтримувати один шаблон гри: підготовка, 2–4 кроки, що помітити, stop condition,
   low-energy/accessibility alternative.
4. Не перетворювати «реакцію після гри» на приховану оцінку дитини; вона ранжує лише
   зручність формату для цієї сім'ї.
5. Харчування, сон, прикорм або медичні модулі запускати лише з окремим предметним gate,
   а не як спосіб штучно наповнити підписку.
6. Не додавати фото, публічний sharing, AI-діагностику, daily streak або push-серію до
   окремого доказу користі, privacy і safety.
7. Уникати сильніших доказових тверджень, ніж дозволяють джерела: чесний шаблон —
   «ідея узгоджується із загальними рекомендаціями; ефект саме цієї гри окремо не
   оцінювався». Не називати автоматично сформований текст клінічним висновком.
8. У мікрокопі віддавати перевагу нейтральним діям: «Показати коротку відповідь»,
   «Зведення ваших відповідей», «На сьогодні достатньо». Формулювання мають завершувати
   сесію без провини, а не стимулювати повтор заради метрики.

## 8. Free + paid модель

### 8.1 Безкоштовний незнижуваний рівень

| Можливість | Free |
|---|:---:|
| Повний віковий шлях спостереження | Так |
| Red flags, втрата навички, stop rules і маршрут до фахівця | Завжди |
| Базове пояснення «чому це тут» і джерело | Завжди |
| Одна безпечна персоналізована гра на сьогодні | Так, після реального expert sign-off |
| Локальні записи, історія й власні нотатки | Створення, читання, export, delete |
| Базовий підсумок для фахівця | Завжди |
| Offline, accessibility, privacy і recovery controls | Завжди |

Не можна показувати paywall після «Ще не помічаю», перед stop rule/джерелом, на маршруті
до фахівця або під час доступу, export чи delete власних даних. Не можна продавати
формулювання «оновіть, щоб дізнатися, чи все нормально».

### 8.2 Що може бути платним після перевірки

- більше експертно перевірених варіантів гри й контекстів, але не «безпечніша версія»;
- глибші reviewed explainers, але не базова safety-інформація;
- cloud sync і caregiver sharing після privacy/backend gate;
- розширені фільтри, шаблони й організація, але не блокування власних записів;
- нові експертно перевірені модулі та чесний content cadence;
- підтримка після 12 місяців, якщо з'явиться реальний roadmap 15–60 місяців.

### 8.3 Комерційний verdict

**Підписку зараз не реалізовувати.** Спочатку протестувати три окремі концепції:

1. Free core;
2. одноразовий Expanded 0–12 Pack;
3. Family plan із recurring service, а не лише доступом до статичних карток.

За поточного горизонту 0–12 місяців одноразовий pack або обмежений annual access виглядає
чесніше за автоматично поновлювану monthly subscription. Це гіпотеза для тесту, не
підтверджена бізнес-модель.

Необхідна послідовність:

`Free core → expert gate → usability → 4–8 тижнів retention → one-time vs subscription WTP → legal/backend → paid pilot`.

До написання billing-коду треба зафіксувати наперед:

- яку повторювану задачу сім'я вирішує після першого тижня і після 12 місяців;
- activation, добровільне W4/W8 повернення й причини відмови без використання streak;
- поведінковий WTP для one-time, annual і monthly пропозицій, а не лише відповідь «так/ні»;
- реальну швидкість expert-reviewed content cadence і її собівартість;
- server-authoritative entitlement, webhooks, restore purchase, family roles, grace/downgrade,
  refund/cancellation і read/export/delete власних даних після завершення оплати.

Без цих доказів paywall лише приховає слабку retention-модель. У поточному продукті
правильне рішення — будувати якісний free core й вимірювати корисність, а не імітувати
готовність підписки тарифною сторінкою.

## 9. Пріоритетний реєстр того, що лишилось

Після зеленого P2.64 автоматизовані source-level P0/P1, знайдені цим аудитом, вважаються
закритими. Це **не** закриває release P0: живий UI, assistive technology, клінічний зміст,
батьківське розуміння, legal/privacy та production-origin потребують окремих доказів.

| ID | Пріоритет | Дія | Власник/роль | Критерій завершення |
|---|:---:|---|---|---|
| G1 | P0 для release | Live browser/device/a11y matrix | QA + design | Немає overflow/overlap; core flow проходить touch/keyboard/SR |
| G2 | P0 для parent test | Review 54 milestones і всіх parent-facing claims | Педіатр/клінічний експерт | Підписані рішення, version/date/role, zero unresolved critical |
| G3 | P0 для parent test | Review 60 activities, 60 visual guides (59 Motion Cards + 1 tummy-time guide) і 27 safety gaps | Педіатр + physio/OT + content | Пози, рухи, stop, source, provenance й license схвалені або відхилені |
| G4 | P0 для release | 5 moderated parent sessions | UX researcher | Core tasks без критичної допомоги; safety не тлумачиться помилково |
| G5 | P0 для public/cloud | Privacy/legal review | DPO/privacy lawyer | Notice, consent, retention, rights і local/cloud boundary затверджені |
| G6 | P0 для public | Ізольований production origin і security headers | Web/platform + security | CSP, headers, cache/rollback; жодного shared-origin доступу до local records |
| R1 | P1 business | 4–8-тижневий free longitudinal pilot | Product research | Відомі добровільні причини повернення й drop-off, без streak pressure |
| R2 | P1 business | One-time vs monthly/annual WTP | Product + research | Поведінкові, а не лише гіпотетичні сигнали; thresholds задані до тесту |
| R3 | P1 strategy | Вирішити горизонт після 12 місяців | Product + experts | Або reviewed 15–60 roadmap, або чесний one-time 0–12 scope |
| T1 | P1 перед paid build | Account/entitlement/privacy architecture | Backend + security + legal | Server authority, downgrade, restore, delete, offline grace спроєктовані |
| T2 | P2 engineering | Розділити app/runtime/internal review tooling | Frontend | Модулі й storage adapter мають окремі тести; internal reviewer не їде в parent bundle |
| D1 | P2 design | Перевірити нічну тему | Design + parents | Нічний сценарій реально зменшує glare без втрати контрасту |
| D2 | P2 utility | Print/PDF specialist summary | Product + clinician | Підсумок фактичний, короткий, приватний і придатний до прийому |
| D3 | P2 accessibility | TTS для кроків, лише якщо є попит | Accessibility research | Не дублює SR хаотично й допомагає в hands-busy сценарії |

## 10. Обов'язкова ручна матриця

Viewports/режими:

- 320×568;
- 390×844 на iOS Safari або найближчий реальний iPhone;
- 360×800 і 412×915 на Android Chrome;
- 768×1024 на iPadOS Safari;
- 1440×900;
- 1280×720 при 400% page zoom;
- 200% text-only scaling;
- portrait/landscape із safe-area;
- reduced motion, forced colors, keyboard-only;
- VoiceOver на iOS, TalkBack на Android і NVDA або еквівалент на desktop.

Стани:

- Welcome зі зламаним storage та restore;
- consent/profile, нова й друга дитина, corrected age, pre-2 і post-12;
- Home до/під час/після observation, offline, storage failure і stale-tab conflict;
- Survey first/middle/resume, Results `all clear`/`not sure`/`not yet`;
- Game до Start, blocked activity ID, active timer, Finish, reflection, reminder, alternative;
- Records empty/full/private-moment delete;
- Library current-age default, explicit other ages, search/no-results і all-age safety;
- Ask із нотатками й копіюванням;
- PWA install, update by consent, offline restart, browser-tab ↔ installed-PWA update і recovery.

Acceptance:

- `scrollWidth === clientWidth` для сторінки, крім свідомої Motion carousel;
- bottom nav і thumb action не перекривають зміст або focus;
- Back/Forward не повертають до невалідного onboarding і не гублять дані;
- застаріла вкладка не перезаписує новіший revision; зовнішня валідна зміна відображається,
  невалідна — не замінює поточний стан;
- Start/Finish працюють по тексту, іконці й клавіатурі;
- route change має одне зрозуміле оголошення; timer не читається щосекунди;
- library count оголошується один раз після debounce;
- звичайний validation channel не запускає жоден із 27 `NEEDS_REVIEW` IDs;
- жодна essential action не залежить лише від кольору, hover або gesture.

Повний операційний чекліст уже є в `docs/real_device_smoke_test_ua.md`.

## 11. Що виправлено під час цього аудиту

| Крок | Результат | Commit |
|---|---|---|
| Baseline | Зафіксовано scope, gates і one-step/one-commit процес | `060175a` |
| Age routing | Молодший завершений checklist, pre-2 state, corrected-age tests | `a51b4b8` |
| Data integrity | Повторне спостереження більше не стирає play data | `eaef86f` |
| Content/safety gates | Draft не видається за approved; stop rules видно до Start | `b675669` |
| Home/routes | Одна контекстна дія й стабільні primary routes | `b4ea9dd` |
| Game | Одна основна безпечна активність і захищений play lifecycle | `cbba1bf` |
| Visual system | Семантичні кольори, solid controls, єдині SVG, restrained gradients | `c2ad968` |
| A11y/reflow/recovery/PWA | Focus/ARIA, ≤400 px reflow, restore, strict backup, 442 KiB core | `431c667` |
| Age/route boundaries | Pre-2 data controls, post-12 завершення, Results/unknown-route guards | `a5e4b71` |
| Startup/import security | Один strict validator, canonical IDs/times, recovery і snapshot-XSS захист | `ae1dafe` |
| Multi-play integrity | Нотатки/реакції activity-specific; legacy migration; safe undo | `706c6d2` |
| Multi-tab/PWA integrity | Revision, compare-before-write, conflict notice і external storage refresh | `a85a23d` |
| Item-level content boundary | 27 `NEEDS_REVIEW` fail closed; 33 draft allowlist; age-first Library | `edd4388` |

## 12. Рекомендована послідовність подальших комітів

1. `test: complete live device and accessibility matrix` — лише після реального проходу;
2. `content: record expert review decisions` — тільки реальні рішення, без симуляції;
3. окремі `fix:` коміти для кожного expert/parent P0 або P1;
4. `research: record five parent sessions and synthesis`;
5. `legal: record privacy and public-hosting decision`;
6. `research: record longitudinal retention evidence`;
7. `research: compare paid offer concepts`;
8. лише після рішення — окремий architecture plan для account/entitlements/payments.

Критерій переходу між фазами:

- **P2.64 automated baseline** → можна передавати в закрите expert review;
- **expert permission + live smoke** → можна проводити moderated parent sessions;
- **expert + parent + accessibility/device + legal/privacy** → можна окремо вирішувати
  питання публічної безкоштовної версії;
- **4–8 тижнів retention + поведінковий WTP + backend/legal design** → лише тоді
  вирішувати, чи потрібна підписка взагалі.

Після завершення цього аудиту власник окремо дозволив публічний validation preview, який
було розгорнуто 2026-07-15 через manual-only GitHub Pages workflow. Це рішення не змінює
вердикт **NO-GO для production Free release** і не закриває expert, device/a11y, parent або
privacy gates. Поточний код не повинен отримувати фіктивні «expert approved», «clinically
validated» або «subscription ready» позначки.
