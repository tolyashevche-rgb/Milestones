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
           surveys: {}, snapshots: [], programSelections: {}, triedActivities: [], notes: "" };
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
    c.programSelections = s.programSelections || {};
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
store.children.forEach((c) => { c.programSelections = c.programSelections || {}; });
let profileEditing = false;

// ---- helpers ----
function localDateString(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}
function parseLocalDate(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value || "");
  if (!match) return null;
  const dob = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  if (dob.getFullYear() !== Number(match[1]) || dob.getMonth() !== Number(match[2]) - 1 || dob.getDate() !== Number(match[3])) return null;
  return dob;
}
function monthsSince(dobStr) {
  const dob = parseLocalDate(dobStr);
  if (!dob) return null;
  const now = new Date();
  if (dob > now) return null;
  let m = (now.getFullYear() - dob.getFullYear()) * 12 + (now.getMonth() - dob.getMonth());
  if (now.getDate() < dob.getDate()) m -= 1;
  return m;
}
function validateDob(dobStr) {
  if (!dobStr) return { months: null, error: "Вкажіть дату народження." };
  const dob = parseLocalDate(dobStr);
  if (!dob) return { months: null, error: "Вкажіть коректну дату народження." };
  if (dob > new Date()) return { months: null, error: "Дата народження не може бути в майбутньому." };
  const months = monthsSince(dobStr);
  if (months > 12) return { months, error: "Зараз застосунок підтримує вік від народження до 12 місяців." };
  return { months, error: "" };
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
  delete cc().programSelections[String(age)];
  surveyUi = { age, index: 0 };
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
function profileForSurvey(survey, age) {
  const s = survey || { states: {}, questionIds: [] };
  return buildProfile(s.states || {}, age, ENGINE_CONFIG, s.questionIds || null);
}
function calendarDayNumber(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date)) return null;
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}
function currentProgramDayIndex(survey, programLength) {
  if (!programLength) return 0;
  const started = calendarDayNumber(survey && survey.date);
  const today = calendarDayNumber(new Date());
  const elapsed = started == null || today == null ? 0 : Math.max(0, today - started);
  return elapsed % programLength;
}

// ---- routing ----
const NAV = [
  { route: "home", label: "Головна", icon: "⌂" },
  { route: "survey", label: "Спостереження", icon: "◎" },
  { route: "program", label: "Гра", icon: "◇" },
  { route: "ask", label: "Фахівець", icon: "?" }
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
  root.querySelector("h1")?.focus({ preventScroll: true });
}

function renderNav(active) {
  const nav = document.getElementById("bottomNav");
  const onboarding = ["welcome", "consent", "profile"].includes(active);
  nav.style.display = onboarding ? "none" : "flex";
  nav.innerHTML = NAV.map((n) => `
    <button type="button" class="nav-btn ${active === n.route || (active === "results" && n.route === "survey") ? "active" : ""}" data-go="${n.route}" ${active === n.route || (active === "results" && n.route === "survey") ? 'aria-current="page"' : ""}>
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
      <h1 tabindex="-1">Перший рік — спокійніше</h1>
      <p class="lead">Короткі спостереження, прості ігри та зрозумілі підказки для розмови з фахівцем.</p>
      <button type="button" class="btn primary block" data-go="consent">Почати</button>
      <p class="fineprint">Матеріали спираються на рекомендації CDC, AAP, WHO та Harvard. Це не діагностика і не скринінг.</p>
    </section>`;
}

function renderConsent() {
  return `
    <section class="screen-pad">
      <h1 tabindex="-1">Перш ніж почати</h1>
      <p class="muted">Три короткі підтвердження. Дані залишаються в цьому браузері.</p>
      <label class="check"><input type="checkbox" class="consent-box" data-k="parent"><span>Я один із батьків або опікун дитини.</span></label>
      <label class="check"><input type="checkbox" class="consent-box" data-k="purpose"><span>Розумію, що це інструмент спостереження і гри, <strong>не діагностика і не скринінг</strong>, і не замінює фахівця.</span></label>
      <label class="check"><input type="checkbox" class="consent-box" data-k="local"><span>Погоджуюся з локальним зберіганням даних у цьому браузері.</span></label>
      <button type="button" id="consentContinue" class="btn primary block" disabled>Продовжити</button>
    </section>`;
}

function renderProfile() {
  const c = profileEditing ? (cc() || {}) : {};
  const dobCheck = c.dob ? validateDob(c.dob) : { months: null, error: "" };
  const ageHint = dobCheck.months == null || dobCheck.error ? "" : `Вік: ~${dobCheck.months} міс. → вікове вікно ${AGE_LABELS[ageWindowFor(dobCheck.months)]}`;
  return `
    <section class="screen-pad">
      <h1 tabindex="-1">Профіль дитини</h1>
      <p class="muted">Дата народження потрібна, щоб показати питання за віком. Ім'я можна не вказувати.</p>
      <label class="field"><span>Ім'я (необов'язково)</span><input id="childName" type="text" value="${esc(c.name || "")}" placeholder="Напр., Софія"></label>
      <label class="field"><span>Дата народження</span><input id="childDob" type="date" value="${esc(c.dob || "")}" max="${localDateString()}" required aria-describedby="ageHint profileError"></label>
      <div id="ageHint" class="age-hint">${ageHint}</div>
      <div id="profileError" class="field-error" role="alert">${esc(dobCheck.error)}</div>
      <button type="button" id="profileSave" class="btn primary block" ${dobCheck.error || !c.dob ? "disabled" : ""}>${profileEditing ? "Зберегти зміни" : "Зберегти і продовжити"}</button>
    </section>`;
}

// ---- home / cabinet ----
function todaysTask(age) {
  const survey = cc().surveys[age];
  if (!survey || !survey.date) return null;
  const profile = profileForSurvey(survey, age);
  if (profile.notStarted) return null;
  const program = buildProgram(profile, age);
  if (!program.length) return null;
  const dayIdx = currentProgramDayIndex(survey, program.length);
  const day = program[dayIdx];
  const selected = cc().programSelections[String(age)] && cc().programSelections[String(age)][String(day.day)];
  const act = activityById(age, selected) || activityById(age, day.options[0]);
  return act ? { day: dayIdx + 1, domain: domainOf(act.id) || day.domain, act } : null;
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
        <span class="muted">Сьогодні</span>
        <h1 tabindex="-1">${childName ? `Для ${childName}` : "Для вашої дитини"}</h1>
        <div class="profile-meta"><span class="chip">${AGE_LABELS[age]}</span><button type="button" class="profile-edit" id="editProfile">Змінити профіль</button></div>
      </div>

      <article class="card today">
        ${task ? `
          <div class="illus mini" aria-hidden="true">${(typeof domainIllus === "function" ? domainIllus(task.domain) : "")}</div>
          <span class="mini-label">Гра на сьогодні · день ${task.day}</span>
          <h2>${esc(task.act.title)}</h2>
          <p class="muted">${esc(task.act.time)} · ${esc(task.act.materials)}</p>
          <div class="row">
            <button type="button" class="btn primary" data-go="program">Почати гру</button>
            <button type="button" class="btn ghost" id="addIcs">У календар</button>
          </div>` : `
          <span class="mini-label">Перший крок</span>
          <h2>Коротке спостереження</h2>
          <p class="muted">Відповідайте по одному питанню. Наприкінці отримаєте одну просту гру на сьогодні.</p>
          <button type="button" class="btn primary" data-go="survey">Почати</button>`}
      </article>

      ${tested ? `<div class="tiles">
        <button type="button" class="tile" data-go="program"><strong>Усі ігри</strong><span class="muted">план на сім днів</span></button>
        <button type="button" class="tile" data-go="progress"><strong>Історія</strong><span class="muted">ваші спостереження</span></button>
        <button type="button" class="tile" data-go="ask"><strong>Для фахівця</strong><span class="muted">підсумок і нотатки</span></button>
        <button type="button" class="tile" data-go="survey" data-restart="1"><strong>Оновити</strong><span class="muted">пройти ще раз</span></button>
      </div>` : ""}

      ${next ? `<p class="note">Наступне вікове спостереження — приблизно у ${next} місяців.</p>` : ""}
      <div class="home-danger">
        <button type="button" id="deleteChild" class="linklike danger">Видалити цю дитину</button>
        <button type="button" id="eraseAll" class="linklike danger">Стерти всі мої дані</button>
      </div>
    </section>`;
}

// ---- survey ----
let surveyUi = { age: null, index: 0 };

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
  if (surveyUi.age !== age) {
    const firstUnanswered = ids.findIndex((id) => !states[id]);
    surveyUi = { age, index: firstUnanswered >= 0 ? firstUnanswered : 0 };
  }
  surveyUi.index = Math.max(0, Math.min(surveyUi.index, Math.max(0, ids.length - 1)));
  const id = ids[surveyUi.index];
  const m = milestoneById(age, id);
  if (!m) return `<section class="screen-pad"><h1 tabindex="-1">Спостереження</h1><p class="muted">Не вдалося завантажити питання.</p></section>`;
  const s = states[id];
  const pool = variantPoolFor(age, id);
  const prompt = pool[survey.variants[id]] || m.text;
  const isLast = surveyUi.index === ids.length - 1;
  const position = surveyUi.index + 1;
  return `
    <section class="screen-pad">
      <h1 tabindex="-1">Спостереження</h1>
      <p class="muted">Оберіть варіант, який найкраще описує те, що ви бачите зараз.</p>
      <div class="survey-progress-row"><span>Питання ${position} з ${ids.length}</span><span>${answered} збережено</span></div>
      <div class="progress-mini" role="progressbar" aria-label="Хід спостереження" aria-valuemin="1" aria-valuemax="${ids.length}" aria-valuenow="${position}"><span style="width:${ids.length ? (position / ids.length) * 100 : 0}%"></span></div>
      <article class="q-card q-card-single">
        <span class="mini-label">${esc(m.domain)}</span>
        <h2 id="questionTitle">${esc(m.title)}</h2>
        <p class="question-prompt">${esc(prompt)}</p>
        ${(typeof whoWindowFor === "function" && whoWindowFor(id)) ? `<p class="who-window">${esc(whoWindowFor(id))}</p>` : ""}
        <div class="state-controls" data-id="${id}" role="group" aria-labelledby="questionTitle">
          <button type="button" data-state="yes" class="${s === "yes" ? "active" : ""}" aria-pressed="${s === "yes"}">Бачу</button>
          <button type="button" data-state="not_sure" class="${s === "not_sure" ? "active" : ""}" aria-pressed="${s === "not_sure"}">Ще спостерігаю</button>
          <button type="button" data-state="not_yet" class="${s === "not_yet" ? "active" : ""}" aria-pressed="${s === "not_yet"}">Поки ні</button>
        </div>
      </article>
      <div class="survey-actions">
        <button type="button" id="surveyBack" class="btn ghost" ${surveyUi.index === 0 ? "disabled" : ""}>Назад</button>
        <button type="button" id="surveyNext" class="btn primary" ${s ? "" : "disabled"}>${isLast ? "Побачити підсумок" : "Далі"}</button>
      </div>
      <p class="fineprint center">Відповіді зберігаються автоматично. Це не оцінка дитини.</p>
    </section>`;
}

// ---- results ----
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

function domainSummary(age) {
  const snaps = snapshotsForAge(age);
  if (!snaps.length) return `<p class="muted">Спостережень ще немає.</p>`;
  const stats = snapshotAskedStats(snaps[snaps.length - 1], age);
  return `<div class="domain-summary">${DOMAIN_KEYS.map((key) => {
    const item = stats[key];
    const text = !item.total ? "Питань не було" : item.yes === item.total ? "Усі вибрані ознаки вже помітні" : item.yes === 0 ? "Поки більше спостерігаєте" : "Деякі ознаки вже помітні";
    return `<div class="domain-row"><strong>${DOMAIN_LABELS[key]}</strong><span>${text}</span></div>`;
  }).join("")}</div>`;
}

function renderResults() {
  const age = currentAge();
  const survey = cc().surveys[age] || { states: {} };
  const profile = profileForSurvey(survey, age);
  let focusBlock;
  if (profile.allClear) focusBlock = `<p>Продовжуйте звичну гру та спілкування — окремий напрямок зараз не потрібен.</p>`;
  else if (profile.partialClear) focusBlock = `<p>Продовжуйте спостерігати у власному темпі. Ми запропонуємо легку гру без додаткового навантаження.</p>`;
  else focusBlock = `<p>Найближчими днями почніть із гри, яка підтримує:</p><ul class="focus-list">${profile.focus.map((f) => `<li><strong>${DOMAIN_LABELS[f.domain]}</strong></li>`).join("")}</ul>`;

  const flagged = (survey.questionIds || []).map((id) => milestoneById(age, id)).filter((m) => m && (survey.states[m.id] === "not_yet" || survey.states[m.id] === "not_sure") && DISCUSS_BY_ID[m.id]);
  const discuss = flagged.length ? `
    <details class="calm-details">
      <summary>Коли варто запитати фахівця</summary>
      <p class="muted">Відкрийте цей блок, якщо хочете підготуватися до розмови.</p>
      ${flagged.map((m) => `<article class="discuss-card"><div class="q-meta"><span>${esc(m.domain)}</span><span>${survey.states[m.id] === "not_yet" ? "Поки ні" : "Ще спостерігаю"}</span></div><h3>${esc(m.title)}</h3><p class="muted">${esc(DISCUSS_BY_ID[m.id])}</p></article>`).join("")}
    </details>` : "";

  return `
    <section class="screen-pad">
      <h1 tabindex="-1">Ваші спостереження</h1>
      <p class="muted">Короткий підсумок для віку ${AGE_LABELS[age]}. Це не оцінка і не діагноз.</p>
      <article class="card">
        <span class="mini-label">Що ви помітили</span>
        ${domainSummary(age)}
      </article>

      <article class="card">
        <span class="mini-label">З чого почати</span>
        ${focusBlock}
      </article>

      ${discuss}

      <button type="button" class="btn primary block" data-go="program">Почати гру на сьогодні</button>
    </section>`;
}

// ---- program (accordion: each day expands inline, one open at a time) ----
let programState = { age: null, program: null, openDay: null, selected: {} };

function renderProgram() {
  const age = currentAge();
  const survey = cc().surveys[age];
  if (!survey || !survey.date) {
    return `<section class="screen-pad"><h1 tabindex="-1">Гра на сьогодні</h1><p class="muted">Спершу дайте відповіді на кілька коротких питань.</p><button type="button" class="btn primary block" data-go="survey">Почати спостереження</button></section>`;
  }
  const profile = profileForSurvey(survey, age);
  const program = buildProgram(profile, age);
  const currentDay = program[currentProgramDayIndex(survey, program.length)];
  programState = { age, program, openDay: currentDay ? currentDay.day : null, selected: { ...(cc().programSelections[String(age)] || {}) } };
  return `
    <section class="screen-pad">
      <h1 tabindex="-1">Гра на тиждень</h1>
      <p class="muted">Сьогоднішній день уже відкрито. Оберіть одну коротку гру — цього достатньо.</p>
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
  return a ? `<button type="button" class="day-opt ${id === sel ? "active" : ""}" data-day-opt="${dayNum}" data-opt="${id}" aria-pressed="${id === sel}">${esc(a.title)}</button>` : "";
}

function dayAccordionHtml(age, d) {
  const open = programState.openDay === d.day;
  const sel = programState.selected[d.day] || d.options[0];
  const selAct = activityById(age, sel);
  const selectedDomain = selAct ? domainOf(selAct.id) : d.domain;
  // Primary same-domain ideas (the day's focus).
  const opts = d.options.length > 1
    ? `<p class="bonus-label">Оберіть одну гру:</p><div class="day-opts">${d.options.map((id) => dayChip(age, d.day, id, sel)).join("")}</div>`
    : "";
  // Optional cross-domain "bonus" ideas — clearly optional, so a day can touch several areas.
  const bonus = (d.bonus || []).filter((b) => activityById(age, b.id));
  const bonusHtml = bonus.length
    ? `<p class="bonus-label">Або оберіть іншу легку ідею:</p>
       <div class="day-opts bonus">${bonus.map((b) => dayChip(age, d.day, b.id, sel)).join("")}</div>`
    : "";
  return `
    <article class="day-acc ${open ? "open" : ""}">
      <button type="button" class="day-acc-head" data-day-toggle="${d.day}" aria-expanded="${open}">
        <span class="day-acc-meta"><span class="day-num">День ${d.day}</span><span class="chip">${DOMAIN_LABELS_SHORT[selectedDomain] || selectedDomain}</span></span>
        <span class="day-acc-title">${esc(selAct ? selAct.title : "")}</span>
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
function sourceFriendly(source) {
  return String(source || "").replace(/WHO motor/gi, "WHO — руховий розвиток");
}

function activityDetailHtml(age, id) {
  const a = activityById(age, id);
  if (!a) return "";
  if (!cc().triedActivities.includes(id)) { cc().triedActivities.push(id); save(); }
  const note = (typeof authorNoteFor === "function") ? authorNoteFor(a.id) : null;
  // Plain-language note: keep author + the actionable idea; the internal mechanism mapping
  // stays in data for traceability but is not shown as jargon to parents.
  const basis = a.evidence || note ? `<details class="evidence-details"><summary>Чому ця гра тут</summary>
    ${a.evidence ? `<p><strong>Основа:</strong> ${esc(evidenceFriendly(a.evidence))}. <strong>Джерело:</strong> ${esc(sourceFriendly(a.source))}.</p>` : ""}
    ${note ? `<p><strong>Ідея ${esc(note.author)}:</strong> ${esc(note.idea)}.</p>` : ""}
  </details>` : "";
  return `
    <div class="illus" aria-hidden="true">${(typeof domainIllus === "function" ? domainIllus(domainOf(a.id)) : "")}</div>
    <div class="tag-row"><span class="chip">${DOMAIN_LABELS[domainOf(a.id)] || a.domain}</span><span class="chip">${esc(a.time)}</span><span class="chip">${esc(a.materials)}</span></div>
    <h2>${esc(a.title)}</h2>
    <p class="muted">${esc(a.why)}</p>
    <div class="steps"><strong>Кроки</strong><ol>${a.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>
    <div class="stop"><strong>Коли зупинитися:</strong> ${esc(a.stop)}</div>
    ${basis}`;
}

// ---- progress ----
function renderProgress() {
  const snaps = cc().snapshots.slice().reverse();
  const list = snaps.length ? snaps.map((s) => {
    const date = new Date(s.date).toLocaleString("uk-UA", { dateStyle: "medium", timeStyle: "short" });
    return `<article class="history-item"><h2>${AGE_LABELS[s.age]} · ${date}</h2><dl><dt>Бачу</dt><dd>${s.counts.observed}</dd><dt>Ще спостерігаю</dt><dd>${s.counts.notSure}</dd><dt>Поки ні</dt><dd>${s.counts.notYet}</dd></dl></article>`;
  }).join("") : `<p class="muted">Збережених спостережень ще немає.</p>`;
  return `
    <section class="screen-pad">
      <h1 tabindex="-1">Історія спостережень</h1>
      <p class="muted">Тут зберігаються ваші відповіді з різних дат. Вони не є оцінкою розвитку.</p>
      <div class="history-list">${list}</div>
    </section>`;
}

// ---- ask ----
function renderAsk() {
  const age = currentAge();
  const survey = cc().surveys[age] || { states: {}, questionIds: [] };
  const flagged = (survey.questionIds || []).map((id) => milestoneById(age, id)).filter((m) => m && (survey.states[m.id] === "not_yet" || survey.states[m.id] === "not_sure") && DISCUSS_BY_ID[m.id]);
  const notes = cc().notes || "";
  return `
    <section class="screen-pad">
      <h1 tabindex="-1">Для розмови з фахівцем</h1>
      <p class="muted">Збережіть те, що помітили, і спокійно обговоріть під час візиту.</p>
      <h2 class="mt">За вашими відповідями</h2>
      ${flagged.length ? flagged.map((m) => `<article class="discuss-card"><div class="q-meta"><span>${esc(m.domain)}</span><span>${survey.states[m.id] === "not_yet" ? "Поки ні" : "Ще спостерігаю"}</span></div><h3>${esc(m.title)}</h3><p class="muted">${esc(DISCUSS_BY_ID[m.id])}</p></article>`).join("") : `<p class="muted">Поки немає пунктів, які ви позначили «Ще спостерігаю» або «Поки ні».</p>`}
      <label class="field mt"><span>Нотатки для візиту</span><textarea id="askNotes" rows="5" placeholder="Що помітили, що пробували, що хочете запитати?">${esc(notes)}</textarea></label>
      <button type="button" id="copySummary" class="btn ghost block">Скопіювати підсумок для фахівця</button>
      <p id="copyStatus" class="muted small" role="status"></p>
    </section>`;
}

function summaryText() {
  const age = currentAge();
  const survey = cc().surveys[age] || { states: {} };
  const pick = (st) => (MILESTONES_BY_AGE[age] || []).filter((m) => survey.states[m.id] === st).map((m) => "- " + m.title).join("\n") || "- поки нічого";
  return `Вік: ${AGE_LABELS[age]}\nМета: нотатки для розмови про розвиток, не діагностика і не скринінг\n\nБачу:\n${pick("yes")}\n\nЩе спостерігаю:\n${pick("not_sure")}\n\nПоки ні:\n${pick("not_yet")}\n\nНотатки:\n${cc().notes || "- немає"}\n\nПитання до фахівця:\n1.\n2.\n3.`;
}

// ---- snapshot on finishing a survey ----
function finishSurvey() {
  const age = currentAge();
  const survey = cc().surveys[age] || { states: {}, questionIds: [] };
  const ids = survey.questionIds || [];
  if (!ids.length || ids.some((id) => !survey.states[id])) return;
  const profile = profileForSurvey(survey, age);
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
document.addEventListener("click", async (e) => {
  const go = e.target.closest("[data-go]");
  if (go) {
    if (go.dataset.restart) {
      const ok = confirm("Почати нове спостереження? Попередній підсумок залишиться в історії.");
      if (!ok) return;
      restartSurvey(currentAge());
    }
    setHash(go.dataset.go);
    return;
  }

  if (e.target.id === "consentContinue") {
    store.consent = { accepted: true, date: new Date().toISOString() }; save(); setHash("profile"); return;
  }
  if (e.target.id === "profileSave") {
    const name = document.getElementById("childName").value.trim();
    const dob = document.getElementById("childDob").value;
    const checked = validateDob(dob);
    const error = document.getElementById("profileError");
    const input = document.getElementById("childDob");
    if (checked.error) {
      if (error) error.textContent = checked.error;
      if (input) { input.setAttribute("aria-invalid", "true"); input.focus(); }
      return;
    }
    if (input) input.removeAttribute("aria-invalid");
    if (profileEditing && cc()) {
      cc().name = name;
      cc().dob = dob;
    } else {
      const child = freshChild(name, dob);
      store.children.push(child);
      store.activeChildId = child.id;
    }
    profileEditing = false;
    save(); setHash("home"); return;
  }
  if (e.target.id === "editProfile") {
    profileEditing = true;
    setHash("profile");
    return;
  }
  if (e.target.id === "deleteChild") {
    const c = cc(); if (!c) return;
    if (confirm(`Видалити профіль «${c.name || "дитина"}» і всі його дані?`)) {
      store.children = store.children.filter((x) => x.id !== c.id);
      store.activeChildId = (store.children[0] && store.children[0].id) || null;
      save();
      if (!store.children.length) { profileEditing = false; setHash("profile"); }
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
    const st = document.getElementById("copyStatus");
    try {
      if (!navigator.clipboard || !navigator.clipboard.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(summaryText());
      if (st) st.textContent = "Підсумок скопійовано.";
    } catch {
      if (st) st.textContent = "Не вдалося скопіювати. Спробуйте ще раз у захищеному браузері.";
    }
    return;
  }
  if (e.target.id === "surveyBack") {
    surveyUi.index = Math.max(0, surveyUi.index - 1);
    show("survey");
    return;
  }
  if (e.target.id === "surveyNext") {
    const age = currentAge();
    const survey = cc().surveys[age];
    const ids = survey.questionIds || [];
    const currentId = ids[surveyUi.index];
    if (!currentId || !survey.states[currentId]) return;
    if (surveyUi.index >= ids.length - 1) finishSurvey();
    else { surveyUi.index += 1; show("survey"); }
    return;
  }

  const stateBtn = e.target.closest(".state-controls button");
  if (stateBtn) {
    const wrap = stateBtn.closest(".state-controls");
    const age = currentAge();
    cc().surveys[age] = cc().surveys[age] || { states: {}, questionIds: questionIdsFor(age) };
    cc().surveys[age].states[wrap.dataset.id] = stateBtn.dataset.state;
    save();
    wrap.querySelectorAll("button").forEach((b) => { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
    stateBtn.classList.add("active");
    stateBtn.setAttribute("aria-pressed", "true");
    const ids = cc().surveys[age].questionIds || [];
    const answered = ids.filter((id) => cc().surveys[age].states[id]).length;
    const saved = document.querySelector(".survey-progress-row span:last-child"); if (saved) saved.textContent = `${answered} збережено`;
    const next = document.getElementById("surveyNext"); if (next) next.disabled = false;
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
    cc().programSelections[String(programState.age)] = cc().programSelections[String(programState.age)] || {};
    cc().programSelections[String(programState.age)][String(day)] = dayOpt.dataset.opt;
    save();
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
    if (v === "__add") { profileEditing = false; setHash("profile"); return; }
    store.activeChildId = v; save(); route();
    return;
  }
  if (e.target.id === "childDob") {
    const hint = document.getElementById("ageHint");
    const error = document.getElementById("profileError");
    const button = document.getElementById("profileSave");
    const checked = validateDob(e.target.value);
    if (hint) hint.textContent = checked.error || checked.months == null ? "" : `Вік: ~${checked.months} міс. → вікове вікно ${AGE_LABELS[ageWindowFor(checked.months)]}`;
    if (error) error.textContent = checked.error;
    if (button) button.disabled = Boolean(checked.error);
    e.target.toggleAttribute("aria-invalid", Boolean(checked.error));
  }
  if (e.target.id === "askNotes") { cc().notes = e.target.value; save(); }
});

window.addEventListener("hashchange", route);
route();
