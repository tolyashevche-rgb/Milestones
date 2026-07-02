// Authored low-energy variants mirrored from data/activity_library_0_12_months_ua.csv.
// Only reviewed-as-authored values are exposed here; NEEDS_REVIEW rows are intentionally absent.
// These are shorter ways to use an existing activity, never a dose or developmental shortcut.
const ACTIVITY_LOW_ENERGY_UA = {
  "act_002_social_001": "Скажіть одну лагідну фразу перед годуванням чи сном.",
  "act_002_social_002": "Зробіть одну усмішку й одну паузу.",
  "act_002_language_001": "Повторіть один звук один раз.",
  "act_002_language_002": "Поміть один природний звук протягом дня.",
  "act_002_cognitive_001": "Поверніть обличчя один раз і усміхніться.",
  "act_002_movement_001": "Одна коротка хвилинка на животику після сповивання.",
  "act_004_social_001": "Одна усмішка й пауза.",
  "act_004_language_001": "Видайте одне воркування під час одягання.",
  "act_004_language_002": "Скажіть одну фразу збоку.",
  "act_004_cognitive_001": "Назвіть руки один раз під час сповивання.",
  "act_004_cognitive_002": "Запропонуйте один безпечний прорізувач один раз.",
  "act_004_movement_001": "Одна коротка хвилинка гри на животику.",
  "act_006_social_001": "Одне спокійне привітання на день.",
  "act_006_social_002": "Одне привітання в дзеркалі.",
  "act_006_language_001": "Зробіть 30 секунд під час сповивання.",
  "act_006_cognitive_001": "Запропонуйте одне тягнення вбік один раз.",
  "act_006_cognitive_002": "Зробіть одну паузу й назвіть сигнал.",
  "act_006_movement_001": "Одне коротке тягнення на животику.",
  "act_006_movement_002": "Одне коротке сидіння з підтримкою.",
  "act_009_social_001": "Один раунд гри в хованки обличчям.",
  "act_009_social_002": "Покличте на ім'я один раз під час гри.",
  "act_009_language_001": "Повторіть один лепет один раз.",
  "act_009_language_002": "Зробіть одну паузу перед тим, як взяти.",
  "act_009_cognitive_001": "Впустіть один раз і подивіться разом.",
  "act_009_movement_001": "Одне перекладання з руки в руку.",
  "act_009_movement_002": "Одне тягнення до іграшки сидячи.",
  "act_012_social_001": "Одне плескання й пауза.",
  "act_012_language_001": "Помахайте один раз, виходячи з кімнати.",
  "act_012_language_002": "Скажіть ім'я один раз у рутині.",
  "act_012_cognitive_001": "Один предмет усередину й назовні.",
  "act_012_cognitive_002": "Сховайте іграшку наполовину один раз.",
  "act_012_movement_001": "Одна спроба встати з опорою.",
  "act_012_movement_002": "Запропонуйте один безпечний шматочок."
};

// Explicit eligibility lists for situational recommendations. An omitted activity is
// intentionally not promised for that context; this avoids guessing from its title.
const ACTIVITY_CONTEXT_TAGS_UA = {
  one_hand: [
    "act_002_social_001", "act_002_language_001",
    "act_004_social_001", "act_004_language_001",
    "act_006_social_001", "act_006_language_001",
    "act_009_social_002", "act_009_language_001",
    "act_012_social_001", "act_012_language_001"
  ],
  quiet: [
    "act_002_social_002", "act_002_language_001",
    "act_004_social_001", "act_004_language_002",
    "act_006_social_001", "act_006_language_001",
    "act_009_social_002", "act_009_language_002",
    "act_012_social_002", "act_012_language_002"
  ],
  calming: [
    "act_002_social_001", "act_002_cognitive_001",
    "act_004_social_001", "act_004_cognitive_001",
    "act_006_social_001", "act_006_cognitive_002",
    "act_009_social_001", "act_009_language_002",
    "act_012_social_001", "act_012_language_002"
  ],
  active: [
    "act_002_movement_001", "act_002_movement_002", "act_002_movement_003",
    "act_004_movement_001", "act_004_movement_002", "act_004_movement_003",
    "act_006_movement_001", "act_006_movement_002", "act_006_movement_003",
    "act_009_movement_001", "act_009_movement_002", "act_009_movement_003",
    "act_012_movement_001", "act_012_movement_002", "act_012_movement_003"
  ]
};
