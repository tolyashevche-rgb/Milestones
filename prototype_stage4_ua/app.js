// Дані — у data_ua.js (MILESTONES_BY_AGE, ACTIVITIES_BY_AGE, AGES, AGE_LABELS).
// Логіка персоналізації — у engine.js (buildProfile, buildProgram, DOMAIN_KEYS, domainOf).

let currentAge = 6;
let milestones = MILESTONES_BY_AGE[currentAge];
let activities = ACTIVITIES_BY_AGE[currentAge];

const DOMAIN_LABELS = {
  social: "Соціально-емоційний розвиток",
  language: "Мовлення і комунікація",
  cognitive: "Навчання і мислення",
  movement: "Рух і фізичний розвиток"
};

const state = {};
let selectedActivityId = null;
const storageKey = "milestonesMap.stage4.ua.developmentalMemory";

function loadMemory() {
  try {
    return JSON.parse(localStorage.getItem(storageKey)) || { states: {}, notes: "", triedActivities: [], snapshots: [] };
  } catch {
    return { states: {}, notes: "", triedActivities: [], snapshots: [] };
  }
}

function saveMemory(memory) {
  localStorage.setItem(storageKey, JSON.stringify(memory));
}

const memory = loadMemory();
Object.assign(state, memory.states || {});

function activityById(id) {
  return activities.find((a) => a.id === id);
}

function nextCheckAge(age) {
  return AGES.find((a) => a > age) || null;
}

function renderMilestones() {
  const list = document.getElementById("milestoneList");
  list.innerHTML = milestones.map((item) => `
    <article class="milestone-card">
      <div class="milestone-meta">
        <span>${item.domain}</span>
        <span>${item.source}</span>
      </div>
      <h4>${item.title}</h4>
      <p>${item.text}</p>
      <div class="state-controls" data-id="${item.id}">
        <button type="button" data-state="yes" class="${state[item.id] === "yes" ? "active" : ""}">Бачу</button>
        <button type="button" data-state="not_sure" class="${state[item.id] === "not_sure" ? "active" : ""}">Не впевнена</button>
        <button type="button" data-state="not_yet" class="${state[item.id] === "not_yet" ? "active" : ""}">Ще ні</button>
      </div>
    </article>
  `).join("");
}

function updateProgress() {
  memory.states = { ...state };
  saveMemory(memory);
  const observed = milestones.filter((item) => state[item.id] === "yes").length;
  document.getElementById("progressText").textContent = `${observed} з ${milestones.length} позначено`;
  document.getElementById("progressBar").style.width = `${(observed / milestones.length) * 100}%`;
  renderPlan();
  renderDiscuss();
  renderSummary();
  renderHistory();
}

function renderActivityById(id) {
  const item = activityById(id);
  const feature = document.getElementById("activityFeature");
  if (!feature) return;
  if (!item) { feature.innerHTML = ""; return; }
  selectedActivityId = id;
  if (!memory.triedActivities.includes(id)) {
    memory.triedActivities.push(id);
    saveMemory(memory);
  }
  feature.innerHTML = `
    <div class="tag-row">
      <span class="tag">${DOMAIN_LABELS[domainOf(item.id)] || item.domain}</span>
      <span class="tag">${item.time}</span>
      <span class="tag">${item.materials}</span>
    </div>
    <h4>${item.title}</h4>
    <p>${item.why}</p>
    ${item.evidence ? `<p class="source-line"><strong>Доказ:</strong> ${item.evidence} · <strong>Джерело:</strong> ${item.source}</p>` : ""}
    <div class="feature-steps">
      <div>
        <strong>Кроки</strong>
        <ol>${item.steps.map((step) => `<li>${step}</li>`).join("")}</ol>
      </div>
      <div>
        <strong>Коли зупинитись</strong>
        <p>${item.stop}</p>
      </div>
    </div>
  `;
  document.querySelectorAll(".act-chip").forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.actId === id);
  });
}

function renderPlan() {
  const profileBox = document.getElementById("profileBox");
  const programList = document.getElementById("programList");
  const feature = document.getElementById("activityFeature");
  if (!profileBox || !programList) return;

  const profile = buildProfile(state, currentAge);

  if (profile.notStarted) {
    profileBox.innerHTML = `<p class="panel-note">Позначте пункти у вкладці «Спостерігати», щоб отримати персональний тижневий план гри.</p>`;
    programList.innerHTML = "";
    if (feature) feature.innerHTML = "";
    return;
  }

  const strengthsTxt = profile.strengths.length ? profile.strengths.map((k) => DOMAIN_LABELS[k]).join(", ") : "—";
  let focusHtml;
  if (profile.allClear) {
    focusHtml = `<p>Чудово — ви позначили всі пункти цього віку і поки нічого не виділили для окремого фокусу. Продовжуйте гру, щоб підтримати те, що ще формується.</p>`;
  } else if (profile.partialClear) {
    focusHtml = `<p>Поки що нічого не виділено для окремого фокусу — це гарний знак. Ви позначили ${profile.answered} з ${profile.total} пунктів; решту можна позначити у «Спостерігати», щоб картина була повнішою. А поки — ось легкі ідеї для гри.</p>`;
  } else {
    const focusList = profile.focus.map((f) => `<li><strong>${DOMAIN_LABELS[f.domain]}</strong></li>`).join("");
    focusHtml = `<p>Найближчий тиждень м'яко зосередьте гру на:</p><ul class="focus-list">${focusList}</ul>`;
  }
  const next = nextCheckAge(currentAge);

  profileBox.innerHTML = `
    <span class="mini-label">Ваш фокус</span>
    <p><strong>Сильні напрямки:</strong> ${strengthsTxt}</p>
    ${focusHtml}
    <p class="panel-note">Це показує, де зосередити гру — це не оцінка і не діагноз. Якщо щось турбує, скористайтесь вкладкою «Запитати».</p>
    ${next ? `<p class="panel-note">Наступна перевірка milestones: близько ${next} місяців.</p>` : `<p class="panel-note">Це остання вікова сторінка в MVP.</p>`}
  `;

  const program = buildProgram(profile, currentAge);
  programList.innerHTML = program.map((day) => {
    const chips = day.options.map((id) => {
      const a = activityById(id);
      return a ? `<button type="button" class="act-chip" data-act-id="${id}">${a.title}</button>` : "";
    }).join("");
    return `
      <article class="day-card">
        <div class="day-head">
          <span class="day-num">День ${day.day}</span>
          <span class="tag">${DOMAIN_LABELS[day.domain] || day.domain}</span>
        </div>
        <div class="chip-row">${chips}</div>
      </article>
    `;
  }).join("");

  const firstId = program[0] && program[0].options[0];
  if (firstId) renderActivityById(firstId);
  else if (feature) feature.innerHTML = "";
}

// "Коли варто обговорити з фахівцем" — контекстні нотатки лише для пунктів, які батько
// позначив «Не впевнена» або «Ще ні». Це шар спостереження (бачення), не діагноз.
function renderDiscuss() {
  const box = document.getElementById("discussList");
  if (!box) return;
  const flagged = milestones.filter((item) => {
    const s = state[item.id];
    return (s === "not_yet" || s === "not_sure") && (typeof DISCUSS_BY_ID !== "undefined") && DISCUSS_BY_ID[item.id];
  });
  if (!flagged.length) {
    box.innerHTML = `<p class="panel-note">Поки немає пунктів, позначених «Не впевнена» або «Ще ні». Якщо щось з'явиться — спокійні орієнтири покажуться тут.</p>`;
    return;
  }
  box.innerHTML = flagged.map((item) => `
    <article class="discuss-card">
      <div class="milestone-meta">
        <span>${item.domain}</span>
        <span>${state[item.id] === "not_yet" ? "Ще ні" : "Не впевнена"}</span>
      </div>
      <h4>${item.title}</h4>
      <p>${DISCUSS_BY_ID[item.id]}</p>
    </article>
  `).join("");
}

function renderSummary() {
  const summary = document.getElementById("summaryBox");
  if (!summary) return;
  const observed = milestones.filter((item) => state[item.id] === "yes").map((item) => `- ${item.title}`).join("\n") || "- поки нічого не позначено";
  const unsure = milestones.filter((item) => state[item.id] === "not_sure").map((item) => `- ${item.title}`).join("\n") || "- поки нічого не позначено";
  const notYet = milestones.filter((item) => state[item.id] === "not_yet").map((item) => `- ${item.title}`).join("\n") || "- поки нічого не позначено";
  const notes = document.getElementById("parentNotes")?.value || "";
  memory.notes = notes;
  saveMemory(memory);
  summary.textContent = `Вік: ${AGE_LABELS[currentAge]}
Мета: нотатки для розмови про розвиток, не діагностика і не скринінг

Бачу:
${observed}

Не впевнена:
${unsure}

Ще ні:
${notYet}

Нотатки:
${notes || "- поки немає"}

Питання до фахівця:
1.
2.
3.`;
}

function buildSnapshot() {
  const profile = buildProfile(state, currentAge);
  const observed = milestones.filter((item) => state[item.id] === "yes").length;
  const notSure = milestones.filter((item) => state[item.id] === "not_sure").length;
  const notYet = milestones.filter((item) => state[item.id] === "not_yet").length;
  const domainYes = {};
  for (const k of DOMAIN_KEYS) domainYes[k] = { yes: profile.stats[k].yes, total: profile.stats[k].total };
  return {
    id: `snapshot_${Date.now()}`,
    date: new Date().toISOString(),
    ageLabel: AGE_LABELS[currentAge],
    age: currentAge,
    states: { ...state },
    notes: document.getElementById("parentNotes")?.value || "",
    triedActivities: [...memory.triedActivities],
    counts: { observed, notSure, notYet },
    domainYes
  };
}

function domainBars(profile) {
  return DOMAIN_KEYS.map((k) => {
    const s = profile.stats[k];
    const pct = s.total ? Math.round((s.yes / s.total) * 100) : 0;
    return `
      <div class="dbar">
        <span class="dbar-label">${DOMAIN_LABELS[k]}</span>
        <div class="dbar-track"><span style="width:${pct}%"></span></div>
        <em>${s.yes}/${s.total}</em>
      </div>`;
  }).join("");
}

function renderHistory() {
  const insight = document.getElementById("historyInsight");
  const list = document.getElementById("historyList");
  if (!insight || !list) return;

  const snapshots = memory.snapshots || [];
  const current = buildSnapshot();
  const profile = buildProfile(state, currentAge);
  const previous = snapshots.filter((s) => s.age === currentAge).slice(-1)[0];
  const previousObserved = previous?.counts?.observed ?? 0;
  const currentObserved = current.counts.observed;
  const newlyObserved = previous
    ? milestones.filter((item) => previous.states[item.id] !== "yes" && state[item.id] === "yes")
    : [];

  insight.innerHTML = `
    <strong>Позначено по напрямках (${AGE_LABELS[currentAge]})</strong>
    <div class="dbars">${domainBars(profile)}</div>
    <p>${previous ? `Порівняно з останнім snapshot цього віку: ${Math.max(0, currentObserved - previousObserved)} нових «бачу». ${newlyObserved.length ? `Нове: ${newlyObserved.map((item) => item.title).join(", ")}.` : "Нових позначок поки немає."}` : "Збережіть перший snapshot, щоб бачити зміни з часом."}</p>
    <p class="panel-note">Це timeline батьківських спостережень, не оцінка і не діагноз.</p>
  `;

  if (!snapshots.length) {
    list.innerHTML = `<div class="history-item"><h4>Збережених snapshot ще немає</h4><p class="panel-note">Позначте кілька пунктів, додайте нотатки і збережіть snapshot.</p></div>`;
    return;
  }

  list.innerHTML = snapshots.slice().reverse().map((snapshot) => {
    const date = new Date(snapshot.date).toLocaleString("uk-UA", { dateStyle: "medium", timeStyle: "short" });
    return `
      <article class="history-item">
        <h4>${snapshot.ageLabel} · ${date}</h4>
        <dl>
          <dt>Бачу</dt><dd>${snapshot.counts.observed}</dd>
          <dt>Не впевнена</dt><dd>${snapshot.counts.notSure}</dd>
          <dt>Ще ні</dt><dd>${snapshot.counts.notYet}</dd>
          <dt>Активності</dt><dd>${snapshot.triedActivities.length} відкрито</dd>
          <dt>Нотатки</dt><dd>${snapshot.notes || "Немає нотаток"}</dd>
        </dl>
      </article>
    `;
  }).join("");
}

function setAge(age) {
  if (!MILESTONES_BY_AGE[age]) return;
  currentAge = age;
  milestones = MILESTONES_BY_AGE[age];
  activities = ACTIVITIES_BY_AGE[age];
  selectedActivityId = null;

  document.querySelectorAll(".age-switcher button").forEach((button) => {
    button.classList.toggle("active", Number(button.dataset.age) === age);
  });

  const demoTitle = document.getElementById("demoAgeTitle");
  if (demoTitle) demoTitle.textContent = `Сторінка ${AGE_LABELS[age]}`;

  renderMilestones();
  updateProgress();
}

document.addEventListener("click", (event) => {
  const ageButton = event.target.closest(".age-switcher button");
  if (ageButton) {
    setAge(Number(ageButton.dataset.age));
  }

  const tab = event.target.closest(".tab");
  if (tab) {
    document.querySelectorAll(".tab").forEach((item) => item.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach((item) => item.classList.remove("active"));
    tab.classList.add("active");
    document.getElementById(tab.dataset.tab).classList.add("active");
  }

  const stateButton = event.target.closest(".state-controls button");
  if (stateButton) {
    const controls = stateButton.closest(".state-controls");
    state[controls.dataset.id] = stateButton.dataset.state;
    controls.querySelectorAll("button").forEach((button) => button.classList.remove("active"));
    stateButton.classList.add("active");
    updateProgress();
  }

  const chip = event.target.closest(".act-chip");
  if (chip) {
    renderActivityById(chip.dataset.actId);
    renderHistory();
  }

  if (event.target.id === "copySummary") {
    const text = document.getElementById("summaryBox").textContent;
    navigator.clipboard?.writeText(text);
    document.getElementById("copyStatus").textContent = "Підсумок скопійовано для тесту.";
  }

  if (event.target.id === "saveSnapshot") {
    memory.snapshots.push(buildSnapshot());
    saveMemory(memory);
    renderHistory();
  }

  if (event.target.id === "clearHistory") {
    memory.snapshots = [];
    saveMemory(memory);
    renderHistory();
  }
});

document.addEventListener("input", (event) => {
  if (event.target.id === "parentNotes") {
    memory.notes = event.target.value;
    saveMemory(memory);
    renderSummary();
    renderHistory();
  }
});

renderMilestones();
if (memory.notes) {
  const notes = document.getElementById("parentNotes");
  if (notes) notes.value = memory.notes;
}
updateProgress();
