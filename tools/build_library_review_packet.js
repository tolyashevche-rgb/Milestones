// Build the E4 library expert-review packet from the parent-facing source of truth.
// Output: docs/library_expert_review_packet_ua.md.
// A blank tracker is created only when missing, so reruns never erase expert feedback.
// Run from repo root: node tools/build_library_review_packet.js
const fs = require("fs");
const vm = require("vm");

const SOURCE = "prototype_stage5_ua/library_ua.js";
const PACKET = "docs/library_expert_review_packet_ua.md";
const TRACKER = "docs/library_expert_review_tracker_ua.csv";
const sourceCode = fs.readFileSync(SOURCE, "utf8");
const context = {};
vm.createContext(context);
vm.runInContext(`${sourceCode}\n;globalThis.__library = LIBRARY_MATERIALS;`, context);
const materials = Array.from(context.__library);

const md = (value) => String(value || "—").replace(/\|/g, "\\|");
const lines = [
  "# E4 — пакет експертного рев’ю бібліотеки",
  "",
  "Згенеровано: 2026-07-02. Джерело правди: `prototype_stage5_ua/library_ua.js`.",
  "Перегенерувати: `node tools/build_library_review_packet.js`.",
  "Рішення фіксувати у `library_expert_review_tracker_ua.csv`; цей пакет не є експертним схваленням.",
  "",
  `Обсяг: **${materials.length} батьківських матеріалів** зі статусом \`draft\`.`,
  "",
  "## Як перевіряти",
  "",
  "Для кожного ID відкрийте офіційне джерело й оцініть:",
  "",
  "1. чи точно коротка відповідь передає джерело без розширення твердження;",
  "2. чи безпечна й однозначна дія «зараз»;",
  "3. чи достатньо чітка межа між освітою та індивідуальною медичною порадою;",
  "4. чи відповідають вікові вікна змісту;",
  "5. фінальне рішення: `approved`, `revise` або `remove`.",
  "",
  "Статус у застосунку змінюється лише після зафіксованих імені, ролі, дати й рішення профільного фахівця.",
];

for (const [index, item] of materials.entries()) {
  lines.push(
    "",
    "---",
    "",
    `## ${index + 1}. ${md(item.title)}`,
    "",
    `- **ID:** \`${item.id}\``,
    `- **Тема:** ${md(item.topicLabel)} (\`${item.topic}\`)`,
    `- **Вік:** ${item.ages.join(", ")} місяців`,
    `- **Коротка відповідь:** ${md(item.answer)}`,
    `- **Що можна зробити зараз:** ${md(item.doNow)}`,
    `- **Межа:** ${md(item.boundary)}`,
    `- **Джерело:** [${md(item.source.publisher)} · ${md(item.source.title)}](${item.source.url})`,
    `- **Звірено командою:** ${item.lastChecked}`,
    `- **Поточний статус:** \`${item.reviewStatus}\``,
  );
}

fs.writeFileSync(PACKET, `${lines.join("\n")}\n`, "utf8");

if (!fs.existsSync(TRACKER)) {
  const header = [
    "material_id", "topic", "ages", "source_publisher", "source_url",
    "accuracy", "do_now_safety", "boundary_and_referral", "age_fit",
    "decision", "required_changes", "reviewer_name_and_role", "reviewed_at"
  ];
  const csv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;
  const rows = materials.map((item) => [
    item.id, item.topic, item.ages.join("|"), item.source.publisher, item.source.url,
    "", "", "", "", "", "", "", ""
  ].map(csv).join(";"));
  fs.writeFileSync(TRACKER, `${header.map(csv).join(";")}\n${rows.join("\n")}\n`, "utf8");
}

console.log(`Wrote ${PACKET} — ${materials.length} materials. Tracker preserved: ${fs.existsSync(TRACKER)}.`);
