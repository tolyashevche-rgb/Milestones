// Milestones Map — personalization engine (framework-aligned, Profile-of-focus / option A).
//
// Pure logic, no DOM, language-independent: it works on stable ids and returns
// structured data (domain keys, milestone ids, activity ids, a day schedule).
// The language layer (app.js) renders the human text.
//
// Safety guardrails baked in (see research_foundation.md / developmental_memory_plan.md):
//   - No score, level, percentile or risk is ever produced. "weight" is an internal
//     ordering hint only and must not be shown to the parent as a number.
//   - Program = opportunities for play woven into the day, never a treatment dose.
//   - "complexity" means how many focus areas / how much support, NOT severity of delay.

const DOMAIN_KEYS = ["social", "language", "cognitive", "movement"];

// Tunable parameters. These are starting hypotheses to validate with the parent test
// and expert review — deliberately NOT hard-coded into the logic below.
const ENGINE_CONFIG = {
  cycleDays: 14,       // 1-2 week play cycle (engagement clock, not a re-screening clock)
  maxFocus: 2,         // primary focus domains shown prominently (1-2 to avoid overload)
  optionsPerDay: 2,    // primary same-domain ideas per day; doing one already "counts"
  bonusPerDay: 2,      // optional cross-domain "if in the mood" ideas added to each day
  notYetWeight: 2,     // "not yet" weighs more than "not sure" when choosing focus
  notSureWeight: 1
};

// ms_006_social_001 / act_006_social_001 -> "social"
function domainOf(id) {
  const parts = String(id).split("_");
  return parts.length >= 3 ? parts[2] : null;
}

// Build the focus profile from the parent's milestone states for one age.
// states: { milestoneId: "yes" | "not_sure" | "not_yet" }
function buildProfile(states, age, config = ENGINE_CONFIG) {
  states = states || {};
  const milestones = (typeof MILESTONES_BY_AGE !== "undefined" && MILESTONES_BY_AGE[age]) || [];

  // Per-domain tallies for this age only.
  const stats = {};
  for (const key of DOMAIN_KEYS) {
    stats[key] = { yes: 0, not_sure: 0, not_yet: 0, total: 0, notYetIds: [], notSureIds: [] };
  }
  for (const m of milestones) {
    const key = domainOf(m.id);
    if (!stats[key]) continue;
    stats[key].total++;
    const s = states[m.id];
    if (s === "yes") stats[key].yes++;
    else if (s === "not_sure") { stats[key].not_sure++; stats[key].notSureIds.push(m.id); }
    else if (s === "not_yet") { stats[key].not_yet++; stats[key].notYetIds.push(m.id); }
  }

  // Internal ordering weight (never surfaced as a number).
  const weighted = DOMAIN_KEYS.map((key) => ({
    domain: key,
    weight: stats[key].not_yet * config.notYetWeight + stats[key].not_sure * config.notSureWeight,
    targetMilestoneIds: [...stats[key].notYetIds, ...stats[key].notSureIds]
  }));

  const focus = weighted
    .filter((d) => d.weight > 0)
    .sort((a, b) => b.weight - a.weight)
    .slice(0, config.maxFocus);

  const strengths = DOMAIN_KEYS
    .filter((key) => stats[key].yes > 0)
    .sort((a, b) => stats[b].yes - stats[a].yes)
    .slice(0, 2);

  const answered = DOMAIN_KEYS.reduce((n, k) => n + stats[k].yes + stats[k].not_sure + stats[k].not_yet, 0);

  return {
    age,
    answered,                              // how many milestones the parent actually marked
    total: milestones.length,              // milestones available for this age
    // allClear = every milestone marked AND none flagged (true celebration / maintenance).
    allClear: focus.length === 0 && answered > 0 && answered === milestones.length,
    // partialClear = nothing flagged yet, but not every milestone has been marked.
    partialClear: focus.length === 0 && answered > 0 && answered < milestones.length,
    notStarted: answered === 0,
    strengths,                             // domain keys
    focus,                                 // [{ domain, weight, targetMilestoneIds }]
    stats                                  // per-domain detail for charts/summary
  };
}

// Pick activities for a focus domain: those that support a flagged milestone first,
// then any remaining activities of that domain (for variety across the cycle).
function candidatesForDomain(domain, targetMilestoneIds, age) {
  const activities = (typeof ACTIVITIES_BY_AGE !== "undefined" && ACTIVITIES_BY_AGE[age]) || [];
  const targets = new Set(targetMilestoneIds || []);
  const supporting = [];
  const sameDomain = [];
  for (const a of activities) {
    const supportsTarget = (a.supports || []).some((id) => targets.has(id));
    if (supportsTarget) supporting.push(a.id);
    else if (domainOf(a.id) === domain || (a.supports || []).some((id) => domainOf(id) === domain)) {
      sameDomain.push(a.id);
    }
  }
  // De-duplicate while preserving priority order.
  return [...new Set([...supporting, ...sameDomain])];
}

// All activity ids of a domain for an age (used for optional cross-domain "bonus" ideas).
function activitiesOfDomain(domain, age) {
  const activities = (typeof ACTIVITIES_BY_AGE !== "undefined" && ACTIVITIES_BY_AGE[age]) || [];
  return activities.filter((a) => domainOf(a.id) === domain).map((a) => a.id);
}

// Distribute cycleDays across focus domains, weight-proportional, min 1 day each.
function allocateDays(focus, cycleDays) {
  if (!focus.length) return [];
  const totalWeight = focus.reduce((s, d) => s + d.weight, 0) || focus.length;
  // Initial proportional allocation, floored, then hand out remainder by largest fractional part.
  const raw = focus.map((d) => ({ domain: d.domain, exact: (d.weight / totalWeight) * cycleDays }));
  const alloc = raw.map((r) => ({ domain: r.domain, days: Math.max(1, Math.floor(r.exact)), frac: r.exact - Math.floor(r.exact) }));
  let used = alloc.reduce((s, a) => s + a.days, 0);
  // Adjust up or down to exactly cycleDays.
  const byFracDesc = [...alloc].sort((a, b) => b.frac - a.frac);
  let i = 0;
  while (used < cycleDays) { byFracDesc[i % byFracDesc.length].days++; used++; i++; }
  const byDaysDesc = [...alloc].sort((a, b) => b.days - a.days);
  i = 0;
  while (used > cycleDays) { const t = byDaysDesc[i % byDaysDesc.length]; if (t.days > 1) { t.days--; used--; } i++; }
  return alloc;
}

// Build a day-by-day play program from a profile.
// Returns [{ day, domain, options: [primary same-domain ids], bonus: [{domain, id}, ...] }]
// "options" stay the day's primary focus; "bonus" are optional cross-domain ideas so a day
// can touch several developmental areas. One activity already counts — bonus is never a dose.
function buildProgram(profile, age, config = ENGINE_CONFIG) {
  const days = [];

  // Cross-domain bonus pool: a rotating index per domain so optional ideas vary day to day.
  const bonusPools = {};
  for (const dk of DOMAIN_KEYS) bonusPools[dk] = { cands: activitiesOfDomain(dk, age), idx: 0 };
  function pickBonus(primaryDomain, dayIdx) {
    const others = DOMAIN_KEYS.filter((k) => k !== primaryDomain && bonusPools[k].cands.length);
    const out = [];
    for (let b = 0; b < config.bonusPerDay && others.length; b++) {
      const dom = others[(dayIdx + b) % others.length];
      const pool = bonusPools[dom];
      out.push({ domain: dom, id: pool.cands[pool.idx % pool.cands.length] });
      pool.idx++;
    }
    return out;
  }

  // Maintenance mode: nothing flagged -> light rotation across all domains, no pressure.
  // Covers both allClear (everything marked) and partialClear (some still unmarked).
  if (profile.allClear || profile.partialClear) {
    const activities = (typeof ACTIVITIES_BY_AGE !== "undefined" && ACTIVITIES_BY_AGE[age]) || [];
    for (let d = 1; d <= config.cycleDays; d++) {
      const a = activities[(d - 1) % activities.length];
      const dom = domainOf(a.id);
      days.push({ day: d, domain: dom, options: [a.id], bonus: pickBonus(dom, d - 1), maintenance: true });
    }
    return days;
  }

  if (!profile.focus.length) return days; // nothing answered yet

  const alloc = allocateDays(profile.focus, config.cycleDays);

  // Build an ordered list of domains, one entry per assigned day, interleaved so the
  // heavier focus appears more often but days don't clump all on one domain.
  const queue = [];
  const pools = {};
  for (const a of alloc) {
    const f = profile.focus.find((x) => x.domain === a.domain);
    pools[a.domain] = { cands: candidatesForDomain(a.domain, f.targetMilestoneIds, age), idx: 0, left: a.days };
  }
  while (queue.length < config.cycleDays) {
    let pushedAny = false;
    // Order domains by remaining days desc each round for even interleave.
    const order = Object.keys(pools).sort((x, y) => pools[y].left - pools[x].left);
    for (const dom of order) {
      if (pools[dom].left > 0 && queue.length < config.cycleDays) { queue.push(dom); pools[dom].left--; pushedAny = true; }
    }
    if (!pushedAny) break;
  }

  for (let d = 0; d < queue.length; d++) {
    const dom = queue[d];
    const pool = pools[dom];
    const options = [];
    for (let k = 0; k < config.optionsPerDay && pool.cands.length; k++) {
      options.push(pool.cands[pool.idx % pool.cands.length]);
      pool.idx++;
    }
    days.push({ day: d + 1, domain: dom, options: [...new Set(options)], bonus: pickBonus(dom, d) });
  }
  return days;
}
