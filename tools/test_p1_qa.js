const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), "utf8");
const run = (context, relativePath) => vm.runInContext(read(relativePath), context, { filename: relativePath });

function contentContext() {
  const context = vm.createContext({ console });
  run(context, "prototype_stage4_ua/data_ua.js");
  run(context, "prototype_stage4_ua/engine.js");
  run(context, "prototype_stage5_ua/questions_ua.js");
  run(context, "prototype_stage5_ua/authors_ua.js");
  run(context, "prototype_stage5_ua/who_windows.js");
  return context;
}

function testContentAndEngine() {
  assert.equal(
    read("prototype_stage4/engine.js"),
    read("prototype_stage4_ua/engine.js"),
    "EN and UA engine copies must remain identical"
  );

  const context = contentContext();
  const api = vm.runInContext(`({
    AGES, DOMAIN_KEYS, ENGINE_CONFIG, MILESTONES_BY_AGE, ACTIVITIES_BY_AGE, DISCUSS_BY_ID,
    QUESTION_VARIANTS_UA, ACTIVITY_AUTHOR_NOTES, WHO_WINDOW_BY_ID,
    buildProfile, buildProgram, domainOf
  })`, context);

  assert.deepEqual(Array.from(api.AGES), [2, 4, 6, 9, 12]);
  assert.equal(api.ENGINE_CONFIG.cycleDays, 14);

  const milestoneIds = new Set();
  const activityIds = new Set();
  const validDomains = new Set(Array.from(api.DOMAIN_KEYS));

  for (const age of api.AGES) {
    const milestones = Array.from(api.MILESTONES_BY_AGE[age] || []);
    const activities = Array.from(api.ACTIVITIES_BY_AGE[age] || []);
    assert.ok(milestones.length > 0, `${age} months needs milestones`);
    assert.ok(activities.length > 0, `${age} months needs activities`);

    for (const milestone of milestones) {
      assert.ok(!milestoneIds.has(milestone.id), `duplicate milestone id ${milestone.id}`);
      milestoneIds.add(milestone.id);
      assert.ok(validDomains.has(api.domainOf(milestone.id)), `invalid milestone domain ${milestone.id}`);
      assert.ok(milestone.title && milestone.text, `incomplete milestone ${milestone.id}`);
      assert.ok(api.DISCUSS_BY_ID[milestone.id], `missing discuss note ${milestone.id}`);
      assert.ok(Array.isArray(api.QUESTION_VARIANTS_UA[milestone.id]), `missing question variants ${milestone.id}`);
      assert.ok(api.QUESTION_VARIANTS_UA[milestone.id].length >= 2, `too few question variants ${milestone.id}`);
    }

    for (const activity of activities) {
      assert.ok(!activityIds.has(activity.id), `duplicate activity id ${activity.id}`);
      activityIds.add(activity.id);
      assert.ok(validDomains.has(api.domainOf(activity.id)), `invalid activity domain ${activity.id}`);
      assert.ok(activity.title && activity.why && activity.evidence && activity.source, `incomplete activity ${activity.id}`);
      assert.ok(Array.isArray(activity.steps) && activity.steps.length > 0, `missing steps ${activity.id}`);
      assert.ok(Array.isArray(activity.supports) && activity.supports.length > 0, `missing supports ${activity.id}`);
      assert.ok(api.ACTIVITY_AUTHOR_NOTES[activity.id], `missing author note ${activity.id}`);
    }

    const allYes = Object.fromEntries(milestones.map((milestone) => [milestone.id, "yes"]));
    const allNotYet = Object.fromEntries(milestones.map((milestone) => [milestone.id, "not_yet"]));
    const oneYes = { [milestones[0].id]: "yes" };
    const cases = [
      { name: "all clear", profile: api.buildProfile(allYes, age, api.ENGINE_CONFIG) },
      { name: "focus", profile: api.buildProfile(allNotYet, age, api.ENGINE_CONFIG) },
      { name: "partial", profile: api.buildProfile(oneYes, age, api.ENGINE_CONFIG) }
    ];

    assert.equal(cases[0].profile.allClear, true, `${age} months all-clear profile`);
    assert.equal(cases[1].profile.focus.length > 0, true, `${age} months focus profile`);
    assert.equal(cases[2].profile.partialClear, true, `${age} months partial profile`);
    assert.equal(api.buildProgram(api.buildProfile({}, age, api.ENGINE_CONFIG), age, api.ENGINE_CONFIG).length, 0);

    for (const scenario of cases) {
      const first = api.buildProgram(scenario.profile, age, api.ENGINE_CONFIG);
      const second = api.buildProgram(scenario.profile, age, api.ENGINE_CONFIG);
      assert.equal(first.length, 14, `${age} months ${scenario.name} program length`);
      assert.deepEqual(first, second, `${age} months ${scenario.name} program must be deterministic`);
      first.forEach((day, index) => {
        assert.equal(day.day, index + 1, `${age} months sequential program days`);
        assert.ok(day.options.length >= 1 && day.options.length <= 2, `${age} months primary options`);
        day.options.forEach((id) => assert.ok(activities.some((activity) => activity.id === id), `unknown primary activity ${id}`));
        day.bonus.forEach((item) => assert.ok(activities.some((activity) => activity.id === item.id), `unknown bonus activity ${item.id}`));
      });
    }
  }

  for (const age of api.AGES) {
    for (const activity of api.ACTIVITIES_BY_AGE[age]) {
      activity.supports.forEach((id) => assert.ok(milestoneIds.has(id), `activity ${activity.id} supports unknown milestone ${id}`));
    }
  }
  Object.keys(api.WHO_WINDOW_BY_ID).forEach((id) => assert.ok(milestoneIds.has(id), `WHO window points to unknown milestone ${id}`));
}

function appContext() {
  const storage = new Map();
  const listeners = {};
  const nodes = {
    screen: { innerHTML: "", querySelector: () => null },
    bottomNav: { innerHTML: "", style: {} },
    appbarChild: { innerHTML: "" }
  };
  const context = vm.createContext({
    console,
    localStorage: {
      getItem: (key) => storage.has(key) ? storage.get(key) : null,
      setItem: (key, value) => storage.set(key, String(value)),
      removeItem: (key) => storage.delete(key)
    },
    document: {
      addEventListener: (type, handler) => { listeners[type] = handler; },
      getElementById: (id) => nodes[id] || null,
      querySelector: () => null
    },
    window: { addEventListener: () => {}, scrollTo: () => {}, setTimeout: (callback) => callback() },
    location: { hash: "#/welcome" },
    navigator: {},
    confirm: () => true,
    URL: { createObjectURL: () => "blob:test", revokeObjectURL: () => {} },
    Blob: function Blob() {},
    __listeners: listeners
  });
  run(context, "prototype_stage4_ua/data_ua.js");
  run(context, "prototype_stage4_ua/engine.js");
  run(context, "prototype_stage5_ua/questions_ua.js");
  run(context, "prototype_stage5_ua/app5.js");
  return context;
}

function testAppState() {
  const context = appContext();
  const result = vm.runInContext(`(() => {
    const fourMonthsAgo = new Date();
    fourMonthsAgo.setDate(1);
    fourMonthsAgo.setMonth(fourMonthsAgo.getMonth() - 4);
    const first = freshChild("Перша", localDateString(fourMonthsAgo));
    const second = freshChild("Друга", "2025-09-28");
    store = { consent: { accepted: true }, children: [first, second], activeChildId: first.id };

    renderNav("home");
    const navMarkup = document.getElementById("bottomNav").innerHTML;
    const navIconsOkay = (navMarkup.match(/class="nav-icon"/g) || []).length === 4
      && ["home", "observe", "play", "pencil"].every((name) => navMarkup.includes('data-icon="' + name + '"'))
      && !navMarkup.includes("⌂") && !navMarkup.includes("◎") && !navMarkup.includes("◇") && !navMarkup.includes("✎");

    const ids = questionIdsFor(4);
    const startStep = homeNextStep(4);
    const startMarkup = renderHome();
    const surveyMarkup = renderSurvey();
    const emotionalCopyOkay = OBSERVATION_LABELS.not_yet === "Ще не помічаю"
      && surveyMarkup.includes("Ще не помічаю")
      && !surveyMarkup.includes("Поки ні")
      && calmDiscussionIntroHtml().includes("Це не висновок")
      && discussCardHtml(milestoneById(4, ids[0]), "not_yet").includes("Ще не помічаю");
    const answerWrap = {
      dataset: { id: ids[0] },
      querySelectorAll: () => [answerButton]
    };
    const answerButton = {
      dataset: { state: "yes" },
      disabled: false,
      classList: { add: () => {}, remove: () => {} },
      setAttribute: () => {},
      closest: (selector) => selector === ".state-controls" ? answerWrap : null
    };
    const answerTarget = {
      id: "",
      closest: (selector) => selector === ".state-controls button" ? answerButton : null
    };
    location.hash = "#/survey";
    __listeners.click({ target: answerTarget });
    const oneThumbSurveyOkay = surveyMarkup.includes('data-auto-advance="true"')
      && surveyMarkup.includes('id="surveyAdvanceStatus"')
      && !surveyMarkup.includes('id="surveyNext"')
      && first.surveys[4].states[ids[0]] === "yes"
      && surveyUi.index === 1;
    const continueStep = homeNextStep(4);
    const continueMarkup = renderHome();
    first.surveys[4].states = Object.fromEntries(ids.map((id) => [id, "yes"]));
    first.surveys[4].date = "2026-06-20T10:00:00.000Z";
    const playStep = homeNextStep(4);
    const playMarkup = renderHome();
    first.activityCompletions[completionKey(4)] = { activityId: playStep.task.act.id };
    const doneStep = homeNextStep(4);
    const doneMarkup = renderHome();
    const programMarkup = renderProgram();
    const currentProgramDay = programState.program[programState.currentIndex];
    const upcomingProgramDay = programState.program[(programState.currentIndex + 1) % programState.program.length];
    const todayMarkup = todayActivityHtml(4, currentProgramDay);
    const upcomingMarkup = dayAccordionHtml(4, upcomingProgramDay);
    const programUiOkay = programMarkup.includes('<div id="programToday"></div>')
      && programMarkup.includes('<details class="week-plan">')
      && todayMarkup.includes('class="day-acc open today-game"')
      && todayMarkup.includes('class="activity-switcher"')
      && todayMarkup.includes('class="thumb-action"')
      && todayMarkup.includes('id="toggleTodayDone"')
      && !todayMarkup.includes('class="illus"')
      && !todayMarkup.includes('data-day-toggle=')
      && upcomingMarkup.includes('data-day-toggle=')
      && !upcomingMarkup.includes('id="toggleTodayDone"');
    const homeNextStepOkay = startStep.kind === "start-observation"
      && continueStep.kind === "continue-observation"
      && continueStep.progress.value === 1
      && playStep.kind === "play-today"
      && doneStep.kind === "done-today"
      && (startMarkup.match(/data-primary-action=/g) || []).length === 1
      && (continueMarkup.match(/data-primary-action=/g) || []).length === 1
      && (playMarkup.match(/data-primary-action=/g) || []).length === 1
      && (doneMarkup.match(/data-primary-action=/g) || []).length === 0
      && !startMarkup.includes('class="hello"')
      && !startMarkup.includes('class="profile-meta"')
      && doneMarkup.includes('<details class="home-more">');
    first.snapshots.push({ id: "snap_existing" });
    first.programSelections["4"] = { "1": "act_004_language_001" };
    first.activityCompletions[completionKey(4)] = { activityId: "act_004_language_001" };

    restartSurvey(4);
    const restartOkay = first.surveys[4].date === null
      && Object.keys(first.surveys[4].states).length === 0
      && first.snapshots.length === 1
      && !first.programSelections["4"]
      && !first.activityCompletions[completionKey(4)];

    first.surveys[4].states = Object.fromEntries(ids.map((id) => [id, "yes"]));
    finishSurvey();
    const snapshotsAfterFirstFinish = first.snapshots.length;
    finishSurvey();
    const finishIsIdempotent = first.snapshots.length === snapshotsAfterFirstFinish;

    first.specialistPrep = { noticed: "повертає голову на голос", tried: "короткі голосові ігри", questions: "що спостерігати далі?" };
    first.notes = first.specialistPrep.noticed;
    const askMarkup = renderAsk();
    const specialistSummary = summaryText();
    const specialistPrepOkay = (askMarkup.match(/data-prep-field=/g) || []).length === 3
      && askMarkup.includes('class="visit-overview"')
      && askMarkup.includes('class="visit-discuss"')
      && askMarkup.includes('class="visit-notes"')
      && askMarkup.includes('class="thumb-action"')
      && !askMarkup.includes('class="visit-badge"')
      && askMarkup.includes('id="copySummary"')
      && specialistSummary.includes("Дитина: Перша")
      && specialistSummary.includes("ЩО ВЖЕ ПРОБУВАЛИ")
      && specialistSummary.includes(first.specialistPrep.questions);

    store.activeChildId = second.id;
    const childrenIsolated = cc().notes === "" && specialistPrepFor().noticed === "" && !cc().surveys[4] && !completedActivityToday(4);

    const migrated = migrate({
      consent: { accepted: true }, child: { name: "Старий профіль", dob: "2026-02-28" },
      surveys: { 4: { states: { sample: "yes" } } }, snapshots: [{ id: "old" }],
      programSelections: { 4: { 1: "activity" } }, activityCompletions: { sample: { activityId: "activity" } },
      triedActivities: ["activity"], notes: "нотатка"
    });
    const migrationOkay = migrated.children.length === 1
      && migrated.children[0].snapshots.length === 1
      && migrated.children[0].notes === "нотатка"
      && migrated.children[0].specialistPrep.noticed === "нотатка"
      && migrated.children[0].activityCompletions.sample.activityId === "activity";

    const oldSnapshot = { age: 4, states: { [ids[0]]: "not_sure", [ids[1]]: "yes" } };
    const newSnapshot = { age: 4, questionIds: ids.slice(0, 3), states: { [ids[0]]: "yes", [ids[1]]: "not_yet", [ids[2]]: "yes" } };
    const fallbackCounts = snapshotCounts(oldSnapshot);
    const changes = snapshotChanges(newSnapshot, oldSnapshot);
    const historyOkay = fallbackCounts.observed === 1
      && fallbackCounts.notSure === 1
      && fallbackCounts.notYet === 0
      && changes.newlyObserved.length === 2
      && changes.changed.length === 1;

    return { restartOkay, finishIsIdempotent, childrenIsolated, migrationOkay, historyOkay, homeNextStepOkay, programUiOkay, specialistPrepOkay, oneThumbSurveyOkay, emotionalCopyOkay, navIconsOkay };
  })()`, context);

  assert.equal(result.restartOkay, true, "re-test must clear only the active plan and today's completion");
  assert.equal(result.finishIsIdempotent, true, "finishing the same survey twice must not create duplicate snapshots");
  assert.equal(result.childrenIsolated, true, "children must not share surveys, notes, or completions");
  assert.equal(result.migrationOkay, true, "legacy single-child data must migrate losslessly");
  assert.equal(result.historyOkay, true, "history comparison must support old snapshots and describe answer changes");
  assert.equal(result.homeNextStepOkay, true, "home must expose one contextual primary action and a calm done state");
  assert.equal(result.programUiOkay, true, "program must keep today's game open and future days secondary");
  assert.equal(result.specialistPrepOkay, true, "specialist prep must keep one overview, three structured notes, and a copyable summary");
  assert.equal(result.oneThumbSurveyOkay, true, "survey answers must save and advance without a separate next button");
  assert.equal(result.emotionalCopyOkay, true, "sensitive observation copy must keep the emotion-aware, explicitly non-conclusive guardrails");
  assert.equal(result.navIconsOkay, true, "bottom navigation must use one consistent four-icon SVG set");
}

testContentAndEngine();
testAppState();
console.log("P1/P2 QA passed: 5 ages, content integrity, deterministic plans, contextual home, unified SVG navigation, one-thumb survey, emotion-aware copy, today-first game, specialist prep, re-tests, history comparison, migration, multi-child isolation.");
