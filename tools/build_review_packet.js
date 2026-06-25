// Build a human-readable expert-review packet from the live content (source of truth).
// Consolidates, per age: milestones (text + alternate phrasings + "when to discuss" + WHO
// window) and activities (full step/why/stop + authored safety fields + author approach),
// so a clinician reviews content instead of reading JS.
//
// Sources: prototype_stage4_ua/data_ua.js, prototype_stage5_ua/{questions_ua,authors_ua,who_windows}.js,
// and data/activity_library_0_12_months_ua.csv. Output: docs/expert_review_packet_ua.md.
// Run from repo root:  node tools/build_review_packet.js
const fs = require("fs"), vm = require("vm");

// 1) Load the runtime data structures via a sandbox (no DOM needed — pure data + helpers).
const JS = [
  "prototype_stage4_ua/data_ua.js",
  "prototype_stage5_ua/questions_ua.js",
  "prototype_stage5_ua/authors_ua.js",
  "prototype_stage5_ua/who_windows.js",
];
const ctx = { console };
vm.createContext(ctx);
const exportSnippet = "\n;globalThis.__d = { AGES, AGE_LABELS, MILESTONES_BY_AGE, QUESTION_VARIANTS_UA, DISCUSS_BY_ID, authorNoteFor, whoWindowFor };";
vm.runInContext(JS.map((f) => fs.readFileSync(f, "utf8")).join("\n") + exportSnippet, ctx);
const D = ctx.__d;

// 2) Parse the UA activity CSV (richest activity view: includes authored-safety fields).
const lines = fs.readFileSync("data/activity_library_0_12_months_ua.csv", "utf8").trim().split(/\r?\n/);
const head = lines[0].split(";");
const acts = {};
for (let i = 1; i < lines.length; i++) {
  const cols = lines[i].split(";");
  const o = {};
  head.forEach((h, j) => (o[h] = cols[j] !== undefined ? cols[j] : ""));
  acts[o.id] = o;
}

// 3) Emit markdown.
const NR = (v) => (v === "NEEDS_REVIEW" ? "**_NEEDS_REVIEW_**" : (v || "—"));
const out = [];
const totalM = D.AGES.reduce((s, a) => s + (D.MILESTONES_BY_AGE[a] || []).length, 0);
const totalA = Object.keys(acts).length;

out.push("# Пакет для експертного рев'ю — UA-контент (згенеровано)\n");
out.push(`Згенеровано: ${new Date().toISOString().slice(0, 10)}. **Згенерований артефакт — не редагувати вручну.**`);
out.push("Джерело правди: рантайм прототипу (`data_ua.js`, `questions_ua.js`, `authors_ua.js`, `who_windows.js`) + `data/activity_library_0_12_months_ua.csv`.");
out.push("Перегенерувати: `node tools/build_review_packet.js`.\n");
out.push("Питання рев'ю: [expert_review_checklist.md](expert_review_checklist.md). Фіксувати висновки: [expert_review_tracker.md](expert_review_tracker.md).\n");
out.push(`Усього: **${totalM} milestones**, **${totalA} активностей**, ${D.AGES.length} вікових вікна.\n`);
out.push("> **_NEEDS_REVIEW_** = поле ще не авторизоване (потребує написання + перевірки). Див. трекер §5.");

for (const age of D.AGES) {
  out.push(`\n---\n\n## Вік: ${D.AGE_LABELS[age]}\n`);

  const ms = D.MILESTONES_BY_AGE[age] || [];
  out.push(`### Milestones (${ms.length})\n`);
  let curDom = null;
  for (const m of ms) {
    if (m.domain !== curDom) { curDom = m.domain; out.push(`\n#### ${curDom}\n`); }
    out.push(`**${m.title}** · джерело: ${m.source} · \`${m.id}\``);
    out.push(`- Спостереження: ${m.text}`);
    const alts = D.QUESTION_VARIANTS_UA[m.id] || [];
    if (alts.length) out.push(`- Інші формулювання: ${alts.map((a, i) => `(${i + 1}) ${a}`).join("  ")}`);
    const disc = D.DISCUSS_BY_ID[m.id]; if (disc) out.push(`- Коли обговорити: ${disc}`);
    const who = D.whoWindowFor(m.id); if (who) out.push(`- ${who}`);
    out.push("");
  }

  const tag = "act_" + String(age).padStart(3, "0") + "_";
  const ids = Object.keys(acts).filter((id) => id.startsWith(tag));
  out.push(`\n### Activities (${ids.length})\n`);
  for (const id of ids) {
    const a = acts[id];
    const note = D.authorNoteFor(id);
    out.push(`**${a.title}** · ${a.domain} · ${a.duration} · ${a.materials} · \`${id}\``);
    out.push(`- Підтримує milestones: ${(a.supports_milestone_ids || "").replace(/\|/g, ", ")}`);
    out.push(`- Доказовість: ${a.evidence_bucket} / ${a.evidence_label} · джерела: ${NR(a.source_ids)}`);
    out.push(`- Підготовка (setup): ${NR(a.setup)}`);
    out.push(`- Кроки: ${a.steps}`);
    out.push(`- На що дивитися (what_to_watch): ${NR(a.what_to_watch)}`);
    out.push(`- Чому працює: ${a.why_it_works}`);
    out.push(`- Межа твердження (claim_limit): ${NR(a.claim_limit)}`);
    out.push(`- Стоп-правила: ${a.stop_rules}`);
    out.push(`- Низька енергія: ${NR(a.low_energy_option)} · Адаптації: ${NR(a.adaptations)}`);
    if (note) out.push(`- Підхід (натхнення): ${note.author} — ${note.idea} (${note.mechanism}; ${note.level})`);
    out.push("");
  }
}

fs.writeFileSync("docs/expert_review_packet_ua.md", out.join("\n"), "utf8");
console.log(`Wrote docs/expert_review_packet_ua.md — ${totalM} milestones, ${totalA} activities, ${D.AGES.length} ages.`);
