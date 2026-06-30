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
  run(context, "prototype_stage5_ua/activity_context_ua.js");
  return context;
}

function testContentAndEngine() {
  const stage5Index = read("prototype_stage5_ua/index.html");
  const stage5Styles = read("prototype_stage5_ua/styles5.css");
  const stage5App = read("prototype_stage5_ua/app5.js");
  const stage5Authors = read("prototype_stage5_ua/authors_ua.js");
  const pwaScript = read("prototype_stage5_ua/pwa.js");
  const serviceWorker = read("prototype_stage5_ua/sw.js");
  const pagesWorkflow = read(".github/workflows/pages.yml");
  const pagesIndex = read(".github/pages-index.html");
  const authorCardFiles = fs.readdirSync(path.join(root, "knowledge_base/author_source_cards"))
    .filter((name) => name.startsWith("auth_") && name.endsWith(".md"));
  const authorMap = read("knowledge_base/recommendation_author_map.csv");
  const stammCard = read("knowledge_base/author_source_cards/auth_stamm_everyday-responsive-interaction.md");
  const manifest = JSON.parse(read("prototype_stage5_ua/manifest.webmanifest"));
  const icon192 = fs.readFileSync(path.join(root, "prototype_stage5_ua/app-icon-192.png"));
  const icon512 = fs.readFileSync(path.join(root, "prototype_stage5_ua/app-icon-512.png"));
  assert.ok(stage5Index.includes("20260630-p2-16-r1"), "Stage5 assets must use the P2.16 cache key");
  assert.ok(stage5Index.includes('<main id="screen"></main>'), "route changes must not announce the entire main region");
  assert.ok(stage5Index.includes('class="brand-mark"') && stage5Index.includes('<svg viewBox="0 0 20 20"'), "app shell needs the original kite brand mark");
  assert.ok(stage5Styles.includes("--apricot-soft:") && stage5Styles.includes(".week-recap"), "warm visual layer and weekly recap styles must ship together");
  assert.ok(stage5Styles.includes("@media (forced-colors: active)"), "high-contrast mode needs explicit active-state support");
  assert.ok(stage5Styles.includes("@media (prefers-reduced-motion: reduce)"), "reduced-motion preference must stay supported");
  assert.ok(stage5App.includes('document.getElementById("toggleTodayDone")?.focus'), "program updates must restore focus to the thumb action");
  assert.ok(stage5App.includes('id="installApp"') && stage5App.includes('id="installHelp"'), "data settings need install guidance without changing the primary home action");
  assert.ok(stage5App.includes('id="updateControls"') && stage5App.includes('id="applyUpdate"'), "PWA updates need an explicit action in collapsed settings");
  assert.equal(manifest.display, "standalone", "PWA manifest must request standalone display");
  assert.equal(manifest.start_url, "./", "PWA must start inside its own scope");
  assert.ok(manifest.icons.some((icon) => icon.sizes === "192x192"), "PWA needs a 192px icon");
  assert.ok(manifest.icons.some((icon) => icon.sizes === "512x512"), "PWA needs a 512px icon");
  assert.equal(icon192.readUInt32BE(16), 192, "192px icon width");
  assert.equal(icon192.readUInt32BE(20), 192, "192px icon height");
  assert.equal(icon512.readUInt32BE(16), 512, "512px icon width");
  assert.equal(icon512.readUInt32BE(20), 512, "512px icon height");
  assert.ok(serviceWorker.includes('const CACHE_NAME = "milestones-stage5-p2-16-r1"'), "service worker cache must be versioned");
  assert.ok(serviceWorker.includes('caches.match("./index.html")'), "offline navigation needs an app-shell fallback");
  assert.ok(pwaScript.includes('navigator.serviceWorker.register("./sw.js")'), "the app must register its service worker");
  assert.ok(pwaScript.includes('window.addEventListener("beforeinstallprompt"'), "supported browsers need a deferred native install action");
  assert.ok(pwaScript.includes('window.addEventListener("appinstalled"'), "installed mode must hide redundant install guidance");
  assert.ok(pwaScript.includes('navigator.serviceWorker.addEventListener("controllerchange"'), "accepted updates must reload only after controller change");
  assert.ok(stage5Index.includes('id="offlineStatus"'), "the app shell needs a quiet offline status");
  assert.ok(stage5Index.includes('id="storageStatus"'), "storage failures need a persistent visible status");
  assert.ok(pagesWorkflow.includes("node tools/test_p1_qa.js"), "public preview must pass regression checks before deployment");
  assert.ok(pagesWorkflow.includes("workflow_dispatch:") && !pagesWorkflow.includes("\n  push:"), "paused public preview must remain manual-only");
  assert.ok(pagesWorkflow.includes("pages: write") && pagesWorkflow.includes("id-token: write"), "Pages deployment needs only the documented deployment permissions");
  assert.ok(pagesWorkflow.includes("cp -R prototype_stage5_ua/. _site/prototype_stage5_ua/")
    && pagesWorkflow.includes("prototype_stage4_ua/data_ua.js prototype_stage4_ua/engine.js")
    && !pagesWorkflow.includes("path: '.'"), "Pages artifact must publish only the app and its canonical engine data");
  assert.ok(pagesIndex.includes('url=prototype_stage5_ua/') && pagesIndex.includes('href="prototype_stage5_ua/"'), "Pages root must lead to the Stage 5 UA preview");
  assert.equal(authorCardFiles.length, 10, "author-card roadmap count must match the ten review records");
  authorCardFiles.forEach((name) => {
    const card = read(`knowledge_base/author_source_cards/${name}`);
    assert.ok(card.includes("status: draft") || card.includes("status: expert_reviewed"), `${name} needs a review status`);
    assert.ok(card.includes("copyright: paraphrase"), `${name} must stay paraphrase-only`);
    assert.ok(card.includes("## Not allowed wording / claim limit"), `${name} needs an explicit claim limit`);
  });
  assert.ok(authorMap.includes("amap_007;early_brain_development_daily_interaction;Jill Stamm"), "Stamm review card needs a traceable recommendation-map row");
  assert.ok(stammCard.includes("evidence_level: secondary_synthesis")
    && stammCard.includes("Do not claim that this “wires the brain correctly”")
    && !stage5Authors.includes("Jill Stamm"), "moderate-caution Stamm framing must remain review-only and outside runtime");
  const montessoriCard = read("knowledge_base/author_source_cards/auth_montessori_prepared-environment.md");
  assert.ok(authorMap.includes("amap_008;prepared_environment_everyday_exploration;Maria Montessori")
    && montessoriCard.includes("evidence_level: bronze")
    && montessoriCard.includes("Child-led never") && montessoriCard.includes("means unattended")
    && !stage5Authors.includes('author: "Maria Montessori"'), "Montessori must remain form-only, supervised, and outside runtime");

  assert.equal(
    read("prototype_stage4/engine.js"),
    read("prototype_stage4_ua/engine.js"),
    "EN and UA engine copies must remain identical"
  );

  const context = contentContext();
  const api = vm.runInContext(`({
    AGES, DOMAIN_KEYS, ENGINE_CONFIG, MILESTONES_BY_AGE, ACTIVITIES_BY_AGE, DISCUSS_BY_ID,
    QUESTION_VARIANTS_UA, ACTIVITY_AUTHOR_NOTES, WHO_WINDOW_BY_ID, ACTIVITY_LOW_ENERGY_UA,
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
  assert.equal(Object.keys(api.ACTIVITY_LOW_ENERGY_UA).length, 33, "only authored low-energy variants may ship");
  Object.entries(api.ACTIVITY_LOW_ENERGY_UA).forEach(([id, text]) => {
    assert.ok(activityIds.has(id), `low-energy variant points to unknown activity ${id}`);
    assert.ok(text && text !== "NEEDS_REVIEW", `low-energy variant ${id} must be authored`);
  });
}

function appContext(options = {}) {
  const storage = new Map();
  let storageWriteFails = Boolean(options.storageWriteFails);
  let storageReadFails = Boolean(options.storageReadFails);
  const listeners = {};
  const nodes = {
    screen: { innerHTML: "", querySelector: () => null },
    bottomNav: { innerHTML: "", style: {} },
    appbarChild: { innerHTML: "" },
    storageStatus: {
      hidden: true, textContent: "", title: "", ariaLabel: "",
      setAttribute(name, value) { if (name === "aria-label") this.ariaLabel = value; },
      removeAttribute(name) { if (name === "aria-label") this.ariaLabel = ""; }
    }
  };
  const context = vm.createContext({
    console,
    localStorage: {
      getItem: (key) => { if (storageReadFails) throw new Error("storage read blocked"); return storage.has(key) ? storage.get(key) : null; },
      setItem: (key, value) => { if (storageWriteFails) throw new Error("storage full"); storage.set(key, String(value)); },
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
    __listeners: listeners,
    __setStorageWriteFails: (value) => { storageWriteFails = Boolean(value); },
    __setStorageReadFails: (value) => { storageReadFails = Boolean(value); }
  });
  run(context, "prototype_stage4_ua/data_ua.js");
  run(context, "prototype_stage4_ua/engine.js");
  run(context, "prototype_stage5_ua/questions_ua.js");
  run(context, "prototype_stage5_ua/activity_context_ua.js");
  run(context, "prototype_stage5_ua/app5.js");
  return context;
}

function testStorageFailureRecovery() {
  const context = appContext({ storageWriteFails: true });
  const failed = vm.runInContext(`(() => {
    store = freshStore();
    const saved = save();
    const status = document.getElementById("storageStatus");
    return { saved, problem: storageProblem, hidden: status.hidden, text: status.textContent, ariaLabel: status.ariaLabel };
  })()`, context);
  assert.equal(failed.saved, false, "blocked localStorage must not throw through the active interaction");
  assert.ok(failed.problem.includes("не зберіг"), "storage failure needs actionable calm guidance");
  assert.equal(failed.hidden, false, "storage failure status must become visible");
  assert.equal(failed.text, "Не збережено", "storage failure needs a short visible label");
  assert.ok(failed.ariaLabel.includes("резервну копію"), "assistive text must explain the recovery path");

  context.__setStorageWriteFails(false);
  const recovered = vm.runInContext(`(() => {
    const saved = save();
    const status = document.getElementById("storageStatus");
    return { saved, problem: storageProblem, hidden: status.hidden, text: status.textContent };
  })()`, context);
  assert.equal(recovered.saved, true, "storage must recover without restarting the app");
  assert.equal(recovered.problem, "", "successful save must clear the stale failure state");
  assert.equal(recovered.hidden, true, "recovered storage must hide the warning");
}

async function testServiceWorker() {
  const listeners = {};
  const cachedShell = [];
  const deletedCaches = [];
  const storedRequests = [];
  let skipWaitingCalled = false;
  let clientsClaimed = false;
  const offlineDocument = { kind: "offline-index" };
  const cache = {
    addAll: async (paths) => { cachedShell.push(...paths); },
    put: async (request) => { storedRequests.push(request); }
  };
  const context = vm.createContext({
    URL,
    Promise,
    fetch: async () => { throw new Error("offline"); },
    caches: {
      open: async () => cache,
      keys: async () => ["milestones-stage5-p2-12", "milestones-stage5-p2-13", "milestones-stage5-p2-14", "milestones-stage5-p2-15", "milestones-stage5-p2-15-r1", "milestones-stage5-p2-16", "milestones-stage5-p2-16-r1", "unrelated-cache"],
      delete: async (key) => { deletedCaches.push(key); return true; },
      match: async (request) => request === "./index.html" ? offlineDocument : null
    },
    self: {
      location: { origin: "http://localhost:4175" },
      addEventListener: (type, handler) => { listeners[type] = handler; },
      skipWaiting: async () => { skipWaitingCalled = true; },
      clients: { claim: async () => { clientsClaimed = true; } }
    }
  });
  run(context, "prototype_stage5_ua/sw.js");

  let installWork;
  listeners.install({ waitUntil: (promise) => { installWork = promise; } });
  await installWork;
  assert.equal(skipWaitingCalled, false, "service worker updates must wait for an explicit user action");
  assert.ok(cachedShell.includes("./index.html"), "offline shell must cache index.html");
  assert.ok(cachedShell.includes("./app-icon-512.png"), "offline shell must cache install icons");
  assert.ok(cachedShell.includes("../prototype_stage4_ua/data_ua.js?v=20260630-p2-16-r1"), "offline shell must cache canonical content");
  assert.ok(cachedShell.includes("./activity_context_ua.js?v=20260630-p2-16-r1"), "offline shell must cache authored activity context variants");

  listeners.message({ data: { type: "SKIP_WAITING" } });
  assert.equal(skipWaitingCalled, true, "approved update must tell the waiting worker to activate");

  let activateWork;
  listeners.activate({ waitUntil: (promise) => { activateWork = promise; } });
  await activateWork;
  assert.deepEqual(deletedCaches, ["milestones-stage5-p2-12", "milestones-stage5-p2-13", "milestones-stage5-p2-14", "milestones-stage5-p2-15", "milestones-stage5-p2-15-r1", "milestones-stage5-p2-16"], "activation must delete only older Stage5 caches");
  assert.equal(clientsClaimed, true, "new service worker must claim the app after activation");

  let navigationResponse;
  listeners.fetch({
    request: { method: "GET", mode: "navigate", url: "http://localhost:4175/prototype_stage5_ua/#/home" },
    respondWith: (promise) => { navigationResponse = promise; }
  });
  assert.equal(await navigationResponse, offlineDocument, "offline navigation must return the cached app shell");
  assert.deepEqual(storedRequests, [], "offline fallback must not attempt a cache write");
}

async function testPwaInstallUi() {
  const windowListeners = {};
  const documentListeners = {};
  const nodes = {
    offlineStatus: { hidden: false, textContent: "" },
    installApp: { hidden: true, disabled: false },
    installHelp: { hidden: false, textContent: "" },
    installStatus: { textContent: "" },
    updateControls: { hidden: true },
    applyUpdate: { disabled: false },
    updateStatus: { textContent: "" },
    screen: {}
  };
  let registered = false;
  let promptCalls = 0;
  let prevented = false;
  let updateMessages = 0;
  let reloads = 0;
  const serviceWorkerListeners = {};
  const waitingWorker = { postMessage: (message) => { if (message && message.type === "SKIP_WAITING") updateMessages += 1; } };
  const registration = {
    waiting: waitingWorker,
    installing: null,
    addEventListener: () => {}
  };
  class FakeMutationObserver { constructor(callback) { this.callback = callback; } observe() {} }
  const context = vm.createContext({
    Promise,
    MutationObserver: FakeMutationObserver,
    location: { protocol: "http:" },
    navigator: {
      onLine: true,
      standalone: false,
      serviceWorker: {
        controller: { scriptURL: "old-sw.js" },
        addEventListener: (type, handler) => { serviceWorkerListeners[type] = handler; },
        register: async () => { registered = true; return registration; }
      }
    },
    window: {
      MutationObserver: FakeMutationObserver,
      matchMedia: () => ({ matches: false }),
      location: { reload: () => { reloads += 1; } },
      addEventListener: (type, handler) => { windowListeners[type] = handler; }
    },
    document: {
      getElementById: (id) => nodes[id] || null,
      addEventListener: (type, handler) => { documentListeners[type] = handler; }
    }
  });
  run(context, "prototype_stage5_ua/pwa.js");
  assert.equal(nodes.offlineStatus.hidden, true, "online mode must not show an offline badge");
  assert.equal(nodes.installApp.hidden, true, "install action stays hidden until the browser offers it");

  const installEvent = {
    preventDefault: () => { prevented = true; },
    prompt: async () => { promptCalls += 1; },
    userChoice: Promise.resolve({ outcome: "dismissed" })
  };
  windowListeners.beforeinstallprompt(installEvent);
  assert.equal(prevented, true, "browser install prompt must be deferred until the user asks");
  assert.equal(nodes.installApp.hidden, false, "native install action must appear when supported");

  await documentListeners.click({
    target: { closest: (selector) => selector === "#installApp" ? nodes.installApp : null }
  });
  assert.equal(promptCalls, 1, "install action must invoke the native prompt once");
  assert.equal(nodes.installApp.hidden, true, "a consumed install prompt cannot stay actionable");
  assert.ok(nodes.installStatus.textContent.includes("пізніше"), "dismissal must stay calm and reversible");

  windowListeners.appinstalled();
  assert.equal(nodes.installHelp.hidden, true, "installed mode must hide redundant guidance");
  assert.ok(nodes.installStatus.textContent.includes("додано"), "successful installation needs concise feedback");
  await windowListeners.load();
  assert.equal(registered, true, "PWA bootstrap must register the service worker on load");
  assert.equal(nodes.updateControls.hidden, false, "waiting update must appear only in collapsed settings");
  serviceWorkerListeners.controllerchange();
  assert.equal(reloads, 0, "first install must not trigger an unsolicited reload");
  await documentListeners.click({
    target: { closest: (selector) => selector === "#applyUpdate" ? nodes.applyUpdate : null }
  });
  assert.equal(updateMessages, 1, "update action must activate the waiting worker once");
  assert.equal(nodes.applyUpdate.disabled, true, "update action must lock while activation starts");
  assert.ok(nodes.updateStatus.textContent.includes("Оновлюємо"), "update action needs immediate calm feedback");
  serviceWorkerListeners.controllerchange();
  serviceWorkerListeners.controllerchange();
  assert.equal(reloads, 1, "controller change must reload exactly once");
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

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setDate(1);
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    const preterm = freshChild("Передчасно", localDateString(sixMonthsAgo), localDateString(fourMonthsAgo));
    const twoWeeksAfterBirth = new Date(sixMonthsAgo);
    twoWeeksAfterBirth.setDate(twoWeeksAfterBirth.getDate() + 14);
    const nearTerm = freshChild("Майже в термін", localDateString(sixMonthsAgo), localDateString(twoWeeksAfterBirth));
    const thirteenMonthsAgo = new Date();
    thirteenMonthsAgo.setDate(1);
    thirteenMonthsAgo.setMonth(thirteenMonthsAgo.getMonth() - 13);
    const nearTermOldDue = new Date(thirteenMonthsAgo);
    nearTermOldDue.setDate(nearTermOldDue.getDate() + 14);
    const profileMarkup = renderProfile();
    const correctedAgeOkay = usesCorrectedAge(preterm)
      && ageWindowFor(developmentalMonths(preterm)) === 4
      && validateProfileDates(preterm.dob, preterm.expectedDueDate).corrected
      && !validateProfileDates(preterm.dob, preterm.expectedDueDate).error
      && validateProfileDates(preterm.dob, preterm.dob).field === "expectedDueDate"
      && !usesCorrectedAge(nearTerm)
      && validateProfileDates(nearTerm.dob, nearTerm.expectedDueDate).earlyButNotCorrected
      && Boolean(validateProfileDates(localDateString(thirteenMonthsAgo), localDateString(nearTermOldDue)).error)
      && profileMarkup.includes('id="expectedDueDate"')
      && profileMarkup.includes("не оцінка розвитку");

    renderNav("home");
    const navMarkup = document.getElementById("bottomNav").innerHTML;
    const navIconsOkay = (navMarkup.match(/class="nav-icon"/g) || []).length === 4
      && ["home", "observe", "play", "pencil"].every((name) => navMarkup.includes('data-icon="' + name + '"'))
      && !navMarkup.includes("⌂") && !navMarkup.includes("◎") && !navMarkup.includes("◇") && !navMarkup.includes("✎");

    const ids = questionIdsFor(4);
    const startStep = homeNextStep(4);
    const startMarkup = renderHome();
    const surveyMarkup = renderSurvey();
    const backup = backupPayload();
    const restoredBackup = validateBackupPayload(backup);
    const tamperedBackup = JSON.parse(JSON.stringify(backup));
    tamperedBackup.data.children[0].surveys[4].states[ids[0]] = "diagnosis";
    const tamperedContextBackup = JSON.parse(JSON.stringify(backup));
    tamperedContextBackup.data.children[0].playContext = "score_child";
    const dataBackupOkay = startMarkup.includes('id="exportBackup"')
      && startMarkup.includes('id="chooseBackup"')
      && startMarkup.includes('id="importBackup"')
      && backup.schema === BACKUP_SCHEMA
      && backup.version === BACKUP_VERSION
      && restoredBackup.ok
      && restoredBackup.store.children.length === 2
      && !validateBackupPayload({ schema: "other", version: 1, data: {} }).ok
      && !validateBackupPayload(tamperedBackup).ok
      && !validateBackupPayload(tamperedContextBackup).ok;
    const emotionalCopyOkay = OBSERVATION_LABELS.not_yet === "Ще не помічаю"
      && surveyMarkup.includes("Ще не помічаю")
      && !surveyMarkup.includes("Поки ні")
      && calmDiscussionIntroHtml().includes("Це не висновок")
      && discussCardHtml(milestoneById(4, ids[0]), "not_yet").includes("Ще не помічаю");
    const accessibilityOkay = surveyMarkup.includes('id="questionTitle" tabindex="-1" aria-describedby="questionPrompt"')
      && surveyMarkup.includes('role="status" aria-live="polite" aria-atomic="true"');
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
    const homeProgressAccessibilityOkay = continueMarkup.includes('role="progressbar"')
      && continueMarkup.includes('aria-valuemin="0"');
    first.surveys[4].states = Object.fromEntries(ids.map((id) => [id, "yes"]));
    first.surveys[4].date = "2026-06-20T10:00:00.000Z";
    const playStep = homeNextStep(4);
    const playMarkup = renderHome();
    const programMarkup = renderProgram();
    const quickContextId = contextActivityId(4, "quick");
    const noMaterialsContextId = contextActivityId(4, "no_materials");
    const lowEnergyContextId = contextActivityId(4, "low_energy");
    const contextPickerMarkup = playContextHtml(4);
    const lowEnergyMarkup = activityDetailHtml(4, lowEnergyContextId, true);
    const contextFilterOkay = PLAY_CONTEXT_IDS.join(",") === "any,quick,no_materials,low_energy"
      && AGES.every((age) => ["quick", "no_materials", "low_energy"].every((context) =>
        (ACTIVITIES_BY_AGE[age] || []).some((activity) => activityFitsContext(activity, context))))
      && activityFitsContext(activityById(4, quickContextId), "quick")
      && activityFitsContext(activityById(4, noMaterialsContextId), "no_materials")
      && activityFitsContext(activityById(4, lowEnergyContextId), "low_energy")
      && (contextPickerMarkup.match(/data-play-context=/g) || []).length === 4
      && contextPickerMarkup.includes("не відповіді спостереження")
      && lowEnergyMarkup.includes("Коли сил мало")
      && lowEnergyMarkup.includes("Повні кроки й умова зупинки")
      && lowEnergyMarkup.includes(ACTIVITY_LOW_ENERGY_UA[lowEnergyContextId]);
    first.activityCompletions[completionKey(4)] = { activityId: playStep.task.act.id };
    first.favoriteActivities.push(playStep.task.act.id);
    first.activityReactions[completionKey(4)] = "liked";
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = localDateString(yesterday) + ":4";
    first.activityCompletions[yesterdayKey] = { activityId: playStep.task.act.id };
    first.activityReactions[yesterdayKey] = "not_today";
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    first.activityCompletions[localDateString(eightDaysAgo) + ":4"] = { activityId: playStep.task.act.id };
    const weekly = weeklyPlaySummary(first);
    const weeklyMarkup = weeklyRecapHtml(weekly);
    const weeklyRecapOkay = weekly.count === 2 && weekly.liked === 1 && weekly.notToday === 1
      && weeklyMarkup.includes("Кілька теплих моментів гри")
      && weeklyMarkup.includes("немає обов'язкової серії")
      && !weeklyMarkup.includes('role="progressbar"')
      && !weeklyMarkup.includes("data-go=");
    const doneStep = homeNextStep(4);
    const doneMarkup = renderHome();
    const currentProgramDay = programState.program[programState.currentIndex];
    const upcomingProgramDay = programState.program[(programState.currentIndex + 1) % programState.program.length];
    const todayMarkup = todayActivityHtml(4, currentProgramDay);
    const upcomingMarkup = dayAccordionHtml(4, upcomingProgramDay);
    const savedMarkup = savedGamesHtml(4);
    const gentleEngagementOkay = todayMarkup.includes('data-favorite-id="' + playStep.task.act.id + '"')
      && todayMarkup.includes("Збережено")
      && todayMarkup.includes('data-activity-reaction="liked" aria-pressed="true"')
      && todayMarkup.includes("Не сьогодні")
      && savedMarkup.includes('data-saved-game="' + playStep.task.act.id + '"');
    const programUiOkay = programMarkup.includes('<div id="programToday"></div>')
      && programMarkup.includes('<div id="playContext"></div>')
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
      && !first.activityCompletions[completionKey(4)]
      && !first.activityReactions[completionKey(4)]
      && first.favoriteActivities.includes(playStep.task.act.id);

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
    const childrenIsolated = cc().notes === "" && specialistPrepFor().noticed === "" && !cc().surveys[4]
      && !completedActivityToday(4) && cc().favoriteActivities.length === 0 && Object.keys(cc().activityReactions).length === 0
      && cc().playContext === "any";

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
      && migrated.children[0].activityCompletions.sample.activityId === "activity"
      && migrated.children[0].expectedDueDate === ""
      && migrated.children[0].favoriteActivities.length === 0
      && Object.keys(migrated.children[0].activityReactions).length === 0
      && migrated.children[0].playContext === "any";

    const oldSnapshot = { age: 4, states: { [ids[0]]: "not_sure", [ids[1]]: "yes" } };
    const newSnapshot = { age: 4, questionIds: ids.slice(0, 3), states: { [ids[0]]: "yes", [ids[1]]: "not_yet", [ids[2]]: "yes" } };
    const fallbackCounts = snapshotCounts(oldSnapshot);
    const changes = snapshotChanges(newSnapshot, oldSnapshot);
    const historyOkay = fallbackCounts.observed === 1
      && fallbackCounts.notSure === 1
      && fallbackCounts.notYet === 0
      && changes.newlyObserved.length === 2
      && changes.changed.length === 1;

    return { restartOkay, finishIsIdempotent, childrenIsolated, migrationOkay, historyOkay, homeNextStepOkay, programUiOkay, specialistPrepOkay, oneThumbSurveyOkay, emotionalCopyOkay, navIconsOkay, accessibilityOkay: accessibilityOkay && homeProgressAccessibilityOkay, dataBackupOkay, correctedAgeOkay, gentleEngagementOkay, weeklyRecapOkay, contextFilterOkay };
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
  assert.equal(result.accessibilityOkay, true, "survey and home must expose focused, concise accessibility semantics");
  assert.equal(result.dataBackupOkay, true, "local backup must round-trip valid data and reject malformed answers");
  assert.equal(result.correctedAgeOkay, true, "optional expected due date must select the corrected-age window without exposing a score");
  assert.equal(result.gentleEngagementOkay, true, "favorites and optional post-play feedback must stay calm and local per child");
  assert.equal(result.weeklyRecapOkay, true, "weekly recap must describe recent play without a streak, progress bar, or competing action");
  assert.equal(result.contextFilterOkay, true, "context picker must use honest activity attributes and authored low-energy variants across all ages");
}

(async () => {
  testContentAndEngine();
  testAppState();
  testStorageFailureRecovery();
  await testServiceWorker();
  await testPwaInstallUi();
  console.log("P1/P2 QA passed: 5 ages, content integrity, deterministic plans, corrected-age profile support, honest context-aware game choice, 33 authored low-energy variants, calm favorites, post-play feedback and weekly recap, warm kite visual layer, contextual home, guarded local storage, installable offline shell, deferred install UX, user-approved PWA updates, service-worker lifecycle, safe local backup/restore, unified SVG navigation, one-thumb survey, accessible focus/status semantics, emotion-aware copy, today-first game, specialist prep, re-tests, history comparison, migration, multi-child isolation.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
