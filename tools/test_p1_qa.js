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
  run(context, "prototype_stage5_ua/library_ua.js");
  return context;
}

function testCurrentBuildBoundary() {
  const currentBuild = read("CURRENT_BUILD.md");
  const auditScope = JSON.parse(read("audit-scope.json"));
  const readme = read("README.md");
  const agentGuide = read("AGENT.md");
  const stage4Legacy = read("prototype_stage4/legacy-reference.html");
  const stage4UaLegacy = read("prototype_stage4_ua/legacy-reference.html");

  assert.equal(auditScope.release, "P2.56", "audit scope must identify the current release");
  assert.equal(auditScope.primaryEntryPoint, "prototype_stage5_ua/index.html", "Stage 5 UA must be the sole current UI entry point");
  assert.deepEqual(auditScope.runtimeDependencies, [
    "prototype_stage4_ua/data_ua.js",
    "prototype_stage4_ua/engine.js"
  ], "only Stage 4 UA data and engine may be current runtime dependencies");
  assert.ok(currentBuild.includes("prototype_stage5_ua/index.html") && currentBuild.includes("P2.56"), "current-build instructions must name the exact entry point and release");
  assert.ok(readme.includes("CURRENT BUILD: Stage 5 UA / P2.56"), "README must lead with the current build boundary");
  assert.ok(agentGuide.includes("Audit only `prototype_stage5_ua/index.html`"), "agent instructions must reject legacy UI audits");
  assert.equal(fs.existsSync(path.join(root, "prototype_stage4/index.html")), false, "legacy EN UI must not look like a current entry point");
  assert.equal(fs.existsSync(path.join(root, "prototype_stage4_ua/index.html")), false, "legacy UA UI must not look like a current entry point");
  assert.ok(stage4Legacy.includes("not the current product"), "legacy EN page must show a visible archive warning");
  assert.ok(stage4UaLegacy.includes("не актуальний продукт"), "legacy UA page must show a visible archive warning");
}

function testContentAndEngine() {
  const stage5Index = read("prototype_stage5_ua/index.html");
  const motionReviewHtml = read("internal_tools/motion_review.html");
  const stage5Styles = read("prototype_stage5_ua/styles5.css");
  const stage5App = read("prototype_stage5_ua/app5.js");
  const stage5Authors = read("prototype_stage5_ua/authors_ua.js");
  const pwaScript = read("prototype_stage5_ua/pwa.js");
  const serviceWorker = read("prototype_stage5_ua/sw.js");
  const pagesWorkflow = read(".github/workflows/pages.yml");
  const pagesIndex = read(".github/pages-index.html");
  const libraryReviewPacket = read("docs/library_expert_review_packet_ua.md");
  const libraryReviewTracker = read("docs/library_expert_review_tracker_ua.csv");
  const libraryReviewBuilder = read("tools/build_library_review_packet.js");
  const feedingSchema = read("docs/feeding_pilot_schema_ua.md");
  const feedingDrafts = read("docs/feeding_pilot_drafts_ua.md");
  const feedingReviewPacket = read("docs/feeding_expert_review_packet_ua.md");
  const feedingReviewTracker = read("docs/feeding_expert_review_tracker_ua.md");
  const privateMomentsPrivacy = read("docs/private_moments_privacy_decision_ua.md");
  const authorCardFiles = fs.readdirSync(path.join(root, "knowledge_base/author_source_cards"))
    .filter((name) => name.startsWith("auth_") && name.endsWith(".md"));
  const authorMap = read("knowledge_base/recommendation_author_map.csv");
  const stammCard = read("knowledge_base/author_source_cards/auth_stamm_everyday-responsive-interaction.md");
  const manifest = JSON.parse(read("prototype_stage5_ua/manifest.webmanifest"));
  const icon192 = fs.readFileSync(path.join(root, "prototype_stage5_ua/app-icon-192.png"));
  const icon512 = fs.readFileSync(path.join(root, "prototype_stage5_ua/app-icon-512.png"));
  assert.ok(stage5Index.includes("20260714-p2-56-r1"), "Stage5 assets must use the P2.56 cache key");
  assert.ok(stage5Index.includes('src="library_ua.js?v=20260714-p2-56-r1"'), "the sourced library must load before the app shell");
  assert.ok(stage5Index.includes('MILESTONES_BUILD_CHANNEL = "validation"') && !stage5Index.includes('MILESTONES_BUILD_CHANNEL = "validation-review"'), "the ordinary app must not enable internal reviewer routing");
  assert.ok(motionReviewHtml.includes('MILESTONES_BUILD_CHANNEL = "validation-review"') && motionReviewHtml.includes('name="robots" content="noindex,nofollow"'), "Motion review needs a separate noindex internal entry point");
  assert.ok(stage5Index.includes('<main id="screen"></main>'), "route changes must not announce the entire main region");
  assert.ok(stage5Index.includes('class="brand-mark"') && stage5Index.includes('<svg viewBox="0 0 20 20"'), "app shell needs the original kite brand mark");
  assert.ok(stage5Styles.includes("--apricot-soft:") && stage5Styles.includes(".week-recap"), "warm visual layer and weekly recap styles must ship together");
  assert.ok(stage5Styles.includes("@media (forced-colors: active)"), "high-contrast mode needs explicit active-state support");
  assert.ok(stage5Styles.includes("@media (prefers-reduced-motion: reduce)"), "reduced-motion preference must stay supported");
  assert.ok(stage5Styles.includes(".home-secondary-links") && !stage5Styles.includes(".home-action-deck") && !stage5Styles.includes(".home-tab-viewport"), "home must use a calm document flow without nested deck or tab scrolling");
  assert.ok(stage5App.includes("homeNextStepHtml(nextStep)") && stage5App.includes("homeSecondaryLinksHtml(tested)"), "home must render the contextual next step before secondary routes");
  assert.ok(!stage5App.includes("function initHomeDeck()") && !stage5App.includes("function activateHomeTab("), "retired home deck and tab controllers must not ship");
  assert.ok(stage5App.includes('document.getElementById("toggleTodayDone")?.focus'), "program updates must restore focus to the thumb action");
  assert.ok(stage5App.includes('class="private-moments"') && stage5App.includes('data-delete-moment='), "E6 needs a bounded local moments view with individual deletion");
  assert.ok(stage5App.includes('"DTEND:"') && !stage5App.includes("RRULE:FREQ=DAILY"), "calendar reminders must be single events without a hidden recurring series");
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
  assert.ok(serviceWorker.includes('const CACHE_NAME = "milestones-stage5-p2-56-r1"'), "service worker cache must be versioned");
  const motionCardFiles = fs.readdirSync(path.join(root, "prototype_stage5_ua/assets/motion_cards")).filter((name) => name.endsWith(".jpg"));
  assert.equal(motionCardFiles.length, 59, "the complete Motion Cards library must contain exactly 59 optimized illustrations");
  motionCardFiles.forEach((name) => assert.ok(serviceWorker.includes(`./assets/motion_cards/${name}`), `${name} must be available offline`));
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
  assert.equal(authorCardFiles.length, 24, "author-card roadmap count must match the twenty-four review records");
  const coveredAuthorIds = new Set();
  authorCardFiles.forEach((name) => {
    const card = read(`knowledge_base/author_source_cards/${name}`);
    assert.ok(card.includes("status: draft") || card.includes("status: expert_reviewed"), `${name} needs a review status`);
    assert.ok(card.includes("copyright: paraphrase"), `${name} must stay paraphrase-only`);
    assert.ok(card.includes("## Not allowed wording / claim limit"), `${name} needs an explicit claim limit`);
    const authorId = card.match(/^author_id:\s*(.+)$/m);
    assert.ok(authorId, `${name} needs an author_id`);
    authorId[1].split("|").map((id) => id.trim()).filter(Boolean).forEach((id) => coveredAuthorIds.add(id));
  });
  assert.equal(coveredAuthorIds.size, 26, "author-card roadmap must cover all twenty-six distinct authors");
  assert.ok(authorMap.includes("amap_007;early_brain_development_daily_interaction;Jill Stamm"), "Stamm review card needs a traceable recommendation-map row");
  assert.ok(stammCard.includes("evidence_level: secondary_synthesis")
    && stammCard.includes("Do not claim that this “wires the brain correctly”")
    && !stage5Authors.includes("Jill Stamm"), "moderate-caution Stamm framing must remain review-only and outside runtime");
  const montessoriCard = read("knowledge_base/author_source_cards/auth_montessori_prepared-environment.md");
  assert.ok(authorMap.includes("amap_008;prepared_environment_everyday_exploration;Maria Montessori")
    && montessoriCard.includes("evidence_level: bronze")
    && montessoriCard.includes("Child-led never") && montessoriCard.includes("means unattended")
    && !stage5Authors.includes('author: "Maria Montessori"'), "Montessori must remain form-only, supervised, and outside runtime");
  const eliotCard = read("knowledge_base/author_source_cards/auth_eliot_ordinary-experience-resilience.md");
  assert.ok(authorMap.includes("amap_009;ordinary_sensory_relational_experience;Lise Eliot")
    && eliotCard.includes("evidence_level: secondary_synthesis")
    && eliotCard.includes("Do not transfer enriched-versus-deprived animal findings directly to a child")
    && eliotCard.includes("More input is not always better")
    && !stage5Authors.includes('author: "Lise Eliot"'), "dated Eliot neuroclaims must be blocked and remain outside runtime");
  const medinaCard = read("knowledge_base/author_source_cards/auth_medina_good-enough-supported-caregiving.md");
  assert.ok(authorMap.includes("amap_010;caregiver_stress_parent_anxiety;John Medina")
    && medinaCard.includes("evidence_level: secondary_synthesis")
    && medinaCard.includes("Milestones") && medinaCard.includes("must not act as crisis care")
    && medinaCard.includes("Do not blame a caregiver")
    && !stage5Authors.includes('author: "John Medina"'), "Medina must remain a blame-free cross-cutting review card outside runtime");
  const siegelBrysonCard = read("knowledge_base/author_source_cards/auth_siegel-bryson_infant-connect-before-correct.md");
  assert.ok(authorMap.includes("amap_011;infant_distress_caregiver_reactivity;Daniel J. Siegel|Tina Payne Bryson")
    && siegelBrysonCard.includes("nothing to\ndiscipline or redirect")
    && siegelBrysonCard.includes("Crying and fussing are signals, not misbehavior")
    && siegelBrysonCard.includes("Do not present left/right brain, upstairs/downstairs brain, integration, rewiring")
    && !stage5Authors.includes('author: "Daniel J. Siegel"')
    && !stage5Authors.includes('author: "Tina Payne Bryson"'), "Siegel and Bryson must stay infant-safe, metaphor-free, and outside runtime");
  const luriaCard = read("knowledge_base/author_source_cards/auth_luria_internal-functional-systems.md");
  assert.ok(authorMap.includes("amap_012;internal_language_neuropsychology;A. R. Luria")
    && luriaCard.includes("There is no direct caregiver action from this card")
    && luriaCard.includes("Do not infer brain location, lesion, dysfunction, immaturity, delay, or diagnosis")
    && luriaCard.includes("used_in_activities: []")
    && !stage5Authors.includes('author: "A. R. Luria"'), "Luria must remain a non-diagnostic internal theory guardrail outside runtime");
  const bernsteinCard = read("knowledge_base/author_source_cards/auth_bernstein_internal-motor-control.md");
  assert.ok(authorMap.includes("amap_013;internal_motor_control;N. A. Bernstein")
    && bernsteinCard.includes("There is no direct caregiver action from this card")
    && bernsteinCard.includes("Do not prescribe passive limb manipulation, forced positions, restraint, fatigue")
    && bernsteinCard.includes("used_in_activities: []")
    && !stage5Authors.includes('author: "N. A. Bernstein"'), "Bernstein must remain a no-force internal motor-theory guardrail outside runtime");
  const maciasCard = read("knowledge_base/author_source_cards/auth_macias_monitoring-screening-boundary.md");
  assert.ok(authorMap.includes("amap_014;developmental_monitoring_screening_boundary;Michelle M. Macias")
    && maciasCard.includes("This is developmental monitoring, not a screening or diagnostic test")
    && maciasCard.includes("Do not call the Milestones observation flow a screen, screening tool, test")
    && maciasCard.includes("used_in_activities: []")
    && !stage5Authors.includes('author: "Michelle M. Macias"'), "Macias must keep app monitoring distinct from validated screening and outside runtime");
  const poonCard = read("knowledge_base/author_source_cards/auth_poon_professional-followup-boundary.md");
  assert.ok(authorMap.includes("amap_015;professional_summary_followup_boundary;Jennifer K. Poon")
    && poonCard.includes("Do not generate a clinical impression, suspected condition, urgency level")
    && poonCard.includes("Saving an observation helps preserve context; it is not a clinical conclusion")
    && poonCard.includes("used_in_activities: []")
    && !stage5Authors.includes('author: "Jennifer K. Poon"'), "Poon must limit summaries to factual preparation and remain outside runtime");
  const hpgCard = read("knowledge_base/author_source_cards/auth_hirsh-pasek-golinkoff_playful-language.md");
  assert.ok(authorMap.includes("amap_002;language_communication;Hirsh-Pasek and Golinkoff;How Babies Talk")
    && hpgCard.includes("work: How Babies Talk")
    && hpgCard.includes("Do not deliberately ignore, interrupt, misunderstand, frustrate")
    && hpgCard.includes("Do not demand eye contact, imitation, a word, a gesture")
    && hpgCard.includes("act_002_language_001") && hpgCard.includes("act_012_language_003"), "How Babies Talk must support the full infant conversational form without becoming a test");
  const sasseCard = read("knowledge_base/author_source_cards/auth_sasse_safe-floor-play-form.md");
  assert.ok(authorMap.includes("amap_016;safe_infant_floor_play_form;Margaret Sassé;Smart Start")
    && sasseCard.includes("caution: high") && sasseCard.includes("used_in_activities: []")
    && sasseCard.includes("Do not copy or recommend the book’s pull-ups, push-ups")
    && sasseCard.includes("Do not say crawling is required, bottom shuffling is a problem")
    && sasseCard.includes("Sleep is always on the back")
    && !stage5Authors.includes('author: "Margaret Sassé"'), "Smart Start must remain no-force, no-brain-claim, review-only, and outside runtime");
  const suzukiCard = read("knowledge_base/author_source_cards/auth_suzuki_shared-music-without-training.md");
  const authorRegistry = read("knowledge_base/authors_registry.csv");
  const authorWorks = read("knowledge_base/author_works_inventory.csv");
  assert.ok(authorMap.includes("amap_017;shared_music_without_training;Shinichi Suzuki")
    && authorRegistry.includes("suzuki;Shinichi Suzuki;pedagogy_method;pedagogy_method;medium;high")
    && authorWorks.includes("work_suzuki_001;suzuki;Shinichi Suzuki;Nurtured by Love: The Classic Approach to Talent Education;book;core;Optional shared-music form only;inspiration_form_only;high")
    && suzukiCard.includes("caution: high") && suzukiCard.includes("used_in_activities: []")
    && suzukiCard.includes("Do not prescribe training from birth")
    && suzukiCard.includes("Do not blame a mother, father or caregiver’s voice")
    && suzukiCard.includes("Do not claim violin, music, memorization or persistent practice treats")
    && !stage5Authors.includes('author: "Shinichi Suzuki"'), "Suzuki must remain blame-free, treatment-free, training-free, and outside runtime");
  const neufeldMateCard = read("knowledge_base/author_source_cards/auth_neufeld-mate_warm-presence-without-collecting.md");
  assert.ok(authorMap.includes("amap_018;warm_presence_without_collecting;Gordon Neufeld|Gabor Maté")
    && authorRegistry.includes("neufeld;Gordon Neufeld;attachment_emotional;expert_model;high;high;inspiration_form_only")
    && authorWorks.includes("work_neufeld_mate_001;neufeld|mate;Gordon Neufeld, Gabor Maté")
    && neufeldMateCard.includes("caution: high") && neufeldMateCard.includes("used_in_activities: []")
    && neufeldMateCard.includes("Do not use “collect the child”, “woo”, “get in the child’s face”")
    && neufeldMateCard.includes("Do not try to elicit or require eye contact, a smile, nod, grasp")
    && neufeldMateCard.includes("Babies can form relationships with multiple safe caregivers")
    && !stage5Authors.includes('author: "Gordon Neufeld"')
    && !stage5Authors.includes('author: "Gabor Maté"'), "Neufeld and Maté must remain reciprocity-free, assessment-free, blame-free, and outside runtime");
  const searsCard = read("knowledge_base/author_source_cards/auth_sears_responsive-care-without-method-rules.md");
  assert.ok(authorMap.includes("amap_019;responsive_care_without_method_rules;William Sears")
    && authorRegistry.includes("sears;William Sears;attachment_emotional;practice_secondary;medium;high;inspiration_form_only;warm responsive-care tone only")
    && authorWorks.includes("work_sears_001;sears;William Sears, Martha Sears;The Baby Book;book;supporting;Optional warm responsive-care tone only;inspiration_form_only;high")
    && searsCard.includes("caution: high") && searsCard.includes("used_in_activities: []")
    && searsCard.includes("Do not recommend bed sharing or call it safe")
    && searsCard.includes("Do not claim attachment parenting, bed sharing, breastfeeding, carrying")
    && searsCard.includes("Never frame formula, combination feeding, pumping, weaning")
    && searsCard.includes("Do not reuse vaccination schedules, medication doses, diagnoses, treatments")
    && searsCard.includes("Caregiver exhaustion deserves practical support")
    && !stage5Authors.includes('author: "William Sears"'), "Sears must remain method-free, safe-sleep bounded, blame-free, and outside runtime");
  const shichidaCard = read("knowledge_base/author_source_cards/auth_shichida_shared-picture-without-right-brain-training.md");
  assert.ok(authorMap.includes("amap_020;shared_picture_without_right_brain_training;Makoto Shichida")
    && authorRegistry.includes("shichida;Makoto Shichida;pedagogy_method;pedagogy_method;low-medium;high;inspiration_form_only;shared-picture form only")
    && authorWorks.includes("work_shichida_001;shichida;Makoto Shichida;Children Can Change Through Right Brain Education;book;supporting;Optional shared-picture form only;inspiration_form_only;high")
    && shichidaCard.includes("caution: high") && shichidaCard.includes("used_in_activities: []")
    && shichidaCard.includes("Do not say the right brain dominates from birth to age three")
    && shichidaCard.includes("Do not prescribe rapid flash cards, dots, numerals, equations")
    && shichidaCard.includes("clairvoyance, telepathy")
    && shichidaCard.includes("Do not claim the method changes facial muscles")
    && shichidaCard.includes("Do not blame a caregiver's pace")
    && !stage5Authors.includes('author: "Makoto Shichida"'), "Shichida must remain right-brain-free, flash-card-free, treatment-free, and outside runtime");
  const domanCard = read("knowledge_base/author_source_cards/auth_doman_shared-reading-without-intelligence-training.md");
  assert.ok(authorMap.includes("amap_021;shared_reading_without_intelligence_training;Glenn Doman")
    && authorRegistry.includes("doman;Glenn Doman;pedagogy_method;pedagogy_method;low-medium;high;inspiration_form_only;enjoyable shared-reading form only")
    && authorWorks.includes("work_doman_001;doman;Glenn Doman, Janet Doman;How to Teach Your Baby to Read;book/course material;supporting;Optional enjoyable shared-reading form only;inspiration_form_only;high")
    && domanCard.includes("caution: high") && domanCard.includes("used_in_activities: []")
    && domanCard.includes("Do not say an infant reads words, understands print")
    && domanCard.includes("Do not prescribe word cards, dot cards")
    && domanCard.includes("Do not transfer theories or practices from brain injury")
    && domanCard.includes("patterning, passive limb sequences, forced crawling or creeping")
    && domanCard.includes("Do not privilege mothers as natural or full-time teachers")
    && !stage5Authors.includes('author: "Glenn Doman"'), "Doman must remain card-free, early-academics-free, treatment-free, and outside runtime");
  const ibukaCard = read("knowledge_base/author_source_cards/auth_ibuka_ordinary-experience-without-deadline.md");
  assert.ok(authorMap.includes("amap_022;ordinary_experience_without_deadline;Masaru Ibuka")
    && authorRegistry.includes("ibuka;Masaru Ibuka;pedagogy_method;pedagogy_method;low-medium;high;inspiration_form_only;ordinary responsive experience without deadline")
    && authorWorks.includes("work_ibuka_001;ibuka;Masaru Ibuka;Kindergarten Is Too Late!;book;supporting;Optional ordinary responsive experience without deadline;inspiration_form_only;high")
    && ibukaCard.includes("caution: high") && ibukaCard.includes("used_in_activities: []")
    && ibukaCard.includes('Do not use "after three is too late"')
    && ibukaCard.includes("Do not promise native-like multilingualism")
    && ibukaCard.includes("Do not recommend infant swimming, submersion")
    && ibukaCard.includes("Do not privilege maternal love")
    && ibukaCard.includes("Current AAP policy requires")
    && !stage5Authors.includes('author: "Masaru Ibuka"'), "Ibuka must remain deadline-free, infant-swimming-free, blame-free, and outside runtime");

  assert.equal(
    read("prototype_stage4/engine.js"),
    read("prototype_stage4_ua/engine.js"),
    "EN and UA engine copies must remain identical"
  );

  const context = contentContext();
  const api = vm.runInContext(`({
    AGES, DOMAIN_KEYS, ENGINE_CONFIG, MILESTONES_BY_AGE, ACTIVITIES_BY_AGE, DISCUSS_BY_ID,
    QUESTION_VARIANTS_UA, ACTIVITY_AUTHOR_NOTES, WHO_WINDOW_BY_ID, ACTIVITY_LOW_ENERGY_UA, LIBRARY_MATERIALS, LIBRARY_TOPICS,
    buildProfile, buildProgram, domainOf
  })`, context);

  assert.deepEqual(Array.from(api.AGES), [2, 4, 6, 9, 12]);
  assert.equal(api.ENGINE_CONFIG.cycleDays, 7, "play plan must use a transparent seven-day reflection cycle");
  assert.equal(api.LIBRARY_MATERIALS.length, 13, "E4 pilot needs thirteen concise materials including outdoor safety");
  assert.ok(api.LIBRARY_MATERIALS.every((item) => item.reviewStatus === "draft" && item.lastChecked === "2026-07-02" && item.source.url.startsWith("https://")), "library materials need honest review status, check date, and source");
  assert.ok(api.LIBRARY_TOPICS.some((topic) => topic.id === "safety") && api.LIBRARY_TOPICS.some((topic) => topic.id === "parent"), "library filters must cover safety and caregiver wellbeing");
  const trackerLines = libraryReviewTracker.trim().split(/\r?\n/);
  const trackerIds = trackerLines.slice(1).map((line) => line.split(";")[0].replaceAll('"', ""));
  assert.deepEqual(trackerIds.sort(), Array.from(api.LIBRARY_MATERIALS, (item) => item.id).sort(), "E4 expert tracker must cover every live library material exactly once");
  assert.ok(trackerLines[0].includes('"decision"') && trackerLines[0].includes('"reviewer_name_and_role"') && trackerLines[0].includes('"reviewed_at"'), "E4 tracker needs an attributable decision gate");
  assert.ok(api.LIBRARY_MATERIALS.every((item) => libraryReviewPacket.includes(`\`${item.id}\``) && libraryReviewPacket.includes(item.source.url)), "E4 review packet must expose every live card and official source");
  assert.ok(libraryReviewBuilder.includes("if (!fs.existsSync(TRACKER))"), "packet regeneration must preserve an existing expert tracker");
  const feedingIds = Array.from(feedingDrafts.matchAll(/\*\*ID:\*\* `([^`]+)`/g), (match) => match[1]);
  const feedingTrackerIds = Array.from(feedingReviewTracker.matchAll(/\| `([^`]+)` \|/g), (match) => match[1]);
  assert.equal(feedingIds.length, 12, "E5 review-only pilot needs exactly twelve candidate meal templates");
  assert.equal(new Set(feedingIds).size, 12, "E5 template IDs must be unique");
  assert.deepEqual(feedingTrackerIds.sort(), [...feedingIds].sort(), "E5 Markdown tracker must cover every draft exactly once");
  assert.ok(feedingDrafts.includes("Статус усіх карток: `generated_draft`") && feedingDrafts.includes("NEEDS_LOCAL_REVIEW"), "E5 drafts must stay blocked on real review and localization");
  assert.ok(feedingSchema.includes("Runtime: не підключено")
    && feedingSchema.includes("https://www.who.int/publications/i/item/9789240081864")
    && feedingSchema.includes("https://www.cdc.gov/infant-toddler-nutrition/foods-and-drinks/choking-hazards.html"), "E5 schema needs an explicit runtime boundary and official sources");
  assert.ok(feedingReviewPacket.includes("`approved`, `revise` або `remove`")
    && feedingReviewPacket.includes("Автоматично забороняє approval"), "E5 expert packet needs attributable decisions and hard blocking criteria");
  assert.ok(privateMomentsPrivacy.includes("локальна текстова добірка без фото, хмари, акаунта й аналітики")
    && privateMomentsPrivacy.includes("максимум три")
    && privateMomentsPrivacy.includes("одну подію"), "E6 needs a documented data-minimizing privacy decision and non-recurring reminder boundary");

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
      assert.equal(first.length, 7, `${age} months ${scenario.name} weekly program length`);
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
    window: { MILESTONES_BUILD_CHANNEL: options.buildChannel || "validation", addEventListener: () => {}, scrollTo: () => {}, setTimeout: (callback) => callback() },
    location: { hash: "#/welcome", search: "", origin: "http://localhost:4175", pathname: options.buildChannel === "validation-review" ? "/internal_tools/motion_review.html" : "/prototype_stage5_ua/index.html" },
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
  run(context, "prototype_stage5_ua/illustrations.js");
  run(context, "prototype_stage5_ua/authors_ua.js");
  run(context, "prototype_stage5_ua/activity_context_ua.js");
  run(context, "prototype_stage5_ua/library_ua.js");
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

function testReviewBuildIsolation() {
  const normalContext = appContext({ buildChannel: "validation" });
  const result = vm.runInContext(`(() => {
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(1);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const child = freshChild("Тест", localDateString(oneMonthAgo));
    store = { consent: { accepted: true }, children: [child], activeChildId: child.id };
    location.search = "?reviewSession=parent_1";
    location.hash = "#/visual-pilot";
    const reviewerBlocked = motionReviewReviewerSession() === null;
    renderAppbar("home");
    const appbar = document.getElementById("appbarChild").innerHTML;
    show("visual-pilot");
    const markup = document.getElementById("screen").innerHTML;
    return reviewerBlocked && appbar.includes("До 2 міс") && markup.includes("Перший чекліст ще попереду") && !markup.includes("Перевірка Motion Cards");
  })()`, normalContext);
  assert.equal(result, true, "the ordinary app must not expose or activate the internal Motion review route");
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
  assert.ok(cachedShell.includes("../prototype_stage4_ua/data_ua.js?v=20260714-p2-56-r1"), "offline shell must cache canonical content");
  assert.ok(cachedShell.includes("./activity_context_ua.js?v=20260714-p2-56-r1"), "offline shell must cache authored activity context variants");
  assert.ok(cachedShell.includes("./library_ua.js?v=20260714-p2-56-r1"), "the sourced library must be cached offline");
  assert.ok(cachedShell.includes("./activity-tummy-time-guide-v1.png"), "offline shell must cache the visual pilot asset");

  listeners.message({ data: { type: "SKIP_WAITING" } });
  assert.equal(skipWaitingCalled, true, "approved update must tell the waiting worker to activate");

  let activateWork;
  listeners.activate({ waitUntil: (promise) => { activateWork = promise; } });
  await activateWork;
  assert.deepEqual(deletedCaches, ["milestones-stage5-p2-12", "milestones-stage5-p2-13", "milestones-stage5-p2-14", "milestones-stage5-p2-15", "milestones-stage5-p2-15-r1", "milestones-stage5-p2-16", "milestones-stage5-p2-16-r1"], "activation must delete only older Stage5 caches");
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
  const context = appContext({ buildChannel: "validation-review" });
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
    const youngerWindowOkay = [
      [-1, null], [0, null], [1, null],
      [2, 2], [3, 2], [4, 4], [5, 4],
      [6, 6], [7, 6], [8, 6],
      [9, 9], [10, 9], [11, 9], [12, 12]
    ].every(([months, expected]) => ageWindowFor(months) === expected);
    const oneMonthAgo = new Date();
    oneMonthAgo.setDate(1);
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
    const beforeFirst = freshChild("Новонароджена", localDateString(oneMonthAgo));
    store.children.push(beforeFirst);
    store.activeChildId = beforeFirst.id;
    const beforeFirstHome = renderHome();
    const beforeFirstSurvey = renderSurvey();
    renderAppbar("home");
    const beforeFirstAppbar = document.getElementById("appbarChild").innerHTML;
    const beforeFirstOkay = currentAge() === null
      && beforeFirstHome.includes("Перший чекліст ще попереду")
      && beforeFirstSurvey.includes("Поверніться у 2 місяці")
      && !beforeFirstSurvey.includes('class="state-controls"')
      && (IS_MOTION_REVIEW_BUILD ? beforeFirstAppbar.includes("Перевірка Motion Cards") : beforeFirstAppbar.includes("До 2 міс"))
      && !beforeFirstAppbar.includes("undefined")
      && !Object.prototype.hasOwnProperty.call(beforeFirst.surveys, "null")
      && !Object.prototype.hasOwnProperty.call(beforeFirst.surveys, "2");
    store.children = [first, second];
    store.activeChildId = first.id;
    const correctedAgeOkay = youngerWindowOkay
      && beforeFirstOkay
      && usesCorrectedAge(preterm)
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
    renderNav("results");
    const resultsNavMarkup = document.getElementById("bottomNav").innerHTML;
    renderNav("progress");
    const progressNavMarkup = document.getElementById("bottomNav").innerHTML;
    renderNav("ask");
    const askNavMarkup = document.getElementById("bottomNav").innerHTML;
    renderNav("library");
    const libraryNavMarkup = document.getElementById("bottomNav").innerHTML;
    const navIconsOkay = (navMarkup.match(/class="nav-icon"/g) || []).length === 4
      && ["home", "observe", "play", "history"].every((name) => navMarkup.includes('data-icon="' + name + '"'))
      && ["Сьогодні", "Спостереження", "Гра", "Записи"].every((label) => navMarkup.includes(label))
      && resultsNavMarkup.includes('data-icon="observe"') && resultsNavMarkup.includes('aria-current="page"')
      && progressNavMarkup.includes('data-icon="history"') && progressNavMarkup.includes('aria-current="page"')
      && !askNavMarkup.includes('aria-current="page"')
      && !libraryNavMarkup.includes('aria-current="page"')
      && !navMarkup.includes("⌂") && !navMarkup.includes("◎") && !navMarkup.includes("◇") && !navMarkup.includes("✎");

    const ids = questionIdsFor(4);
    const canonicalPromptsOnly = AGES.every((age) => (MILESTONES_BY_AGE[age] || []).every((milestone) => {
      const pool = variantPoolFor(age, milestone.id);
      return pool.length === 1 && pool[0] === milestone.text;
    }));
    const authoredActivityId = Object.keys(ACTIVITY_AUTHOR_NOTES).find((id) => activityById(Number(id.slice(4, 7)), id));
    const authoredActivityAge = Number(authoredActivityId.slice(4, 7));
    const authoredActivityMarkup = activityDetailHtml(authoredActivityAge, authoredActivityId);
    const draftAuthorHidden = !authoredActivityMarkup.includes("<strong>Ідея ");
    const escapedSafety = activitySafetyStripHtml({ id: 'unsafe<id', materials: '<b>test</b>', steps: ['<img>'], stop: '<script>' });
    const safetyEscapesHtml = escapedSafety.includes('unsafe&lt;id')
      && escapedSafety.includes('&lt;b&gt;test&lt;/b&gt;')
      && escapedSafety.includes('&lt;img&gt;')
      && escapedSafety.includes('&lt;script&gt;');
    const startStep = homeNextStep(4);
    const startMarkup = renderHome();
    const surveyMarkup = renderSurvey();
    const backup = backupPayload();
    const restoredBackup = validateBackupPayload(backup);
    const tamperedBackup = JSON.parse(JSON.stringify(backup));
    tamperedBackup.data.children[0].surveys[4].states[ids[0]] = "diagnosis";
    const tamperedContextBackup = JSON.parse(JSON.stringify(backup));
    tamperedContextBackup.data.children[0].playContext = "score_child";
    const tamperedActivityNoteBackup = JSON.parse(JSON.stringify(backup));
    tamperedActivityNoteBackup.data.children[0].activityNotes = { "2026-07-02:4": "x".repeat(1001) };
    const tamperedDailyPlayBackup = JSON.parse(JSON.stringify(backup));
    tamperedDailyPlayBackup.data.children[0].dailyPlayCompletions = { "2026-07-02:4": [42] };
    const tamperedSignalBackup = JSON.parse(JSON.stringify(backup));
    tamperedSignalBackup.data.children[0].activitySignals = { "2026-07-02:4:activity": "score_child" };
    const tamperedDiaryBackup = JSON.parse(JSON.stringify(backup));
    tamperedDiaryBackup.data.children[0].playDiary = [{ id: "bad", activityId: "activity", age: 4, startedAt: "x", endedAt: "x", reaction: "score_child" }];
    const tamperedSessionBackup = JSON.parse(JSON.stringify(backup));
    tamperedSessionBackup.data.children[0].activePlaySession = { activityId: 42, age: "bad" };
    const dataBackupOkay = startMarkup.includes('id="exportBackup"')
      && startMarkup.includes('id="chooseBackup"')
      && startMarkup.includes('id="importBackup"')
      && backup.schema === BACKUP_SCHEMA
      && backup.version === BACKUP_VERSION
      && restoredBackup.ok
      && restoredBackup.store.children.length === 2
      && !validateBackupPayload({ schema: "other", version: 1, data: {} }).ok
      && !validateBackupPayload(tamperedBackup).ok
      && !validateBackupPayload(tamperedContextBackup).ok
      && !validateBackupPayload(tamperedActivityNoteBackup).ok
      && !validateBackupPayload(tamperedDailyPlayBackup).ok
      && !validateBackupPayload(tamperedSignalBackup).ok
      && !validateBackupPayload(tamperedDiaryBackup).ok
      && !validateBackupPayload(tamperedSessionBackup).ok;
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
    const homeProgressAccessibilityOkay = continueMarkup.includes('class="card next-step continue-observation"')
      && continueMarkup.includes('role="progressbar"')
      && continueMarkup.includes('aria-valuenow="1"')
      && (continueMarkup.match(/data-primary-action=/g) || []).length === 1
      && continueMarkup.includes('aria-label="Додаткові розділи"');
    first.surveys[4].states = Object.fromEntries(ids.map((id) => [id, "yes"]));
    first.surveys[4].date = "2026-06-20T10:00:00.000Z";
    const allClearResultsMarkup = renderResults();
    const playStep = homeNextStep(4);
    const playMarkup = renderHome();
    const programMarkup = renderProgram();
    const recentSurveyDate = new Date();
    recentSurveyDate.setDate(recentSurveyDate.getDate() - 3);
    const readySurveyDate = new Date();
    readySurveyDate.setDate(readySurveyDate.getDate() - 8);
    const notYetSurvey = { date: new Date().toISOString(), states: { [ids[0]]: "not_yet" }, questionIds: [ids[0]] };
    const notSureRecentSurvey = { date: recentSurveyDate.toISOString(), states: { [ids[0]]: "not_sure" }, questionIds: [ids[0]] };
    const notSureReadySurvey = { date: readySurveyDate.toISOString(), states: { [ids[0]]: "not_sure" }, questionIds: [ids[0]] };
    const originalSurvey = first.surveys[4];
    first.surveys[4] = notYetSurvey;
    const discussStep = homeNextStep(4);
    const discussHomeMarkup = renderHome();
    const discussResultsMarkup = renderResults();
    first.surveys[4] = notSureReadySurvey;
    const recheckStep = homeNextStep(4);
    const recheckHomeMarkup = renderHome();
    first.surveys[4] = originalSurvey;
    const followUpRoutingOkay = observationRouteFor(notYetSurvey).kind === "discuss-now"
      && observationRouteFor(notSureRecentSurvey).kind === "watch-window"
      && observationRouteFor(notSureReadySurvey).kind === "recheck-ready"
      && discussStep.kind === "discuss-now" && discussStep.route === "ask"
      && recheckStep.kind === "recheck-ready" && recheckStep.restart === true
      && (discussHomeMarkup.match(/data-primary-action=/g) || []).length === 1
      && discussHomeMarkup.includes('data-primary-action="discuss-now"')
      && (recheckHomeMarkup.match(/data-primary-action=/g) || []).length === 1
      && recheckHomeMarkup.includes('data-primary-action="recheck-ready"')
      && discussResultsMarkup.includes("не замінюють обговорення")
      && discussResultsMarkup.includes('data-go="ask"');
    const compactResultsOkay = allClearResultsMarkup.includes('<article class="result-hero age-window">')
      && allClearResultsMarkup.includes('<div class="result-focus">')
      && allClearResultsMarkup.includes('<details class="result-details">')
      && allClearResultsMarkup.includes("Це не оцінка й не діагноз")
      && allClearResultsMarkup.includes('data-go="program"')
      && discussResultsMarkup.includes('<article class="result-hero discuss-now">')
      && !allClearResultsMarkup.includes('class="observation-route');
    const quickContextId = contextActivityId(4, "quick");
    const noMaterialsContextId = contextActivityId(4, "no_materials");
    const lowEnergyContextId = contextActivityId(4, "low_energy");
    const contextPickerMarkup = playContextHtml(4);
    const lowEnergyMarkup = activityDetailHtml(4, lowEnergyContextId, true);
    const contextFilterOkay = PLAY_CONTEXT_IDS.join(",") === "any,quick,no_materials,one_hand,quiet,calming,active,low_energy"
      && AGES.every((age) => ["quick", "no_materials", "one_hand", "quiet", "calming", "active", "low_energy"].every((context) =>
        (ACTIVITIES_BY_AGE[age] || []).some((activity) => activityFitsContext(activity, context))))
      && activityFitsContext(activityById(4, quickContextId), "quick")
      && activityFitsContext(activityById(4, noMaterialsContextId), "no_materials")
      && activityFitsContext(activityById(4, lowEnergyContextId), "low_energy")
      && (contextPickerMarkup.match(/data-play-context=/g) || []).length === 8
      && contextPickerMarkup.includes("не відповіді спостереження")
      && lowEnergyMarkup.includes("Коли сил мало")
      && lowEnergyMarkup.includes("Повні кроки й умова зупинки")
      && lowEnergyMarkup.includes(ACTIVITY_LOW_ENERGY_UA[lowEnergyContextId]);
    const rasterVisualIds = Object.keys(ACTIVITY_RASTER_GUIDES);
    const visualPilotIds = ["act_002_movement_001", ...rasterVisualIds];
    const visualGuideOkay = visualPilotIds.every((id) => {
      const age = Number(id.slice(4, 7));
      const markup = activityDetailHtml(age, id);
      const expectedImage = id === "act_002_movement_001"
        ? "activity-tummy-time-guide-v1.png"
        : ACTIVITY_RASTER_GUIDES[id].image;
      const hasFourVisuals = markup.includes(expectedImage)
        && (markup.match(/<article class="motion-slide(?: |")/g) || []).length === 4;
      return hasFourVisuals
        && markup.includes('class="activity-safety-strip"')
        && markup.indexOf('class="activity-safety-strip"') < markup.indexOf('class="motion-guide"')
        && markup.includes("Підготуйте")
        && markup.includes("Спостерігайте")
        && markup.includes("Деталі й безпека")
        && markup.includes("Без «правильної» реакції")
        && markup.includes("Зупиніться:");
    }) && rasterVisualIds.length === 59 && visualPilotIds.length === 60 && activityVisualGuideHtml("act_012_cognitive_003").includes("act_012_cognitive_003.jpg");
    const reviewVisualIds = motionReviewCardIds();
    motionReview.active = "parent_1";
    motionReview.sessions.parent_1 = {
      cards: { [rasterVisualIds[0]]: { action: "yes", hands: "yes", stop: "yes", note: "зрозуміло" } },
      sourceExportedAt: "2026-07-03T10:00:00.000Z",
      importedAt: "2026-07-04T10:00:00.000Z"
    };
    motionReview.view = { status: "all", age: "all" };
    const motionReviewMarkup = renderVisualPilot();
    const expertReviewerUrl = motionReviewReviewerUrl("expert");
    const parentInvitation = motionReviewInvitationText("parent_1");
    const expertInvitation = motionReviewInvitationText("expert");
    const invitationUrls = MOTION_REVIEW_SESSIONS.map((session) => motionReviewReviewerUrl(session.id));
    const invitationsOkay = new Set(invitationUrls).size === MOTION_REVIEW_SESSIONS.length
      && parentInvitation.includes("Ваша окрема сесія: Мама 1")
      && parentInvitation.includes("після кожних 10 карток")
      && parentInvitation.includes("Після 60 карток")
      && parentInvitation.includes("JSON-файл")
      && parentInvitation.includes("reviewSession=parent_1")
      && expertInvitation.includes("відповідність віку")
      && expertInvitation.includes(expertReviewerUrl)
      && motionReviewInvitationText("unknown") === "";
    const parentOneOrder = motionReviewSessionCardIds(MOTION_REVIEW_SESSIONS[0]);
    const parentTwoOrder = motionReviewSessionCardIds(MOTION_REVIEW_SESSIONS[1]);
    const parentThreeOrder = motionReviewSessionCardIds(MOTION_REVIEW_SESSIONS[2]);
    const reviewOrderOkay = parentOneOrder.length === reviewVisualIds.length
      && JSON.stringify(parentOneOrder) === JSON.stringify(motionReviewSessionCardIds(MOTION_REVIEW_SESSIONS[0]))
      && JSON.stringify(parentOneOrder) !== JSON.stringify(parentTwoOrder)
      && JSON.stringify([...parentOneOrder].sort()) === JSON.stringify([...reviewVisualIds].sort())
      && new Set(parentOneOrder.slice(0, 5).map((id) => Number(id.slice(4, 7)))).size === 5;
    const coordinatorStore = store;
    location.search = "?v=p2-52-r1&reviewSession=parent_3";
    location.hash = "#/visual-pilot";
    store = freshStore();
    motionReview.active = "parent_1";
    motionReview.view = { status: "pending", age: "all" };
    route();
    const reviewerMarkup = document.getElementById("screen").innerHTML;
    const firstReviewerId = parentThreeOrder[0];
    const firstReviewerTitle = activityById(Number(firstReviewerId.slice(4, 7)), firstReviewerId).title;
    const reviewerRouteBypassOkay = reviewerMarkup.includes("Ізольований режим рецензента")
      && reviewerMarkup.includes("Мама 3")
      && (reviewerMarkup.match(/data-review-session=/g) || []).length === 1
      && reviewerMarkup.includes('data-review-session="parent_3"')
      && reviewerMarkup.includes("disabled")
      && reviewerMarkup.includes('id="exportMotionSession"')
      && reviewerMarkup.includes("Картка у фокусі")
      && reviewerMarkup.includes("У черзі 60")
      && reviewerMarkup.includes("Зберегти чернетку")
      && reviewerMarkup.includes("віки чергуються")
      && reviewerMarkup.includes("до паузи 10")
      && reviewerMarkup.includes("порядок збережеться")
      && reviewerMarkup.includes('src="' + motionReviewGuideFor(parentThreeOrder[0]).image + '"')
      && reviewerMarkup.includes("Що зрозуміло з ілюстрації?")
      && reviewerMarkup.includes("5–8 секунд")
      && reviewerMarkup.includes("Не шукайте «правильну» відповідь")
      && reviewerMarkup.includes("Не відкривайте питання до першого погляду")
      && reviewerMarkup.includes("Картка без назви")
      && reviewerMarkup.includes("Показати критерії після першого погляду")
      && reviewerMarkup.includes('alt="Ілюстрація Motion Card для незалежної перевірки"')
      && !reviewerMarkup.includes(firstReviewerTitle)
      && !reviewerMarkup.includes("pilot-legend")
      && !reviewerMarkup.includes("Бібліотека з 60 карток")
      && reviewerMarkup.indexOf('class="pilot-gallery reviewer-focus"') < reviewerMarkup.indexOf('class="motion-session-transfer"')
      && !reviewerMarkup.includes("data-review-age-filter")
      && !reviewerMarkup.includes("data-review-status-filter")
      && !reviewerMarkup.includes('<details class="pilot-review" open>')
      && (reviewerMarkup.match(/class="pilot-review"/g) || []).length === 1
      && !reviewerMarkup.includes('id="importMotionSession"')
      && !reviewerMarkup.includes("motion-review-overview")
      && !reviewerMarkup.includes("motion-release-gate")
      && !reviewerMarkup.includes("data-copy-review-link");
    motionReview.sessions.parent_3.cards[firstReviewerId] = {};
    MOTION_REVIEW_CRITERIA.parent.forEach((criterion) => { motionReview.sessions.parent_3.cards[firstReviewerId][criterion.id] = "yes"; });
    motionReview.sessions.parent_3.lastReviewedId = firstReviewerId;
    route();
    const reviewerHistoryMarkup = document.getElementById("screen").innerHTML;
    motionReview.sessions.parent_3.revisitId = firstReviewerId;
    route();
    const reviewerRevisitMarkup = document.getElementById("screen").innerHTML;
    const reviewerHistoryOkay = reviewerHistoryMarkup.includes("Виправити попередню відповідь")
      && reviewerRevisitMarkup.includes("Редагуєте попередню картку")
      && reviewerRevisitMarkup.includes("Повернутися до черги")
      && reviewerRevisitMarkup.includes('<details class="pilot-review" open>')
      && reviewerRevisitMarkup.includes("Редагувати відповіді")
      && reviewerRevisitMarkup.includes('data-review-card="' + firstReviewerId + '"');
    motionReview.sessions.parent_3 = { contentVersion: MOTION_REVIEW_CONTENT_VERSION, cards: {} };
    parentThreeOrder.slice(0, MOTION_REVIEW_CHECKPOINT_SIZE).forEach((id) => {
      motionReview.sessions.parent_3.cards[id] = {};
      MOTION_REVIEW_CRITERIA.parent.forEach((criterion) => { motionReview.sessions.parent_3.cards[id][criterion.id] = "yes"; });
    });
    route();
    const checkpointMarkup = document.getElementById("screen").innerHTML;
    const checkpointState = motionReviewCheckpoint(MOTION_REVIEW_SESSIONS[2], motionReview.sessions.parent_3);
    motionReview.sessions.parent_3.checkpointAcknowledged = MOTION_REVIEW_CHECKPOINT_SIZE;
    route();
    const continuedReviewerMarkup = document.getElementById("screen").innerHTML;
    const checkpointOkay = checkpointState.due && checkpointState.reviewed === MOTION_REVIEW_CHECKPOINT_SIZE
      && checkpointMarkup.includes("10 карток готово — час перепочити")
      && checkpointMarkup.includes('id="continueMotionReviewCheckpoint"')
      && !checkpointMarkup.includes('class="pilot-figure pilot-gallery-card')
      && continuedReviewerMarkup.includes('src="' + motionReviewGuideFor(parentThreeOrder[MOTION_REVIEW_CHECKPOINT_SIZE]).image + '"')
      && continuedReviewerMarkup.includes("до паузи 10");
    motionReview.sessions.parent_3 = { contentVersion: MOTION_REVIEW_CONTENT_VERSION, cards: {} };
    reviewVisualIds.forEach((id) => {
      motionReview.sessions.parent_3.cards[id] = {};
      MOTION_REVIEW_CRITERIA.parent.forEach((criterion) => { motionReview.sessions.parent_3.cards[id][criterion.id] = "yes"; });
    });
    route();
    const completedReviewerMarkup = document.getElementById("screen").innerHTML;
    const reviewerCompletionOkay = completedReviewerMarkup.includes("Сесію завершено")
      && completedReviewerMarkup.includes("Сесію повністю перевірено")
      && completedReviewerMarkup.includes("Зберегти сесію")
      && !completedReviewerMarkup.includes("Зберегти чернетку");
    delete motionReview.sessions.parent_3;
    store = coordinatorStore;
    location.search = "";
    location.hash = "#/survey";
    motionReview.active = "parent_1";
    motionReview.view = { status: "all", age: "all" };
    const motionReviewExport = motionReviewCsv();
    const motionReviewSummary = motionReviewOverview();
    const initialReleaseGate = motionReviewReleaseGate();
    const motionSessionPayload = motionReviewSessionPayload("parent_1");
    const motionSessionRoundTrip = validateMotionReviewSessionPayload(motionSessionPayload);
    const completeMotionSession = JSON.parse(JSON.stringify(motionSessionPayload));
    reviewVisualIds.forEach((id) => {
      completeMotionSession.cards[id] = {};
      MOTION_REVIEW_CRITERIA.parent.forEach((criterion) => { completeMotionSession.cards[id][criterion.id] = "yes"; });
    });
    const completeMotionSessionRoundTrip = validateMotionReviewSessionPayload(completeMotionSession);
    const tamperedMotionSession = JSON.parse(JSON.stringify(motionSessionPayload));
    tamperedMotionSession.cards[rasterVisualIds[0]].unexpected = "yes";
    const rejectedMotionSession = validateMotionReviewSessionPayload(tamperedMotionSession);
    const staleMotionSession = JSON.parse(JSON.stringify(motionSessionPayload));
    staleMotionSession.contentVersion = "motion-cards-old";
    const rejectedStaleMotionSession = validateMotionReviewSessionPayload(staleMotionSession);
    const undatedMotionSession = JSON.parse(JSON.stringify(motionSessionPayload));
    undatedMotionSession.exportedAt = "not-a-date";
    const rejectedUndatedMotionSession = validateMotionReviewSessionPayload(undatedMotionSession);
    const fullerExistingCards = JSON.parse(JSON.stringify(motionSessionPayload.cards));
    fullerExistingCards[rasterVisualIds[1]] = { action: "yes", hands: "yes", stop: "yes" };
    const downgradeWarnings = motionReviewImportWarnings(MOTION_REVIEW_SESSIONS[0], motionSessionRoundTrip, fullerExistingCards);
    const ageFourReviewIds = reviewVisualIds.filter((id) => id.startsWith("act_004_"));
    motionReview.view = { status: "pending", age: "4" };
    const ageBatchMarkup = renderVisualPilot();
    motionReview.sessions.parent_1.cards[ageFourReviewIds[0]] = { action: "no" };
    motionReview.view = { status: "issues", age: "4" };
    const issueBatchMarkup = renderVisualPilot();
    const motionReviewFiltersOkay = freshMotionReview().view.status === "pending"
      && freshMotionReview().view.age === "all"
      && freshMotionReview().storeVersion === MOTION_REVIEW_STORE_VERSION
      && (ageBatchMarkup.match(/class="pilot-review"/g) || []).length === ageFourReviewIds.length
      && ageBatchMarkup.includes("Коротка review-партія")
      && ageBatchMarkup.includes("Показано " + ageFourReviewIds.length + " із 60")
      && (ageBatchMarkup.match(/data-review-age-filter=/g) || []).length === 6
      && (ageBatchMarkup.match(/data-review-status-filter=/g) || []).length === 3
      && (issueBatchMarkup.match(/class="pilot-review"/g) || []).length === 1
      && issueBatchMarkup.includes("Є «Ні» <b>1</b>");
    const collectionDashboardOkay = motionReviewMarkup.includes('aria-label="Стан збору файлів"')
      && motionReviewMarkup.includes("Отримано чернетку 1/60")
      && motionReviewMarkup.includes("Очікуємо файл")
      && motionReviewMarkup.includes("Файл від") && motionReviewMarkup.includes("імпортовано")
      && motionReviewSummary.collectionComplete === 0 && motionReviewSummary.collectionDrafts === 1
      && motionReviewSummary.collectionWaiting === 5 && motionReviewSummary.collectionStale === 0;
    const motionReviewBaseOkay = motionReviewProgressText() === "Перевірено 1 із 60"
      && (motionReviewMarkup.match(/data-review-session=/g) || []).length === 6
      && (motionReviewMarkup.match(/data-copy-review-link=/g) || []).length === 6
      && (motionReviewMarkup.match(/Копіювати запрошення/g) || []).length === 6
      && (motionReviewMarkup.match(/class="pilot-review"/g) || []).length === 60
      && motionReviewMarkup.includes("activity-tummy-time-guide-v1.png")
      && motionReviewMarkup.includes("Бібліотека з 60 карток")
      && motionReviewMarkup.includes(firstReviewerTitle)
      && motionReviewMarkup.includes('data-motion-review="' + rasterVisualIds[0] + '"')
      && motionReviewMarkup.includes("Відповіді зберігаються лише в цьому браузері")
      && motionReviewMarkup.includes('id="exportMotionReview"')
      && motionReviewMarkup.includes('id="exportMotionGate"')
      && motionReviewMarkup.includes('id="exportMotionSession"')
      && motionReviewMarkup.includes('id="importMotionSession"')
      && motionReviewMarkup.includes("Передати окрему сесію")
      && motionReviewMarkup.includes("60 із 60 перевірених карток")
      && motionReviewMarkup.includes("Запуск рев’ю: посилання та запрошення")
      && expertReviewerUrl.includes("reviewSession=expert") && expertReviewerUrl.endsWith("#/visual-pilot")
      && invitationsOkay
      && reviewerRouteBypassOkay && reviewerHistoryOkay && checkpointOkay && reviewerCompletionOkay
      && reviewOrderOkay
      && motionReviewMarkup.includes("Gate публікації")
      && initialReleaseGate.pending === 60 && initialReleaseGate.ready === 0 && initialReleaseGate.issues === 0
      && motionReviewMarkup.includes("Завершено сесій: 0 із 6")
      && collectionDashboardOkay
      && motionReviewExport.startsWith("\uFEFF")
      && motionReviewExport.includes('"session_id","учасник","роль"')
      && motionReviewExport.includes('"Мама 1"')
      && motionReviewExport.includes('"зрозуміло"')
      && motionReviewSummary.completeSessions === 0 && motionReviewSummary.issues === 0
      && motionSessionPayload.schema === MOTION_REVIEW_SESSION_SCHEMA
      && motionSessionPayload.version === MOTION_REVIEW_SESSION_VERSION
      && motionSessionPayload.contentVersion === MOTION_REVIEW_CONTENT_VERSION
      && motionSessionPayload.reviewOrderVersion === MOTION_REVIEW_ORDER_VERSION
      && motionSessionPayload.sessionId === "parent_1"
      && !JSON.stringify(motionSessionPayload).includes("children")
      && motionSessionRoundTrip.ok && motionSessionRoundTrip.cards[rasterVisualIds[0]].action === "yes"
      && motionSessionRoundTrip.exportedAt === motionSessionPayload.exportedAt
      && motionSessionRoundTrip.reviewed === 1 && motionSessionRoundTrip.total === 60 && !motionSessionRoundTrip.complete
      && completeMotionSessionRoundTrip.ok && completeMotionSessionRoundTrip.reviewed === 60 && completeMotionSessionRoundTrip.complete
      && !rejectedMotionSession.ok && !rejectedStaleMotionSession.ok && !rejectedUndatedMotionSession.ok
      && downgradeWarnings.some((warning) => warning.includes("повніша версія: 2 із 60"))
      && motionReviewFiltersOkay
      && MOTION_REVIEW_CRITERIA.parent.length === 3
      && MOTION_REVIEW_CRITERIA.expert.length === 4;
    const releaseReadyId = rasterVisualIds.find((id) => !id.startsWith("act_004_"));
    MOTION_REVIEW_SESSIONS.forEach((meta) => {
      motionReview.sessions[meta.id] = motionReview.sessions[meta.id] || { contentVersion: MOTION_REVIEW_CONTENT_VERSION, cards: {} };
      motionReview.sessions[meta.id].contentVersion = MOTION_REVIEW_CONTENT_VERSION;
      motionReview.sessions[meta.id].cards = motionReview.sessions[meta.id].cards || {};
      motionReview.sessions[meta.id].cards[releaseReadyId] = {};
      MOTION_REVIEW_CRITERIA[meta.type].forEach((criterion) => {
        motionReview.sessions[meta.id].cards[releaseReadyId][criterion.id] = "yes";
      });
    });
    const releaseGate = motionReviewReleaseGate();
    const releaseGateExport = motionReviewReleaseCsv();
    motionReview.sessions.expert.contentVersion = "motion-cards-old";
    motionReview.active = "expert";
    motionReview.view = { status: "all", age: "all" };
    const staleReleaseGate = motionReviewReleaseGate();
    const staleReviewMarkup = renderVisualPilot();
    motionReview.sessions.expert.contentVersion = MOTION_REVIEW_CONTENT_VERSION;
    motionReview.active = "parent_1";
    const motionReviewOkay = motionReviewBaseOkay
      && releaseGate.ready === 1 && releaseGate.issues === 1 && releaseGate.pending === 58
      && staleReleaseGate.ready === 0 && staleReleaseGate.issues === 1 && staleReleaseGate.pending === 59
      && staleReleaseGate.staleSessions === 1
      && staleReviewMarkup.includes("Картки змінилися після цієї перевірки")
      && staleReviewMarkup.includes('id="restartMotionReviewVersion"')
      && staleReviewMarkup.includes("Застаріла версія")
      && releaseGateExport.startsWith("\uFEFF")
      && releaseGateExport.includes('"стан_gate","завершено_сесій"')
      && releaseGateExport.includes('"готова до рішення"')
      && releaseGateExport.includes('"потрібне виправлення"');
    libraryUi = { query: "сон", topic: "all" };
    const librarySearchResults = filteredLibraryItems();
    libraryUi = { query: "", topic: "safety" };
    const librarySafetyResults = filteredLibraryItems();
    const outdoorSearchesWork = ["прогулянка", "гуляти", "коляска"].every((query) => {
      libraryUi = { query, topic: "all" };
      return filteredLibraryItems().some((item) => item.id === "walk-hot-weather");
    });
    libraryUi = { query: "підгузки", topic: "all" };
    const libraryFallbackMarkup = libraryResultsHtml();
    libraryUi = { query: "", topic: "safety" };
    const libraryMarkup = renderLibrary();
    const libraryOkay = librarySearchResults.some((item) => item.id === "sleep-routine")
      && librarySafetyResults.length === 3
      && librarySafetyResults.every((item) => item.topic === "safety")
      && outdoorSearchesWork
      && libraryFallbackMarkup.includes("Точного збігу поки немає")
      && libraryFallbackMarkup.includes("Показати всі матеріали")
      && !libraryFallbackMarkup.includes("Нічого не знайшлося")
      && libraryMarkup.includes('id="librarySearch"')
      && libraryMarkup.includes('data-library-topic="safety"')
      && libraryMarkup.includes('class="library-source-link"')
      && libraryMarkup.includes("Джерело")
      && libraryMarkup.includes("Статус і застереження")
      && libraryMarkup.includes("Експертне рев’ю ще не завершено")
      && !NAV.some((item) => item.route === "library");
    first.activityCompletions[completionKey(4)] = { activityId: playStep.task.act.id };
    first.favoriteActivities.push(playStep.task.act.id);
    first.activityReactions[completionKey(4)] = "liked";
    first.activityNotes[completionKey(4)] = "Повернула голову на голос і потім відвернулася.";
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayKey = localDateString(yesterday) + ":4";
    first.activityCompletions[yesterdayKey] = { activityId: playStep.task.act.id };
    first.activityReactions[yesterdayKey] = "not_today";
    first.activityNotes[yesterdayKey] = "Коротко подивилася на іграшку.";
    const eightDaysAgo = new Date();
    eightDaysAgo.setDate(eightDaysAgo.getDate() - 8);
    first.activityCompletions[localDateString(eightDaysAgo) + ":4"] = { activityId: playStep.task.act.id };
    const weekly = weeklyPlaySummary(first);
    const weeklyMarkup = weeklyRecapHtml(weekly);
    const weeklyRecapOkay = weekly.count === 2 && weekly.liked === 1 && weekly.notToday === 1 && weekly.notes === 2
      && weeklyMarkup.includes("Кілька теплих моментів гри")
      && weeklyMarkup.includes("короткі спостереження")
      && weeklyMarkup.includes("немає обов'язкової серії")
      && !weeklyMarkup.includes('role="progressbar"')
      && !weeklyMarkup.includes("data-go=");
    const moments = privateMoments(first);
    const momentsMarkup = privateMomentsHtml(moments);
    const privateMomentsOkay = moments.length === 2
      && moments[0].key === completionKey(4)
      && momentsMarkup.includes("Маленькі моменти")
      && momentsMarkup.includes("Показуємо максимум три записи")
      && (momentsMarkup.match(/data-delete-moment=/g) || []).length === 2
      && !momentsMarkup.includes('role="progressbar"')
      && !momentsMarkup.includes("поділитися");
    const doneStep = homeNextStep(4);
    const doneMarkup = renderHome();
    const currentProgramDay = programState.program[programState.currentIndex];
    const upcomingProgramDay = programState.program[(programState.currentIndex + 1) % programState.program.length];
    const todayMarkup = todayActivityHtml(4, currentProgramDay);
    const upcomingMarkup = dayAccordionHtml(4, upcomingProgramDay);
    const savedMarkup = savedGamesHtml(4);
    const selectedPlayId = programState.selected[currentProgramDay.day] || currentProgramDay.options[0];
    first.activePlaySession = { activityId: selectedPlayId, age: 4, startedAt: new Date().toISOString() };
    const activeSessionMarkup = playSessionControlsHtml(4, selectedPlayId);
    first.activePlaySession = null;
    const diaryProbe = { id: "play_probe", age: 4, activityId: selectedPlayId, startedAt: new Date().toISOString(), endedAt: new Date().toISOString(), durationSeconds: 125, reaction: "liked", signal: "voice", note: "Усміхнулася на голос.", saved: false, nextChoice: "" };
    first.playDiary.unshift(diaryProbe);
    const reflectionMarkup = playSessionControlsHtml(4, selectedPlayId);
    diaryProbe.saved = true;
    const continueMarkupAfterPlay = playSessionControlsHtml(4, selectedPlayId);
    diaryProbe.nextChoice = "later";
    const scheduleMarkup = playSessionControlsHtml(4, selectedPlayId);
    const diaryMarkup = playDiaryHtml(first);
    first.playDiary = [];
    first.activePlaySession = null;
    const selectedActivity = activityById(4, selectedPlayId);
    const selectedStop = selectedActivity.stop;
    selectedActivity.stop = "";
    const unsafeStartBlocked = !startPlaySession(4, selectedPlayId)
      && playSessionControlsHtml(4, selectedPlayId).includes("Початок гри заблоковано")
      && !playSessionControlsHtml(4, selectedPlayId).includes('id="startPlaySession"');
    selectedActivity.stop = selectedStop;
    const sessionStarted = startPlaySession(4, selectedPlayId);
    const otherPlayId = dailyPlayChoiceIds(4, currentProgramDay).find((id) => id !== selectedPlayId);
    const parallelSessionBlocked = otherPlayId ? !startPlaySession(4, otherPlayId) : true;
    const finishedSession = finishPlaySession(4, selectedPlayId);
    const sessionLifecycleOkay = sessionStarted && parallelSessionBlocked && finishedSession && !first.activePlaySession
      && first.playDiary[0].id === finishedSession.id && first.playDiary[0].saved === false;
    const releaseGateOkay = canonicalPromptsOnly
      && draftAuthorHidden
      && safetyEscapesHtml
      && unsafeStartBlocked
      && todayMarkup.indexOf('class="activity-safety-strip"') < todayMarkup.indexOf('id="startPlaySession"')
      && !CONTENT_RELEASE.expertApproved;
    first.playDiary = [];
    const gentleEngagementOkay = todayMarkup.includes('data-favorite-id="' + playStep.task.act.id + '"')
      && todayMarkup.includes("Збережено")
      && reflectionMarkup.includes('data-diary-reaction="liked"')
      && reflectionMarkup.includes("Не сьогодні")
      && reflectionMarkup.includes("Було складно")
      && reflectionMarkup.includes('data-diary-note="play_probe"')
      && reflectionMarkup.includes("пам’ять про момент, не оцінка дитини")
      && savedMarkup.includes('data-saved-game="' + playStep.task.act.id + '"');
    const livelyDayOkay = (todayMarkup.match(/data-daily-play-choice=/g) || []).length === 3
      && todayMarkup.includes("Одна — достатньо")
      && todayMarkup.includes('<details class="activity-more">')
      && playContextHtml(4).includes('<details class="play-context"')
      && playContextHtml(4).includes("Підібрати під момент")
      && activeSessionMarkup.includes('class="play-timer"')
      && [2, 3, 5].every((minutes) => activeSessionMarkup.includes('data-play-timer-minutes="' + minutes + '"'))
      && reflectionMarkup.includes('data-diary-signal="voice"')
      && startMarkup.includes("Хвилина для батьків")
      && startMarkup.includes("Перевірити себе")
      && startMarkup.includes("Освітня чернетка до експертного рев’ю")
      && todayMarkup.includes('id="startPlaySession"')
      && activeSessionMarkup.includes('id="finishPlaySession"')
      && activeSessionMarkup.includes("таймер")
      && reflectionMarkup.includes("Зберегти в щоденник")
      && continueMarkupAfterPlay.includes("Ще одна зараз")
      && continueMarkupAfterPlay.includes("Нагадати пізніше")
      && scheduleMarkup.includes('type="time"')
      && scheduleMarkup.includes("Сьогодні") && scheduleMarkup.includes("Завтра")
      && diaryMarkup.includes("Щоденник гри") && diaryMarkup.includes("Усміхнулася на голос");
    const livelyProbe = freshChild("Проба", localDateString(fourMonthsAgo));
    const livelyChoiceIds = dailyPlayChoiceIds(4, currentProgramDay);
    const extraLivelyId = ACTIVITIES_BY_AGE[4].map((activity) => activity.id).find((id) => !livelyChoiceIds.includes(id));
    const firstThreeSaved = livelyChoiceIds.every((id) => toggleActivityCompletion(4, id, livelyProbe));
    livelyProbe.activitySignals[activitySignalKey(4, livelyChoiceIds[0])] = "voice";
    const fourthBlocked = extraLivelyId ? !toggleActivityCompletion(4, extraLivelyId, livelyProbe) : true;
    const undoWorks = toggleActivityCompletion(4, livelyChoiceIds[0], livelyProbe);
    const multiDailyOkay = livelyChoiceIds.length === 3 && firstThreeSaved && fourthBlocked && undoWorks
      && completedActivityIdsToday(4, livelyProbe).length === 2
      && !livelyProbe.activitySignals[activitySignalKey(4, livelyChoiceIds[0])];
    const programUiOkay = programMarkup.includes('<div id="programToday"></div>')
      && programMarkup.includes('<div id="playContext"></div>')
      && programMarkup.includes('<details class="week-plan">')
      && programMarkup.includes('class="play-cycle"')
      && programMarkup.includes("Цикл 7 днів")
      && programMarkup.includes("можливість, а не лікувальна доза")
      && todayMarkup.includes('class="day-acc open today-game"')
      && todayMarkup.includes('class="daily-play-menu"')
      && todayMarkup.includes('id="startPlaySession"')
      && !todayMarkup.includes('class="thumb-action"')
      && !todayMarkup.includes('class="illus"')
      && !todayMarkup.includes('data-day-toggle=')
      && upcomingMarkup.includes('data-day-toggle=')
      && !upcomingMarkup.includes('id="toggleTodayDone"');
    const homeNextStepOkay = startStep.kind === "start-observation"
      && continueStep.kind === "continue-observation"
      && continueStep.progress.value === 1
      && playStep.kind === "play-today"
      && doneStep.kind === "done-today"
      && [startMarkup, continueMarkup, playMarkup].every((markup) => (markup.match(/data-primary-action=/g) || []).length === 1)
      && (doneMarkup.match(/data-primary-action=/g) || []).length === 0
      && [startMarkup, continueMarkup, playMarkup, doneMarkup].every((markup) => markup.includes('<h1 tabindex="-1">Сьогодні</h1>') && markup.includes('class="card next-step'))
      && [startMarkup, continueMarkup, playMarkup, doneMarkup].every((markup) => markup.includes("Короткі відповіді") && markup.includes("Записи"))
      && [startMarkup, continueMarkup, playMarkup, doneMarkup].every((markup) => !markup.includes("data-home-card=") && !markup.includes('class="home-tabs"') && !markup.includes('role="tablist"'))
      && !startMarkup.includes("Для фахівця")
      && !continueMarkup.includes("Для фахівця")
      && playMarkup.includes("Для фахівця")
      && doneMarkup.includes("Для фахівця")
      && typeof initHomeDeck === "undefined"
      && typeof activateHomeTab === "undefined";
    first.snapshots.push({ id: "snap_existing" });
    first.programSelections["4"] = { "1": "act_004_language_001" };
    first.activityCompletions[completionKey(4)] = { activityId: "act_004_language_001" };
    first.activityReactions[completionKey(4)] = "liked";
    first.activityNotes[completionKey(4)] = "Усміхнулася на голос";
    first.dailyPlayCompletions[completionKey(4)] = ["act_004_language_001", "act_004_movement_001"];
    first.activitySignals[activitySignalKey(4, "act_004_language_001")] = "voice";
    first.activePlaySession = { activityId: "act_004_language_001", age: 4, startedAt: new Date().toISOString() };
    first.playDiary = [{ id: "pending", activityId: "act_004_language_001", age: 4, startedAt: new Date().toISOString(), endedAt: new Date().toISOString(), reaction: "", signal: "", note: "", saved: false }];
    const questionIdsBeforeRestart = [...first.surveys[4].questionIds];
    const playStateBeforeRestart = JSON.stringify({
      programSelections: first.programSelections["4"],
      completion: first.activityCompletions[completionKey(4)],
      reaction: first.activityReactions[completionKey(4)],
      note: first.activityNotes[completionKey(4)],
      daily: first.dailyPlayCompletions[completionKey(4)],
      signal: first.activitySignals[activitySignalKey(4, "act_004_language_001")],
      activeSession: first.activePlaySession,
      diary: first.playDiary
    });

    restartSurvey(4);
    restartSurvey(4);
    const playStateAfterRestart = JSON.stringify({
      programSelections: first.programSelections["4"],
      completion: first.activityCompletions[completionKey(4)],
      reaction: first.activityReactions[completionKey(4)],
      note: first.activityNotes[completionKey(4)],
      daily: first.dailyPlayCompletions[completionKey(4)],
      signal: first.activitySignals[activitySignalKey(4, "act_004_language_001")],
      activeSession: first.activePlaySession,
      diary: first.playDiary
    });
    const restartOkay = first.surveys[4].date === null
      && Object.keys(first.surveys[4].states).length === 0
      && Object.keys(first.surveys[4].variants).length === 0
      && JSON.stringify(first.surveys[4].questionIds) === JSON.stringify(questionIdsBeforeRestart)
      && first.snapshots.length === 1
      && playStateAfterRestart === playStateBeforeRestart
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
      && specialistSummary.includes("СПОСТЕРЕЖЕННЯ ПІСЛЯ ІГОР ЗА ОСТАННІ 14 ДНІВ")
      && specialistSummary.includes("Коротко подивилася на іграшку")
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
      && Object.keys(migrated.children[0].activityNotes).length === 0
      && Object.keys(migrated.children[0].dailyPlayCompletions).length === 0
      && Object.keys(migrated.children[0].activitySignals).length === 0
      && migrated.children[0].playDiary.length === 0
      && migrated.children[0].activePlaySession === null
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

    return { restartOkay, finishIsIdempotent, childrenIsolated, migrationOkay, historyOkay, homeNextStepOkay, programUiOkay, livelyDayOkay: livelyDayOkay && multiDailyOkay && sessionLifecycleOkay, compactResultsOkay, specialistPrepOkay, oneThumbSurveyOkay, emotionalCopyOkay, navIconsOkay, accessibilityOkay: accessibilityOkay && homeProgressAccessibilityOkay, dataBackupOkay, correctedAgeOkay, releaseGateOkay, gentleEngagementOkay, weeklyRecapOkay, privateMomentsOkay, contextFilterOkay, visualGuideOkay, collectionDashboardOkay, motionReviewOkay, libraryOkay, followUpRoutingOkay };
  })()`, context);

  assert.equal(result.restartOkay, true, "re-test must reset only the survey draft and preserve all play records");
  assert.equal(result.finishIsIdempotent, true, "finishing the same survey twice must not create duplicate snapshots");
  assert.equal(result.childrenIsolated, true, "children must not share surveys, notes, or completions");
  assert.equal(result.migrationOkay, true, "legacy single-child data must migrate losslessly");
  assert.equal(result.historyOkay, true, "history comparison must support old snapshots and describe answer changes");
  assert.equal(result.homeNextStepOkay, true, "home must expose one contextual primary action followed by secondary routes in document flow");
  assert.equal(result.programUiOkay, true, "program must keep today's game open and future days secondary");
  assert.equal(result.livelyDayOkay, true, "P2.56 must preserve the compact play lifecycle");
  assert.equal(result.compactResultsOkay, true, "results must lead with one next step and keep detailed answers collapsed");
  assert.equal(result.specialistPrepOkay, true, "specialist prep must keep one overview, three structured notes, and a copyable summary");
  assert.equal(result.oneThumbSurveyOkay, true, "survey answers must save and advance without a separate next button");
  assert.equal(result.emotionalCopyOkay, true, "sensitive observation copy must keep the emotion-aware, explicitly non-conclusive guardrails");
  assert.equal(result.navIconsOkay, true, "bottom navigation must use one consistent four-icon SVG set");
  assert.equal(result.accessibilityOkay, true, "survey and home must expose focused, concise accessibility semantics");
  assert.equal(result.dataBackupOkay, true, "local backup must round-trip valid data and reject malformed answers");
  assert.equal(result.correctedAgeOkay, true, "age routing must use the youngest completed window and keep pre-2-month profiles out of older checklists");
  assert.equal(result.releaseGateOkay, true, "ordinary content must keep draft variants and author notes gated while safety stays visible before play");
  assert.equal(result.gentleEngagementOkay, true, "favorites and optional post-play feedback must stay calm and local per child");
  assert.equal(result.weeklyRecapOkay, true, "weekly recap must describe recent play without a streak, progress bar, or competing action");
  assert.equal(result.privateMomentsOkay, true, "private moments must reuse local notes, show at most three, and support individual deletion without social mechanics");
  assert.equal(result.contextFilterOkay, true, "context picker must use honest activity attributes and authored low-energy variants across all ages");
  assert.equal(result.visualGuideOkay, true, "all 60 activities need four-frame guides and unchanged detailed safety steps");
  assert.equal(result.collectionDashboardOkay, true, "Motion review collection must distinguish complete files, drafts, waiting sessions, and stale evidence");
  assert.equal(result.motionReviewOkay, true, "Motion Cards need isolated review sessions plus a per-card release gate that never auto-approves drafts");
  assert.equal(result.libraryOkay, true, "E4 library must stay searchable, source-visible, draft-labelled, and secondary to the four-item navigation");
  assert.equal(result.followUpRoutingOkay, true, "not-yet must route to discussion while not-sure gets a 7–14 day re-observation window");
}

(async () => {
  testCurrentBuildBoundary();
  testContentAndEngine();
  testAppState();
  testStorageFailureRecovery();
  testReviewBuildIsolation();
  await testServiceWorker();
  await testPwaInstallUi();
  console.log("P1/P2/E4 QA passed: one contextual Home action with stable secondary routes, compact Game and one-glance Results, explicit play sessions, optional timer, diary and reminders, preserved specialist routing, 60 visual guides with safety details, 5 ages, content integrity, guarded local storage, offline shell, backup/restore, migration, and multi-child isolation.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
