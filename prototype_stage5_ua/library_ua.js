// E4 pilot: concise parent-facing materials with traceable official sources.
// All entries remain draft until a qualified domain expert signs them off.
const LIBRARY_MATERIALS = [
  {
    id: "responsive-pause", topic: "development", topicLabel: "Розвиток", ages: [2, 4, 6, 9, 12],
    title: "Як відповідати на сигнали дитини?",
    answer: "Помітьте погляд, звук або рух, дайте коротку відповідь і зробіть паузу. Дитині не потрібно повторювати дію чи «виконувати завдання».",
    doNow: "Один раз повторіть звук або міміку дитини й спокійно зачекайте.",
    source: { publisher: "WHO", title: "Improving early childhood development: WHO guideline", url: "https://www.who.int/publications/b/53575" }
  },
  {
    id: "milestones-not-score", topic: "development", topicLabel: "Розвиток", ages: [2, 4, 6, 9, 12],
    title: "Що означають вікові орієнтири?",
    answer: "Це навички, які допомагають спостерігати за грою, мовленням, поведінкою й рухом. Вони не є оцінкою дитини та не замінюють стандартизований скринінг.",
    doNow: "Запишіть конкретний приклад того, що бачите, без порівняння з іншими дітьми.",
    source: { publisher: "CDC", title: "Developmental Milestones", url: "https://www.cdc.gov/milestones" }
  },
  {
    id: "when-concerned", topic: "specialist", topicLabel: "Фахівець", ages: [2, 4, 6, 9, 12],
    title: "Коли варто обговорити розвиток?",
    answer: "Поговоріть із лікарем, якщо дитина втратила вже набуту навичку, ви не бачите кількох очікуваних умінь або вас просто щось непокоїть.",
    doNow: "Запишіть: що саме помітили, коли це почалося і що вже пробували.",
    source: { publisher: "CDC", title: "Developmental Milestones", url: "https://www.cdc.gov/milestones" }
  },
  {
    id: "talk-turns", topic: "language", topicLabel: "Мовлення", ages: [2, 4, 6, 9, 12],
    title: "Як підтримати ранню розмову?",
    answer: "Говоріть коротко, відповідайте на звуки, жести й погляд та залишайте паузу. Чергування важливіше за кількість слів або карток.",
    doNow: "Назвіть те, на що дивиться дитина, і зачекайте на будь-яку відповідь.",
    source: { publisher: "WHO", title: "Improving early childhood development: WHO guideline", url: "https://www.who.int/publications/b/53575" }
  },
  {
    id: "movement-floor", topic: "movement", topicLabel: "Рух", ages: [2, 4, 6, 9, 12],
    title: "Яка рухова гра достатня сьогодні?",
    answer: "Коротка гра на безпечній поверхні під наглядом уже корисна. Не тягніть дитину в позу й завершуйте при втомі, плачі або втраті інтересу.",
    doNow: "Покладіть одну велику безпечну іграшку в межах комфортного руху.",
    source: { publisher: "WHO", title: "Improving early childhood development: WHO guideline", url: "https://www.who.int/publications/b/53575" }
  },
  {
    id: "sleep-routine", topic: "sleep", topicLabel: "Сон", ages: [2, 4, 6, 9, 12],
    title: "Як зробити вечір спокійнішим?",
    answer: "Проста повторювана послідовність може допомогти налаштуватися на сон. Різні діти сплять по-різному, тому рутина не гарантує сон усю ніч.",
    doNow: "Оберіть три тихі кроки, наприклад: приглушити світло, переодягнути, тихо поговорити.",
    source: { publisher: "NHS", title: "Helping your baby to sleep", url: "https://www.nhs.uk/baby/caring-for-a-newborn/helping-your-baby-to-sleep/" }
  },
  {
    id: "safe-sleep", topic: "safety", topicLabel: "Безпека", ages: [2, 4, 6, 9, 12],
    title: "Базові умови безпечного сну",
    answer: "Для кожного сну кладіть немовля на спину на тверду рівну поверхню. М’які речі й вільна постіль не мають бути в зоні сну.",
    doNow: "Перед сном приберіть із ліжечка подушки, ковдри, бортики та м’які іграшки.",
    source: { publisher: "CDC", title: "Providing Care for Babies to Sleep Safely", url: "https://www.cdc.gov/sudden-infant-death/sleep-safely/" }
  },
  {
    id: "crying-check", topic: "calming", topicLabel: "Заспокоєння", ages: [2, 4, 6, 9, 12],
    title: "З чого почати, коли дитина плаче?",
    answer: "Перевірте голод, підгузок, втому, температуру й потребу в близькості. Спробуйте один спокійний спосіб; не кожна порада працює для кожної дитини.",
    doNow: "Зменште світло й шум, візьміть дитину близько та повільно поговоріть.",
    source: { publisher: "NHS", title: "Soothing a crying baby", url: "https://www.nhs.uk/baby/caring-for-a-newborn/soothing-a-crying-baby/" }
  },
  {
    id: "crying-caregiver-pause", topic: "parent", topicLabel: "Стан дорослого", ages: [2, 4, 6, 9, 12],
    title: "Що робити, якщо ви вже на межі?",
    answer: "Попросіть іншу дорослу людину підмінити вас. Якщо допомоги немає, покладіть дитину в безпечне ліжечко, відійдіть на кілька хвилин і поверніться, коли трохи заспокоїтесь. Ніколи не трусіть дитину.",
    doNow: "Напишіть одній людині коротке: «Мені потрібні 10 хвилин допомоги».",
    source: { publisher: "NHS", title: "Soothing a crying baby", url: "https://www.nhs.uk/baby/caring-for-a-newborn/soothing-a-crying-baby/" }
  },
  {
    id: "crying-urgent", topic: "specialist", topicLabel: "Фахівець", ages: [2, 4, 6, 9, 12],
    title: "Коли плач потребує термінової допомоги?",
    answer: "Терміново звертайтеся по місцеву медичну допомогу, якщо дитина млява або не прокидається як завжди, має утруднене дихання, судоми, незвичний колір шкіри чи інші ознаки тяжкого стану.",
    doNow: "Довіряйте відчуттю, що поведінка незвична; не чекайте відповіді застосунку.",
    source: { publisher: "NHS", title: "Soothing a crying baby", url: "https://www.nhs.uk/baby/caring-for-a-newborn/soothing-a-crying-baby/" }
  },
  {
    id: "choking-shape", topic: "safety", topicLabel: "Безпека", ages: [6, 9, 12],
    title: "Як зменшити ризик вдавлення їжею?",
    answer: "Форма, розмір і текстура їжі мають відповідати навичкам дитини. Під час їжі дитина сидить вертикально, дорослий постійно поруч, а прийом їжі проходить без поспіху.",
    doNow: "Перевірте, чи немає цілих твердих, круглих, липких або дрібних шматків.",
    source: { publisher: "CDC", title: "Choking Hazards", url: "https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/choking-hazards.html" }
  },
  {
    id: "cup-practice", topic: "feeding", topicLabel: "Годування", ages: [6, 9, 12],
    title: "Коли знайомити з чашкою?",
    answer: "Коли починається прикорм приблизно у шість місяців, можна запропонувати тренувальну чашку, чашку із соломинкою або відкриту чашку з допомогою дорослого.",
    doNow: "Запропонуйте кілька ковтків у спокійний момент і будьте готові до розлитої води.",
    source: { publisher: "CDC", title: "Fingers, Spoons, Forks, and Cups", url: "https://www.cdc.gov/infant-toddler-nutrition/mealtime/fingers-spoons-forks-and-cups.html" }
  }
].map((item) => Object.freeze({
  ...item,
  lastChecked: "2026-07-02",
  reviewStatus: "draft",
  expert: null,
  boundary: "Освітній матеріал, не діагностика й не індивідуальне лікування."
}));

const LIBRARY_TOPICS = [
  { id: "all", label: "Усі" },
  { id: "development", label: "Розвиток" },
  { id: "language", label: "Мовлення" },
  { id: "movement", label: "Рух" },
  { id: "sleep", label: "Сон" },
  { id: "calming", label: "Заспокоєння" },
  { id: "safety", label: "Безпека" },
  { id: "feeding", label: "Годування" },
  { id: "parent", label: "Стан дорослого" },
  { id: "specialist", label: "Фахівець" }
];
