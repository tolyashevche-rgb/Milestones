// Data lives in data.js (MILESTONES_BY_AGE, ACTIVITIES_BY_AGE, AGES, AGE_LABELS).
// Personalization logic lives in engine.js (buildProfile, buildProgram, DOMAIN_KEYS, domainOf).

let currentAge = 6;
let milestones = MILESTONES_BY_AGE[currentAge];
let activities = ACTIVITIES_BY_AGE[currentAge];

const DOMAIN_LABELS = {
  social: "Social & Emotional",
  language: "Language & Communication",
  cognitive: "Learning & Thinking",
  movement: "Movement & Physical"
};

const state = {};
let selectedActivityId = null;
const storageKey = "milestonesMap.stage4.developmentalMemory";

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
        <button type="button" data-state="yes" class="${state[item.id] === "yes" ? "active" : ""}">Observed</button>
        <button type="button" data-state="not_sure" class="${state[item.id] === "not_sure" ? "active" : ""}">Not sure</button>
        <button type="button" data-state="not_yet" class="${state[item.id] === "not_yet" ? "active" : ""}">Not yet</button>
      </div>
    </article>
  `).join("");
}

function updateProgress() {
  memory.states = { ...state };
  saveMemory(memory);
  const observed = milestones.filter((item) => state[item.id] === "yes").length;
  const progressText = document.getElementById("progressText");
  const progressBar = document.getElementById("progressBar");
  progressText.textContent = `${observed} of ${milestones.length} observed`;
  progressBar.style.width = `${(observed / milestones.length) * 100}%`;
  renderPlan();
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
    ${item.evidence ? `<p class="source-line"><strong>Evidence:</strong> ${item.evidence} · <strong>Source:</strong> ${item.source}</p>` : ""}
    <div class="feature-steps">
      <div>
        <strong>Steps</strong>
        <ol>${item.steps.map((step) => `<li>${step}</li>`).join("")}</ol>
      </div>
      <div>
        <strong>Stop rule</strong>
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
    profileBox.innerHTML = `<p class="panel-note">Mark the milestones in the "Watch" tab to get your personalised focus and a weekly play plan.</p>`;
    programList.innerHTML = "";
    if (feature) feature.innerHTML = "";
    return;
  }

  const strengthsTxt = profile.strengths.length ? profile.strengths.map((k) => DOMAIN_LABELS[k]).join(", ") : "—";
  let focusHtml;
  if (profile.allClear) {
    focusHtml = `<p>Lovely — you've marked every milestone for this age and nothing is flagged for special focus. Keep playing to support what's still emerging.</p>`;
  } else if (profile.partialClear) {
    focusHtml = `<p>Nothing is flagged for special focus yet — a good sign. You've marked ${profile.answered} of ${profile.total} items; you can mark the rest in "Watch" for a fuller picture. In the meantime, here are some light play ideas.</p>`;
  } else {
    const focusList = profile.focus.map((f) => `<li><strong>${DOMAIN_LABELS[f.domain]}</strong></li>`).join("");
    focusHtml = `<p>This week, gently focus play on:</p><ul class="focus-list">${focusList}</ul>`;
  }
  const next = nextCheckAge(currentAge);

  profileBox.innerHTML = `
    <span class="mini-label">Your focus this week</span>
    <p><strong>Strengths:</strong> ${strengthsTxt}</p>
    ${focusHtml}
    <p class="panel-note">This shows where to focus play — it is not a score or a diagnosis. If anything worries you, use the "Ask" tab.</p>
    ${next ? `<p class="panel-note">Next milestone check: around ${next} months.</p>` : `<p class="panel-note">This is the last age page in the MVP.</p>`}
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
          <span class="day-num">Day ${day.day}</span>
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

function renderSummary() {
  const summary = document.getElementById("summaryBox");
  if (!summary) return;

  const observed = milestones.filter((item) => state[item.id] === "yes").map((item) => `- ${item.title}`).join("\n") || "- none marked yet";
  const unsure = milestones.filter((item) => state[item.id] === "not_sure").map((item) => `- ${item.title}`).join("\n") || "- none marked yet";
  const notYet = milestones.filter((item) => state[item.id] === "not_yet").map((item) => `- ${item.title}`).join("\n") || "- none marked yet";
  const notes = document.getElementById("parentNotes")?.value || "";
  memory.notes = notes;
  saveMemory(memory);

  summary.textContent = `Age page: ${AGE_LABELS[currentAge]}
Tool purpose: developmental monitoring conversation, not diagnosis or screening

Observed:
${observed}

Not sure:
${unsure}

Not yet:
${notYet}

Parent notes:
${notes || "- none yet"}

Questions for professional:
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
    <strong>Observed by area (${AGE_LABELS[currentAge]})</strong>
    <div class="dbars">${domainBars(profile)}</div>
    <p>${previous ? `Compared with your last saved snapshot at this age: ${Math.max(0, currentObserved - previousObserved)} more observed. ${newlyObserved.length ? `Newly observed: ${newlyObserved.map((item) => item.title).join(", ")}.` : "No newly observed items yet."}` : "Save your first snapshot to start seeing change over time."}</p>
    <p class="panel-note">This is a timeline of parent observations, not a score and not a diagnosis.</p>
  `;

  if (!snapshots.length) {
    list.innerHTML = `<div class="history-item"><h4>No saved snapshots yet</h4><p class="panel-note">Mark a few milestones, add notes, then save a snapshot.</p></div>`;
    return;
  }

  list.innerHTML = snapshots.slice().reverse().map((snapshot) => {
    const date = new Date(snapshot.date).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });
    return `
      <article class="history-item">
        <h4>${snapshot.ageLabel} · ${date}</h4>
        <dl>
          <dt>Observed</dt><dd>${snapshot.counts.observed}</dd>
          <dt>Not sure</dt><dd>${snapshot.counts.notSure}</dd>
          <dt>Not yet</dt><dd>${snapshot.counts.notYet}</dd>
          <dt>Activities</dt><dd>${snapshot.triedActivities.length} opened</dd>
          <dt>Notes</dt><dd>${snapshot.notes || "No notes"}</dd>
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
  if (demoTitle) demoTitle.textContent = `${AGE_LABELS[age]} page`;

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
    document.getElementById("copyStatus").textContent = "Summary copied for testing.";
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
