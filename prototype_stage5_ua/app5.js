// Stage 5 — guided UA prototype.
// Reuses data_ua.js (MILESTONES_BY_AGE, ACTIVITIES_BY_AGE, AGES, AGE_LABELS, DISCUSS_BY_ID)
// and engine.js (buildProfile, buildProgram, DOMAIN_KEYS, domainOf) from prototype_stage4_ua.
// This file is presentation + navigation only — no developmental logic lives here.

const DOMAIN_LABELS = {
  social: "Соціально-емоційний розвиток",
  language: "Мовлення і комунікація",
  cognitive: "Навчання і мислення",
  movement: "Рух і фізичний розвиток"
};

// Short labels for the vertical chart columns (long labels do not fit under 4 bars).
const DOMAIN_LABELS_SHORT = {
  social: "Соціальний",
  language: "Мова",
  cognitive: "Мислення",
  movement: "Рух"
};

const STORAGE_KEY = "milestonesMap.stage5.ua";

// ---- storage (per-child data under children[]; shaped so optional sync can be added later) ----
function freshChild(name, dob) {
  return { id: "child_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
           name: name || "", dob: dob || "",
           surveys: {}, snapshots: [], triedActivities: [], notes: "" };
}
function freshStore() { return { consent: null, children: [], activeChildId: null }; }
// Migrate the old single-child shape ({consent, child, surveys, ...}) into children[]. Idempotent.
function migrate(s) {
  if (!s || typeof s !== "object") return freshStore();
  if (Array.isArray(s.children)) return Object.assign(freshStore(), s);
  const st = freshStore();
  st.consent = s.consent || null;
  if (s.child) {
    const c = freshChild(s.child.name, s.child.dob);
    c.surveys = s.surveys || {}; c.snapshots = s.snapshots || [];
    c.triedActivities = s.triedActivities || []; c.notes = s.notes || "";
    st.children.push(c); st.activeChildId = c.id;
  }
  return st;
}
function load() { try { return migrate(JSON.parse(localStorage.getItem(STORAGE_KEY))); } catch { return freshStore(); } }
function save() { localStorage.setItem(STORAGE_KEY, JSON.stringify(store)); }
// Active child — per-child data lives here. Null only before the first child exists.
function cc() { return store.children.find((c) => c.id === store.activeChildId) || store.children[0] || null; }
let store = load();

// ---- helpers ----
function monthsSince(dobStr) {
  const dob = new Date(dobStr);
  if (isNaN(dob)) return null;
  const now = new Date();
  let m = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
  if (now.getDate() < dob.getDate()) m -= 1;
  return Math.max(0, m);
}
// Snap real age to the nearest available CDC window (2/4/6/9/12).
function ageWindowFor(months) {
  if (months == null) return 6;
  return AGES.reduce((best, a) => Math.abs(a - months) < Math.abs(best - months) ? a : best, AGES[0]);
}
function nextCheckAge(age) { return AGES.find((a) => a > age) || null; }
function activityById(age, id) { return (ACTIVITIES_BY_AGE[age] || []).find((a) => a.id === id); }
function esc(s) { return String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c])); }

// Pick the survey questions for an age. Persist the selection so a re-test reuses the SAME
// questions (like-for-like comparison over time).
function questionIdsFor(age) {
  if (cc().surveys[age] && cc().surveys[age].questionIds && cc().surveys[age].questionIds.length) {
    return cc().surveys[age].questionIds;
  }
  // Ask EVERY milestone for the age (authored order) — nothing is silently dropped, and this
  // matches the full CDC age checklist. Re-test variety comes from phrasing (variantPoolFor),
  // not from sampling which milestones are asked. (Replaces the old "up to 3 per domain" cap,
  // which both skipped milestones and made allClear unreachable at richer ages like 9 mo.)
  const picked = (MILESTONES_BY_AGE[age] || []).map((m) => m.id);
  cc().surveys[age] = cc().surveys[age] || { states: {}, date: null };
  cc().surveys[age].questionIds = picked;
  save();
  return picked;
}
function milestoneById(age, id) { return (MILESTONES_BY_AGE[age] || []).find((m) => m.id === id); }

// Phrasing pool for one milestone: milestone.text (variant 0) + curated alternates.
// Answers stay keyed by milestone id, so a different phrasing still compares like-for-like.
function variantPoolFor(age, id) {
  const m = milestoneById(age, id);
  const alts = (typeof QUESTION_VARIANTS_UA !== "undefined" && QUESTION_VARIANTS_UA[id]) || [];
  return [m ? m.text : ""].concat(alts).filter(Boolean);
}

// Re-test: keep the same milestone ids (for comparison) but reshuffle phrasings + clear
// the working answers, while history snapshots are preserved.
function restartSurvey(age) {
  const s = cc().surveys[age] || { questionIds: questionIdsFor(age) };
  s.states = {};
  s.variants = {};
  s.date = null;
  cc().surveys[age] = s;
  save();
}

// Descriptive per-domain counts over ONLY the asked questions (not all milestones).
function askedStats(age) {
  const ids = (cc().surveys[age] && cc().surveys[age].questionIds) || [];
  const states = (cc().surveys[age] && cc().surveys[age].states) || {};
  const stats = {};
  for (const k of DOMAIN_KEYS) stats[k] = { yes: 0, total: 0 };
  for (const id of ids) { const d = domainOf(id); if (!stats[d]) continue; stats[d].total++; if (states[id] === "yes") stats[d].yes++; }
  return stats;
}

function currentAge() { const c = cc(); return c && c.dob ? ageWindowFor(monthsSince(c.dob)) : 6; }

// ---- routing ----
const NAV = [
  { route: "home", label: "Головна", icon: "⌂" },
  { route: "survey", label: "Тест", icon: "✎" },
  { route: "program", label: "Програма", icon: "♪" },
  { route: "progress", label: "Прогрес", icon: "↗" }
];

function setHash(route) { location.hash = "#/" + route; }
function currentRoute() { return (location.hash.replace(/^#\//, "") || "home").split("?")[0]; }

function route() {
  const r = currentRoute();
  // Onboarding gate: welcome first, then consent, then child profile.
  if (!store.consent || !store.consent.accepted) return show(r === "consent" ? "consent" : "welcome");
  if (!store.children.length) return show("profile");
  const known = ["home", "survey", "results", "program", "progress", "ask", "profile", "consent", "welcome"];
  show(known.includes(r) ? r : "home");
}

function show(screen) {
  const root = document.getElementById("screen");
  const renderers = {
    welcome: renderWelcome, consent: renderConsent, profile: renderProfile,
    home: renderHome, survey: renderSurvey, results: renderResults,
    program: renderProgram, progress: renderProgress, ask: renderAsk
  };
  root.innerHTML = (renderers[screen] || renderHome)();
  renderNav(screen);
  renderAppbar(screen);
  if (screen === "program") afterProgramRender();
}

function renderNav(active) {
  const nav = document.getElementById("bottomNav");
  const onboarding = ["welcome", "consent", "profile"].includes(active);
  nav.style.display = onboarding ? "none" : "flex";
  nav.innerHTML = NAV.map((n) => `
    <button type="button" class="nav-btn ${active === n.route || (active === "results" && n.route === "survey") ? "active" : ""}" data-go="${n.route}">
      <span class="nav-ico" aria-hidden="true">${n.icon}</span><span>${n.label}</span>
    </button>`).join("");
}

// Active-child switcher in the appbar (global, hidden during onboarding).
function renderAppbar(screen) {
  const slot = document.getElementById("appbarChild");
  if (!slot) return;
  const onboarding = ["welcome", "consent", "profile"].includes(screen);
  if (onboarding || !store.children.length) {
    slot.innerHTML = `<strong>Карта розвитку</strong><span class="appbar-tag">0–12 міс</span>`;
    return;
  }
  const active = cc();
  const opts = store.children.map((c, i) =>
    `<option value="${c.id}"${c.id === active.id ? " selected" : ""}>${esc(c.name || ("Дитина " + (i + 1)))}</option>`).join("");
  slot.innerHTML =
    `<select id="childSwitch" class="appbar-select" aria-label="Активна дитина">${opts}<option value="__add">+ Додати дитину</option></select>` +
    `<span class="appbar-tag">${AGE_LABELS[currentAge()]}</span>`;
}

// ---- onboarding screens ----
function renderWelcome() {
  return `
    <section class="screen-pad center">
      <div class="logo-dot" aria-hidden="true"></div>
      <h1>Перший рік без паніки через milestones</h1>
      <p class="lead">Спокійний evidence-informed помічник: що спостерігати, у що грати і коли варто запитати фахівця.</p>
      <button type="button" class="btn primary block" data-go="consent">Почати</button>
      <p class="fineprint">Узгоджено з CDC, AAP, WHO, Harvard. Не діагностика і не скринінг.</p>
    </section>`;
}

function renderConsent() {
  return `
    <section class="screen-pad">
      <h2>Перш ніж почати</h2>
      <p class="muted">Кілька підтверджень. Дані зберігаються лише на цьому пристрої.</p>
      <label class="check"><input type="checkbox" class="consent-box" data-k="parent"><span>Я батько/мати або опікун дитини.</span></label>
      <label class="check"><input type="checkbox" class="consent-box" data-k="purpose"><span>Розумію, що це інструмент спостереження і гри, <strong>не діагностика і не скринінг</strong>, і не замінює фахівця.</span></label>
      <label class="check"><input type="checkbox" class="consent-box" data-k="local"><span>Згоден(на), що мої дані зберігаються локально в цьому браузері.</span></label>
      <button type="button" id="consentContinue" class="btn primary block" disabled>Продовжити</button>
    </section>`;
}

function renderProfile() {
  const c = {}; // always a blank form — used both for the first child and for "add another"
  return `
    <section class="screen-pad">
      <h2>Профіль дитини</h2>
      <p class="muted">Дата народження допоможе підібрати вікове вікно. Ім'я — за бажанням.</p>
      <label class="field"><span>Ім'я (необов'язково)</span><input id="childName" type="text" value="${esc(c.name || "")}" placeholder="Напр., Софія"></label>
      <label class="field"><span>Дата народження</span><input id="childDob" type="date" value="${esc(c.dob || "")}"></label>
      <div id="ageHint" class="age-hint"></div>
      <button type="button" id="profileSave" class="btn primary block">Зберегти і продовжити</button>
    </section>`;
}

// ---- home / cabinet ----
function todaysTask(age) {
  const survey = cc().surveys[age];
  if (!survey || !survey.date) return null;
  const profile = buildProfile(survey.states || {}, age);
  if (profile.notStarted) return null;
  const program = buildProgram(profile, age);
  if (!program.length) return null;
  const dayIdx = Math.floor(Date.now() / 86400000) % program.length;
  const day = program[dayIdx];
  const act = activityById(age, day.options[0]);
  return act ? { day: dayIdx + 1, domain: day.domain, act } : null;
}

function renderHome() {
  const age = currentAge();
  const c = cc(); const childName = (c && c.name) ? esc(c.name) : "";
  const survey = cc().surveys[age];
  const task = todaysTask(age);
  const next = nextCheckAge(age);
  const tested = survey && survey.date;
  return `
    <section class="screen-pad">
      <div class="hello">
        <span class="muted">Кабінет</span>
        <h2>${childName || "Розвиток дитини"}</h2>
        <span class="chip">Вікове вікно: ${AGE_LABELS[age]}</span>
      </div>

      <article class="card today">
        <span class="mini-label">Сьогодні</span>
        ${task ? `
          <div class="illus mini" aria-hidden="true">${(typeof domainIllus === "function" ? domainIllus(task.domain) : "")}</div>
          <h3>${esc(task.act.title)}</h3>
          <p class="muted">${esc(task.act.time)} · ${esc(task.act.materials)} · ${DOMAIN_LABELS[task.domain] || ""}</p>
          <div class="row">
            <button type="button" class="btn primary" data-go="program">Відкрити заняття</button>
            <button type="button" class="btn ghost" id="addIcs">У календар</button>
          </div>` : `
          <h3>Почніть з короткого тесту</h3>
          <p class="muted">Пройдіть опитування для віку ${AGE_LABELS[age]}, щоб отримати персональний фокус і план гри.</p>
          <button type="button" class="btn primary" data-go="survey">Пройти тест</button>`}
      </article>

      <div class="tiles">
        <button type="button" class="tile" data-go="survey" ${tested ? 'data-restart="1"' : ""}><strong>${tested ? "Перепройти тест" : "Пройти тест"}</strong><span class="muted">${tested ? "оновити спостереження" : "кілька питань за віком"}</span></button>
        <button type="button" class="tile" data-go="program"><strong>Програма гри</strong><span class="muted">щоденні заняття</span></button>
        <button type="button" class="tile" data-go="progress"><strong>Прогрес</strong><span class="muted">графіки і історія</span></button>
        <button type="button" class="tile" data-go="ask"><strong>Запитати</strong><span class="muted">нотатки для фахівця</span></button>
      </div>

      ${next ? `<p class="note">Наступна перевірка milestones — близько ${next} місяців. Це окремий «годинник» від щоденної гри.</p>` : ""}
      <div class="home-danger">
        <button type="button" id="deleteChild" class="linklike danger">Видалити цю дитину</button>
        <button type="button" id="eraseAll" class="linklike danger">Стерти всі мої дані</button>
      </div>
    </section>`;
}

// ---- survey ----
function renderSurvey() {
  const age = currentAge();
  const ids = questionIdsFor(age);
  const survey = cc().surveys[age];
  survey.variants = survey.variants || {};
  // Freeze a random phrasing per question for this round (stable while answering).
  let changed = false;
  ids.forEach((id) => {
    if (survey.variants[id] == null) { survey.variants[id] = Math.floor(Math.random() * variantPoolFor(age, id).length); changed = true; }
  });
  if (changed) save();
  const states = survey.states || {};
  const answered = ids.filter((id) => states[id]).length;
  const cards = ids.map((id) => {
    const m = milestoneById(age, id);
    if (!m) return "";
    const s = states[id];
    const pool = variantPoolFor(age, id);
    const prompt = pool[survey.variants[id]] || m.text;
    return `
      <article class="q-card">
        <div class="q-meta"><span>${esc(m.domain)}</span><span>${esc(m.source)}</span></div>
        <h4>${esc(m.title)}</h4>
        <p class="muted">${esc(prompt)}</p>
        ${(typeof whoWindowFor === "function" && whoWindowFor(id)) ? `<p class="who-window">${esc(whoWindowFor(id))}</p>` : ""}
        <div class="state-controls" data-id="${id}">
          <button type="button" data-state="yes" class="${s === "yes" ? "active" : ""}">Бачу</button>
          <button type="button" data-state="not_sure" class="${s === "not_sure" ? "active" : ""}">Не впевнена</button>
          <button type="button" data-state="not_yet" class="${s === "not_yet" ? "active" : ""}">Ще ні</button>
        </div>
      </article>`;
  }).join("");
  return `
    <section class="screen-pad">
      <h2>Тест · ${AGE_LABELS[age]}</h2>
      <p class="muted">Це спостереження, а не іспит для дитини. Відповідайте спокійно — «не впевнена» теж нормально.</p>
      <div class="progress-mini"><span style="width:${ids.length ? (answered / ids.length) * 100 : 0}%"></span></div>
      <p class="muted small">${answered} з ${ids.length} відповідей</p>
      ${cards}
      <button type="button" id="finishSurvey" class="btn primary block" ${answered === 0 ? "disabled" : ""}>Завершити і побачити результат</button>
    </section>`;
}

// ---- results + vision ----
// One distinct color per test (chronological index → stable color across re-renders).
const COMPARE_COLORS = ["#0f766e", "#2563eb", "#d97706", "#7c3aed", "#0891b2", "#be185d"];
const MAX_COMPARE = 5; // how many recent tests to place side by side

function snapshotsForAge(age) { return cc().snapshots.filter((s) => s.age === age); } // chronological

// Per-domain "yes" counts for one snapshot, over the SAME asked question ids (stable across
// re-tests), so every test's bar uses the same denominator and is comparable.
function snapshotAskedStats(snap, age) {
  const ids = (cc().surveys[age] && cc().surveys[age].questionIds) || [];
  const st = (snap && snap.states) || {};
  const stats = {};
  for (const k of DOMAIN_KEYS) stats[k] = { yes: 0, total: 0 };
  for (const id of ids) { const d = domainOf(id); if (!stats[d]) continue; stats[d].total++; if (st[id] === "yes") stats[d].yes++; }
  return stats;
}

// Grouped vertical bar chart: one narrow bar per test, side by side within each domain group,
// each test a different color, newest on the right — so re-tests compare at a glance.
// Descriptive only (counts), never a score — see safety_rules.md.
function domainChart(age) {
  const snaps = snapshotsForAge(age);
  if (!snaps.length) return `<p class="chart-cap">Пройдіть тест, щоб побачити графік.</p>`;
  const shown = snaps.slice(-MAX_COMPARE);
  const base = snaps.length - shown.length; // absolute index of first shown test
  const colorOf = (i) => COMPARE_COLORS[(base + i) % COMPARE_COLORS.length];
  const dateOf = (s) => new Date(s.date).toLocaleDateString("uk-UA", { day: "numeric", month: "short" });

  const legend = shown.map((s, i) =>
    `<span class="leg"><span class="leg-dot" style="background:${colorOf(i)}"></span>${dateOf(s)}${i === shown.length - 1 ? " (зараз)" : ""}</span>`
  ).join("");

  const groups = DOMAIN_KEYS.map((k) => {
    const bars = shown.map((s, i) => {
      const st = snapshotAskedStats(s, age)[k];
      const pct = st.total ? Math.round((st.yes / st.total) * 100) : 0;
      return `<span class="cbar" style="height:${pct}%;background:${colorOf(i)}" title="${dateOf(s)}: ${st.yes}/${st.total}"></span>`;
    }).join("");
    const last = snapshotAskedStats(shown[shown.length - 1], age)[k];
    return `
      <div class="vgroup">
        <em class="vbar-count">${last.yes}/${last.total}</em>
        <div class="cbars">${bars}</div>
        <span class="vbar-label">${DOMAIN_LABELS_SHORT[k]}</span>
      </div>`;
  }).join("");

  const cap = shown.length > 1
    ? "Кожен стовпчик — окремий тест. Нові додаються праворуч іншим кольором, щоб бачити зміни."
    : "Скільки ознак ви вже бачите в кожному напрямку (з опитаних). Повторний тест додасть стовпчик поруч.";
  return `<p class="chart-cap">${cap}</p><div class="chart-legend">${legend}</div><div class="vchart">${groups}</div>`;
}

function renderResults() {
  const age = currentAge();
  const survey = cc().surveys[age] || { states: {} };
  const profile = buildProfile(survey.states, age);

  // Comparison with the previous snapshot at this age (descriptive, never a score).
  const prev = cc().snapshots.filter((s) => s.age === age).slice(0, -1).slice(-1)[0];
  let compare = "";
  if (prev) {
    const cur = cc().snapshots.filter((s) => s.age === age).slice(-1)[0];
    const diff = (cur ? cur.counts.observed : 0) - prev.counts.observed;
    compare = `<p class="note">Порівняно з минулим разом: ${diff > 0 ? "+" + diff + " нових «бачу»" : diff === 0 ? "без змін у кількості «бачу»" : diff + " «бачу»"}. Це timeline ваших спостережень, не оцінка.</p>`;
  }

  // Vision: strengths, focus (as chances to play), and "when to discuss" for flagged items.
  const strengths = profile.strengths.length ? profile.strengths.map((k) => DOMAIN_LABELS[k]).join(", ") : "—";
  let focusBlock;
  if (profile.allClear) focusBlock = `<p>Ви позначили всі питання і поки нічого не виділили для окремого фокусу. Чудово — продовжуйте гру, щоб підтримати те, що формується.</p>`;
  else if (profile.partialClear) focusBlock = `<p>Поки нічого не виділено для окремого фокусу — гарний знак. Ось легкі ідеї для гри, а решту питань можна пройти згодом.</p>`;
  else focusBlock = `<p>Цього періоду більше нагод для гри варто дати тут:</p><ul class="focus-list">${profile.focus.map((f) => `<li><strong>${DOMAIN_LABELS[f.domain]}</strong></li>`).join("")}</ul>`;

  const flagged = (survey.questionIds || []).map((id) => milestoneById(age, id)).filter((m) => m && (survey.states[m.id] === "not_yet" || survey.states[m.id] === "not_sure") && DISCUSS_BY_ID[m.id]);
  const discuss = flagged.length ? `
    <h3 class="mt">На що звернути увагу</h3>
    ${flagged.map((m) => `<article class="discuss-card"><div class="q-meta"><span>${esc(m.domain)}</span><span>${survey.states[m.id] === "not_yet" ? "Ще ні" : "Не впевнена"}</span></div><h4>${esc(m.title)}</h4><p class="muted">${esc(DISCUSS_BY_ID[m.id])}</p></article>`).join("")}` : "";

  return `
    <section class="screen-pad">
      <h2>Результат · ${AGE_LABELS[age]}</h2>
      <article class="card">
        <span class="mini-label">Що ви спостерегли</span>
        <div class="dbars">${domainChart(age)}</div>
        ${compare}
      </article>

      <article class="card">
        <span class="mini-label">Бачення цього тижня</span>
        <p><strong>Сильні напрямки:</strong> ${strengths}</p>
        ${focusBlock}
        <p class="note">Це показує, де дати більше нагод для гри — це не оцінка і не діагноз.</p>
      </article>

      ${discuss}

      <button type="button" class="btn primary block" data-go="program">Перейти до плану гри</button>
    </section>`;
}

// ---- program (accordion: each day expands inline, one open at a time) ----
let programState = { age: null, program: null, openDay: null, selected: {} };

function renderProgram() {
  const age = currentAge();
  const survey = cc().surveys[age];
  if (!survey || !survey.date) {
    return `<section class="screen-pad"><h2>Програма гри</h2><p class="muted">Спершу пройдіть короткий тест, щоб скласти персональний план.</p><button type="button" class="btn primary block" data-go="survey">Пройти тест</button></section>`;
  }
  const profile = buildProfile(survey.states, age);
  const program = buildProgram(profile, age);
  programState = { age, program, openDay: program[0] ? program[0].day : null, selected: {} };
  return `
    <section class="screen-pad">
      <h2>Програма гри · ${AGE_LABELS[age]}</h2>
      <p class="muted">Навіть одна коротка активність на день — це вже чудово. Доросла гра, не «доза». Торкніться дня, щоб розгорнути.</p>
      <div class="program-list" id="programList"></div>
    </section>`;
}

function afterProgramRender() { renderProgramList(); }

function renderProgramList() {
  const list = document.getElementById("programList");
  if (!list || !programState.program) return;
  list.innerHTML = programState.program.map((d) => dayAccordionHtml(programState.age, d)).join("");
}

function dayChip(age, dayNum, id, sel) {
  const a = activityById(age, id);
  return a ? `<button type="button" class="day-opt ${id === sel ? "active" : ""}" data-day-opt="${dayNum}" data-opt="${id}">${esc(a.title)}</button>` : "";
}

function dayAccordionHtml(age, d) {
  const open = programState.openDay === d.day;
  const sel = programState.selected[d.day] || d.options[0];
  const selAct = activityById(age, sel);
  // Primary same-domain ideas (the day's focus).
  const opts = d.options.length > 1
    ? `<div class="day-opts">${d.options.map((id) => dayChip(age, d.day, id, sel)).join("")}</div>`
    : "";
  // Optional cross-domain "bonus" ideas — clearly optional, so a day can touch several areas.
  const bonus = (d.bonus || []).filter((b) => activityById(age, b.id));
  const bonusHtml = bonus.length
    ? `<p class="bonus-label">Якщо є настрій — потроху з інших напрямків (необов'язково):</p>
       <div class="day-opts bonus">${bonus.map((b) => dayChip(age, d.day, b.id, sel)).join("")}</div>`
    : "";
  return `
    <article class="day-acc ${open ? "open" : ""}">
      <button type="button" class="day-acc-head" data-day-toggle="${d.day}" aria-expanded="${open}">
        <span class="day-acc-meta"><span class="day-num">День ${d.day}</span><span class="chip">${DOMAIN_LABELS_SHORT[d.domain] || d.domain}</span></span>
        <span class="day-acc-title">${esc(selAct ? selAct.title : "")}</span>
        ${(typeof authorNoteFor === "function" && authorNoteFor(sel)) ? `<span class="day-badge">Підхід</span>` : ""}
        <span class="day-acc-caret" aria-hidden="true">${open ? "▾" : "▸"}</span>
      </button>
      ${open ? `<div class="day-acc-body">${opts}${bonusHtml}${activityDetailHtml(age, sel)}</div>` : ""}
    </article>`;
}

// Plain-language version of the internal evidence tier (parents don't read "механізм").
function evidenceFriendly(ev) {
  const e = String(ev || "").toLowerCase();
  if (e.includes("механізм")) return "відома закономірність розвитку дитини";
  if (e.includes("nurturing") || e.includes("догляд")) return "рекомендації догляду (WHO)";
  return ev || "";
}

function activityDetailHtml(age, id) {
  const a = activityById(age, id);
  if (!a) return "";
  if (!cc().triedActivities.includes(id)) { cc().triedActivities.push(id); save(); }
  const note = (typeof authorNoteFor === "function") ? authorNoteFor(a.id) : null;
  // Plain-language note: keep author + the actionable idea; the internal mechanism mapping
  // stays in data for traceability but is not shown as jargon to parents.
  const noteHtml = note ? `
    <div class="approach">
      <p><strong>На основі підходу ${esc(note.author)}:</strong> ${esc(note.idea)}.</p>
    </div>` : "";
  return `
    <div class="illus" aria-hidden="true">${(typeof domainIllus === "function" ? domainIllus(domainOf(a.id)) : "")}</div>
    <div class="tag-row"><span class="chip">${DOMAIN_LABELS[domainOf(a.id)] || a.domain}</span><span class="chip">${esc(a.time)}</span><span class="chip">${esc(a.materials)}</span></div>
    <h3>${esc(a.title)}</h3>
    <p class="muted">${esc(a.why)}</p>
    ${a.evidence ? `<p class="source-line"><strong>На чому ґрунтується:</strong> ${esc(evidenceFriendly(a.evidence))} · <strong>Джерело:</strong> ${esc(a.source)}</p>` : ""}
    ${noteHtml}
    <div class="steps"><strong>Кроки</strong><ol>${a.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>
    <div class="stop"><strong>Коли зупинитись:</strong> ${esc(a.stop)}</div>`;
}

// ---- progress ----
function renderProgress() {
  const age = currentAge();
  const snaps = cc().snapshots.slice().reverse();
  const list = snaps.length ? snaps.map((s) => {
    const date = new Date(s.date).toLocaleString("uk-UA", { dateStyle: "medium", timeStyle: "short" });
    return `<article class="history-item"><h4>${AGE_LABELS[s.age]} · ${date}</h4><dl><dt>Бачу</dt><dd>${s.counts.observed}</dd><dt>Не впевнена</dt><dd>${s.counts.notSure}</dd><dt>Ще ні</dt><dd>${s.counts.notYet}</dd></dl></article>`;
  }).join("") : `<p class="muted">Збережених тестів ще немає. Пройдіть тест, щоб почати timeline.</p>`;
  return `
    <section class="screen-pad">
      <h2>Прогрес · ${AGE_LABELS[age]}</h2>
      <article class="card"><span class="mini-label">Спостереження по тестах</span><div class="dbars">${domainChart(age)}</div><p class="note">Це timeline батьківських спостережень, не оцінка і не діагноз.</p></article>
      <h3 class="mt">Історія тестів</h3>
      <div class="history-list">${list}</div>
    </section>`;
}

// ---- ask ----
function renderAsk() {
  const age = currentAge();
  const survey = cc().surveys[age] || { states: {}, questionIds: [] };
  const flagged = (survey.questionIds || []).map((id) => milestoneById(age, id)).filter((m) => m && (survey.states[m.id] === "not_yet" || survey.states[m.id] === "not_sure") && DISCUSS_BY_ID[m.id]);
  const notes = cc().notes || "";
  const observed = (MILESTONES_BY_AGE[age] || []).filter((m) => survey.states[m.id] === "yes").map((m) => "- " + m.title).join("\n") || "- поки нічого";
  return `
    <section class="screen-pad">
      <h2>Запитати фахівця</h2>
      <p class="muted">Якщо щось турбує — це не привід панікувати, а привід зафіксувати і запитати.</p>
      <h3 class="mt">На що звернути увагу за вашими позначками</h3>
      ${flagged.length ? flagged.map((m) => `<article class="discuss-card"><div class="q-meta"><span>${esc(m.domain)}</span><span>${survey.states[m.id] === "not_yet" ? "Ще ні" : "Не впевнена"}</span></div><h4>${esc(m.title)}</h4><p class="muted">${esc(DISCUSS_BY_ID[m.id])}</p></article>`).join("") : `<p class="muted">Поки немає пунктів «Не впевнена» або «Ще ні».</p>`}
      <label class="field mt"><span>Нотатки для візиту</span><textarea id="askNotes" rows="5" placeholder="Що помітили, що пробували, що хочете запитати?">${esc(notes)}</textarea></label>
      <button type="button" id="copySummary" class="btn ghost block">Скопіювати підсумок для фахівця</button>
      <p id="copyStatus" class="muted small" role="status"></p>
    </section>`;
}

function summaryText() {
  const age = currentAge();
  const survey = cc().surveys[age] || { states: {} };
  const pick = (st) => (MILESTONES_BY_AGE[age] || []).filter((m) => survey.states[m.id] === st).map((m) => "- " + m.title).join("\n") || "- поки нічого";
  return `Вік: ${AGE_LABELS[age]}\nМета: нотатки для розмови про розвиток, не діагностика і не скринінг\n\nБачу:\n${pick("yes")}\n\nНе впевнена:\n${pick("not_sure")}\n\nЩе ні:\n${pick("not_yet")}\n\nНотатки:\n${cc().notes || "- немає"}\n\nПитання до фахівця:\n1.\n2.\n3.`;
}

// ---- snapshot on finishing a survey ----
function finishSurvey() {
  const age = currentAge();
  const survey = cc().surveys[age] || { states: {}, questionIds: [] };
  const profile = buildProfile(survey.states, age);
  const ids = survey.questionIds || [];
  const counts = {
    observed: ids.filter((id) => survey.states[id] === "yes").length,
    notSure: ids.filter((id) => survey.states[id] === "not_sure").length,
    notYet: ids.filter((id) => survey.states[id] === "not_yet").length
  };
  const domainYes = {};
  for (const k of DOMAIN_KEYS) domainYes[k] = { yes: profile.stats[k].yes, total: profile.stats[k].total };
  survey.date = new Date().toISOString();
  cc().surveys[age] = survey;
  cc().snapshots.push({ id: "snap_" + Date.now(), date: survey.date, age, states: { ...survey.states }, counts, domainYes });
  save();
  setHash("results");
}

// ---- calendar (.ics) ----
function downloadIcs(title) {
  const dt = new Date(); dt.setHours(9, 0, 0, 0);
  const stamp = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Milestones//UA//", "BEGIN:VEVENT",
    "UID:" + Date.now() + "@milestones", "DTSTAMP:" + stamp(new Date()), "DTSTART:" + stamp(dt),
    "RRULE:FREQ=DAILY;COUNT=14", "SUMMARY:" + title, "DESCRIPTION:Коротка гра з дитиною (Карта розвитку)", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
  const url = URL.createObjectURL(new Blob([ics], { type: "text/calendar" }));
  const a = document.createElement("a"); a.href = url; a.download = "milestones-task.ics"; a.click();
  URL.revokeObjectURL(url);
}

// ---- events ----
document.addEventListener("click", (e) => {
  const go = e.target.closest("[data-go]");
  if (go) {
    if (go.dataset.restart) restartSurvey(currentAge());
    setHash(go.dataset.go);
    return;
  }

  if (e.target.id === "consentContinue") {
    store.consent = { accepted: true, date: new Date().toISOString() }; save(); setHash("profile"); return;
  }
  if (e.target.id === "profileSave") {
    const name = document.getElementById("childName").value.trim();
    const dob = document.getElementById("childDob").value;
    const child = freshChild(name, dob); store.children.push(child); store.activeChildId = child.id; save(); setHash("home"); return;
  }
  if (e.target.id === "deleteChild") {
    const c = cc(); if (!c) return;
    if (confirm(`Видалити профіль «${c.name || "дитина"}» і всі його дані?`)) {
      store.children = store.children.filter((x) => x.id !== c.id);
      store.activeChildId = (store.children[0] && store.children[0].id) || null;
      save();
      if (!store.children.length) setHash("profile");
      route();
    }
    return;
  }
  if (e.target.id === "eraseAll") {
    if (confirm("Стерти всі локальні дані цього застосунку?")) { localStorage.removeItem(STORAGE_KEY); store = freshStore(); setHash("welcome"); route(); }
    return;
  }
  if (e.target.id === "finishSurvey") { finishSurvey(); return; }
  if (e.target.id === "addIcs") { const t = todaysTask(currentAge()); downloadIcs(t ? t.act.title : "Гра з дитиною"); return; }
  if (e.target.id === "copySummary") {
    navigator.clipboard?.writeText(summaryText());
    const st = document.getElementById("copyStatus"); if (st) st.textContent = "Підсумок скопійовано.";
    return;
  }

  const stateBtn = e.target.closest(".state-controls button");
  if (stateBtn) {
    const wrap = stateBtn.closest(".state-controls");
    const age = currentAge();
    cc().surveys[age] = cc().surveys[age] || { states: {}, questionIds: questionIdsFor(age) };
    cc().surveys[age].states[wrap.dataset.id] = stateBtn.dataset.state;
    save();
    wrap.querySelectorAll("button").forEach((b) => b.classList.remove("active"));
    stateBtn.classList.add("active");
    // live progress update
    const ids = cc().surveys[age].questionIds || [];
    const answered = ids.filter((id) => cc().surveys[age].states[id]).length;
    const bar = document.querySelector(".progress-mini span"); if (bar) bar.style.width = (ids.length ? (answered / ids.length) * 100 : 0) + "%";
    const fin = document.getElementById("finishSurvey"); if (fin) fin.disabled = answered === 0;
    const cnt = document.querySelector(".small"); if (cnt && cnt.textContent.includes("відповід")) cnt.textContent = `${answered} з ${ids.length} відповідей`;
    return;
  }

  const dayToggle = e.target.closest("[data-day-toggle]");
  if (dayToggle) {
    const day = Number(dayToggle.dataset.dayToggle);
    programState.openDay = (programState.openDay === day) ? null : day;
    renderProgramList();
    return;
  }
  const dayOpt = e.target.closest("[data-day-opt]");
  if (dayOpt) {
    const day = Number(dayOpt.dataset.dayOpt);
    programState.selected[day] = dayOpt.dataset.opt;
    programState.openDay = day;
    renderProgramList();
    return;
  }

  const consentBox = e.target.closest(".consent-box");
  if (consentBox) {
    const all = [...document.querySelectorAll(".consent-box")].every((b) => b.checked);
    const btn = document.getElementById("consentContinue"); if (btn) btn.disabled = !all;
    return;
  }
});

document.addEventListener("input", (e) => {
  if (e.target.id === "childSwitch") {
    const v = e.target.value;
    if (v === "__add") { setHash("profile"); return; }
    store.activeChildId = v; save(); route();
    return;
  }
  if (e.target.id === "childDob") {
    const hint = document.getElementById("ageHint");
    const m = monthsSince(e.target.value);
    if (hint) hint.textContent = m == null ? "" : `Вік: ~${m} міс. → вікове вікно ${AGE_LABELS[ageWindowFor(m)]}`;
  }
  if (e.target.id === "askNotes") { cc().notes = e.target.value; save(); }
});

window.addEventListener("hashchange", route);
route();
