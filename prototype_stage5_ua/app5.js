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

const OBSERVATION_LABELS = {
  yes: "Бачу",
  not_sure: "Ще спостерігаю",
  not_yet: "Ще не помічаю"
};

const STORAGE_KEY = "milestonesMap.stage5.ua";
const BACKUP_SCHEMA = "milestones.stage5.ua.backup";
const BACKUP_VERSION = 1;
const MAX_BACKUP_BYTES = 2 * 1024 * 1024;
let storageProblem = "";

// ---- storage (per-child data under children[]; shaped so optional sync can be added later) ----
function emptySpecialistPrep(noticed = "") {
  return { noticed: noticed || "", tried: "", questions: "" };
}
function specialistPrepFor(child = cc()) {
  if (!child) return emptySpecialistPrep();
  if (!child.specialistPrep || typeof child.specialistPrep !== "object") {
    child.specialistPrep = emptySpecialistPrep(child.notes || "");
  }
  child.specialistPrep.noticed = child.specialistPrep.noticed || "";
  child.specialistPrep.tried = child.specialistPrep.tried || "";
  child.specialistPrep.questions = child.specialistPrep.questions || "";
  return child.specialistPrep;
}
function freshChild(name, dob) {
  return { id: "child_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
           name: name || "", dob: dob || "",
           surveys: {}, snapshots: [], programSelections: {}, activityCompletions: {}, triedActivities: [], notes: "",
           specialistPrep: emptySpecialistPrep() };
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
    c.activityCompletions = s.activityCompletions || {};
    c.triedActivities = s.triedActivities || []; c.notes = s.notes || "";
    c.specialistPrep = s.specialistPrep || emptySpecialistPrep(c.notes);
    st.children.push(c); st.activeChildId = c.id;
  }
  return st;
}
function renderStorageStatus() {
  const status = document.getElementById("storageStatus");
  if (!status) return;
  status.hidden = !storageProblem;
  status.textContent = storageProblem ? "Не збережено" : "";
  status.title = storageProblem;
  if (storageProblem) status.setAttribute("aria-label", storageProblem);
  else status.removeAttribute("aria-label");
}
function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return migrate(raw ? JSON.parse(raw) : null);
  } catch {
    storageProblem = "Не вдалося прочитати локальні дані. Не закривайте вкладку; скористайтеся резервною копією, якщо вона є.";
    return freshStore();
  }
}
function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(store));
    storageProblem = "";
    renderStorageStatus();
    return true;
  } catch {
    storageProblem = "Браузер не зберіг останні зміни. Не закривайте вкладку; збережіть резервну копію в керуванні даними.";
    renderStorageStatus();
    return false;
  }
}
function backupPayload(source = store) {
  return {
    schema: BACKUP_SCHEMA,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data: JSON.parse(JSON.stringify(source))
  };
}
function isRecord(value) { return Boolean(value) && typeof value === "object" && !Array.isArray(value); }
function validateBackupPayload(payload) {
  const fail = (error) => ({ ok: false, error });
  if (!isRecord(payload) || payload.schema !== BACKUP_SCHEMA || payload.version !== BACKUP_VERSION || !isRecord(payload.data)) {
    return fail("Це не схоже на резервну копію Milestones.");
  }
  const imported = migrate(JSON.parse(JSON.stringify(payload.data)));
  if (!Array.isArray(imported.children) || imported.children.length > 20) return fail("Файл має непідтримувану структуру.");
  if (imported.consent != null && (!isRecord(imported.consent) || typeof imported.consent.accepted !== "boolean")) {
    return fail("У файлі є пошкоджені налаштування.");
  }
  const childIds = new Set();
  for (const child of imported.children) {
    if (!isRecord(child) || typeof child.id !== "string" || !/^[A-Za-z0-9_-]{1,100}$/.test(child.id) || childIds.has(child.id)) {
      return fail("У файлі є пошкоджений профіль.");
    }
    childIds.add(child.id);
    const parsedDob = typeof child.dob === "string" ? parseLocalDate(child.dob) : null;
    if (typeof child.name !== "string" || child.name.length > 200 || !parsedDob || parsedDob > new Date()) {
      return fail("У файлі є некоректні дані профілю.");
    }
    if (!isRecord(child.surveys) || !Array.isArray(child.snapshots) || !isRecord(child.programSelections)
      || !isRecord(child.activityCompletions) || !Array.isArray(child.triedActivities)) {
      return fail("У файлі є пошкоджені дані спостережень.");
    }
    if (Object.values(child.programSelections).some((selection) => !isRecord(selection))
      || Object.values(child.activityCompletions).some((completion) => !isRecord(completion))
      || child.triedActivities.some((id) => typeof id !== "string")
      || child.snapshots.some((snapshot) => !isRecord(snapshot) || !isRecord(snapshot.states || {})
        || (snapshot.questionIds != null && !Array.isArray(snapshot.questionIds)))) {
      return fail("У файлі є пошкоджена історія або план.");
    }
    for (const survey of Object.values(child.surveys)) {
      if (!isRecord(survey) || !isRecord(survey.states || {})
        || (survey.questionIds != null && !Array.isArray(survey.questionIds))
        || (survey.variants != null && !isRecord(survey.variants))) {
        return fail("У файлі є пошкоджені відповіді.");
      }
      if (Object.values(survey.states || {}).some((state) => !["yes", "not_sure", "not_yet"].includes(state))) {
        return fail("У файлі є невідомий варіант відповіді.");
      }
    }
    if (child.notes != null && typeof child.notes !== "string") return fail("У файлі є пошкоджені нотатки.");
    if (child.specialistPrep != null && (!isRecord(child.specialistPrep)
      || ["noticed", "tried", "questions"].some((key) => child.specialistPrep[key] != null && typeof child.specialistPrep[key] !== "string"))) {
      return fail("У файлі є пошкоджені нотатки для фахівця.");
    }
    child.notes = child.notes || "";
    child.specialistPrep = child.specialistPrep || emptySpecialistPrep(child.notes);
    specialistPrepFor(child);
  }
  imported.activeChildId = childIds.has(imported.activeChildId) ? imported.activeChildId : (imported.children[0]?.id || null);
  return { ok: true, store: imported };
}
// Active child — per-child data lives here. Null only before the first child exists.
function cc() { return store.children.find((c) => c.id === store.activeChildId) || store.children[0] || null; }
let store = load();
store.children.forEach((c) => {
  c.programSelections = c.programSelections || {};
  c.activityCompletions = c.activityCompletions || {};
  specialistPrepFor(c);
});
let profileEditing = false;
let dataNotice = "";

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
  delete cc().activityCompletions[completionKey(age)];
  surveyUi = { age, index: 0 };
  surveyAdvancePending = false;
  surveyAdvanceToken += 1;
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
function completionKey(age) { return `${localDateString()}:${age}`; }
function completedActivityToday(age) { return cc().activityCompletions[completionKey(age)] || null; }

// ---- routing ----
const NAV = [
  { route: "home", label: "Головна", icon: "home" },
  { route: "survey", label: "Спостереження", icon: "observe" },
  { route: "program", label: "Гра", icon: "play" },
  { route: "ask", label: "Фахівець", icon: "pencil" }
];

function navIcon(name) {
  const paths = {
    home: `<path d="M3.5 9.2 10 3.4l6.5 5.8v7.1a1.3 1.3 0 0 1-1.3 1.3H4.8a1.3 1.3 0 0 1-1.3-1.3Z"/><path d="M7.6 17.6v-5.2h4.8v5.2"/>`,
    observe: `<path d="M2.4 10s2.8-4.4 7.6-4.4 7.6 4.4 7.6 4.4-2.8 4.4-7.6 4.4S2.4 10 2.4 10Z"/><circle cx="10" cy="10" r="2.2"/>`,
    play: `<path d="m10 2.6 6.1 6.1-6.1 6.1-6.1-6.1Z"/><path d="M10 14.8c0 1.6 2 1.4 2 3"/><path d="m10.9 16.4 2 .2-.8 1.7"/>`,
    pencil: `<path d="m4 16 1-3.8 8.4-8.4a1.4 1.4 0 0 1 2 0l.8.8a1.4 1.4 0 0 1 0 2L7.8 15Z"/><path d="m12.2 5 2.8 2.8M5 12.2 7.8 15"/>`
  };
  return `<svg class="nav-icon" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">${paths[name] || paths.home}</svg>`;
}

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
  renderStorageStatus();
  if (screen === "program") afterProgramRender();
  window.scrollTo(0, 0);
  const focusTarget = screen === "survey" ? root.querySelector("#questionTitle") : root.querySelector("h1");
  focusTarget?.focus({ preventScroll: true });
}

function renderNav(active) {
  const nav = document.getElementById("bottomNav");
  const onboarding = ["welcome", "consent", "profile"].includes(active);
  nav.style.display = onboarding ? "none" : "flex";
  nav.innerHTML = NAV.map((n) => {
    const survey = cc() && cc().surveys[currentAge()];
    const target = n.route === "survey" && survey && survey.date ? "results" : n.route;
    const isActive = active === n.route || (active === "results" && n.route === "survey");
    return `
    <button type="button" class="nav-btn ${isActive ? "active" : ""}" data-go="${target}" ${isActive ? 'aria-current="page"' : ""}>
      <span class="nav-ico" data-icon="${n.icon}" aria-hidden="true">${navIcon(n.icon)}</span><span>${n.label}</span>
    </button>`;
  }).join("");
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
  const ageHint = dobCheck.months == null || dobCheck.error ? "" : `Показуватимемо питання для віку ${AGE_LABELS[ageWindowFor(dobCheck.months)]}.`;
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
  return act ? { day: day.day, domain: domainOf(act.id) || day.domain, act, done: completedActivityToday(age)?.activityId === act.id } : null;
}

function homeNextStep(age) {
  const survey = cc().surveys[age];
  if (!survey || !survey.date) {
    const ids = (survey && survey.questionIds && survey.questionIds.length)
      ? survey.questionIds
      : (MILESTONES_BY_AGE[age] || []).map((m) => m.id);
    const states = (survey && survey.states) || {};
    const answered = ids.filter((id) => states[id]).length;
    if (answered) {
      return {
        kind: "continue-observation",
        label: "Наступний крок",
        title: "Продовжіть спостереження",
        body: `Ви відповіли на ${answered} з ${ids.length} питань. Відповіді вже збережені.`,
        cta: "Продовжити",
        route: "survey",
        progress: { value: answered, total: ids.length }
      };
    }
    return {
      kind: "start-observation",
      label: "Перший крок",
      title: "Коротке спостереження",
      body: "Відповідайте по одному питанню. Наприкінці отримаєте одну просту гру на сьогодні.",
      cta: "Почати спостереження",
      route: "survey"
    };
  }

  const task = todaysTask(age);
  if (task && task.done) {
    return {
      kind: "done-today",
      label: "✓ На сьогодні все",
      title: "Гру виконано",
      body: `«${task.act.title}» позначено виконаною. Завтра тут з’явиться наступна коротка гра.`,
      task
    };
  }
  if (task) {
    return {
      kind: "play-today",
      label: `Рекомендовано сьогодні · день ${task.day}`,
      title: task.act.title,
      body: `${task.act.time} · ${task.act.materials}`,
      cta: "Почати гру",
      route: "program",
      task
    };
  }
  return {
    kind: "review-results",
    label: "Наступний крок",
    title: "Перегляньте підсумок",
    body: "Спостереження збережено. У підсумку є спокійний опис і наступна ідея для гри.",
    cta: "Переглянути підсумок",
    route: "results"
  };
}

function homeNextStepHtml(step) {
  const progress = step.progress ? `
    <div class="next-step-progress" role="progressbar" aria-label="Збережені відповіді" aria-valuemin="0" aria-valuemax="${step.progress.total}" aria-valuenow="${step.progress.value}">
      <span style="width:${step.progress.total ? (step.progress.value / step.progress.total) * 100 : 0}%"></span>
    </div>` : "";
  const action = step.route ? `<button type="button" class="btn primary" data-primary-action="${step.kind}" data-go="${step.route}">${step.cta}</button>` : "";
  return `
    <article class="card next-step ${step.kind}" aria-labelledby="nextStepTitle">
      <span class="mini-label">${step.label}</span>
      <h2 id="nextStepTitle">${esc(step.title)}</h2>
      <p class="muted">${esc(step.body)}</p>
      ${progress}
      ${action}
    </article>`;
}

function renderHome() {
  const age = currentAge();
  const survey = cc().surveys[age];
  const task = todaysTask(age);
  const nextStep = homeNextStep(age);
  const next = nextCheckAge(age);
  const tested = survey && survey.date;
  return `
    <section class="screen-pad">
      <h1 tabindex="-1">Сьогодні</h1>

      ${homeNextStepHtml(nextStep)}

      ${tested ? `<details class="home-more">
        <summary>Інші можливості</summary>
        <div class="tiles">
          <button type="button" class="tile" data-go="program"><strong>Усі ігри</strong><span class="muted">найближчі сім днів</span></button>
          <button type="button" class="tile" data-go="progress"><strong>Історія</strong><span class="muted">ваші спостереження</span></button>
          <button type="button" class="tile" data-go="ask"><strong>Для фахівця</strong><span class="muted">підсумок і нотатки</span></button>
          <button type="button" class="tile" data-go="survey" data-restart="1"><strong>Оновити</strong><span class="muted">пройти ще раз</span></button>
          ${task ? `<button type="button" class="tile" id="addIcs"><strong>У календар</strong><span class="muted">нагадування про гру</span></button>` : ""}
        </div>
      </details>` : ""}

      ${next ? `<p class="note">Наступне вікове спостереження — приблизно у ${next} місяців.</p>` : ""}
      <details class="data-controls">
        <summary>Керування профілем і даними</summary>
        <div class="install-controls">
          <p id="installHelp" class="muted small">Щоб відкривати Milestones одним дотиком, у меню браузера оберіть «Додати на головний екран».</p>
          <button type="button" id="installApp" class="btn ghost" hidden>Встановити на телефон</button>
          <p id="installStatus" class="backup-status" role="status" aria-live="polite" aria-atomic="true"></p>
        </div>
        <div id="updateControls" class="update-controls" hidden>
          <p class="muted small">Нова версія вже готова. Поточні відповіді збережені локально.</p>
          <button type="button" id="applyUpdate" class="btn ghost">Оновити зараз</button>
          <p id="updateStatus" class="backup-status" role="status" aria-live="polite" aria-atomic="true"></p>
        </div>
        <div class="backup-controls">
          <p class="muted small">Резервна копія залишається у вас. Вона містить локальні спостереження, тому зберігайте файл приватно.</p>
          <div class="backup-actions">
            <button type="button" id="exportBackup" class="btn ghost">Зберегти копію</button>
            <button type="button" id="chooseBackup" class="btn">Відновити з файлу</button>
            <input id="importBackup" class="visually-hidden" type="file" accept="application/json,.json" tabindex="-1">
          </div>
          <p id="backupStatus" class="backup-status" role="status" aria-live="polite" aria-atomic="true">${esc(dataNotice)}</p>
        </div>
        <div class="home-danger">
          <button type="button" id="editProfile" class="linklike">Редагувати профіль</button>
          <button type="button" id="deleteChild" class="linklike danger">Видалити цю дитину</button>
          <button type="button" id="eraseAll" class="linklike danger">Стерти всі мої дані</button>
        </div>
      </details>
    </section>`;
}

// ---- survey ----
let surveyUi = { age: null, index: 0 };
let surveyAdvancePending = false;
let surveyAdvanceToken = 0;

function renderSurvey() {
  const age = currentAge();
  const ids = questionIdsFor(age);
  const survey = cc().surveys[age];
  if (survey.date) {
    return `
      <section class="screen-pad">
        <h1 tabindex="-1">Спостереження збережено</h1>
        <p class="muted">Підсумок уже готовий. Оновлюйте відповіді лише тоді, коли хочете зафіксувати нові спостереження.</p>
        <button type="button" class="btn primary block" data-go="results">Переглянути підсумок</button>
        <button type="button" class="btn ghost block" data-go="survey" data-restart="1">Оновити спостереження</button>
      </section>`;
  }
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
  const position = surveyUi.index + 1;
  return `
    <section class="screen-pad">
      <h1 tabindex="-1">Спостереження</h1>
      <p class="muted">Оберіть варіант, який найкраще описує те, що ви бачите зараз.</p>
      <div class="survey-progress-row"><span>Питання ${position} з ${ids.length}</span><span>${answered} збережено</span></div>
      <div class="progress-mini" role="progressbar" aria-label="Хід спостереження" aria-valuemin="1" aria-valuemax="${ids.length}" aria-valuenow="${position}"><span style="width:${ids.length ? (position / ids.length) * 100 : 0}%"></span></div>
      <article class="q-card q-card-single">
        <span class="mini-label">${esc(m.domain)}</span>
        <h2 id="questionTitle" tabindex="-1" aria-describedby="questionPrompt">${esc(m.title)}</h2>
        <p id="questionPrompt" class="question-prompt">${esc(prompt)}</p>
        ${(typeof whoWindowFor === "function" && whoWindowFor(id)) ? `<p class="who-window">${esc(whoWindowFor(id))}</p>` : ""}
        <div class="state-controls" data-id="${id}" data-auto-advance="true" role="group" aria-labelledby="questionTitle">
          <button type="button" data-state="yes" class="${s === "yes" ? "active" : ""}" aria-pressed="${s === "yes"}">Бачу</button>
          <button type="button" data-state="not_sure" class="${s === "not_sure" ? "active" : ""}" aria-pressed="${s === "not_sure"}">Ще спостерігаю</button>
          <button type="button" data-state="not_yet" class="${s === "not_yet" ? "active" : ""}" aria-pressed="${s === "not_yet"}">Ще не помічаю</button>
        </div>
      </article>
      <div class="survey-actions survey-actions-auto">
        ${surveyUi.index > 0 ? `<button type="button" id="surveyBack" class="btn ghost">Назад</button>` : ""}
        <p id="surveyAdvanceStatus" class="survey-auto-hint" role="status" aria-live="polite" aria-atomic="true">Один дотик зберігає відповідь. На наступному екрані можна повернутися.</p>
      </div>
      <p class="fineprint center">Можна зупинитися будь-коли — відповіді вже збережені. Це не тест чи оцінка дитини.</p>
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

function calmDiscussionIntroHtml() {
  return `<div class="calm-anchor"><strong>Це не висновок.</strong> Одна відповідь описує лише те, що ви помітили зараз. Не потрібно перевіряти дитину ще раз просто зараз.</div><p class="muted small">Коли буде зручно, занотуйте звичайний приклад і обговоріть його з фахівцем.</p>`;
}

function discussCardHtml(m, state) {
  return `<article class="discuss-card"><div class="q-meta"><span>${esc(m.domain)}</span><span>${OBSERVATION_LABELS[state] || "Спостереження"}</span></div><h3>${esc(m.title)}</h3><p class="muted"><strong>Для розмови:</strong> ${esc(DISCUSS_BY_ID[m.id])}</p></article>`;
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
      <summary>Що можна спокійно обговорити</summary>
      ${calmDiscussionIntroHtml()}
      ${flagged.map((m) => discussCardHtml(m, survey.states[m.id])).join("")}
    </details>` : "";

  return `
    <section class="screen-pad has-thumb-action">
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

      <div class="thumb-action"><button type="button" class="btn primary" data-go="program">Почати гру на сьогодні</button></div>
    </section>`;
}

// ---- program (today first; alternatives and future days stay available but secondary) ----
let programState = { age: null, program: null, openDay: null, currentDay: null, selected: {} };

function renderProgram() {
  const age = currentAge();
  const survey = cc().surveys[age];
  if (!survey || !survey.date) {
    return `<section class="screen-pad"><h1 tabindex="-1">Гра на сьогодні</h1><p class="muted">Спершу дайте відповіді на кілька коротких питань.</p><button type="button" class="btn primary block" data-go="survey">Почати спостереження</button></section>`;
  }
  const profile = profileForSurvey(survey, age);
  const program = buildProgram(profile, age);
  const currentIndex = currentProgramDayIndex(survey, program.length);
  const currentDay = program[currentIndex];
  programState = { age, program, openDay: null, currentDay: currentDay ? currentDay.day : null, currentIndex, selected: { ...(cc().programSelections[String(age)] || {}) } };
  return `
    <section class="screen-pad has-thumb-action">
      <h1 tabindex="-1">Гра на сьогодні</h1>
      <p class="muted">Одна коротка ідея — цього достатньо. Зупиніться раніше, якщо дитина втомилася або втратила інтерес.</p>
      <div id="programToday"></div>
      <details class="week-plan">
        <summary><span>Наступні 6 днів</span><span class="muted small">Переглянути план</span></summary>
        <div class="program-list" id="programList"></div>
      </details>
    </section>`;
}

function afterProgramRender() { renderProgramList(); }

function renderProgramList() {
  const list = document.getElementById("programList");
  const today = document.getElementById("programToday");
  if (!list || !today || !programState.program) return;
  const visibleDays = Array.from({ length: Math.min(7, programState.program.length) }, (_, offset) =>
    programState.program[(programState.currentIndex + offset) % programState.program.length]);
  today.innerHTML = visibleDays[0] ? todayActivityHtml(programState.age, visibleDays[0]) : "";
  list.innerHTML = visibleDays.slice(1).map((d) => dayAccordionHtml(programState.age, d)).join("");
}

function dayChip(age, dayNum, id, sel) {
  const a = activityById(age, id);
  return a ? `<button type="button" class="day-opt ${id === sel ? "active" : ""}" data-day-opt="${dayNum}" data-opt="${id}" aria-pressed="${id === sel}">${esc(a.title)}</button>` : "";
}

function dayChoiceHtml(age, d, sel) {
  const opts = d.options.length > 1
    ? `<p class="bonus-label">Основні ідеї:</p><div class="day-opts">${d.options.map((id) => dayChip(age, d.day, id, sel)).join("")}</div>`
    : "";
  const bonus = (d.bonus || []).filter((b) => activityById(age, b.id));
  const bonusHtml = bonus.length
    ? `<p class="bonus-label">Інші легкі ідеї:</p><div class="day-opts bonus">${bonus.map((b) => dayChip(age, d.day, b.id, sel)).join("")}</div>`
    : "";
  if (!opts && !bonusHtml) return "";
  return `<details class="activity-switcher"><summary>Хочете іншу гру?</summary><div class="activity-switcher-body">${opts}${bonusHtml}</div></details>`;
}

function dayBodyHtml(age, d) {
  const sel = programState.selected[d.day] || d.options[0];
  return `${activityDetailHtml(age, sel)}${dayChoiceHtml(age, d, sel)}`;
}

function todayActivityHtml(age, d) {
  const sel = programState.selected[d.day] || d.options[0];
  const selectedDomain = domainOf(sel) || d.domain;
  const done = completedActivityToday(age)?.activityId === sel;
  return `
    <article class="day-acc open today-game">
      <div class="today-game-head">
        <span class="day-num">Сьогодні</span>
        <span class="chip">${DOMAIN_LABELS_SHORT[selectedDomain] || selectedDomain}</span>
      </div>
      <div class="day-acc-body">${dayBodyHtml(age, d)}</div>
    </article>
    <div class="thumb-action"><button type="button" id="toggleTodayDone" class="btn ${done ? "ghost" : "primary"}" data-activity-id="${sel}" aria-pressed="${done}">${done ? "✓ Виконано сьогодні" : "Позначити виконаним"}</button></div>`;
}

function dayAccordionHtml(age, d) {
  const open = programState.openDay === d.day;
  const sel = programState.selected[d.day] || d.options[0];
  const selAct = activityById(age, sel);
  const selectedDomain = selAct ? domainOf(selAct.id) : d.domain;
  const bodyId = `day-body-${d.day}`;
  return `
    <article class="day-acc ${open ? "open" : ""}">
      <button type="button" class="day-acc-head" data-day-toggle="${d.day}" aria-expanded="${open}" ${open ? `aria-controls="${bodyId}"` : ""}>
        <span class="day-acc-meta"><span class="day-num">День ${d.day}</span><span class="chip">${DOMAIN_LABELS_SHORT[selectedDomain] || selectedDomain}</span></span>
        <span class="day-acc-title">${esc(selAct ? selAct.title : "")}</span>
        <span class="day-acc-caret" aria-hidden="true">${open ? "▾" : "▸"}</span>
      </button>
      ${open ? `<div class="day-acc-body" id="${bodyId}">${dayBodyHtml(age, d)}</div>` : ""}
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
  const basis = a.why || a.evidence || note ? `<details class="evidence-details"><summary>Чому ця гра тут</summary>
    ${a.why ? `<p>${esc(a.why)}</p>` : ""}
    ${a.evidence ? `<p><strong>Основа:</strong> ${esc(evidenceFriendly(a.evidence))}. <strong>Джерело:</strong> ${esc(sourceFriendly(a.source))}.</p>` : ""}
    ${note ? `<p><strong>Ідея ${esc(note.author)}:</strong> ${esc(note.idea)}.</p>` : ""}
  </details>` : "";
  return `
    <h2 class="activity-title">${esc(a.title)}</h2>
    <div class="tag-row activity-quick-meta"><span class="chip">${esc(a.time)}</span><span class="chip">${esc(a.materials)}</span></div>
    <div class="steps"><strong>Кроки</strong><ol>${a.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>
    <div class="stop"><strong>Коли зупинитися:</strong> ${esc(a.stop)}</div>
    ${basis}`;
}

// ---- progress ----
function snapshotQuestionIds(snap) {
  const saved = Array.isArray(snap && snap.questionIds) ? snap.questionIds : [];
  if (saved.length) return saved;
  const fromStates = Object.keys((snap && snap.states) || {});
  if (fromStates.length) return fromStates;
  return ((snap && MILESTONES_BY_AGE[snap.age]) || []).map((m) => m.id);
}

function snapshotCounts(snap) {
  const ids = snapshotQuestionIds(snap);
  const states = (snap && snap.states) || {};
  if (!Object.keys(states).length && snap && snap.counts) {
    return {
      observed: Number(snap.counts.observed) || 0,
      notSure: Number(snap.counts.notSure) || 0,
      notYet: Number(snap.counts.notYet) || 0
    };
  }
  return {
    observed: ids.filter((id) => states[id] === "yes").length,
    notSure: ids.filter((id) => states[id] === "not_sure").length,
    notYet: ids.filter((id) => states[id] === "not_yet").length
  };
}

function snapshotItems(snap, state) {
  const states = (snap && snap.states) || {};
  return snapshotQuestionIds(snap)
    .filter((id) => states[id] === state)
    .map((id) => milestoneById(snap.age, id))
    .filter(Boolean);
}

function snapshotChanges(current, previous) {
  if (!current || !previous || current.age !== previous.age) return { hasPrevious: false, newlyObserved: [], changed: [] };
  const currentStates = current.states || {};
  const previousStates = previous.states || {};
  const ids = [...new Set([...snapshotQuestionIds(previous), ...snapshotQuestionIds(current)])];
  const newlyObserved = [];
  const changed = [];
  ids.forEach((id) => {
    const milestone = milestoneById(current.age, id);
    if (!milestone) return;
    const before = previousStates[id];
    const after = currentStates[id];
    if (after === "yes" && before !== "yes") newlyObserved.push(milestone);
    else if (before && after && before !== after) changed.push({ milestone, before, after });
  });
  return { hasPrevious: true, newlyObserved, changed };
}

function historyAnswerGroup(snap, state) {
  const items = snapshotItems(snap, state);
  return `
    <section class="history-answer-group">
      <h3>${OBSERVATION_LABELS[state]} <span>${items.length}</span></h3>
      ${items.length ? `<ul>${items.map((m) => `<li>${esc(m.title)}</li>`).join("")}</ul>` : `<p class="muted small">Нічого не позначено.</p>`}
    </section>`;
}

function historyComparisonHtml(current, previous) {
  const change = snapshotChanges(current, previous);
  if (!change.hasPrevious) return `<p class="history-first-note">Це перше збережене спостереження для цього віку.</p>`;
  if (!change.newlyObserved.length && !change.changed.length) {
    return `<div class="history-change"><h3>Що змінилося у відповідях</h3><p>Відповіді збігаються з попереднім спостереженням цього віку.</p></div>`;
  }
  return `
    <div class="history-change">
      <h3>Що змінилося у відповідях</h3>
      ${change.newlyObserved.length ? `<div><strong>Тепер позначили «Бачу»</strong><ul>${change.newlyObserved.map((m) => `<li>${esc(m.title)}</li>`).join("")}</ul></div>` : ""}
      ${change.changed.length ? `<div><strong>Цього разу обрали іншу відповідь</strong><ul>${change.changed.map((item) => `<li>${esc(item.milestone.title)} — «${OBSERVATION_LABELS[item.before]}» → «${OBSERVATION_LABELS[item.after]}»</li>`).join("")}</ul></div>` : ""}
      <p class="muted small">Зміна відповіді — це нотатка спостереження, а не оцінка розвитку.</p>
    </div>`;
}

function historySnapshotHtml(snap, previous, isLatest) {
  const parsedDate = new Date(snap.date);
  const date = isNaN(parsedDate) ? "Дата не вказана" : parsedDate.toLocaleString("uk-UA", { dateStyle: "medium", timeStyle: "short" });
  const counts = snapshotCounts(snap);
  return `
    <article class="history-item ${isLatest ? "latest" : ""}">
      <div class="history-head">
        <div><span class="mini-label">${isLatest ? "Останнє спостереження" : "Збережене спостереження"}</span><h2>${AGE_LABELS[snap.age] || `${snap.age} міс.`}</h2></div>
        <time datetime="${esc(snap.date || "")}">${esc(date)}</time>
      </div>
      <div class="history-counts" aria-label="Підсумок відповідей">
        <div><strong>${counts.observed}</strong><span>Бачу</span></div>
        <div><strong>${counts.notSure}</strong><span>Ще спостерігаю</span></div>
        <div><strong>${counts.notYet}</strong><span>Ще не помічаю</span></div>
      </div>
      ${historyComparisonHtml(snap, previous)}
      <details class="history-details">
        <summary>Переглянути всі відповіді</summary>
        <div class="history-answer-list">
          ${historyAnswerGroup(snap, "yes")}
          ${historyAnswerGroup(snap, "not_sure")}
          ${historyAnswerGroup(snap, "not_yet")}
        </div>
      </details>
    </article>`;
}

function renderProgress() {
  const snaps = cc().snapshots.slice().reverse();
  const list = snaps.length ? snaps.map((snap, index) => {
    const previous = snaps.slice(index + 1).find((candidate) => candidate.age === snap.age) || null;
    return historySnapshotHtml(snap, previous, index === 0);
  }).join("") : `<div class="empty-state"><h2>Історія поки порожня</h2><p class="muted">Після першого завершеного спостереження тут з’явиться запис із датою та відповідями.</p><button type="button" class="btn primary" data-go="survey">Почати спостереження</button></div>`;
  const currentSurvey = cc().surveys[currentAge()];
  const updateButton = snaps.length ? `<button type="button" class="btn ghost block" data-go="survey" ${currentSurvey && currentSurvey.date ? 'data-restart="1"' : ""}>Оновити спостереження</button>` : "";
  return `
    <section class="screen-pad">
      <h1 tabindex="-1">Історія спостережень</h1>
      <p class="muted">Порівнюйте лише власні записи з різних дат. Це не оцінка, рейтинг або діагноз.</p>
      <div class="history-list">${list}</div>
      ${updateButton}
    </section>`;
}

// ---- ask ----
function visitDateLabel(value) {
  const date = new Date(value);
  return value && !isNaN(date) ? date.toLocaleDateString("uk-UA", { dateStyle: "medium" }) : "Ще не завершено";
}

function renderAsk() {
  const age = currentAge();
  const survey = cc().surveys[age] || { states: {}, questionIds: [] };
  const ids = survey.questionIds || [];
  const flagged = ids.map((id) => milestoneById(age, id)).filter((m) => m && (survey.states[m.id] === "not_yet" || survey.states[m.id] === "not_sure") && DISCUSS_BY_ID[m.id]);
  const prep = specialistPrepFor();
  const flaggedList = flagged.length
    ? `${calmDiscussionIntroHtml()}${flagged.map((m) => discussCardHtml(m, survey.states[m.id])).join("")}`
    : `<p class="muted small">У цьому спостереженні немає пунктів із підказкою для обговорення.</p>`;
  return `
    <section class="screen-pad${ids.length ? " has-thumb-action" : ""}">
      <h1 tabindex="-1">Підготовка до розмови</h1>
      <p class="muted">Зберіть спостереження й запитання в одному місці. Це нотатка для розмови, а не висновок про розвиток.</p>

      <article class="visit-overview" aria-label="Огляд останнього спостереження">
        <div class="visit-overview-head">
          <div><span class="mini-label">Останнє спостереження</span><h2>${esc(cc().name || "Дитина")} · ${esc(AGE_LABELS[age])}</h2></div>
          <time datetime="${esc(survey.date || "")}">${esc(visitDateLabel(survey.date))}</time>
        </div>
        ${ids.length ? `<p class="visit-ready-line">Автоматичний підсумок уже готовий.</p>` : `<p class="muted small">Спершу завершіть коротке спостереження — тоді тут з’явиться автоматичний підсумок.</p><button type="button" class="btn ghost block" data-go="survey">Почати спостереження</button>`}
        ${ids.length ? `<details class="visit-discuss"><summary>Що можна спокійно обговорити</summary><div class="visit-discuss-body">${flaggedList}</div></details>` : ""}
      </article>

      ${ids.length ? `<p class="local-note">Підсумок можна скопіювати одразу. Власні нотатки — необов’язкові.</p>
      <details class="visit-notes">
        <summary><span>Додати свої нотатки</span><span class="muted small">необов’язково</span></summary>
        <div class="visit-prep" aria-label="Ваші короткі нотатки">
          <label class="field"><span>Що ви помітили?</span><textarea id="prepNoticed" data-prep-field="noticed" rows="3" placeholder="Наприклад: коли кличу зліва, частіше повертає голову…">${esc(prep.noticed)}</textarea></label>
          <label class="field"><span>Що вже пробували?</span><textarea id="prepTried" data-prep-field="tried" rows="3" placeholder="Наприклад: короткі голосові ігри два дні…">${esc(prep.tried)}</textarea></label>
          <label class="field"><span>Що хочете запитати?</span><textarea id="prepQuestions" data-prep-field="questions" rows="3" placeholder="Наприклад: на що звернути увагу до наступного візиту?">${esc(prep.questions)}</textarea></label>
        </div>
      </details>
      <div class="thumb-action"><p id="copyStatus" class="thumb-status" role="status" aria-live="polite" aria-atomic="true"></p><button type="button" id="copySummary" class="btn primary">Скопіювати підсумок</button></div>` : ""}
    </section>`;
}

function summaryText() {
  const age = currentAge();
  const survey = cc().surveys[age] || { states: {}, questionIds: [] };
  const ids = survey.questionIds || [];
  const prep = specialistPrepFor();
  const pick = (st) => ids.map((id) => milestoneById(age, id)).filter((m) => m && survey.states[m.id] === st).map((m) => "- " + m.title).join("\n") || "- нічого не позначено";
  const note = (value) => value.trim() || "- немає";
  return `ПІДГОТОВКА ДО РОЗМОВИ З ФАХІВЦЕМ\n\nДитина: ${cc().name || "не вказано"}\nВік: ${AGE_LABELS[age]}\nДата спостереження: ${visitDateLabel(survey.date)}\nМета: нотатки для розмови про розвиток, не діагностика і не скринінг\n\nБачу:\n${pick("yes")}\n\nЩе спостерігаю:\n${pick("not_sure")}\n\nЩе не помічаю:\n${pick("not_yet")}\n\nЩО ПОМІТИЛИ\n${note(prep.noticed)}\n\nЩО ВЖЕ ПРОБУВАЛИ\n${note(prep.tried)}\n\nПИТАННЯ ДО ФАХІВЦЯ\n${note(prep.questions)}`;
}

// ---- snapshot on finishing a survey ----
function finishSurvey() {
  const age = currentAge();
  const survey = cc().surveys[age] || { states: {}, questionIds: [] };
  if (survey.date) return;
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
  cc().snapshots.push({ id: "snap_" + Date.now(), date: survey.date, age, questionIds: [...ids], states: { ...survey.states }, counts, domainYes });
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

function downloadBackup() {
  const contents = JSON.stringify(backupPayload(), null, 2);
  const url = URL.createObjectURL(new Blob([contents], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `milestones-backup-${localDateString()}.json`;
  a.click();
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
    if (confirm("Стерти всі локальні дані цього застосунку?")) {
      try {
        localStorage.removeItem(STORAGE_KEY);
        storageProblem = "";
        store = freshStore();
        setHash("welcome");
        route();
      } catch {
        storageProblem = "Браузер не зміг стерти локальні дані. Перевірте налаштування сховища.";
        renderStorageStatus();
      }
    }
    return;
  }
  if (e.target.id === "finishSurvey") { finishSurvey(); return; }
  const completionButton = e.target.closest("#toggleTodayDone");
  if (completionButton) {
    const key = completionKey(programState.age);
    const activityId = completionButton.dataset.activityId;
    const current = cc().activityCompletions[key];
    if (current && current.activityId === activityId) delete cc().activityCompletions[key];
    else cc().activityCompletions[key] = { activityId, completedAt: new Date().toISOString() };
    save();
    renderProgramList();
    document.getElementById("toggleTodayDone")?.focus({ preventScroll: true });
    return;
  }
  if (e.target.id === "exportBackup") {
    downloadBackup();
    dataNotice = "Резервну копію збережено. Не надсилайте цей файл стороннім.";
    const status = document.getElementById("backupStatus");
    if (status) status.textContent = dataNotice;
    return;
  }
  if (e.target.id === "chooseBackup") {
    document.getElementById("importBackup")?.click();
    return;
  }
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
    surveyAdvancePending = false;
    surveyAdvanceToken += 1;
    surveyUi.index = Math.max(0, surveyUi.index - 1);
    show("survey");
    return;
  }

  const stateBtn = e.target.closest(".state-controls button");
  if (stateBtn) {
    if (surveyAdvancePending) return;
    const wrap = stateBtn.closest(".state-controls");
    const age = currentAge();
    const currentIndex = surveyUi.index;
    cc().surveys[age] = cc().surveys[age] || { states: {}, questionIds: questionIdsFor(age) };
    cc().surveys[age].states[wrap.dataset.id] = stateBtn.dataset.state;
    save();
    wrap.querySelectorAll("button").forEach((b) => { b.classList.remove("active"); b.setAttribute("aria-pressed", "false"); });
    stateBtn.classList.add("active");
    stateBtn.setAttribute("aria-pressed", "true");
    const ids = cc().surveys[age].questionIds || [];
    const answered = ids.filter((id) => cc().surveys[age].states[id]).length;
    const saved = document.querySelector(".survey-progress-row span:last-child"); if (saved) saved.textContent = `${answered} збережено`;
    const status = document.getElementById("surveyAdvanceStatus");
    if (status) status.textContent = currentIndex >= ids.length - 1 ? "Збережено. Спокійно готуємо підсумок…" : "Збережено. Переходимо далі…";
    wrap.querySelectorAll("button").forEach((b) => { b.disabled = true; });
    surveyAdvancePending = true;
    const advanceToken = ++surveyAdvanceToken;
    window.setTimeout(() => {
      if (advanceToken !== surveyAdvanceToken) return;
      surveyAdvancePending = false;
      if (currentRoute() !== "survey" || currentAge() !== age) return;
      if (currentIndex >= ids.length - 1) finishSurvey();
      else { surveyUi.index = currentIndex + 1; show("survey"); }
    }, 450);
    return;
  }

  const dayToggle = e.target.closest("[data-day-toggle]");
  if (dayToggle) {
    const day = Number(dayToggle.dataset.dayToggle);
    programState.openDay = (programState.openDay === day) ? null : day;
    renderProgramList();
    document.querySelector(`[data-day-toggle="${day}"]`)?.focus({ preventScroll: true });
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
    document.querySelector(`[data-day-opt="${day}"][data-opt="${dayOpt.dataset.opt}"]`)?.focus({ preventScroll: true });
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
    if (hint) hint.textContent = checked.error || checked.months == null ? "" : `Показуватимемо питання для віку ${AGE_LABELS[ageWindowFor(checked.months)]}.`;
    if (error) error.textContent = checked.error;
    if (button) button.disabled = Boolean(checked.error);
    e.target.toggleAttribute("aria-invalid", Boolean(checked.error));
  }
  const prepField = e.target.dataset.prepField;
  if (prepField && ["noticed", "tried", "questions"].includes(prepField)) {
    specialistPrepFor()[prepField] = e.target.value;
    if (prepField === "noticed") cc().notes = e.target.value;
    save();
  }
});

document.addEventListener("change", async (e) => {
  if (e.target.id !== "importBackup") return;
  const input = e.target;
  const file = input.files && input.files[0];
  const status = document.getElementById("backupStatus");
  if (!file) return;
  if (file.size > MAX_BACKUP_BYTES) {
    dataNotice = "Файл завеликий для резервної копії Milestones.";
    if (status) status.textContent = dataNotice;
    input.value = "";
    return;
  }
  try {
    let parsed;
    try {
      parsed = JSON.parse(await file.text());
    } catch {
      dataNotice = "Файл не є коректною резервною копією Milestones.";
      if (status) status.textContent = dataNotice;
      return;
    }
    const checked = validateBackupPayload(parsed);
    if (!checked.ok) {
      dataNotice = checked.error;
      if (status) status.textContent = dataNotice;
      return;
    }
    if (!confirm("Відновлення замінить поточні локальні дані. Продовжити?")) return;
    store = checked.store;
    const restoredPersistently = save();
    dataNotice = restoredPersistently
      ? "Резервну копію відновлено локально."
      : "Копію відкрито, але браузер не зберіг її надовго. Не закривайте вкладку.";
    setHash("home");
    route();
  } catch {
    dataNotice = "Не вдалося прочитати резервну копію.";
    if (status) status.textContent = dataNotice;
  } finally {
    input.value = "";
  }
});

window.addEventListener("hashchange", route);
route();
