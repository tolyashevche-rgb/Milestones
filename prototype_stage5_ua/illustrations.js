// Original inline-SVG illustrations per developmental domain (interim, designer-free).
// Calm line style, decorative only (wrapper carries aria-hidden). No copyrighted assets.
// Color comes from CSS `currentColor`, so they follow the theme.

const SVG_OPEN = '<svg viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">';

const DOMAIN_ILLUS = {
  // Social & emotional: two friendly faces + a small heart.
  social: SVG_OPEN +
    '<circle cx="24" cy="29" r="12"/>' +
    '<circle cx="45" cy="34" r="9"/>' +
    '<circle cx="20" cy="28" r="1.4" fill="currentColor" stroke="none"/>' +
    '<circle cx="28" cy="28" r="1.4" fill="currentColor" stroke="none"/>' +
    '<path d="M20 33q4 3.5 8 0"/>' +
    '<circle cx="42" cy="33" r="1.2" fill="currentColor" stroke="none"/>' +
    '<circle cx="48" cy="33" r="1.2" fill="currentColor" stroke="none"/>' +
    '<path d="M42 37q3 2.5 6 0"/>' +
    '<path d="M47 19c-3-2.2-5.5-4.4-5.5-6.7a2.8 2.8 0 0 1 5.5-.8 2.8 2.8 0 0 1 5.5.8c0 2.3-2.5 4.5-5.5 6.7z"/>' +
    '</svg>',

  // Language & communication: a speech bubble + sound waves.
  language: SVG_OPEN +
    '<path d="M12 26a9 9 0 0 1 9-9h10a9 9 0 0 1 9 9v5a9 9 0 0 1-9 9h-7l-8 6v-7a9 9 0 0 1-4-8z"/>' +
    '<path d="M21 25h10"/><path d="M21 31h7"/>' +
    '<path d="M47 23q5 9 0 18"/>' +
    '<path d="M52 18q8 14 0 28"/>' +
    '</svg>',

  // Learning & thinking: stacking blocks + a little spark.
  cognitive: SVG_OPEN +
    '<rect x="13" y="36" width="16" height="15" rx="2.5"/>' +
    '<rect x="29" y="40" width="13" height="11" rx="2.5"/>' +
    '<rect x="19" y="21" width="13" height="15" rx="2.5"/>' +
    '<path d="M47 16v8"/><path d="M43 20h8"/><path d="M44.5 17.5l5 5"/><path d="M49.5 17.5l-5 5"/>' +
    '</svg>',

  // Movement & physical: a reaching figure + a toy.
  movement: SVG_OPEN +
    '<circle cx="23" cy="19" r="6"/>' +
    '<path d="M23 25v13"/>' +
    '<path d="M23 29l-8 6"/><path d="M23 29l11 4"/>' +
    '<path d="M23 38l-6 10"/><path d="M23 38l7 9"/>' +
    '<circle cx="46" cy="38" r="6"/>' +
    '</svg>'
};

function domainIllus(domain) {
  return (DOMAIN_ILLUS && DOMAIN_ILLUS[domain]) || "";
}

// Original Milestones Motion Cards. These scenes were drawn for this app from
// the activity's own safety-checked wording; they do not reproduce book art.
const MOTION_SVG_OPEN = '<svg viewBox="0 0 96 72" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">';
const MOTION_SVG_CLOSE = '</svg>';

const MOTION_CARD_ART = {
  tummy_prepare: MOTION_SVG_OPEN +
    '<path d="M13 57h70"/><path d="M23 54c8-12 17-15 30-9l14 7"/><circle cx="61" cy="42" r="7"/>' +
    '<path d="M31 48l-7 5M43 45l-5 9M68 47l8 6"/><path class="motion-accent" d="M14 17h24v15H14z"/>' +
    '<path d="M19 25l5-4 4 4 5-5"/>' + MOTION_SVG_CLOSE,
  tummy_do: MOTION_SVG_OPEN +
    '<path d="M10 58h76"/><circle cx="25" cy="30" r="9"/><path d="M19 38l-5 17M31 37l12 15M16 45l19-1"/>' +
    '<path d="M48 54c7-10 15-12 26-7l8 5"/><circle cx="75" cy="43" r="6"/><path d="M42 32q7-5 14 0"/>' +
    '<path class="motion-accent" d="M45 28l4 4-4 4"/>' + MOTION_SVG_CLOSE,
  tummy_observe: MOTION_SVG_OPEN +
    '<path d="M13 57h70"/><path d="M22 54c9-12 19-14 32-8l13 7"/><circle cx="62" cy="41" r="7"/>' +
    '<path d="M31 49l-8 4M45 46l-3 8M69 47l9 6"/><path class="motion-accent" d="M61 29v-9m-5 4 5-5 5 5"/>' +
    '<path d="M74 17l3 3 6-7"/>' + MOTION_SVG_CLOSE,
  tummy_stop: MOTION_SVG_OPEN +
    '<path d="M12 57h72"/><path d="M24 54c8-10 17-12 29-7l13 6"/><circle cx="61" cy="42" r="7"/>' +
    '<path d="M30 50l-7 4M69 48l8 5"/><path d="M58 43q3-3 6 0"/><path class="motion-accent" d="M77 14v20M67 24h20"/>' + MOTION_SVG_CLOSE,

  sound_prepare: MOTION_SVG_OPEN +
    '<circle cx="28" cy="31" r="11"/><path d="M20 42l-5 17M36 42l5 17M17 52h23"/>' +
    '<circle cx="68" cy="36" r="8"/><path d="M62 44l-6 14M74 44l7 14"/><path class="motion-accent" d="M40 28h15"/>' +
    '<path d="M44 24l-4 4 4 4"/>' + MOTION_SVG_CLOSE,
  sound_do: MOTION_SVG_OPEN +
    '<circle cx="26" cy="36" r="10"/><path d="M18 46l-5 14M34 46l5 14"/><circle cx="69" cy="39" r="8"/>' +
    '<path d="M63 47l-5 12M75 47l7 12"/><path class="motion-accent" d="M40 28q7-6 14 0M54 36q-7 6-14 0"/>' +
    '<path d="M48 24v-5M48 45v5"/>' + MOTION_SVG_CLOSE,
  sound_observe: MOTION_SVG_OPEN +
    '<circle cx="48" cy="37" r="14"/><circle cx="43" cy="34" r="1.5" fill="currentColor" stroke="none"/>' +
    '<circle cx="53" cy="34" r="1.5" fill="currentColor" stroke="none"/><path d="M42 42q6 5 12 0"/>' +
    '<path class="motion-accent" d="M27 31q-5 6 0 12M69 31q5 6 0 12"/><path d="M22 26l-5-4M74 26l5-4"/>' + MOTION_SVG_CLOSE,
  sound_stop: MOTION_SVG_OPEN +
    '<circle cx="40" cy="38" r="13"/><circle cx="36" cy="35" r="1.4" fill="currentColor" stroke="none"/>' +
    '<path d="M43 34l6-3M35 44q5-4 10 0"/><path d="M52 42l13 7"/>' +
    '<path class="motion-accent" d="M74 15v22M63 26h22"/>' + MOTION_SVG_CLOSE,

  find_prepare: MOTION_SVG_OPEN +
    '<path d="M14 59h68"/><circle cx="34" cy="28" r="9"/><path d="M34 37v14M34 42l-12 8M34 42l13 8M28 51l-7 8M40 51l7 8"/>' +
    '<path class="motion-accent" d="M63 24l11 20M61 22q5-4 9 1"/>' + MOTION_SVG_CLOSE,
  find_do: MOTION_SVG_OPEN +
    '<circle cx="28" cy="28" r="9"/><path d="M28 37v19M28 42l15 2"/><path class="motion-accent" d="M57 20v26m-5-5 5 5 5-5"/>' +
    '<path d="M52 18q5-4 9 1l9 22M48 58h29"/>' + MOTION_SVG_CLOSE,
  find_observe: MOTION_SVG_OPEN +
    '<circle cx="30" cy="29" r="9"/><path d="M30 38v18M30 43l18 6M30 44l-10 8"/><path class="motion-accent" d="M44 35q9 2 14 10"/>' +
    '<path d="M55 57h22M61 48l9 9"/><path d="M24 27l4 2 4-3"/>' + MOTION_SVG_CLOSE,
  find_stop: MOTION_SVG_OPEN +
    '<circle cx="37" cy="35" r="11"/><path d="M29 45l-8 14M45 45l8 14"/><path d="M32 40q5-4 10 0"/>' +
    '<path d="M59 50l12 7M58 57h20"/><path class="motion-accent" d="M76 14v22M65 25h22"/>' + MOTION_SVG_CLOSE
};

const ACTIVITY_VISUAL_GUIDES = {
  act_002_movement_001: {
    title: "Як це виглядає",
    image: "activity-tummy-time-guide-v1.png",
    imageAlt: "Чотири сцени гри на животику: підготовка килимка, дитина на животику під наглядом, взаємодія на рівні очей та спокійне завершення при втомі.",
    cards: [
      { phase: "Підготуйте", text: "Тверда безпечна поверхня. Дитина не спить.", art: "tummy_prepare" },
      { phase: "Зробіть", text: "Будьте попереду на рівні її очей.", art: "tummy_do" },
      { phase: "Спостерігайте", text: "Погляд або маленький рух — уже відповідь.", art: "tummy_observe" },
      { phase: "Зупиніться", text: "При плачі, втомі чи сонливості.", art: "tummy_stop", stop: true }
    ]
  },
  act_006_language_001: {
    title: "Як це виглядає",
    cards: [
      { phase: "Підготуйте", text: "Влаштуйтесь так, щоб бачити одне одного.", art: "sound_prepare" },
      { phase: "Зробіть", text: "Повторіть звук дитини й зачекайте.", art: "sound_do" },
      { phase: "Спостерігайте", text: "Звук, усмішка, рух чи пауза — відповідь.", art: "sound_observe" },
      { phase: "Зупиніться", text: "Коли дитина відвертається, плаче чи втомилась.", art: "sound_stop", stop: true }
    ]
  },
  act_009_cognitive_001: {
    title: "Як це виглядає",
    cards: [
      { phase: "Підготуйте", text: "Безпечна посадка і велика легка іграшка.", art: "find_prepare" },
      { phase: "Зробіть", text: "Впустіть у полі зору й запитайте: «Де?»",
        art: "find_do" },
      { phase: "Спостерігайте", text: "Погляд униз або спроба дотягнутися — відповідь.", art: "find_observe" },
      { phase: "Зупиніться", text: "Коли дитина засмучується або втрачає інтерес.", art: "find_stop", stop: true }
    ]
  }
};

const ACTIVITY_RASTER_GUIDES = {
  act_002_social_001: { image: "assets/motion_cards/act_002_social_001.jpg", imageAlt: "Дорослий тримає двомісячне немовля, тихо говорить, робить паузу й завершує при ознаках втоми." },
  act_002_language_001: { image: "assets/motion_cards/act_002_language_001.jpg", imageAlt: "Чотири кроки спокійного повторення звуків двомісячної дитини." },
  act_002_cognitive_002: { image: "assets/motion_cards/act_002_cognitive_002.jpg", imageAlt: "Контрастну картку показують двомісячній дитині нерухомо, а потім повільно переміщують." },
  act_004_social_001: { image: "assets/motion_cards/act_004_social_001.jpg", imageAlt: "Дорослий і чотиримісячна дитина повторюють усмішку та роблять паузи." },
  act_004_movement_002: { image: "assets/motion_cards/act_004_movement_002.jpg", imageAlt: "Чотиримісячна дитина тягнеться до великої легкої іграшки, лежачи на спині під наглядом." },
  act_004_cognitive_003: { image: "assets/motion_cards/act_004_cognitive_003.jpg", imageAlt: "Дорослий показує брязкальце, ненадовго ховає його за рукою та знову показує." },
  act_006_language_001: { image: "assets/motion_cards/act_006_language_001.jpg", imageAlt: "Дорослий відповідає на звуки шестимісячної дитини й залишає час для її відповіді." },
  act_006_cognitive_001: { image: "assets/motion_cards/act_006_cognitive_001.jpg", imageAlt: "Велику легку м’яч-іграшку пропонують шестимісячній дитині збоку без примусу схопити." },
  act_006_movement_003: { image: "assets/motion_cards/act_006_movement_003.jpg", imageAlt: "Іграшка збоку запрошує шестимісячну дитину самостійно повернутися без примусу." },
  act_009_social_001: { image: "assets/motion_cards/act_009_social_001.jpg", imageAlt: "Дорослий грає з дев’ятимісячною дитиною в ку-ку, залишаючи паузу для реакції." },
  act_009_cognitive_001: { image: "assets/motion_cards/act_009_cognitive_001.jpg", imageAlt: "Велика безпечна іграшка падає в полі зору дев’ятимісячної дитини, яка може її знайти." },
  act_009_movement_002: { image: "assets/motion_cards/act_009_movement_002.jpg", imageAlt: "Дев’ятимісячна дитина сидячи тягнеться трохи вбік до великого кубика, а дорослий страхує поруч." },
  act_012_cognitive_001: { image: "assets/motion_cards/act_012_cognitive_001.jpg", imageAlt: "Дванадцятимісячна дитина кладе великі предмети у відкриту ємність і виймає їх." },
  act_012_cognitive_002: { image: "assets/motion_cards/act_012_cognitive_002.jpg", imageAlt: "Дорослий частково ховає велику іграшку під тканиною, а дитина знаходить її." },
  act_012_movement_001: { image: "assets/motion_cards/act_012_movement_001.jpg", imageAlt: "Дванадцятимісячна дитина самостійно встає біля низької стійкої опори під наглядом дорослого." },
  act_002_social_002: { image: "assets/motion_cards/act_002_social_002.jpg", imageAlt: "Дорослий безпечно тримає двомісячну дитину обличчям до себе, усміхається, робить паузу й завершує при відвертанні." },
  act_002_movement_002: { image: "assets/motion_cards/act_002_movement_002.jpg", imageAlt: "Легкий дотик до тильної сторони кисті запрошує долоньку двомісячної дитини розкритися без примусу." },
  act_002_movement_003: { image: "assets/motion_cards/act_002_movement_003.jpg", imageAlt: "Дорослий дуже повільно згинає ніжки двомісячної дитини по черзі та припиняє при невдоволенні." },
  act_004_language_001: { image: "assets/motion_cards/act_004_language_001.jpg", imageAlt: "Дорослий воркує з чотиримісячною дитиною, залишаючи паузи для будь-якої відповіді." },
  act_004_cognitive_002: { image: "assets/motion_cards/act_004_cognitive_002.jpg", imageAlt: "Чотиримісячна дитина самостійно досліджує великий безпечний прорізувач під наглядом дорослого." },
  act_004_movement_001: { image: "assets/motion_cards/act_004_movement_001.jpg", imageAlt: "Неспляча чотиримісячна дитина коротко грається на животику з опорою на передпліччя під постійним наглядом." },
  act_006_social_002: { image: "assets/motion_cards/act_006_social_002.jpg", imageAlt: "Шестимісячна дитина з підтримкою дивиться у велике безпечне дитяче дзеркало й завершує гру при втомі." },
  act_006_cognitive_002: { image: "assets/motion_cards/act_006_cognitive_002.jpg", imageAlt: "Дорослий помічає, що шестимісячна дитина відвертається під час годування, прибирає ложку й спокійно завершує." },
  act_006_movement_002: { image: "assets/motion_cards/act_006_movement_002.jpg", imageAlt: "Шестимісячна дитина коротко сидить із опорою на долоні, а дорослий постійно страхує тулуб." },
  act_009_social_003: { image: "assets/motion_cards/act_009_social_003.jpg", imageAlt: "Дорослий і дев’ятимісячна дитина добровільно передають велику іграшку одне одному без силового забирання." },
  act_009_cognitive_002: { image: "assets/motion_cards/act_009_cognitive_002.jpg", imageAlt: "Дев’ятимісячна дитина тримає два великі м’які кубики й пробує звести їх разом." },
  act_009_movement_001: { image: "assets/motion_cards/act_009_movement_001.jpg", imageAlt: "Дев’ятимісячна дитина сидячи перекладає велике кільце з однієї руки в іншу під наглядом." },
  act_012_social_002: { image: "assets/motion_cards/act_012_social_002.jpg", imageAlt: "Дорослий повільно плескає, дванадцятимісячна дитина наслідує у власний спосіб, а гра завершується без тиску." },
  act_012_language_003: { image: "assets/motion_cards/act_012_language_003.jpg", imageAlt: "Дорослий показує велику улюблену іграшку, чекає на будь-який сигнал і відразу дає її дитині." },
  act_012_movement_003: { image: "assets/motion_cards/act_012_movement_003.jpg", imageAlt: "Дванадцятимісячна дитина робить кілька кроків зі стійкою каталкою, а дорослий підтримує тулуб і завершує при втомі." },
  act_002_language_002: { image: "assets/motion_cards/act_002_language_002.jpg", imageAlt: "Дорослий допомагає двомісячній дитині помітити тихий звук тканини, робить паузу й завершує при втомі." },
  act_002_cognitive_001: { image: "assets/motion_cards/act_002_cognitive_001.jpg", imageAlt: "Дорослий повільно переміщує обличчя в полі зору двомісячної дитини та зупиняється, коли вона відвертається." },
  act_002_social_003: { image: "assets/motion_cards/act_002_social_003.jpg", imageAlt: "Повністю одягнену двомісячну дитину спокійно тримають біля грудей із підтримкою голови й тулуба." },
  act_002_language_003: { image: "assets/motion_cards/act_002_language_003.jpg", imageAlt: "Дорослий тихо наспівує під час догляду за двомісячною дитиною, робить паузу й стежить за її станом." },
  act_002_cognitive_003: { image: "assets/motion_cards/act_002_cognitive_003.jpg", imageAlt: "Чорно-білий візерунок показують двомісячній дитині нерухомо й прибирають, коли вона відвертається." },
  act_004_social_002: { image: "assets/motion_cards/act_004_social_002.jpg", imageAlt: "Дорослий показує чотиримісячній дитині кумедну міміку, робить паузу й спокійно завершує гру." },
  act_004_language_002: { image: "assets/motion_cards/act_004_language_002.jpg", imageAlt: "Дорослий подає тихий голос збоку від чотиримісячної дитини, чекає на її реакцію й не примушує повертатися." },
  act_004_cognitive_001: { image: "assets/motion_cards/act_004_cognitive_001.jpg", imageAlt: "Чотиримісячна дитина розглядає власні ручки, а дорослий спокійно спостерігає без примусу." },
  act_004_social_003: { image: "assets/motion_cards/act_004_social_003.jpg", imageAlt: "Дорослий повільно наслідує простий рух чотиримісячної дитини, робить паузу й чекає на відповідь." },
  act_004_language_003: { image: "assets/motion_cards/act_004_language_003.jpg", imageAlt: "Дорослий тихо співає коротку потішку чотиримісячній дитині, робить паузу й завершує при втомі." },
  act_004_movement_003: { image: "assets/motion_cards/act_004_movement_003.jpg", imageAlt: "Чотиримісячна дитина напівлежить на колінах дорослого з постійною підтримкою голови, шиї й тулуба." },
  act_006_social_001: { image: "assets/motion_cards/act_006_social_001.jpg", imageAlt: "Знайомий дорослий вітає шестимісячну дитину, робить паузу для її реакції й не вимагає відповіді." },
  act_006_language_002: { image: "assets/motion_cards/act_006_language_002.jpg", imageAlt: "Дорослий один раз повторює кумедний звук шестимісячної дитини, залишає їй чергу й завершує при втомі." },
  act_006_movement_001: { image: "assets/motion_cards/act_006_movement_001.jpg", imageAlt: "Неспляча шестимісячна дитина тягнеться до великої іграшки на животику під постійним близьким наглядом." },
  act_006_social_003: { image: "assets/motion_cards/act_006_social_003.jpg", imageAlt: "Дорослий робить паузу перед легким дотиком крізь одяг і відразу зупиняється, коли дитина відвертається." },
  act_006_language_003: { image: "assets/motion_cards/act_006_language_003.jpg", imageAlt: "Дорослий називає те, на що дивиться шестимісячна дитина, робить паузу й завершує при втомі." },
  act_006_cognitive_003: { image: "assets/motion_cards/act_006_cognitive_003.jpg", imageAlt: "Шестимісячна дитина під наглядом досліджує три великі безпечні предмети з різними текстурами." },
  act_009_social_002: { image: "assets/motion_cards/act_009_social_002.jpg", imageAlt: "Дорослий один раз тепло називає ім’я дев’ятимісячної дитини, чекає й приймає будь-яку реакцію." },
  act_009_language_001: { image: "assets/motion_cards/act_009_language_001.jpg", imageAlt: "Дорослий повторює лепет дев’ятимісячної дитини, додає просте слово й залишає паузу." },
  act_009_language_002: { image: "assets/motion_cards/act_009_language_002.jpg", imageAlt: "Дорослий показує відкриті руки, чекає на сигнал дев’ятимісячної дитини й не тягне її до себе." },
  act_009_language_003: { image: "assets/motion_cards/act_009_language_003.jpg", imageAlt: "Дорослий і дев’ятимісячна дитина розглядають міцну картонну книжку, називають малюнок і перегортають сторінку." },
  act_009_cognitive_003: { image: "assets/motion_cards/act_009_cognitive_003.jpg", imageAlt: "Дев’ятимісячна дитина пробує вкладати один великий безпечний стаканчик в інший під наглядом." },
  act_009_movement_003: { image: "assets/motion_cards/act_009_movement_003.jpg", imageAlt: "Дев’ятимісячна дитина сидячи трохи тягнеться до великого м’якого кубика, а дорослий страхує тулуб." },
  act_012_social_001: { image: "assets/motion_cards/act_012_social_001.jpg", imageAlt: "Дорослий повільно плескає, робить паузу для дванадцятимісячної дитини й завершує без тиску." },
  act_012_language_001: { image: "assets/motion_cards/act_012_language_001.jpg", imageAlt: "Знайомий дорослий махає на прощання, чекає на будь-яку реакцію дитини й не зникає різко, якщо вона засмучена." },
  act_012_language_002: { image: "assets/motion_cards/act_012_language_002.jpg", imageAlt: "Під час звичайної гри дорослий називає знайому людину, чекає й не вимагає від дитини повторити слово." },
  act_012_movement_002: { image: "assets/motion_cards/act_012_movement_002.jpg", imageAlt: "Дитина безпечно сидить у стільчику й під прямим наглядом пробує взяти один м’який плаский шматочок їжі." },
  act_012_social_003: { image: "assets/motion_cards/act_012_social_003.jpg", imageAlt: "Дорослий і дитина сидячи наслідують простий рух та спокійно зупиняються при перевтомі." },
  act_012_cognitive_003: { image: "assets/motion_cards/act_012_cognitive_003.jpg", imageAlt: "Дванадцятимісячна дитина пробує опустити велику суцільну форму у стійкий сортер під наглядом дорослого." }
};

function activityVisualGuide(id) {
  const guide = ACTIVITY_VISUAL_GUIDES[id];
  const raster = ACTIVITY_RASTER_GUIDES[id];
  if (!guide && !raster) return null;
  return Object.assign({ title: "Як це виглядає" }, guide || {}, raster || {});
}

function motionCardArt(key) {
  return MOTION_CARD_ART[key] || "";
}
