// WHO "windows of achievement" for gross-motor milestones — a calm "typical range" layer.
// Source: WHO Motor Development Study (2006), Acta Paediatr Suppl 450:86-95
// (sources/who-motor-development-study-...pdf; reference: data/who_motor_windows_0_12.csv).
// Window = 1st–99th percentile range, i.e. where almost all typically-developing children fall.
//
// SAFETY (docs/safety_rules.md): reassurance only — it shows the WIDE normal range so a
// parent sees that "earlier / later" is expected. It is never a score, deadline, or pass/fail.
// Mapping to our milestone ids is conservative; "standing with assistance" is approximate.
// Status: DRAFT — pending the same expert-review gate as other parent-facing content.

const WHO_WINDOW_BY_ID = {
  ms_009_movement_004: { lo: 3.8, hi: 9.2, label: "сидіння без підтримки" },
  ms_012_movement_001: { lo: 4.8, hi: 11.4, label: "вставання з опорою" },
  ms_012_movement_002: { lo: 5.9, hi: 13.7, label: "ходьба вздовж опори" }
};

function whoWindowFor(id) {
  const w = WHO_WINDOW_BY_ID[id];
  if (!w) return "";
  const f = (n) => String(n).replace(".", ",");
  return `Орієнтир ВООЗ: ${w.label} зазвичай з'являється приблизно між ${f(w.lo)} і ${f(w.hi)} міс — широкий діапазон норми, у кожної дитини по-своєму.`;
}
