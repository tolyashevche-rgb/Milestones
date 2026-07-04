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

const PLAY_CONTEXTS = [
  { id: "any", label: "Будь-яка" },
  { id: "quick", label: "До 3 хв" },
  { id: "no_materials", label: "Без речей" },
  { id: "one_hand", label: "Одна рука" },
  { id: "quiet", label: "Тиха гра" },
  { id: "calming", label: "Заспокоїтися" },
  { id: "active", label: "Хоче рухатися" },
  { id: "low_energy", label: "Мало сил" }
];
const PLAY_CONTEXT_IDS = PLAY_CONTEXTS.map((context) => context.id);

const STORAGE_KEY = "milestonesMap.stage5.ua";
const MOTION_REVIEW_KEY = "milestonesMap.motionReview.ua.v1";
const MOTION_REVIEW_SESSIONS = [
  { id: "parent_1", label: "Мама 1", type: "parent" },
  { id: "parent_2", label: "Мама 2", type: "parent" },
  { id: "parent_3", label: "Мама 3", type: "parent" },
  { id: "parent_4", label: "Мама 4", type: "parent" },
  { id: "parent_5", label: "Мама 5", type: "parent" },
  { id: "expert", label: "Фахівець", type: "expert" }
];
const MOTION_REVIEW_CRITERIA = {
  parent: [
    { id: "action", label: "Дію зрозуміло за 5–8 секунд" },
    { id: "hands", label: "Зрозуміло, де мають бути руки" },
    { id: "stop", label: "Зрозуміло, коли зупинитися" }
  ],
  expert: [
    { id: "age", label: "Рух і поза відповідають віку" },
    { id: "posture", label: "Підтримка голови й тіла безпечна" },
    { id: "objects", label: "Предмети та поверхня безпечні" },
    { id: "supervision", label: "Нагляд дорослого показано коректно" }
  ]
};
const MOTION_REVIEW_STATUS_FILTERS = [
  { id: "pending", label: "Не перевірено" },
  { id: "issues", label: "Є «Ні»" },
  { id: "all", label: "Усі" }
];
const MOTION_REVIEW_AGE_FILTERS = ["all", "2", "4", "6", "9", "12"];
const MOTION_REVIEW_SESSION_SCHEMA = "milestones.motion-review-session.ua";
const MOTION_REVIEW_SESSION_VERSION = 2;
const MOTION_REVIEW_STORE_VERSION = 2;
const MOTION_REVIEW_CONTENT_VERSION = "motion-cards-2026-07-02-r1";
const MOTION_REVIEW_ORDER_VERSION = "balanced-session-order-v1";
const MOTION_REVIEW_CHECKPOINT_SIZE = 10;
const MAX_MOTION_REVIEW_SESSION_BYTES = 512 * 1024;
const BACKUP_SCHEMA = "milestones.stage5.ua.backup";
const BACKUP_VERSION = 1;
const MAX_BACKUP_BYTES = 2 * 1024 * 1024;
const CORRECTED_AGE_MIN_DAYS = 21;
let storageProblem = "";

function freshMotionReview() { return { storeVersion: MOTION_REVIEW_STORE_VERSION, active: "parent_1", view: { status: "pending", age: "all" }, sessions: {} }; }
function loadMotionReview() {
  try {
    const parsed = JSON.parse(localStorage.getItem(MOTION_REVIEW_KEY) || "null");
    if (!parsed || typeof parsed !== "object" || !MOTION_REVIEW_SESSIONS.some((session) => session.id === parsed.active)) return freshMotionReview();
    const legacyStore = parsed.storeVersion == null;
    parsed.storeVersion = MOTION_REVIEW_STORE_VERSION;
    parsed.sessions = parsed.sessions && typeof parsed.sessions === "object" ? parsed.sessions : {};
    Object.values(parsed.sessions).forEach((session) => {
      if (!session || typeof session !== "object") return;
      if (legacyStore && typeof session.contentVersion !== "string") session.contentVersion = MOTION_REVIEW_CONTENT_VERSION;
    });
    parsed.view = parsed.view && typeof parsed.view === "object" ? parsed.view : {};
    parsed.view.status = MOTION_REVIEW_STATUS_FILTERS.some((item) => item.id === parsed.view.status) ? parsed.view.status : "pending";
    parsed.view.age = MOTION_REVIEW_AGE_FILTERS.includes(String(parsed.view.age)) ? String(parsed.view.age) : "all";
    return parsed;
  } catch { return freshMotionReview(); }
}
function saveMotionReview() {
  try { localStorage.setItem(MOTION_REVIEW_KEY, JSON.stringify(motionReview)); return true; }
  catch { return false; }
}
function decodeQueryPart(value) {
  try { return decodeURIComponent(value || ""); }
  catch { return ""; }
}
function queryParam(name) {
  const query = String(location.search || "").replace(/^\?/, "");
  for (const part of query.split("&")) {
    if (!part) continue;
    const [rawKey, ...rawValue] = part.split("=");
    if (decodeQueryPart(rawKey) === name) return decodeQueryPart(rawValue.join("="));
  }
  return "";
}
function motionReviewReviewerSession() {
  const requested = queryParam("reviewSession");
  return MOTION_REVIEW_SESSIONS.find((session) => session.id === requested) || null;
}
function motionReviewReviewerUrl(sessionId) {
  const meta = MOTION_REVIEW_SESSIONS.find((session) => session.id === sessionId);
  if (!meta) return "";
  const pairs = String(location.search || "").replace(/^\?/, "").split("&").filter(Boolean)
    .filter((part) => decodeQueryPart(part.split("=")[0]) !== "reviewSession");
  pairs.push(`reviewSession=${encodeURIComponent(meta.id)}`);
  return `${location.origin || ""}${location.pathname || ""}?${pairs.join("&")}#/visual-pilot`;
}
function motionReviewInvitationText(sessionId) {
  const meta = MOTION_REVIEW_SESSIONS.find((session) => session.id === sessionId);
  if (!meta) return "";
  const roleInstruction = meta.type === "expert"
    ? "Оцініть відповідність віку, підтримку тіла, безпечність предметів і нагляд дорослого."
    : "Оцініть, чи зрозумілі дія, положення рук дорослого та момент зупинки.";
  return [
    "Вітаю! Допоможіть перевірити ілюстрації Milestones.",
    `Ваша окрема сесія: ${meta.label}.`,
    roleInstruction,
    "",
    "Як пройти перевірку:",
    "1. Відкрийте персональне посилання на телефоні.",
    "2. Спочатку дивіться на кожну картку 5–8 секунд, а потім відкривайте критерії.",
    "3. Прогрес зберігається на цьому пристрої; після кожних 10 карток можна зробити паузу.",
    "4. Після 59 карток натисніть «Зберегти сесію» та поверніть координатору JSON-файл.",
    "",
    `Персональне посилання: ${motionReviewReviewerUrl(meta.id)}`,
    "Будь ласка, не пересилайте це посилання іншому учаснику."
  ].join("\n");
}
function activeMotionReviewSession() {
  const reviewerSession = motionReviewReviewerSession();
  const meta = reviewerSession || MOTION_REVIEW_SESSIONS.find((session) => session.id === motionReview.active) || MOTION_REVIEW_SESSIONS[0];
  if (reviewerSession) motionReview.active = reviewerSession.id;
  motionReview.sessions[meta.id] = motionReview.sessions[meta.id] || { contentVersion: MOTION_REVIEW_CONTENT_VERSION, cards: {} };
  if (typeof motionReview.sessions[meta.id].contentVersion !== "string") motionReview.sessions[meta.id].contentVersion = MOTION_REVIEW_CONTENT_VERSION;
  motionReview.sessions[meta.id].cards = motionReview.sessions[meta.id].cards || {};
  return { meta, data: motionReview.sessions[meta.id] };
}
function motionReviewSessionStale(meta) {
  const data = motionReview.sessions?.[meta.id];
  return Boolean(data && data.contentVersion !== MOTION_REVIEW_CONTENT_VERSION);
}
function motionReviewCardComplete(card, criteria) {
  return criteria.every((criterion) => ["yes", "no"].includes(card?.[criterion.id]));
}
function motionReviewReviewedCount(meta, cards = {}) {
  const criteria = MOTION_REVIEW_CRITERIA[meta.type];
  return motionReviewCardIds().filter((id) => motionReviewCardComplete(cards[id], criteria)).length;
}
function motionReviewTimestamp(value) {
  const date = new Date(value || "");
  return isNaN(date) ? "" : date.toLocaleString("uk-UA", { dateStyle: "medium", timeStyle: "short" });
}
function motionReviewProgressText() {
  const { meta } = activeMotionReviewSession();
  const stats = motionReviewSessionStats(meta);
  return `Перевірено ${stats.reviewed} із ${stats.total}`;
}
function motionReviewCardIds() {
  return typeof ACTIVITY_RASTER_GUIDES === "object" ? Object.keys(ACTIVITY_RASTER_GUIDES) : [];
}
function motionReviewShuffledIds(ids, seedText) {
  let state = 2166136261;
  for (let index = 0; index < seedText.length; index += 1) {
    state ^= seedText.charCodeAt(index);
    state = Math.imul(state, 16777619) >>> 0;
  }
  const shuffled = [...ids];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const swapIndex = state % (index + 1);
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
}
function motionReviewSessionCardIds(meta) {
  const ages = MOTION_REVIEW_AGE_FILTERS.filter((age) => age !== "all");
  const sessionIndex = Math.max(0, MOTION_REVIEW_SESSIONS.findIndex((session) => session.id === meta.id));
  const rotatedAges = ages.map((_, index) => ages[(index + sessionIndex) % ages.length]);
  const buckets = Object.fromEntries(ages.map((age) => [age, motionReviewShuffledIds(
    motionReviewCardIds().filter((id) => Number(id.slice(4, 7)) === Number(age)),
    `${MOTION_REVIEW_ORDER_VERSION}:${meta.id}:${age}`
  )]));
  const ordered = [];
  const longest = Math.max(...ages.map((age) => buckets[age].length));
  for (let row = 0; row < longest; row += 1) {
    rotatedAges.forEach((age) => { if (buckets[age][row]) ordered.push(buckets[age][row]); });
  }
  return ordered;
}
function motionReviewSessionStats(meta) {
  const ids = motionReviewCardIds();
  const criteria = MOTION_REVIEW_CRITERIA[meta.type];
  const data = motionReview.sessions?.[meta.id] || {};
  const cards = data.cards || {};
  const stale = data.contentVersion != null && data.contentVersion !== MOTION_REVIEW_CONTENT_VERSION;
  const reviewed = stale ? 0 : motionReviewReviewedCount(meta, cards);
  const issues = ids.reduce((sum, id) => sum + criteria.filter((criterion) => cards[id]?.[criterion.id] === "no").length, 0);
  return {
    reviewed,
    total: ids.length,
    issues,
    stale,
    sourceExportedAt: typeof data.sourceExportedAt === "string" ? data.sourceExportedAt : "",
    importedAt: typeof data.importedAt === "string" ? data.importedAt : ""
  };
}
function motionReviewCheckpoint(meta, data) {
  const stats = motionReviewSessionStats(meta);
  const reviewed = stats.reviewed;
  const due = !stats.stale && reviewed > 0 && reviewed < stats.total
    && reviewed % MOTION_REVIEW_CHECKPOINT_SIZE === 0
    && data.checkpointAcknowledged !== reviewed;
  const nextAt = Math.min(stats.total, (Math.floor(reviewed / MOTION_REVIEW_CHECKPOINT_SIZE) + 1) * MOTION_REVIEW_CHECKPOINT_SIZE);
  return { due, reviewed, nextAt, remaining: Math.max(0, nextAt - reviewed) };
}
function motionReviewOverview() {
  const sessions = MOTION_REVIEW_SESSIONS.map((meta) => ({ meta, ...motionReviewSessionStats(meta) }));
  return {
    sessions,
    completeSessions: sessions.filter((item) => item.total > 0 && item.reviewed === item.total).length,
    issues: sessions.reduce((sum, item) => sum + item.issues, 0)
  };
}
function motionReviewReleaseGate() {
  const cards = motionReviewCardIds().map((id) => {
    let completedSessions = 0;
    let issues = 0;
    MOTION_REVIEW_SESSIONS.forEach((meta) => {
      const criteria = MOTION_REVIEW_CRITERIA[meta.type];
      const session = motionReview.sessions?.[meta.id] || {};
      const card = session.cards?.[id] || {};
      if (session.contentVersion === MOTION_REVIEW_CONTENT_VERSION && motionReviewCardComplete(card, criteria)) completedSessions += 1;
      issues += criteria.filter((criterion) => card[criterion.id] === "no").length;
    });
    const status = issues > 0 ? "issues" : completedSessions === MOTION_REVIEW_SESSIONS.length ? "ready" : "pending";
    return { id, status, completedSessions, issues };
  });
  return {
    cards,
    ready: cards.filter((card) => card.status === "ready").length,
    issues: cards.filter((card) => card.status === "issues").length,
    pending: cards.filter((card) => card.status === "pending").length,
    staleSessions: MOTION_REVIEW_SESSIONS.filter((meta) => motionReviewSessionStale(meta)).length
  };
}
function motionReviewView() {
  motionReview.view = motionReview.view && typeof motionReview.view === "object" ? motionReview.view : {};
  if (!MOTION_REVIEW_STATUS_FILTERS.some((item) => item.id === motionReview.view.status)) motionReview.view.status = "pending";
  if (!MOTION_REVIEW_AGE_FILTERS.includes(String(motionReview.view.age))) motionReview.view.age = "all";
  motionReview.view.age = String(motionReview.view.age);
  return motionReview.view;
}
function motionReviewEntries(meta, data) {
  const criteria = MOTION_REVIEW_CRITERIA[meta.type];
  const view = motionReviewView();
  const stale = data.contentVersion !== MOTION_REVIEW_CONTENT_VERSION;
  const reviewerSession = motionReviewReviewerSession();
  const ids = reviewerSession?.id === meta.id ? motionReviewSessionCardIds(meta) : motionReviewCardIds();
  return ids.map((id) => [id, ACTIVITY_RASTER_GUIDES[id]]).filter(([id]) => {
    if (view.age !== "all" && Number(id.slice(4, 7)) !== Number(view.age)) return false;
    const card = data.cards[id] || {};
    if (view.status === "pending") return stale || !motionReviewCardComplete(card, criteria);
    if (view.status === "issues") return criteria.some((criterion) => card[criterion.id] === "no");
    return true;
  });
}
function motionReviewStatusCounts(meta, data) {
  const criteria = MOTION_REVIEW_CRITERIA[meta.type];
  const view = motionReviewView();
  const ids = motionReviewCardIds().filter((id) => view.age === "all" || Number(id.slice(4, 7)) === Number(view.age));
  const stale = data.contentVersion !== MOTION_REVIEW_CONTENT_VERSION;
  return {
    all: ids.length,
    pending: stale ? ids.length : ids.filter((id) => !motionReviewCardComplete(data.cards[id], criteria)).length,
    issues: ids.filter((id) => criteria.some((criterion) => data.cards[id]?.[criterion.id] === "no")).length
  };
}
function motionReviewCsvCell(value) {
  return `"${String(value ?? "").replace(/"/g, '""')}"`;
}
function motionReviewCsv() {
  const ids = motionReviewCardIds();
  const rows = [["session_id", "учасник", "роль", "content_version", "activity_id", "назва_картки", "вік_міс", "criterion_id", "критерій", "відповідь", "картку_завершено", "нотатка"]];
  MOTION_REVIEW_SESSIONS.forEach((meta) => {
    const criteria = MOTION_REVIEW_CRITERIA[meta.type];
    const session = motionReview.sessions?.[meta.id] || {};
    const cards = session.cards || {};
    ids.forEach((id) => {
      const age = Number(id.slice(4, 7));
      const activity = activityById(age, id);
      const card = cards[id] || {};
      const complete = motionReviewCardComplete(card, criteria) ? "так" : "ні";
      criteria.forEach((criterion) => rows.push([
        meta.id,
        meta.label,
        meta.type === "expert" ? "фахівець" : "батьківська сесія",
        session.contentVersion || "",
        id,
        activity?.title || id,
        age,
        criterion.id,
        criterion.label,
        card[criterion.id] === "yes" ? "Так" : card[criterion.id] === "no" ? "Ні" : "",
        complete,
        card.note || ""
      ]));
    });
  });
  return "\uFEFF" + rows.map((row) => row.map(motionReviewCsvCell).join(",")).join("\r\n");
}
function motionReviewReleaseCsv() {
  const gate = motionReviewReleaseGate();
  const rows = [["activity_id", "назва_картки", "вік_міс", "стан_gate", "завершено_сесій", "усього_сесій", "відповідей_ні", "content_version"]];
  gate.cards.forEach((card) => {
    const age = Number(card.id.slice(4, 7));
    const activity = activityById(age, card.id);
    rows.push([
      card.id,
      activity?.title || card.id,
      age,
      card.status === "ready" ? "готова до рішення" : card.status === "issues" ? "потрібне виправлення" : "очікує перевірки",
      card.completedSessions,
      MOTION_REVIEW_SESSIONS.length,
      card.issues,
      MOTION_REVIEW_CONTENT_VERSION
    ]);
  });
  return "\uFEFF" + rows.map((row) => row.map(motionReviewCsvCell).join(",")).join("\r\n");
}
function motionReviewSessionPayload(sessionId = motionReview.active) {
  const meta = MOTION_REVIEW_SESSIONS.find((session) => session.id === sessionId) || MOTION_REVIEW_SESSIONS[0];
  const session = motionReview.sessions?.[meta.id] || {};
  const cards = session.cards || {};
  return {
    schema: MOTION_REVIEW_SESSION_SCHEMA,
    version: MOTION_REVIEW_SESSION_VERSION,
    contentVersion: session.contentVersion || MOTION_REVIEW_CONTENT_VERSION,
    reviewOrderVersion: MOTION_REVIEW_ORDER_VERSION,
    sessionId: meta.id,
    exportedAt: new Date().toISOString(),
    cards: JSON.parse(JSON.stringify(cards))
  };
}
function validateMotionReviewSessionPayload(payload) {
  const fail = (error) => ({ ok: false, error });
  if (!isRecord(payload) || payload.schema !== MOTION_REVIEW_SESSION_SCHEMA
    || payload.version !== MOTION_REVIEW_SESSION_VERSION || !isRecord(payload.cards)) {
    return fail("Це не схоже на файл review-сесії Milestones.");
  }
  if (payload.contentVersion !== MOTION_REVIEW_CONTENT_VERSION) {
    return fail("Цю сесію створено для іншої версії Motion Cards. Потрібне повторне рев’ю актуальних карток.");
  }
  if (typeof payload.exportedAt !== "string" || payload.exportedAt.length > 64 || isNaN(new Date(payload.exportedAt))) {
    return fail("У файлі немає коректної дати експорту review-сесії.");
  }
  const meta = MOTION_REVIEW_SESSIONS.find((session) => session.id === payload.sessionId);
  if (!meta) return fail("У файлі вказано невідому review-сесію.");
  const entries = Object.entries(payload.cards);
  if (entries.length > motionReviewCardIds().length) return fail("У файлі забагато карток.");
  const knownIds = new Set(motionReviewCardIds());
  const criteria = MOTION_REVIEW_CRITERIA[meta.type];
  const allowedFields = new Set([...criteria.map((criterion) => criterion.id), "note"]);
  const cards = {};
  for (const [id, card] of entries) {
    if (!knownIds.has(id) || !isRecord(card)) return fail("У файлі є невідома або пошкоджена картка.");
    if (Object.keys(card).some((key) => !allowedFields.has(key))) return fail("У файлі є невідомий критерій перевірки.");
    const normalized = {};
    for (const criterion of criteria) {
      if (card[criterion.id] == null) continue;
      if (!["yes", "no"].includes(card[criterion.id])) return fail("У файлі є невідома відповідь.");
      normalized[criterion.id] = card[criterion.id];
    }
    if (card.note != null) {
      if (typeof card.note !== "string" || card.note.length > 1000) return fail("У файлі є пошкоджена або задовга нотатка.");
      normalized.note = card.note;
    }
    cards[id] = normalized;
  }
  const allIds = motionReviewCardIds();
  const reviewed = motionReviewReviewedCount(meta, cards);
  return {
    ok: true,
    contentVersion: payload.contentVersion,
    sessionId: meta.id,
    exportedAt: new Date(payload.exportedAt).toISOString(),
    cards,
    reviewed,
    total: allIds.length,
    complete: allIds.length > 0 && reviewed === allIds.length
  };
}
function motionReviewImportWarnings(meta, checked, existingCards = {}) {
  const warnings = [];
  const existingReviewed = motionReviewReviewedCount(meta, existingCards);
  if (!checked.complete) warnings.push(`Файл є чернеткою: завершено ${checked.reviewed} із ${checked.total} карток.`);
  if (existingReviewed > 0) {
    if (checked.reviewed < existingReviewed) {
      warnings.push(`У браузері вже є повніша версія: ${existingReviewed} із ${checked.total} карток. Імпорт зменшить збережений прогрес.`);
    }
    warnings.push(`Імпорт замінить локальні відповіді сесії «${meta.label}».`);
  }
  return warnings;
}

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
function freshChild(name, dob, expectedDueDate = "") {
  return { id: "child_" + Date.now() + "_" + Math.random().toString(36).slice(2, 6),
           name: name || "", dob: dob || "", expectedDueDate: expectedDueDate || "",
           surveys: {}, snapshots: [], programSelections: {}, activityCompletions: {}, triedActivities: [], notes: "",
           favoriteActivities: [], activityReactions: {}, activityNotes: {}, playContext: "any",
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
    const c = freshChild(s.child.name, s.child.dob, s.child.expectedDueDate || "");
    c.surveys = s.surveys || {}; c.snapshots = s.snapshots || [];
    c.programSelections = s.programSelections || {};
    c.activityCompletions = s.activityCompletions || {};
    c.triedActivities = s.triedActivities || []; c.notes = s.notes || "";
    c.favoriteActivities = s.favoriteActivities || [];
    c.activityReactions = s.activityReactions || {};
    c.activityNotes = s.activityNotes || {};
    c.playContext = PLAY_CONTEXT_IDS.includes(s.playContext) ? s.playContext : "any";
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
function normalizeChild(child) {
  child.expectedDueDate = typeof child.expectedDueDate === "string" ? child.expectedDueDate : "";
  child.programSelections = isRecord(child.programSelections) ? child.programSelections : {};
  child.activityCompletions = isRecord(child.activityCompletions) ? child.activityCompletions : {};
  child.triedActivities = Array.isArray(child.triedActivities) ? child.triedActivities : [];
  child.favoriteActivities = Array.isArray(child.favoriteActivities) ? child.favoriteActivities : [];
  child.activityReactions = isRecord(child.activityReactions) ? child.activityReactions : {};
  child.activityNotes = isRecord(child.activityNotes) ? child.activityNotes : {};
  child.playContext = PLAY_CONTEXT_IDS.includes(child.playContext) ? child.playContext : "any";
  return child;
}
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
    const profileCheck = validateProfileDates(child.dob, child.expectedDueDate || "");
    if (typeof child.name !== "string" || child.name.length > 200
      || (child.expectedDueDate != null && typeof child.expectedDueDate !== "string") || profileCheck.error) {
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
    if (child.favoriteActivities != null && (!Array.isArray(child.favoriteActivities)
      || child.favoriteActivities.length > 500 || child.favoriteActivities.some((id) => typeof id !== "string"))) {
      return fail("У файлі є пошкоджені збережені ігри.");
    }
    if (child.activityReactions != null && (!isRecord(child.activityReactions)
      || Object.values(child.activityReactions).some((reaction) => !["liked", "repeat_later", "not_today", "hard"].includes(reaction)))) {
      return fail("У файлі є пошкоджені відгуки про ігри.");
    }
    if (child.activityNotes != null && (!isRecord(child.activityNotes)
      || Object.values(child.activityNotes).some((note) => typeof note !== "string" || note.length > 1000))) {
      return fail("У файлі є пошкоджені нотатки після ігор.");
    }
    if (child.playContext != null && !PLAY_CONTEXT_IDS.includes(child.playContext)) {
      return fail("У файлі є пошкоджені налаштування гри.");
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
    normalizeChild(child);
    child.specialistPrep = child.specialistPrep || emptySpecialistPrep(child.notes);
    specialistPrepFor(child);
  }
  imported.activeChildId = childIds.has(imported.activeChildId) ? imported.activeChildId : (imported.children[0]?.id || null);
  return { ok: true, store: imported };
}
// Active child — per-child data lives here. Null only before the first child exists.
function cc() { return store.children.find((c) => c.id === store.activeChildId) || store.children[0] || null; }
let store = load();
let motionReview = loadMotionReview();
store.children.forEach((c) => {
  normalizeChild(c);
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
function completedMonthsBetween(start, end = new Date()) {
  let months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  if (months > 0 && end.getDate() < start.getDate()) months -= 1;
  if (months < 0 && end.getDate() > start.getDate()) months += 1;
  return months;
}
function usesCorrectedAge(child) {
  const dob = parseLocalDate(child && child.dob);
  const due = parseLocalDate(child && child.expectedDueDate);
  return Boolean(dob && due && due > dob && (due - dob) / 86400000 > CORRECTED_AGE_MIN_DAYS);
}
function developmentalMonths(child) {
  if (!child || !child.dob) return null;
  if (usesCorrectedAge(child)) return completedMonthsBetween(parseLocalDate(child.expectedDueDate), new Date());
  return monthsSince(child.dob);
}
function validateProfileDates(dobStr, expectedDueDate = "") {
  if (!dobStr) return { months: null, error: "Вкажіть дату народження." };
  const dob = parseLocalDate(dobStr);
  if (!dob) return { months: null, error: "Вкажіть коректну дату народження.", field: "dob" };
  if (dob > new Date()) return { months: null, error: "Дата народження не може бути в майбутньому.", field: "dob" };
  let months = monthsSince(dobStr);
  let corrected = false;
  let earlyButNotCorrected = false;
  if (expectedDueDate) {
    const due = parseLocalDate(expectedDueDate);
    if (!due) return { months, error: "Вкажіть коректну очікувану дату пологів.", field: "expectedDueDate" };
    if (due <= dob) return { months, error: "Очікувана дата пологів має бути пізнішою за дату народження.", field: "expectedDueDate" };
    const daysEarly = (due - dob) / 86400000;
    if (daysEarly > CORRECTED_AGE_MIN_DAYS) {
      months = completedMonthsBetween(due, new Date());
      corrected = true;
    } else {
      earlyButNotCorrected = true;
    }
  }
  if (months > 12) return { months, corrected, error: "Зараз застосунок підтримує вік до 12 місяців.", field: corrected ? "expectedDueDate" : "dob" };
  return { months, corrected, earlyButNotCorrected, error: "", field: "" };
}
function validateDob(dobStr) { return validateProfileDates(dobStr); }
function profileAgeHint(check) {
  if (!check || check.months == null || check.error) return "";
  const label = AGE_LABELS[ageWindowFor(check.months)];
  if (check.corrected && check.months < 0) return `Очікувана дата пологів ще попереду. Найближчий доступний віковий блок — ${label}.`;
  if (check.corrected) return `Показуватимемо питання для віку ${label} за скоригованим віком.`;
  if (check.earlyButNotCorrected) return `Різниця не перевищує 3 тижні, тому показуватимемо питання для віку ${label} за датою народження.`;
  return `Показуватимемо питання для віку ${label}.`;
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
  delete cc().activityReactions[completionKey(age)];
  delete cc().activityNotes[completionKey(age)];
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

function currentAge() { const c = cc(); return c && c.dob ? ageWindowFor(developmentalMonths(c)) : 6; }
function profileForSurvey(survey, age) {
  const s = survey || { states: {}, questionIds: [] };
  return buildProfile(s.states || {}, age, ENGINE_CONFIG, s.questionIds || null);
}
function addCalendarDays(value, days) {
  const date = value instanceof Date ? new Date(value) : new Date(value);
  if (isNaN(date)) return null;
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() + days);
  return date;
}
function shortDate(value) {
  const date = value instanceof Date ? value : new Date(value);
  return isNaN(date) ? "—" : date.toLocaleDateString("uk-UA", { day: "numeric", month: "short" });
}
function observationRouteFor(survey, now = new Date()) {
  if (!survey || !survey.date) return { kind: "not-complete" };
  const states = Object.values(survey.states || {});
  const notYet = states.filter((state) => state === "not_yet").length;
  const notSure = states.filter((state) => state === "not_sure").length;
  if (notYet) return { kind: "discuss-now", count: notYet };
  if (notSure) {
    const earliest = addCalendarDays(survey.date, 7);
    const latest = addCalendarDays(survey.date, 14);
    const ready = earliest && calendarDayNumber(now) >= calendarDayNumber(earliest);
    return { kind: ready ? "recheck-ready" : "watch-window", count: notSure, earliest, latest };
  }
  return { kind: "age-window" };
}
function observationRouteHtml(survey, compact = false) {
  const followUp = observationRouteFor(survey);
  if (followUp.kind === "discuss-now") {
    return `<aside class="observation-route discuss-now" aria-labelledby="observationRouteTitle">
      <span class="mini-label">Не чекайте кінця плану</span><strong id="observationRouteTitle">Підготуйте розмову з фахівцем</strong>
      <p>Ви позначили «Ще не помічаю». Ігри можуть залишатися частиною дня, але не замінюють обговорення спостереження.</p>
      ${compact ? "" : '<button type="button" class="btn ghost" data-go="ask">Відкрити підсумок</button>'}
    </aside>`;
  }
  if (followUp.kind === "watch-window" || followUp.kind === "recheck-ready") {
    const ready = followUp.kind === "recheck-ready";
    return `<aside class="observation-route ${ready ? "recheck-ready" : "watch-window"}" aria-labelledby="observationRouteTitle">
      <span class="mini-label">Коротке повторне спостереження</span><strong id="observationRouteTitle">${ready ? "Можна спокійно перевірити ще раз" : `${shortDate(followUp.earliest)} — ${shortDate(followUp.latest)}`}</strong>
      <p>${ready ? "Минув щонайменше тиждень. Оновіть відповіді за звичайними моментами, а не одразу після вправи." : "До цього часу просто давайте безпечні можливості для гри й записуйте звичайні спостереження."}</p>
      ${ready && !compact ? '<button type="button" class="btn ghost" data-go="survey" data-restart="1">Оновити спостереження</button>' : ""}
    </aside>`;
  }
  return `<aside class="observation-route age-window"><span class="mini-label">Спостереження триває щодня</span><strong>Віковий чекліст — лише контрольна точка</strong><p>Якщо щось непокоїть або дитина втратила навичку, не чекайте наступного вікового інтервалу.</p></aside>`;
}
function calendarDayNumber(value) {
  const date = value instanceof Date ? value : new Date(value);
  if (isNaN(date)) return null;
  return Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
}
function weeklyPlaySummary(child = cc(), now = new Date()) {
  const summary = { count: 0, liked: 0, repeatLater: 0, notToday: 0, hard: 0, notes: 0 };
  if (!child) return summary;
  const today = calendarDayNumber(now);
  for (const [key, completion] of Object.entries(child.activityCompletions || {})) {
    const match = /^(\d{4}-\d{2}-\d{2}):\d+$/.exec(key);
    const date = match ? parseLocalDate(match[1]) : null;
    const day = date ? calendarDayNumber(date) : null;
    const ageInDays = today == null || day == null ? null : today - day;
    if (ageInDays == null || ageInDays < 0 || ageInDays > 6 || !completion || !completion.activityId) continue;
    summary.count += 1;
    if (child.activityReactions?.[key] === "liked") summary.liked += 1;
    if (child.activityReactions?.[key] === "repeat_later") summary.repeatLater += 1;
    if (child.activityReactions?.[key] === "not_today") summary.notToday += 1;
    if (child.activityReactions?.[key] === "hard") summary.hard += 1;
    if (String(child.activityNotes?.[key] || "").trim()) summary.notes += 1;
  }
  return summary;
}
function weeklyRecapHtml(summary) {
  if (!summary || !summary.count) return "";
  const title = summary.count === 1 ? "Один теплий момент гри" : "Кілька теплих моментів гри";
  const memory = summary.count === 1
    ? "За останні 7 днів ви зберегли один короткий момент разом."
    : "За останні 7 днів ви кілька разів поверталися до короткої гри разом.";
  const liked = summary.liked ? `<p class="week-recap-note">Є гра, яку ви відзначили як приємну. Вона залишиться у вашому профілі.</p>` : "";
  const repeatLater = summary.repeatLater ? `<p class="week-recap-note">Гру «повторити пізніше» не показуватимемо одразу знову — вона м’яко повернеться за кілька днів.</p>` : "";
  const notToday = summary.notToday ? `<p class="week-recap-note">«Не сьогодні» — теж нормальна відповідь. Тут немає обов'язкової серії.</p>` : "";
  const hard = summary.hard ? `<p class="week-recap-note">Якщо було складно, наступні рекомендації віддадуть перевагу простішим ідеям.</p>` : "";
  const notes = summary.notes ? `<p class="week-recap-note">Збережено ${summary.notes} ${summary.notes === 1 ? "коротке спостереження" : "короткі спостереження"} після гри — без оцінювання навички.</p>` : "";
  return `<aside class="week-recap" aria-labelledby="weekRecapTitle">
    <div class="week-recap-mark" aria-hidden="true">${navIcon("play")}</div>
    <div><span class="mini-label">Ваш тиждень</span><h2 id="weekRecapTitle">${title}</h2>
      <p>${memory} Немає мінімуму: навіть один спокійний момент уже достатній.</p>${liked}${repeatLater}${notToday}${hard}${notes}</div>
  </aside>`;
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
function recentActivityNoteLines(age, child = cc(), now = new Date(), days = 14) {
  const today = calendarDayNumber(now);
  return Object.entries(child?.activityNotes || {}).flatMap(([key, note]) => {
    const match = /^(\d{4}-\d{2}-\d{2}):(\d+)$/.exec(key);
    const date = match ? parseLocalDate(match[1]) : null;
    const ageInDays = date ? today - calendarDayNumber(date) : Infinity;
    if (!match || Number(match[2]) !== age || ageInDays < 0 || ageInDays >= days || !String(note).trim()) return [];
    const activityId = child.activityCompletions?.[key]?.activityId;
    const activity = activityById(age, activityId);
    return [`- ${match[1]} · ${activity ? activity.title : "Гра"}: ${String(note).trim()}`];
  });
}
function privateMoments(child = cc(), limit = 3) {
  if (!child) return [];
  return Object.entries(child.activityNotes || {}).flatMap(([key, note]) => {
    const match = /^(\d{4}-\d{2}-\d{2}):(\d+)$/.exec(key);
    if (!match || !String(note).trim()) return [];
    const age = Number(match[2]);
    const completion = child.activityCompletions?.[key];
    const activity = completion?.activityId ? activityById(age, completion.activityId) : null;
    return [{ key, date: match[1], age, title: activity?.title || "Гра разом", note: String(note).trim() }];
  }).sort((a, b) => b.date.localeCompare(a.date)).slice(0, Math.max(0, limit));
}
function privateMomentsHtml(moments) {
  if (!Array.isArray(moments) || !moments.length) return "";
  return `<section class="private-moments" aria-labelledby="privateMomentsTitle">
    <div class="private-moments-head"><div><span class="mini-label">Лише в цьому профілі</span><h2 id="privateMomentsTitle">Маленькі моменти</h2></div><span>${moments.length} останні</span></div>
    <p>Це не стрічка досягнень і не оцінка розвитку — лише ваші короткі нотатки після гри.</p>
    <ul>${moments.map((moment) => `<li><div><time datetime="${esc(moment.date)}">${esc(shortDate(parseLocalDate(moment.date)))}</time><strong>${esc(moment.title)}</strong><p>${esc(moment.note)}</p></div><button type="button" data-delete-moment="${esc(moment.key)}" aria-label="Видалити момент: ${esc(moment.title)}">Видалити</button></li>`).join("")}</ul>
    <small>Показуємо максимум три записи. Вони не передаються назовні й входять до вашої приватної резервної копії.</small>
  </section>`;
}

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
  if (motionReviewReviewerSession()) return show("visual-pilot");
  // Onboarding gate: welcome first, then consent, then child profile.
  if (!store.consent || !store.consent.accepted) return show(r === "consent" ? "consent" : "welcome");
  if (!store.children.length) return show("profile");
  const known = ["home", "survey", "results", "program", "progress", "ask", "library", "visual-pilot", "profile", "consent", "welcome"];
  show(known.includes(r) ? r : "home");
}

function show(screen) {
  const root = document.getElementById("screen");
  const renderers = {
    welcome: renderWelcome, consent: renderConsent, profile: renderProfile,
    home: renderHome, survey: renderSurvey, results: renderResults,
    program: renderProgram, progress: renderProgress, ask: renderAsk, library: renderLibrary,
    "visual-pilot": renderVisualPilot
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
  const onboarding = ["welcome", "consent", "profile"].includes(active) || Boolean(motionReviewReviewerSession());
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
  const reviewerSession = motionReviewReviewerSession();
  if (reviewerSession) {
    slot.innerHTML = `<strong>Перевірка Motion Cards</strong><span class="appbar-tag">${esc(reviewerSession.label)}</span>`;
    return;
  }
  const onboarding = ["welcome", "consent", "profile"].includes(screen);
  if (onboarding || !store.children.length) {
    slot.innerHTML = `<strong>Карта розвитку</strong><span class="appbar-tag">0–12 міс</span>`;
    return;
  }
  const active = cc();
  const opts = store.children.map((c, i) =>
    `<option value="${c.id}"${c.id === active.id ? " selected" : ""}>${esc(c.name || ("Дитина " + (i + 1)))}</option>`).join("");
  const ageTag = usesCorrectedAge(active) ? `${currentAge()} міс · скориг.` : AGE_LABELS[currentAge()];
  slot.innerHTML =
    `<select id="childSwitch" class="appbar-select" aria-label="Активна дитина">${opts}<option value="__add">+ Додати дитину</option></select>` +
    `<span class="appbar-tag"${usesCorrectedAge(active) ? ' title="Віковий блок за скоригованим віком"' : ""}>${ageTag}</span>`;
}

// ---- onboarding screens ----
function renderWelcome() {
  return `
    <section class="screen-pad center">
      <div class="logo-dot" aria-hidden="true">${navIcon("play")}</div>
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
  const profileCheck = c.dob ? validateProfileDates(c.dob, c.expectedDueDate || "") : { months: null, error: "" };
  const ageHint = profileAgeHint(profileCheck);
  return `
    <section class="screen-pad">
      <h1 tabindex="-1">Профіль дитини</h1>
      <p class="muted">Дата народження потрібна, щоб показати питання за віком. Ім'я можна не вказувати.</p>
      <label class="field"><span>Ім'я (необов'язково)</span><input id="childName" type="text" value="${esc(c.name || "")}" placeholder="Напр., Софія"></label>
      <label class="field"><span>Дата народження</span><input id="childDob" type="date" value="${esc(c.dob || "")}" max="${localDateString()}" required aria-describedby="ageHint profileError"></label>
      <details class="preterm-details" ${c.expectedDueDate ? "open" : ""}>
        <summary>Дитина народилася раніше очікуваного терміну?</summary>
        <p class="muted small">Якщо дитина народилася більш ніж на 3 тижні раніше, фахівці можуть враховувати скоригований вік. Вкажіть очікувану дату пологів — це необов'язково.</p>
        <label class="field"><span>Очікувана дата пологів</span><input id="expectedDueDate" type="date" value="${esc(c.expectedDueDate || "")}" aria-describedby="correctedAgeNote ageHint profileError"></label>
        <p id="correctedAgeNote" class="corrected-age-note">Дата допомагає лише обрати віковий блок. Це не оцінка розвитку дитини.</p>
      </details>
      <div id="ageHint" class="age-hint">${ageHint}</div>
      <div id="profileError" class="field-error" role="alert">${esc(profileCheck.error)}</div>
      <button type="button" id="profileSave" class="btn primary block" ${profileCheck.error || !c.dob ? "disabled" : ""}>${profileEditing ? "Зберегти зміни" : "Зберегти і продовжити"}</button>
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

  const followUp = observationRouteFor(survey);
  if (followUp.kind === "discuss-now") {
    return {
      kind: "discuss-now",
      label: "Не чекайте кінця плану",
      title: "Підготуйте розмову з фахівцем",
      body: "Ігри можуть підтримувати розвиток, але відповідь «Ще не помічаю» не варто перевіряти лише вправами.",
      cta: "Відкрити підсумок",
      route: "ask"
    };
  }
  if (followUp.kind === "recheck-ready") {
    return {
      kind: "recheck-ready",
      label: "Минув щонайменше тиждень",
      title: "Оновіть коротке спостереження",
      body: "Відповідайте за тим, що помічали у звичайних ситуаціях, а не лише одразу після гри.",
      cta: "Спостерігати ще раз",
      route: "survey",
      restart: true
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
  const action = step.route ? `<button type="button" class="btn primary" data-primary-action="${step.kind}" data-go="${step.route}" ${step.restart ? 'data-restart="1"' : ""}>${step.cta}</button>` : "";
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
  const weekly = weeklyPlaySummary();
  const moments = privateMoments();
  const next = nextCheckAge(age);
  const tested = survey && survey.date;
  return `
    <section class="screen-pad">
      <h1 tabindex="-1">Сьогодні</h1>

      ${homeNextStepHtml(nextStep)}

      ${tested ? observationRouteHtml(survey, true) : ""}

      ${weeklyRecapHtml(weekly)}

      ${privateMomentsHtml(moments)}

      <details class="home-more">
        <summary>Ще корисне</summary>
        <div class="tiles">
          <button type="button" class="tile" data-go="library"><strong>Бібліотека</strong><span class="muted">короткі перевірювані відповіді</span></button>
          ${tested ? `
          <button type="button" class="tile" data-go="program"><strong>Усі ігри</strong><span class="muted">найближчі сім днів</span></button>
          <button type="button" class="tile" data-go="progress"><strong>Історія</strong><span class="muted">ваші спостереження</span></button>
          <button type="button" class="tile" data-go="ask"><strong>Для фахівця</strong><span class="muted">підсумок і нотатки</span></button>
          <button type="button" class="tile" data-go="survey" data-restart="1"><strong>Оновити</strong><span class="muted">пройти ще раз</span></button>
          ${task ? `<button type="button" class="tile" id="addIcs"><strong>Разово в календар</strong><span class="muted">одне нагадування без серії</span></button>` : ""}
          ` : ""}
        </div>
      </details>

      ${next ? `<p class="note">Наступний віковий чекліст — приблизно у ${next} місяців. Спостереження й звернення при занепокоєнні не потрібно відкладати до цієї дати.</p>` : ""}
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

// ---- concise sourced library (E4 pilot) ----
let libraryUi = { query: "", topic: "all" };

function libraryItems() {
  return typeof LIBRARY_MATERIALS !== "undefined" && Array.isArray(LIBRARY_MATERIALS) ? LIBRARY_MATERIALS : [];
}

function normalizeLibrarySearch(value) {
  return String(value || "").toLocaleLowerCase("uk-UA")
    .replace(/[’'`]/g, "")
    .replace(/[^a-zа-яіїєґ0-9]+/giu, " ")
    .trim().replace(/\s+/g, " ");
}

function libraryIntentIdsForToken(token) {
  if (typeof LIBRARY_SEARCH_INTENTS === "undefined") return [];
  return LIBRARY_SEARCH_INTENTS
    .filter((intent) => intent.stems.some((stem) => token.startsWith(stem) || stem.startsWith(token)))
    .map((intent) => intent.id);
}

function libraryItemMatchesQuery(item, query) {
  const tokens = normalizeLibrarySearch(query).split(" ").filter(Boolean);
  if (!tokens.length) return true;
  const haystack = normalizeLibrarySearch([
    item.title, item.answer, item.doNow, item.topicLabel, item.searchTerms,
    item.source?.publisher, item.source?.title
  ].filter(Boolean).join(" "));
  const words = haystack.split(" ");
  return tokens.every((token) => {
    const textMatch = words.some((word) => word === token
      || (Math.min(word.length, token.length) >= 4 && (word.startsWith(token) || token.startsWith(word))));
    if (textMatch) return true;
    const tokenIntents = libraryIntentIdsForToken(token);
    return tokenIntents.some((intent) => (item.intents || [item.topic]).includes(intent));
  });
}

function filteredLibraryItems() {
  const query = normalizeLibrarySearch(libraryUi.query);
  const age = currentAge();
  return libraryItems().filter((item) => {
    if (libraryUi.topic !== "all" && item.topic !== libraryUi.topic) return false;
    return libraryItemMatchesQuery(item, query);
  }).sort((a, b) => Number(b.ages.includes(age)) - Number(a.ages.includes(age)));
}

function suggestedLibraryItems() {
  const age = currentAge();
  return libraryItems()
    .filter((item) => libraryUi.topic === "all" || item.topic === libraryUi.topic)
    .sort((a, b) => Number(b.ages.includes(age)) - Number(a.ages.includes(age)))
    .slice(0, 3);
}

function libraryCardHtml(item) {
  const age = currentAge();
  const ageLabel = item.ages.includes(age) ? `Для ${AGE_LABELS[age]}` : `Вік: ${item.ages.join(", ")} міс.`;
  return `<article class="library-card">
    <div class="library-card-head"><span class="chip">${esc(item.topicLabel)}</span><span class="library-age">${esc(ageLabel)}</span></div>
    <h2>${esc(item.title)}</h2>
    <p>${esc(item.answer)}</p>
    <div class="library-now"><strong>Що можна зробити зараз</strong><span>${esc(item.doNow)}</span></div>
    <div class="library-source-link">
      <span>Джерело</span>
      <a href="${esc(item.source.url)}" target="_blank" rel="noreferrer">${esc(item.source.publisher)} · ${esc(item.source.title)}</a>
    </div>
    <details class="library-source">
      <summary>Статус і застереження</summary>
      <div>
        <p><span class="review-status">Чернетка</span> Джерело звірено 2 липня 2026 року. Експертне рев’ю ще не завершено.</p>
        <p class="muted small">${esc(item.boundary)}</p>
      </div>
    </details>
  </article>`;
}

function libraryResultsHtml() {
  const items = filteredLibraryItems();
  const hasQuery = Boolean(normalizeLibrarySearch(libraryUi.query));
  const suggestions = hasQuery && !items.length ? suggestedLibraryItems() : [];
  const visibleItems = items.length ? items : suggestions;
  const status = items.length || !hasQuery
    ? `Знайдено: ${items.length}`
    : `Точного збігу поки немає · показуємо ${suggestions.length} корисні матеріали`;
  const fallback = suggestions.length ? `<div class="library-fallback"><strong>Спробуйте інакше</strong><span>Напишіть коротко: «сон», «плач», «прогулянка» або «годування».</span><button type="button" data-clear-library-search>Показати всі матеріали</button></div>` : "";
  return `<p id="libraryCount" class="library-count" role="status" aria-live="polite">${status}</p>
    ${fallback}<div class="library-list">${visibleItems.map(libraryCardHtml).join("")}</div>`;
}

function renderLibrary() {
  const topics = typeof LIBRARY_TOPICS !== "undefined" && Array.isArray(LIBRARY_TOPICS) ? LIBRARY_TOPICS : [];
  return `<section class="screen-pad library-screen">
    <button type="button" class="pilot-back" data-go="home">← На головну</button>
    <span class="pilot-kicker">Пілот · ${libraryItems().length} матеріалів</span>
    <h1 tabindex="-1">Короткі відповіді</h1>
    <p class="muted">Одне питання — одна практична відповідь на 2–3 хвилини. Матеріали освітні й поки мають статус чернетки.</p>
    <label class="library-search"><span>Пошук</span><input id="librarySearch" type="search" value="${esc(libraryUi.query)}" placeholder="Наприклад: прогулянка, сон або плач" autocomplete="off"></label>
    <div class="library-topics" role="group" aria-label="Фільтр за темою">${topics.map((topic) => `<button type="button" data-library-topic="${topic.id}" class="${libraryUi.topic === topic.id ? "active" : ""}" aria-pressed="${libraryUi.topic === topic.id}">${esc(topic.label)}</button>`).join("")}</div>
    <div id="libraryResults">${libraryResultsHtml()}</div>
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
  const followUp = observationRouteFor(survey);
  const primaryRoute = followUp.kind === "discuss-now" ? "ask" : "program";
  const primaryLabel = followUp.kind === "discuss-now" ? "Підготувати розмову" : "Почати гру на сьогодні";

  return `
    <section class="screen-pad has-thumb-action">
      <h1 tabindex="-1">Ваші спостереження</h1>
      <p class="muted">Короткий підсумок для віку ${AGE_LABELS[age]}. Це не оцінка і не діагноз.</p>
      ${observationRouteHtml(survey)}
      <article class="card">
        <span class="mini-label">Що ви помітили</span>
        ${domainSummary(age)}
      </article>

      <article class="card">
        <span class="mini-label">З чого почати</span>
        ${focusBlock}
      </article>

      ${discuss}

      <div class="thumb-action"><button type="button" class="btn primary" data-go="${primaryRoute}">${primaryLabel}</button></div>
    </section>`;
}

// ---- program (today first; alternatives and future days stay available but secondary) ----
let programState = { age: null, program: null, openDay: null, currentDay: null, selected: {}, context: "any", contextNotice: "" };

function activityMaxMinutes(value) {
  const text = String(value || "").toLowerCase();
  const match = /(\d+)(?:\s*-\s*(\d+))?\s*хв/.exec(text);
  if (!match) return Infinity;
  return Number(match[2] || match[1]);
}
function activityFitsContext(activity, context) {
  if (!activity || context === "any") return Boolean(activity);
  if (context === "quick") return activityMaxMinutes(activity.time) <= 3;
  if (context === "no_materials") return String(activity.materials || "").toLowerCase().includes("без матеріалів");
  if (context === "low_energy") return Boolean(typeof ACTIVITY_LOW_ENERGY_UA !== "undefined" && ACTIVITY_LOW_ENERGY_UA[activity.id]);
  if (["one_hand", "quiet", "calming", "active"].includes(context)) {
    return Boolean(typeof ACTIVITY_CONTEXT_TAGS_UA !== "undefined" && ACTIVITY_CONTEXT_TAGS_UA[context]?.includes(activity.id));
  }
  return false;
}
function activityReactionRank(id, child = cc(), now = new Date()) {
  if (!child) return 0;
  const today = calendarDayNumber(now);
  let rank = 0;
  for (const [key, reaction] of Object.entries(child.activityReactions || {})) {
    const completion = child.activityCompletions?.[key];
    if (!completion || completion.activityId !== id) continue;
    const match = /^(\d{4}-\d{2}-\d{2}):\d+$/.exec(key);
    const date = match ? parseLocalDate(match[1]) : null;
    const day = date ? calendarDayNumber(date) : null;
    const ageInDays = today == null || day == null ? Infinity : today - day;
    if (reaction === "liked" && ageInDays <= 30) rank = Math.max(rank, 2);
    if (reaction === "repeat_later" && ageInDays <= 2) rank = Math.min(rank, -4);
    else if (reaction === "repeat_later" && ageInDays <= 14) rank = Math.max(rank, 1);
    if (reaction === "not_today" && ageInDays <= 2) rank = Math.min(rank, -2);
    if (reaction === "hard" && ageInDays <= 14) rank = Math.min(rank, -3);
  }
  return rank;
}
function personalizedActivityIds(program, currentIndex = 0) {
  if (!Array.isArray(program) || !program.length) return [];
  const orderedDays = Array.from({ length: program.length }, (_, offset) => program[(currentIndex + offset) % program.length]);
  const ids = [];
  for (const day of orderedDays) {
    for (const id of day.options || []) if (!ids.includes(id)) ids.push(id);
    for (const bonus of day.bonus || []) if (bonus && bonus.id && !ids.includes(bonus.id)) ids.push(bonus.id);
  }
  return ids.map((id, index) => ({ id, index, rank: activityReactionRank(id) }))
    .sort((a, b) => b.rank - a.rank || a.index - b.index)
    .map((entry) => entry.id);
}
function contextActivityId(age, context) {
  return personalizedActivityIds(programState.program, programState.currentIndex)
    .find((id) => activityFitsContext(activityById(age, id), context)) || null;
}
function contextStatusText(context, found = true, done = false) {
  if (done) return "Гру на сьогодні вже збережено. Щоб змінити вибір, спершу скасуйте позначку «Виконано».";
  if (!found) return "У персональному плані зараз немає такої гри. Залишили поточну ідею.";
  if (context === "quick") return "Показуємо коротку гру тривалістю до 3 хвилин.";
  if (context === "no_materials") return "Показуємо гру без підготовки речей.";
  if (context === "one_hand") return "Показуємо гру, яку зручно запропонувати, коли вільна лише одна рука.";
  if (context === "quiet") return "Показуємо спокійну гру без зайвого шуму.";
  if (context === "calming") return "Показуємо м’яку ідею для спокійного контакту — без обіцянки миттєво припинити плач.";
  if (context === "active") return "Показуємо безпечну рухову гру за віком.";
  if (context === "low_energy") return "Показуємо полегшений варіант. Одного маленького кроку достатньо.";
  return "Показуємо основну рекомендацію для сьогодні.";
}
function playContextHtml(age) {
  const done = Boolean(completedActivityToday(age));
  const active = programState.context || "any";
  const status = done ? contextStatusText(active, true, true) : (programState.contextNotice || contextStatusText(active));
  return `<section class="play-context" aria-labelledby="playContextTitle">
    <div class="play-context-head"><strong id="playContextTitle">Підібрати під момент</strong><span>необов'язково</span></div>
    <p class="play-context-copy">Змінює лише сьогоднішню ідею, не відповіді спостереження.</p>
    <div class="play-context-options" role="group" aria-label="Контекст гри">${PLAY_CONTEXTS.map((context) =>
      `<button type="button" data-play-context="${context.id}" aria-pressed="${active === context.id}" class="${active === context.id ? "active" : ""}" ${done ? "disabled" : ""}>${context.label}</button>`
    ).join("")}</div>
    <p id="playContextStatus" class="play-context-status" role="status" aria-live="polite" aria-atomic="true">${esc(status)}</p>
  </section>`;
}

function playWeekCalendarHtml(program, currentIndex, now = new Date()) {
  if (!program.length) return "";
  const start = addCalendarDays(now, -currentIndex);
  const days = program.map((day, index) => {
    const date = addCalendarDays(start, index);
    const active = index === currentIndex;
    return `<li class="${active ? "active" : ""}" ${active ? 'aria-current="date"' : ""}>
      <span>${date ? date.toLocaleDateString("uk-UA", { weekday: "short" }) : `Д${index + 1}`}</span>
      <strong>${date ? date.getDate() : index + 1}</strong>
      <small>${esc(DOMAIN_LABELS_SHORT[day.domain] || day.domain)}</small>
    </li>`;
  }).join("");
  return `<section class="play-cycle" aria-labelledby="playCycleTitle">
    <div class="play-cycle-head"><div><span class="mini-label">Цикл 7 днів</span><strong id="playCycleTitle">${shortDate(start)} — ${shortDate(addCalendarDays(start, 6))}</strong></div><span>День ${currentIndex + 1} із 7</span></div>
    <ol>${days}</ol>
    <p>Одна гра — це можливість, а не лікувальна доза. Пропустити день нормально.</p>
  </section>`;
}

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
  const context = PLAY_CONTEXT_IDS.includes(cc().playContext) ? cc().playContext : "any";
  programState = { age, program, openDay: null, currentDay: currentDay ? currentDay.day : null, currentIndex, selected: { ...(cc().programSelections[String(age)] || {}) }, context, contextNotice: "" };
  if (currentDay && context !== "any") {
    const selectedId = programState.selected[currentDay.day] || currentDay.options[0];
    if (!activityFitsContext(activityById(age, selectedId), context)) {
      const replacement = contextActivityId(age, context);
      if (replacement) {
        programState.selected[currentDay.day] = replacement;
        cc().programSelections[String(age)] = cc().programSelections[String(age)] || {};
        cc().programSelections[String(age)][String(currentDay.day)] = replacement;
        save();
      } else {
        programState.contextNotice = contextStatusText(context, false);
      }
    }
  }
  return `
    <section class="screen-pad has-thumb-action">
      <h1 tabindex="-1">Гра на сьогодні</h1>
      <p class="muted">Одна коротка ідея — цього достатньо. Зупиніться раніше, якщо дитина втомилася або втратила інтерес.</p>
      ${observationRouteHtml(survey, true)}
      ${playWeekCalendarHtml(program, currentIndex)}
      <div id="playContext"></div>
      <div id="programToday"></div>
      <div id="savedGames"></div>
      <details class="week-plan">
        <summary><span>Наступні 6 днів</span><span class="muted small">Переглянути план</span></summary>
        <div class="program-list" id="programList"></div>
      </details>
    </section>`;
}

function renderVisualPilot() {
  const { meta: reviewMeta, data: reviewData } = activeMotionReviewSession();
  const reviewCriteria = MOTION_REVIEW_CRITERIA[reviewMeta.type];
  const reviewOverview = motionReviewOverview();
  const releaseGate = motionReviewReleaseGate();
  const reviewView = motionReviewView();
  const reviewerSession = motionReviewReviewerSession();
  const reviewerMode = Boolean(reviewerSession);
  if (reviewerMode) {
    reviewView.status = "pending";
    reviewView.age = "all";
  }
  const reviewerStats = motionReviewSessionStats(reviewMeta);
  const reviewSessionStale = reviewerStats.stale;
  const visualCount = typeof ACTIVITY_RASTER_GUIDES === "object" ? Object.keys(ACTIVITY_RASTER_GUIDES).length : 0;
  const matchingEntries = motionReviewEntries(reviewMeta, reviewData);
  const revisitId = reviewerMode && ACTIVITY_RASTER_GUIDES[reviewData.revisitId] ? reviewData.revisitId : "";
  const revisitEntry = revisitId ? [revisitId, ACTIVITY_RASTER_GUIDES[revisitId]] : null;
  const reviewCheckpoint = motionReviewCheckpoint(reviewMeta, reviewData);
  const checkpointDue = reviewerMode && !revisitId && reviewCheckpoint.due;
  const filteredEntries = reviewerMode ? (checkpointDue ? [] : revisitEntry ? [revisitEntry] : matchingEntries.slice(0, 1)) : matchingEntries;
  const filterCounts = motionReviewStatusCounts(reviewMeta, reviewData);
  const lastReviewedId = reviewerMode && ACTIVITY_RASTER_GUIDES[reviewData.lastReviewedId] ? reviewData.lastReviewedId : "";
  const lastReviewedAge = lastReviewedId ? Number(lastReviewedId.slice(4, 7)) : 0;
  const lastReviewedActivity = lastReviewedId ? activityById(lastReviewedAge, lastReviewedId) : null;
  const reviewerHistoryHtml = reviewerMode && !reviewSessionStale && (revisitId || lastReviewedId)
    ? `<div class="motion-reviewer-history"><span>${revisitId ? "Редагуєте попередню картку" : `Остання: ${esc(lastReviewedActivity?.title || lastReviewedId)}`}</span><button type="button" class="btn ghost" data-reviewer-history="${revisitId ? "queue" : "previous"}">${revisitId ? "Повернутися до черги" : "Виправити попередню відповідь"}</button></div>`
    : "";
  const checkpointHtml = checkpointDue ? `<section class="motion-review-checkpoint" aria-labelledby="motionReviewCheckpointTitle">
    <span>Прогрес збережено</span>
    <h2 id="motionReviewCheckpointTitle">${reviewCheckpoint.reviewed} карток готово — час перепочити</h2>
    <p>Коротка пауза допомагає дивитися на наступні ілюстрації свіжим поглядом. Можна закрити сторінку й повернутися пізніше або продовжити зараз.</p>
    <button type="button" id="continueMotionReviewCheckpoint" class="btn">Продовжити перевірку</button>
  </section>` : "";
  const sessionButtons = (reviewerMode ? [reviewMeta] : MOTION_REVIEW_SESSIONS).map((session) =>
    `<button type="button" data-review-session="${session.id}" aria-pressed="${session.id === reviewMeta.id}" class="${session.id === reviewMeta.id ? "active" : ""}"${reviewerMode ? " disabled" : ""}>${esc(session.label)}</button>`).join("");
  const overviewHtml = reviewerMode ? "" : `<div class="motion-review-overview" aria-label="Зведення перевірки">
    <div><strong>Зведення всіх сесій</strong><span>Завершено сесій: ${reviewOverview.completeSessions} із ${MOTION_REVIEW_SESSIONS.length} · Відповідей «Ні»: ${reviewOverview.issues}</span></div>
    <ul>${reviewOverview.sessions.map((item) => `<li><span>${esc(item.meta.label)}</span><b>${item.reviewed}/${item.total}</b>${item.stale ? "<em>Застаріла версія</em>" : item.issues ? `<em>${item.issues} «Ні»</em>` : ""}${item.sourceExportedAt ? `<small>Файл від ${esc(motionReviewTimestamp(item.sourceExportedAt))}${item.importedAt ? ` · імпортовано ${esc(motionReviewTimestamp(item.importedAt))}` : ""}</small>` : ""}</li>`).join("")}</ul>
    <button type="button" id="exportMotionReview" class="btn ghost">Експортувати CSV</button>
    <p>CSV містить критерії, відповіді та нотатки, але не профіль дитини. Перед надсиланням перегляньте нотатки.</p>
    <span id="motionReviewExportStatus" class="sr-status" role="status"></span>
  </div>`;
  const reviewerLinksHtml = reviewerMode ? "" : `<details class="motion-review-invites">
    <summary>Запуск рев’ю: посилання та запрошення</summary>
    <p>Надішліть кожному учаснику лише його готове запрошення. Воно містить персональне посилання, короткий протокол, паузи та інструкцію повернути JSON-файл.</p>
    <ul>${MOTION_REVIEW_SESSIONS.map((session) => `<li><span><b>${esc(session.label)}</b><small>${session.type === "expert" ? "перевірка безпеки" : "перевірка зрозумілості"}</small></span><a class="btn ghost" href="${esc(motionReviewReviewerUrl(session.id))}" target="_blank" rel="noopener">Відкрити</a><button type="button" class="btn ghost" data-copy-review-link="${session.id}">Копіювати запрошення</button></li>`).join("")}</ul>
    <p id="motionReviewLinkStatus" class="backup-status" role="status" aria-live="polite" aria-atomic="true"></p>
  </details>`;
  const transferHtml = `<section class="motion-session-transfer" aria-labelledby="motionSessionTransferTitle">
    <div><strong id="motionSessionTransferTitle">${reviewerMode ? "Завершити й передати сесію" : "Передати окрему сесію"}</strong><span>Зараз обрано: ${esc(reviewMeta.label)}</span></div>
    <p>Файл містить лише відповіді та нотатки цієї review-сесії — без профілю дитини й інших учасників. Завершена сесія має містити 59 із 59 перевірених карток; неповний файл імпортується лише як чернетка.</p>
    ${reviewerMode ? `<div class="motion-session-readiness ${reviewSessionStale ? "stale" : reviewerStats.reviewed === reviewerStats.total ? "complete" : ""}"><strong>${reviewSessionStale ? "Сесія застаріла" : reviewerStats.reviewed === reviewerStats.total ? "Сесію завершено" : `${reviewerStats.reviewed} із ${reviewerStats.total} карток`}</strong><span>${reviewSessionStale ? "Ці відповіді не можна передавати як рев’ю поточної версії." : reviewerStats.reviewed === reviewerStats.total ? "Файл готовий до передачі координатору." : "Збережений файл буде чернеткою; до перевірки можна повернутися на цьому пристрої."}</span></div>` : ""}
    <div>
      <button type="button" id="exportMotionSession" class="btn ghost">${reviewSessionStale ? "Зберегти стару копію" : reviewerMode && reviewerStats.reviewed < reviewerStats.total ? "Зберегти чернетку" : "Зберегти сесію"}</button>
      ${reviewerMode ? "" : '<button type="button" id="chooseMotionSession" class="btn">Імпортувати сесію</button><input id="importMotionSession" class="visually-hidden" type="file" accept="application/json,.json" tabindex="-1">'}
    </div>
    <p id="motionReviewTransferStatus" class="backup-status" role="status" aria-live="polite" aria-atomic="true"></p>
  </section>`;
  const releaseGateHtml = reviewerMode ? "" : `<section class="motion-release-gate" aria-labelledby="motionReleaseGateTitle">
    <div><strong id="motionReleaseGateTitle">Gate публікації</strong><span>Статус <code>approved</code> не встановлюється автоматично${releaseGate.staleSessions ? ` · застарілих сесій: ${releaseGate.staleSessions}` : ""}</span></div>
    <div class="motion-gate-stats">
      <div><b>${releaseGate.ready}</b><span>готові до рішення</span></div>
      <div><b>${releaseGate.issues}</b><span>потребують виправлення</span></div>
      <div><b>${releaseGate.pending}</b><span>очікують сесій</span></div>
    </div>
    <details><summary>Картки, що блокують випуск (${releaseGate.issues + releaseGate.pending})</summary>
      <ul>${releaseGate.cards.filter((card) => card.status !== "ready").map((card) => {
        const age = Number(card.id.slice(4, 7));
        const activity = activityById(age, card.id);
        return `<li><span>${esc(activity?.title || card.id)} · ${age} міс</span><b>${card.issues ? `${card.issues} «Ні»` : `${card.completedSessions}/${MOTION_REVIEW_SESSIONS.length} сесій`}</b></li>`;
      }).join("")}</ul>
    </details>
    <button type="button" id="exportMotionGate" class="btn ghost">Експортувати gate CSV</button>
    <p>Картка готова до фінального рішення лише після всіх шести сесій і без жодної відповіді «Ні».</p>
  </section>`;
  const gallery = filteredEntries.map(([id, guide]) => {
    const age = Number(id.slice(4, 7));
    const activity = activityById(age, id);
    const review = reviewData.cards[id] || {};
    const complete = !reviewSessionStale && motionReviewCardComplete(review, reviewCriteria);
    const revisitingThisCard = reviewerMode && revisitId === id;
    const criteriaHtml = reviewCriteria.map((criterion) => `<div class="pilot-review-row">
      <span>${esc(criterion.label)}</span>
      <div class="pilot-review-options" role="group" aria-label="${esc(criterion.label)}">
        <button type="button" data-motion-review="${id}" data-review-criterion="${criterion.id}" data-review-value="yes" aria-pressed="${review[criterion.id] === "yes"}" class="${review[criterion.id] === "yes" ? "active" : ""}"${reviewSessionStale ? " disabled" : ""}>Так</button>
        <button type="button" data-motion-review="${id}" data-review-criterion="${criterion.id}" data-review-value="no" aria-pressed="${review[criterion.id] === "no"}" class="${review[criterion.id] === "no" ? "active review-no" : ""}"${reviewSessionStale ? " disabled" : ""}>Ні</button>
      </div>
    </div>`).join("");
    return `<figure class="pilot-figure pilot-gallery-card${complete ? " review-complete" : ""}" data-review-card="${id}">
      <img src="${esc(guide.image)}" alt="${reviewerMode ? "Ілюстрація Motion Card для незалежної перевірки" : esc(guide.imageAlt)}" loading="lazy" decoding="async">
      ${reviewerMode ? `<figcaption><strong>Картка без назви</strong><span>${reviewMeta.type === "expert" ? `${age} міс · оцініть відповідність віку й безпеку` : "Оцініть лише те, що видно на зображенні"}</span></figcaption>` : `<figcaption><strong>${esc(activity ? activity.title : id)}</strong><span>${age} міс · чернетка до експертної перевірки</span></figcaption>`}
      <details class="pilot-review"${revisitingThisCard ? " open" : ""}><summary>${reviewerMode ? revisitingThisCard ? "Редагувати відповіді" : "Показати критерії після першого погляду" : complete ? "✓ Перевірено" : "Перевірити картку"}</summary>
        <div class="pilot-review-body">${criteriaHtml}
          <label>Нотатка<textarea rows="2" data-motion-review-note="${id}" placeholder="Що було незрозуміло або небезпечно?"${reviewSessionStale ? " disabled" : ""}>${esc(review.note || "")}</textarea></label>
        </div>
      </details>
    </figure>`;
  }).join("");
  return `<section class="screen-pad visual-pilot-screen">
    ${reviewerMode ? `<aside class="motion-reviewer-banner"><span>Ізольований режим рецензента</span><strong>${esc(reviewMeta.label)}</strong><p>Одна картка за раз. Після повної відповіді відкриється наступна. Профіль дитини, чужі відповіді й загальний gate недоступні.</p></aside>` : '<button type="button" class="pilot-back" data-go="program">← До розділу «Гра»</button>'}
    ${reviewerMode ? `<section class="motion-reviewer-protocol" aria-labelledby="reviewerProtocolTitle">
      <div class="pilot-kicker">Коротка незалежна перевірка</div>
      <h1 id="reviewerProtocolTitle" tabindex="-1">Що зрозуміло з ілюстрації?</h1>
      <p>Спочатку подивіться лише на картку 5–8 секунд. Потім відкрийте критерії та позначте «Так» або «Ні».</p>
      <ol><li>Не відкривайте питання до першого погляду.</li><li>Не шукайте «правильну» відповідь.</li><li>Нотатка потрібна лише коли хочеться пояснити проблему.</li><li>Можна зупинитися й повернутися пізніше на цьому пристрої.</li></ol>
    </section>` : `<div class="pilot-kicker">Пілот нового формату</div>
    <h1 tabindex="-1">Ілюстрована підказка до гри</h1>
    <p class="muted">Приклад власного стилю Milestones: одна послідовність, яку можна зрозуміти без довгого тексту.</p>
    <figure class="pilot-figure">
      <img src="activity-tummy-time-guide-v1.png" alt="Чотири послідовні сцени гри на животику: підготовка килимка, положення дитини під наглядом, спокійна взаємодія на рівні очей та завершення гри при втомі.">
      <figcaption>Міні-хвилинка на животику · візуальний прототип</figcaption>
    </figure>
    <div class="pilot-legend" aria-label="Послідовність ілюстрації">
      <span><b>1</b> Підготуйте</span><span><b>2</b> Розташуйтеся поруч</span>
      <span><b>3</b> Спостерігайте</span><span><b>4</b> Спокійно завершіть</span>
    </div>
    <div class="pilot-safety"><strong>Важливо:</strong> лише коли дитина не спить, на твердій рівній поверхні та під постійним наглядом дорослого.</div>
    <div class="pilot-gallery-head"><h2>Бібліотека з ${visualCount} карток</h2><p class="muted">Єдина візуальна мова, три повторювані сім’ї та фони, що пояснюють дію. Це робочі чернетки до перевірки фахівцем.</p></div>`}
    <section class="motion-review-toolbar" aria-labelledby="motionReviewTitle">
      <div><strong id="motionReviewTitle">Режим перевірки</strong><span id="motionReviewProgress" role="status">${motionReviewProgressText()}</span></div>
      <div class="motion-review-sessions" role="group" aria-label="Учасник перевірки">${sessionButtons}</div>
      <p>${reviewerMode ? "Відповіді зберігаються лише в цьому браузері. Після завершення збережіть файл сесії та передайте його координатору." : "Відповіді зберігаються лише в цьому браузері. Для кожної мами є окремий набір, а фахівець бачить критерії безпеки."}</p>
      ${reviewSessionStale ? `<aside class="motion-review-version-warning"><strong>Картки змінилися після цієї перевірки</strong><p>Старі відповіді збережено для історії, але вони не входять до release-gate.</p><button type="button" id="restartMotionReviewVersion" class="btn">Почати рев’ю актуальної версії</button></aside>` : ""}
      <section class="motion-review-filters" aria-labelledby="motionReviewFiltersTitle">
        <div><strong id="motionReviewFiltersTitle">${reviewerMode ? "Картка у фокусі" : "Коротка review-партія"}</strong><span id="motionReviewShown">${reviewerMode ? `У черзі ${matchingEntries.length}` : `Показано ${filteredEntries.length} із ${visualCount}`}</span></div>
        ${reviewerMode ? `<p class="motion-reviewer-queue-note">${checkpointDue ? "Рекомендована пауза · прогрес уже збережено" : `Лише неперевірені · віки чергуються · до паузи ${reviewCheckpoint.remaining} · порядок збережеться`}</p>` : `<span class="motion-filter-label">Вік</span>
        <div class="motion-filter-row" role="group" aria-label="Фільтр за віком">${MOTION_REVIEW_AGE_FILTERS.map((age) => `<button type="button" data-review-age-filter="${age}" aria-pressed="${reviewView.age === age}" class="${reviewView.age === age ? "active" : ""}">${age === "all" ? "Усі віки" : `${age} міс`}</button>`).join("")}</div>
        <span class="motion-filter-label">Статус</span>
        <div class="motion-filter-row" role="group" aria-label="Фільтр за статусом">${MOTION_REVIEW_STATUS_FILTERS.map((filter) => `<button type="button" data-review-status-filter="${filter.id}" aria-pressed="${reviewView.status === filter.id}" class="${reviewView.status === filter.id ? "active" : ""}">${esc(filter.label)} <b>${filterCounts[filter.id]}</b></button>`).join("")}</div>`}
      </section>
      ${reviewerHistoryHtml}
      ${overviewHtml}
      ${reviewerLinksHtml}
      ${reviewerMode ? "" : transferHtml}
      ${releaseGateHtml}
    </section>
    <div class="pilot-gallery${reviewerMode ? " reviewer-focus" : ""}">${checkpointHtml || gallery || `<div class="motion-review-empty"><strong>${reviewerMode && reviewView.status === "pending" && reviewerStats.reviewed === reviewerStats.total ? "Сесію повністю перевірено" : "У цій партії карток немає"}</strong><p>${reviewerMode && reviewView.status === "pending" && reviewerStats.reviewed === reviewerStats.total ? "Збережіть завершену сесію та передайте файл координатору." : reviewView.status === "issues" ? "Тут ще немає відповідей «Ні»." : "Оберіть інший вік або статус."}</p></div>`}</div>
    ${reviewerMode ? transferHtml : ""}
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
  const context = document.getElementById("playContext");
  if (context) context.innerHTML = playContextHtml(programState.age);
  const saved = document.getElementById("savedGames");
  if (saved) saved.innerHTML = savedGamesHtml(programState.age);
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
  const showLowEnergy = d.day === programState.currentDay && programState.context === "low_energy";
  return `${activityDetailHtml(age, sel, showLowEnergy)}${dayChoiceHtml(age, d, sel)}`;
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
      <div class="day-acc-body">${dayBodyHtml(age, d)}${done ? `${activityReactionHtml(age, sel)}${activityObservationHtml(age, sel)}` : ""}</div>
    </article>
    <div class="thumb-action"><button type="button" id="toggleTodayDone" class="btn ${done ? "ghost" : "primary"}" data-activity-id="${sel}" aria-pressed="${done}">${done ? "✓ Виконано сьогодні" : "Позначити виконаним"}</button></div>`;
}

function favoriteIcon(filled = false) {
  return `<svg class="favorite-icon" viewBox="0 0 20 20" ${filled ? 'fill="currentColor"' : 'fill="none"'} stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10 16.4 3.8 10.6C.7 7.7 2.3 3 6.3 3c1.7 0 2.9.9 3.7 2 0.8-1.1 2-2 3.7-2 4 0 5.6 4.7 2.5 7.6Z"/></svg>`;
}
function favoriteActivityIds(age) {
  return cc().favoriteActivities.filter((id) => activityById(age, id));
}
function savedGamesHtml(age) {
  const ids = favoriteActivityIds(age);
  if (!ids.length) return "";
  return `<details class="saved-games"><summary><span>Збережені ігри</span><span class="saved-count">${ids.length}</span></summary>
    <div class="saved-game-list">${ids.map((id) => {
      const activity = activityById(age, id);
      return `<button type="button" class="saved-game" data-saved-game="${id}"><strong>${esc(activity.title)}</strong><span>${esc(activity.time)} · ${esc(activity.materials)}</span></button>`;
    }).join("")}</div></details>`;
}
function activityReactionHtml(age, activityId) {
  const completion = completedActivityToday(age);
  if (!completion || completion.activityId !== activityId) return "";
  const reaction = cc().activityReactions[completionKey(age)] || "";
  const response = reaction === "repeat_later" ? "Добре — повернемо цю гру не одразу, а за кілька днів."
    : reaction === "hard" ? "Зрозуміло. Це не оцінка дитини — наступні ідеї будуть простішими."
    : "";
  return `<div class="activity-feedback" aria-labelledby="activityFeedbackTitle">
    <strong id="activityFeedbackTitle">Як вам ця гра сьогодні?</strong>
    <p>Необов'язково — відповідь збережеться лише у цьому профілі.</p>
    <div class="feedback-options">
      <button type="button" data-activity-reaction="liked" aria-pressed="${reaction === "liked"}" class="${reaction === "liked" ? "active" : ""}">Сподобалося</button>
      <button type="button" data-activity-reaction="repeat_later" aria-pressed="${reaction === "repeat_later"}" class="${reaction === "repeat_later" ? "active" : ""}">Повторити пізніше</button>
      <button type="button" data-activity-reaction="not_today" aria-pressed="${reaction === "not_today"}" class="${reaction === "not_today" ? "active" : ""}">Не сьогодні</button>
      <button type="button" data-activity-reaction="hard" aria-pressed="${reaction === "hard"}" class="${reaction === "hard" ? "active" : ""}">Було складно</button>
    </div>
    ${response ? `<p class="activity-feedback-response" role="status">${esc(response)}</p>` : ""}
  </div>`;
}

function activityObservationHtml(age, activityId) {
  const completion = completedActivityToday(age);
  if (!completion || completion.activityId !== activityId) return "";
  const key = completionKey(age);
  const note = cc().activityNotes[key] || "";
  return `<div class="activity-observation">
    <label for="activityObservation"><strong>Що саме ви помітили?</strong><span>Не оцінюйте результат вправи — запишіть конкретний звук, рух, погляд, інтерес або втому.</span></label>
    <textarea id="activityObservation" data-activity-note="${esc(key)}" rows="3" maxlength="1000" placeholder="Наприклад: двічі повернула голову на мій голос, потім відвернулася…">${esc(note)}</textarea>
    <p id="activityObservationStatus" role="status" aria-live="polite">${note ? "Збережено лише в цьому профілі." : "Необов’язково."}</p>
  </div>`;
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

function activityVisualGuideHtml(id) {
  if (typeof activityVisualGuide !== "function" || typeof motionCardArt !== "function") return "";
  const guide = activityVisualGuide(id);
  if (!guide) return "";
  let cards = Array.isArray(guide.cards) ? guide.cards : null;
  if (!cards && guide.image) {
    const age = Number(String(id).slice(4, 7));
    const activity = activityById(age, id);
    const steps = activity && Array.isArray(activity.steps) ? activity.steps : [];
    if (activity) cards = [
      { phase: "Підготуйте", text: steps[0] || activity.materials || "Оберіть спокійний момент." },
      { phase: "Зробіть", text: steps[1] || "Спокійно запропонуйте гру." },
      { phase: "Спостерігайте", text: steps.slice(2).join(" ") || "Дайте дитині час відповісти у власний спосіб." },
      { phase: "Зупиніться", text: activity.stop, stop: true }
    ];
  }
  if (!Array.isArray(cards)) return "";
  const visualCards = guide.image
    ? `<figure class="motion-guide-figure"><img src="${esc(guide.image)}" alt="${esc(guide.imageAlt || "Покрокова ілюстрація гри")}" loading="lazy" decoding="async"></figure>
      <div class="motion-image-steps">${cards.map((card, index) => `<div class="motion-image-step${card.stop ? " motion-image-step-stop" : ""}"><b>${index + 1}</b><span><strong>${esc(card.phase)}</strong>${esc(card.text)}</span></div>`).join("")}</div>`
    : `<div class="motion-card-grid">${cards.map((card, index) => `<article class="motion-card${card.stop ? " motion-card-stop" : ""}">
      <div class="motion-card-art" aria-hidden="true">${motionCardArt(card.art)}</div>
      <div class="motion-card-copy"><span>${index + 1}. ${esc(card.phase)}</span><p>${esc(card.text)}</p></div>
    </article>`).join("")}</div>`;
  return `<section class="motion-guide" aria-labelledby="motion-guide-${esc(id)}">
    <div class="motion-guide-head">
      <strong id="motion-guide-${esc(id)}">${esc(guide.title || "Як грати")}</strong>
      <span>4 короткі підказки</span>
    </div>
    ${visualCards}
    <p class="motion-guide-note">Не треба домагатися певної реакції — достатньо спокійно запропонувати й помітити відповідь дитини.</p>
  </section>`;
}

function activityDetailHtml(age, id, showLowEnergy = false) {
  const a = activityById(age, id);
  if (!a) return "";
  if (!cc().triedActivities.includes(id)) { cc().triedActivities.push(id); save(); }
  const note = (typeof authorNoteFor === "function") ? authorNoteFor(a.id) : null;
  const favorite = cc().favoriteActivities.includes(id);
  const lowEnergy = showLowEnergy && typeof ACTIVITY_LOW_ENERGY_UA !== "undefined" ? ACTIVITY_LOW_ENERGY_UA[id] : "";
  const visualGuide = activityVisualGuideHtml(id);
  // Plain-language note: keep author + the actionable idea; the internal mechanism mapping
  // stays in data for traceability but is not shown as jargon to parents.
  const basis = a.why || a.evidence || note ? `<details class="evidence-details"><summary>Чому ця гра тут</summary>
    ${a.why ? `<p>${esc(a.why)}</p>` : ""}
    ${a.evidence ? `<p><strong>Основа:</strong> ${esc(evidenceFriendly(a.evidence))}. <strong>Джерело:</strong> ${esc(sourceFriendly(a.source))}.</p>` : ""}
    ${note ? `<p><strong>Ідея ${esc(note.author)}:</strong> ${esc(note.idea)}.</p>` : ""}
  </details>` : "";
  return `
    <div class="activity-title-row"><h2 class="activity-title">${esc(a.title)}</h2>
      <button type="button" class="favorite-toggle ${favorite ? "active" : ""}" data-favorite-id="${id}" aria-pressed="${favorite}" aria-label="${favorite ? "Прибрати гру зі збережених" : "Зберегти гру"}">${favoriteIcon(favorite)}<span>${favorite ? "Збережено" : "Зберегти"}</span></button>
    </div>
    <div class="tag-row activity-quick-meta"><span class="chip">${esc(a.time)}</span><span class="chip">${esc(a.materials)}</span></div>
    ${lowEnergy ? `<div class="low-energy-option"><strong>Коли сил мало</strong><span>${esc(lowEnergy)}</span><small>Повні кроки й умова зупинки залишаються нижче.</small></div>` : ""}
    ${visualGuide}
    ${visualGuide ? `<details class="full-steps"><summary>Детальні кроки</summary><div class="steps"><ol>${a.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div></details>` : `<div class="steps"><strong>Кроки</strong><ol>${a.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol></div>`}
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
  const playNotes = recentActivityNoteLines(age);
  const pick = (st) => ids.map((id) => milestoneById(age, id)).filter((m) => m && survey.states[m.id] === st).map((m) => "- " + m.title).join("\n") || "- нічого не позначено";
  const note = (value) => value.trim() || "- немає";
  return `ПІДГОТОВКА ДО РОЗМОВИ З ФАХІВЦЕМ\n\nДитина: ${cc().name || "не вказано"}\nВік: ${AGE_LABELS[age]}\nДата спостереження: ${visitDateLabel(survey.date)}\nМета: нотатки для розмови про розвиток, не діагностика і не скринінг\n\nБачу:\n${pick("yes")}\n\nЩе спостерігаю:\n${pick("not_sure")}\n\nЩе не помічаю:\n${pick("not_yet")}\n\nСПОСТЕРЕЖЕННЯ ПІСЛЯ ІГОР ЗА ОСТАННІ 14 ДНІВ\n${playNotes.join("\n") || "- немає"}\n\nЩО ПОМІТИЛИ\n${note(prep.noticed)}\n\nЩО ВЖЕ ПРОБУВАЛИ\n${note(prep.tried)}\n\nПИТАННЯ ДО ФАХІВЦЯ\n${note(prep.questions)}`;
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
  const dt = new Date(); dt.setDate(dt.getDate() + 1); dt.setHours(9, 0, 0, 0);
  const end = new Date(dt); end.setMinutes(end.getMinutes() + 15);
  const stamp = (d) => d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Milestones//UA//", "BEGIN:VEVENT",
    "UID:" + Date.now() + "@milestones", "DTSTAMP:" + stamp(new Date()), "DTSTART:" + stamp(dt),
    "DTEND:" + stamp(end), "SUMMARY:" + title, "DESCRIPTION:Одне добровільне нагадування відкрити Milestones. Без серії та прострочення.", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
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

function downloadMotionReviewCsv() {
  const url = URL.createObjectURL(new Blob([motionReviewCsv()], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `milestones-motion-review-${localDateString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadMotionReviewReleaseCsv() {
  const url = URL.createObjectURL(new Blob([motionReviewReleaseCsv()], { type: "text/csv;charset=utf-8" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `milestones-motion-release-gate-${localDateString()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function downloadMotionReviewSession() {
  const payload = motionReviewSessionPayload();
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" }));
  const a = document.createElement("a");
  a.href = url;
  a.download = `milestones-motion-review-${payload.sessionId}-${localDateString()}.json`;
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

  const deleteMoment = e.target.closest("[data-delete-moment]");
  if (deleteMoment) {
    const key = deleteMoment.dataset.deleteMoment;
    if (!/^\d{4}-\d{2}-\d{2}:\d+$/.test(key) || !cc()?.activityNotes?.[key]) return;
    if (!confirm("Видалити цей приватний момент? Відновити його можна буде лише з раніше збереженої резервної копії.")) return;
    delete cc().activityNotes[key];
    save();
    route();
    return;
  }

  const libraryTopic = e.target.closest("[data-library-topic]");
  if (libraryTopic) {
    const requested = libraryTopic.dataset.libraryTopic;
    if (typeof LIBRARY_TOPICS === "undefined" || !LIBRARY_TOPICS.some((topic) => topic.id === requested)) return;
    libraryUi.topic = requested;
    route();
    document.querySelector(`[data-library-topic="${requested}"]`)?.focus({ preventScroll: true });
    return;
  }
  if (e.target.closest("[data-clear-library-search]")) {
    libraryUi.query = "";
    route();
    document.getElementById("librarySearch")?.focus({ preventScroll: true });
    return;
  }

  if (e.target.id === "exportMotionReview") {
    downloadMotionReviewCsv();
    const status = document.getElementById("motionReviewExportStatus");
    if (status) status.textContent = "CSV збережено. Перед передаванням перевірте нотатки.";
    return;
  }
  if (e.target.id === "exportMotionGate") {
    downloadMotionReviewReleaseCsv();
    const status = document.getElementById("motionReviewExportStatus");
    if (status) status.textContent = "Gate CSV збережено. Це зведення для рішення, а не автоматичне схвалення.";
    return;
  }
  if (e.target.id === "exportMotionSession") {
    downloadMotionReviewSession();
    const status = document.getElementById("motionReviewTransferStatus");
    if (status) status.textContent = "Сесію збережено локально. Перед передаванням перегляньте нотатки.";
    return;
  }
  if (e.target.id === "chooseMotionSession") {
    document.getElementById("importMotionSession")?.click();
    return;
  }
  if (e.target.id === "restartMotionReviewVersion") {
    const { meta } = activeMotionReviewSession();
    if (!confirm(`Почати нове рев’ю для «${meta.label}»? Старі локальні відповіді цієї сесії буде замінено.`)) return;
    motionReview.sessions[meta.id] = { contentVersion: MOTION_REVIEW_CONTENT_VERSION, cards: {} };
    saveMotionReview();
    route();
    return;
  }
  const reviewerHistory = e.target.closest("[data-reviewer-history]");
  if (reviewerHistory && motionReviewReviewerSession()) {
    const { data } = activeMotionReviewSession();
    if (data.contentVersion !== MOTION_REVIEW_CONTENT_VERSION) return;
    if (reviewerHistory.dataset.reviewerHistory === "previous" && ACTIVITY_RASTER_GUIDES[data.lastReviewedId]) {
      data.revisitId = data.lastReviewedId;
    } else if (reviewerHistory.dataset.reviewerHistory === "queue") {
      delete data.revisitId;
    } else return;
    saveMotionReview();
    route();
    return;
  }
  const copyReviewLink = e.target.closest("[data-copy-review-link]");
  if (copyReviewLink) {
    const sessionId = copyReviewLink.dataset.copyReviewLink;
    const meta = MOTION_REVIEW_SESSIONS.find((session) => session.id === sessionId);
    const status = document.getElementById("motionReviewLinkStatus");
    if (!meta) return;
    try {
      if (!navigator.clipboard?.writeText) throw new Error("clipboard unavailable");
      await navigator.clipboard.writeText(motionReviewInvitationText(meta.id));
      if (status) status.textContent = `Запрошення для «${meta.label}» скопійовано.`;
    } catch {
      if (status) status.textContent = "Не вдалося скопіювати. Відкрийте посилання й скопіюйте адресу браузера.";
    }
    return;
  }

  const reviewAgeFilter = e.target.closest("[data-review-age-filter]");
  if (reviewAgeFilter) {
    const requested = String(reviewAgeFilter.dataset.reviewAgeFilter);
    if (!MOTION_REVIEW_AGE_FILTERS.includes(requested)) return;
    motionReviewView().age = requested;
    saveMotionReview();
    route();
    document.querySelector(`[data-review-age-filter="${requested}"]`)?.focus({ preventScroll: true });
    return;
  }
  const reviewStatusFilter = e.target.closest("[data-review-status-filter]");
  if (reviewStatusFilter) {
    const requested = reviewStatusFilter.dataset.reviewStatusFilter;
    if (!MOTION_REVIEW_STATUS_FILTERS.some((item) => item.id === requested)) return;
    motionReviewView().status = requested;
    saveMotionReview();
    route();
    document.querySelector(`[data-review-status-filter="${requested}"]`)?.focus({ preventScroll: true });
    return;
  }

  const reviewSessionButton = e.target.closest("[data-review-session]");
  if (reviewSessionButton) {
    const requested = reviewSessionButton.dataset.reviewSession;
    if (motionReviewReviewerSession()) return;
    if (!MOTION_REVIEW_SESSIONS.some((session) => session.id === requested)) return;
    motionReview.active = requested;
    saveMotionReview();
    route();
    document.querySelector(`[data-review-session="${requested}"]`)?.focus({ preventScroll: true });
    return;
  }
  if (e.target.id === "continueMotionReviewCheckpoint") {
    const reviewer = motionReviewReviewerSession();
    if (!reviewer) return;
    const { meta, data } = activeMotionReviewSession();
    const checkpoint = motionReviewCheckpoint(meta, data);
    if (!checkpoint.due) return;
    data.checkpointAcknowledged = checkpoint.reviewed;
    saveMotionReview();
    route();
    return;
  }
  const motionReviewButton = e.target.closest("[data-motion-review]");
  if (motionReviewButton) {
    const id = motionReviewButton.dataset.motionReview;
    const criterion = motionReviewButton.dataset.reviewCriterion;
    const value = motionReviewButton.dataset.reviewValue;
    const { meta, data } = activeMotionReviewSession();
    const criteria = MOTION_REVIEW_CRITERIA[meta.type];
    if (data.contentVersion !== MOTION_REVIEW_CONTENT_VERSION || !ACTIVITY_RASTER_GUIDES[id]
      || !criteria.some((item) => item.id === criterion) || !["yes", "no"].includes(value)) return;
    data.cards[id] = data.cards[id] || {};
    if (data.cards[id][criterion] === value) delete data.cards[id][criterion];
    else data.cards[id][criterion] = value;
    saveMotionReview();
    const group = motionReviewButton.closest(".pilot-review-options");
    group?.querySelectorAll("button").forEach((button) => {
      const active = data.cards[id][criterion] === button.dataset.reviewValue;
      button.classList.toggle("active", active);
      button.classList.toggle("review-no", active && button.dataset.reviewValue === "no");
      button.setAttribute("aria-pressed", String(active));
    });
    const complete = motionReviewCardComplete(data.cards[id], criteria);
    const card = motionReviewButton.closest("[data-review-card]");
    card?.classList.toggle("review-complete", complete);
    const summary = card?.querySelector(".pilot-review summary");
    if (summary) summary.textContent = complete ? "✓ Перевірено" : "Перевірити картку";
    const progress = document.getElementById("motionReviewProgress");
    if (progress) progress.textContent = motionReviewProgressText();
    const counts = motionReviewStatusCounts(meta, data);
    document.querySelectorAll("[data-review-status-filter]").forEach((button) => {
      const count = button.querySelector("b");
      if (count) count.textContent = String(counts[button.dataset.reviewStatusFilter] || 0);
    });
    const view = motionReviewView();
    const hasIssue = criteria.some((item) => data.cards[id]?.[item.id] === "no");
    const leavesCurrentQueue = (view.status === "pending" && complete) || (view.status === "issues" && !hasIssue);
    if (motionReviewReviewerSession() && leavesCurrentQueue) {
      data.lastReviewedId = id;
      delete data.revisitId;
      saveMotionReview();
      route();
      return;
    }
    if (leavesCurrentQueue) card?.remove();
    const shownCards = document.querySelectorAll(".pilot-gallery-card").length;
    const shown = document.getElementById("motionReviewShown");
    if (shown) shown.textContent = `Показано ${shownCards} із ${motionReviewCardIds().length}`;
    const gallery = document.querySelector(".pilot-gallery");
    if (gallery && shownCards === 0 && !gallery.querySelector(".motion-review-empty")) {
      gallery.innerHTML = `<div class="motion-review-empty"><strong>У цій партії карток немає</strong><p>${view.status === "issues" ? "Тут ще немає відповідей «Ні»." : "Оберіть інший вік або статус."}</p></div>`;
    }
    return;
  }

  if (e.target.id === "consentContinue") {
    store.consent = { accepted: true, date: new Date().toISOString() }; save(); setHash("profile"); return;
  }
  if (e.target.id === "profileSave") {
    const name = document.getElementById("childName").value.trim();
    const dob = document.getElementById("childDob").value;
    const expectedDueDate = document.getElementById("expectedDueDate")?.value || "";
    const checked = validateProfileDates(dob, expectedDueDate);
    const error = document.getElementById("profileError");
    const input = document.getElementById(checked.field === "expectedDueDate" ? "expectedDueDate" : "childDob");
    if (checked.error) {
      if (error) error.textContent = checked.error;
      if (input) { input.setAttribute("aria-invalid", "true"); input.focus(); }
      return;
    }
    if (input) input.removeAttribute("aria-invalid");
    if (profileEditing && cc()) {
      cc().name = name;
      cc().dob = dob;
      cc().expectedDueDate = expectedDueDate;
    } else {
      const child = freshChild(name, dob, expectedDueDate);
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
  const contextButton = e.target.closest("[data-play-context]");
  if (contextButton) {
    const requested = contextButton.dataset.playContext;
    if (!PLAY_CONTEXT_IDS.includes(requested) || contextButton.disabled) return;
    const currentDay = programState.program.find((day) => day.day === programState.currentDay);
    const replacement = requested === "any" ? (currentDay && currentDay.options[0]) : contextActivityId(programState.age, requested);
    if (!replacement) {
      programState.contextNotice = contextStatusText(requested, false);
      renderProgramList();
      document.querySelector(`[data-play-context="${programState.context}"]`)?.focus({ preventScroll: true });
      return;
    }
    programState.context = requested;
    programState.contextNotice = contextStatusText(requested);
    cc().playContext = requested;
    programState.selected[programState.currentDay] = replacement;
    cc().programSelections[String(programState.age)] = cc().programSelections[String(programState.age)] || {};
    cc().programSelections[String(programState.age)][String(programState.currentDay)] = replacement;
    save();
    renderProgramList();
    document.querySelector(`[data-play-context="${requested}"]`)?.focus({ preventScroll: true });
    return;
  }
  const favoriteButton = e.target.closest("[data-favorite-id]");
  if (favoriteButton) {
    const id = favoriteButton.dataset.favoriteId;
    const index = cc().favoriteActivities.indexOf(id);
    if (index >= 0) cc().favoriteActivities.splice(index, 1);
    else cc().favoriteActivities.push(id);
    save();
    renderProgramList();
    document.querySelector(`[data-favorite-id="${id}"]`)?.focus({ preventScroll: true });
    return;
  }
  const savedGameButton = e.target.closest("[data-saved-game]");
  if (savedGameButton) {
    const id = savedGameButton.dataset.savedGame;
    const day = programState.currentDay;
    if (!activityById(programState.age, id) || day == null) return;
    programState.context = "any";
    programState.contextNotice = "";
    cc().playContext = "any";
    programState.selected[day] = id;
    cc().programSelections[String(programState.age)] = cc().programSelections[String(programState.age)] || {};
    cc().programSelections[String(programState.age)][String(day)] = id;
    save();
    renderProgramList();
    document.querySelector(`[data-favorite-id="${id}"]`)?.focus({ preventScroll: true });
    return;
  }
  const reactionButton = e.target.closest("[data-activity-reaction]");
  if (reactionButton) {
    const key = completionKey(programState.age);
    const reaction = reactionButton.dataset.activityReaction;
    if (!["liked", "repeat_later", "not_today", "hard"].includes(reaction) || !completedActivityToday(programState.age)) return;
    if (cc().activityReactions[key] === reaction) delete cc().activityReactions[key];
    else cc().activityReactions[key] = reaction;
    save();
    renderProgramList();
    document.querySelector(`[data-activity-reaction="${reaction}"]`)?.focus({ preventScroll: true });
    return;
  }
  const completionButton = e.target.closest("#toggleTodayDone");
  if (completionButton) {
    const key = completionKey(programState.age);
    const activityId = completionButton.dataset.activityId;
    const current = cc().activityCompletions[key];
    if (current && current.activityId === activityId) {
      delete cc().activityCompletions[key];
      delete cc().activityReactions[key];
      delete cc().activityNotes[key];
    } else {
      cc().activityCompletions[key] = { activityId, completedAt: new Date().toISOString() };
      delete cc().activityReactions[key];
    }
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
    if (day === programState.currentDay) {
      programState.context = "any";
      programState.contextNotice = "";
      cc().playContext = "any";
    }
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
  const activityNoteKey = e.target.dataset.activityNote;
  if (activityNoteKey && /^\d{4}-\d{2}-\d{2}:\d+$/.test(activityNoteKey)) {
    const value = e.target.value.slice(0, 1000);
    if (value.trim()) cc().activityNotes[activityNoteKey] = value;
    else delete cc().activityNotes[activityNoteKey];
    save();
    const status = document.getElementById("activityObservationStatus");
    if (status) status.textContent = value.trim() ? "Збережено лише в цьому профілі." : "Необов’язково.";
    return;
  }
  if (e.target.id === "librarySearch") {
    libraryUi.query = e.target.value.slice(0, 120);
    const results = document.getElementById("libraryResults");
    if (results) results.innerHTML = libraryResultsHtml();
    return;
  }
  const motionNoteId = e.target.dataset.motionReviewNote;
  if (motionNoteId && typeof ACTIVITY_RASTER_GUIDES === "object" && ACTIVITY_RASTER_GUIDES[motionNoteId]) {
    const { data } = activeMotionReviewSession();
    if (data.contentVersion !== MOTION_REVIEW_CONTENT_VERSION) return;
    data.cards[motionNoteId] = data.cards[motionNoteId] || {};
    data.cards[motionNoteId].note = e.target.value.slice(0, 1000);
    saveMotionReview();
    return;
  }
  if (e.target.id === "childSwitch") {
    const v = e.target.value;
    if (v === "__add") { profileEditing = false; setHash("profile"); return; }
    store.activeChildId = v; save(); route();
    return;
  }
  if (e.target.id === "childDob" || e.target.id === "expectedDueDate") {
    const dobInput = document.getElementById("childDob");
    const dueInput = document.getElementById("expectedDueDate");
    const hint = document.getElementById("ageHint");
    const error = document.getElementById("profileError");
    const button = document.getElementById("profileSave");
    const checked = validateProfileDates(dobInput?.value || "", dueInput?.value || "");
    if (hint) hint.textContent = profileAgeHint(checked);
    if (error) error.textContent = checked.error;
    if (button) button.disabled = Boolean(checked.error || !dobInput?.value);
    dobInput?.toggleAttribute("aria-invalid", checked.field === "dob");
    dueInput?.toggleAttribute("aria-invalid", checked.field === "expectedDueDate");
  }
  const prepField = e.target.dataset.prepField;
  if (prepField && ["noticed", "tried", "questions"].includes(prepField)) {
    specialistPrepFor()[prepField] = e.target.value;
    if (prepField === "noticed") cc().notes = e.target.value;
    save();
  }
});

document.addEventListener("change", async (e) => {
  if (e.target.id === "importMotionSession") {
    const input = e.target;
    const file = input.files && input.files[0];
    const status = document.getElementById("motionReviewTransferStatus");
    if (!file) return;
    if (file.size > MAX_MOTION_REVIEW_SESSION_BYTES) {
      if (status) status.textContent = "Файл завеликий для однієї review-сесії.";
      input.value = "";
      return;
    }
    try {
      let parsed;
      try { parsed = JSON.parse(await file.text()); }
      catch {
        if (status) status.textContent = "Файл не є коректною review-сесією Milestones.";
        return;
      }
      const checked = validateMotionReviewSessionPayload(parsed);
      if (!checked.ok) {
        if (status) status.textContent = checked.error;
        return;
      }
      const meta = MOTION_REVIEW_SESSIONS.find((session) => session.id === checked.sessionId);
      const existingCards = motionReview.sessions?.[checked.sessionId]?.cards || {};
      const importWarnings = motionReviewImportWarnings(meta, checked, existingCards);
      if (importWarnings.length && !confirm(`${importWarnings.join("\n")}\nПродовжити?`)) return;
      motionReview.sessions[checked.sessionId] = {
        contentVersion: checked.contentVersion,
        cards: checked.cards,
        sourceExportedAt: checked.exportedAt,
        importedAt: new Date().toISOString()
      };
      motionReview.active = checked.sessionId;
      const saved = saveMotionReview();
      route();
      const nextStatus = document.getElementById("motionReviewTransferStatus");
      if (nextStatus) nextStatus.textContent = saved
        ? checked.complete
          ? `Завершену сесію «${meta.label}» імпортовано: ${checked.reviewed} із ${checked.total} карток. Дані додано до зведеного gate.`
          : `Чернетку «${meta.label}» імпортовано: ${checked.reviewed} із ${checked.total} карток. Gate врахує лише завершені картки.`
        : `Сесію «${meta.label}» відкрито, але браузер не зберіг її надовго.`;
    } catch {
      if (status) status.textContent = "Не вдалося прочитати review-сесію.";
    } finally {
      input.value = "";
    }
    return;
  }
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
