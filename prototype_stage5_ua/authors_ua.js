// Author-inspired "approach" notes per activity (UA).
// Seeded from knowledge_base/recommendation_author_map.csv, then broadened to FULL coverage
// by mechanism: every activity in this product rests on one Silver mechanism (its own
// evidence is "На основі механізму"), so each activity is attributed to the author who best
// exemplifies that mechanism's FORM of play.
//
// SAFETY (docs/safety_rules.md §6): Bronze / inspiration only. Shown only because each maps
// to a Silver mechanism / Gold guideline. Paraphrased, never a guarantee, never
// "behind/advanced". High-caution authors (Doman, Shichida, Ibuka, Sears, Maté, Sasse,
// Montessori-as-proof) are deliberately NOT surfaced. Status: draft — pending the same
// expert review gate as other parent-facing content.

const _MECH = {
  smx: "сенсомоторне дослідження",
  sr: "serve-and-return (взаємний обмін) і гра",
  resp: "чуйна турбота і ко-регуляція",
  play: "гра і практика саморегуляції"
};
const _LEVEL = { bronze: "Натхнення (форма)", silver: "Узгоджено з механізмом" };

const _PIKLER = { author: "Emmi Pikler", idea: "вільний, неквапливий самостійний рух і дослідження у безпечному просторі, без нав'язаних поз", mechanism: _MECH.smx, level: _LEVEL.bronze };
const _HPG = { author: "Hirsh-Pasek і Golinkoff", idea: "грайливий діалог по черзі живить раннє мовлення", mechanism: _MECH.sr, level: _LEVEL.silver };
const _HARVARD_SR = { author: "Harvard Center on the Developing Child", idea: "помічайте сигнали дитини й тепло відповідайте по черзі", mechanism: _MECH.sr, level: _LEVEL.silver };
const _LIEBERMAN = { author: "Alicia F. Lieberman", idea: "чуйні відповіді на сигнали дитини будують емоційну безпеку", mechanism: _MECH.resp, level: _LEVEL.silver };
const _HARVARD_PLAY = { author: "Harvard Center on the Developing Child", idea: "коротка гра за віком підтримує увагу, чергування і саморегуляцію", mechanism: _MECH.play, level: _LEVEL.silver };

const ACTIVITY_AUTHOR_NOTES = {
  // Pikler — free, self-initiated movement & sensory-motor exploration
  act_002_movement_001: _PIKLER, act_002_movement_002: _PIKLER,
  act_004_movement_001: _PIKLER, act_004_movement_002: _PIKLER, act_004_cognitive_002: _PIKLER,
  act_006_movement_001: _PIKLER, act_006_movement_002: _PIKLER, act_006_cognitive_001: _PIKLER,
  act_009_movement_001: _PIKLER, act_009_movement_002: _PIKLER,
  act_012_movement_001: _PIKLER, act_012_movement_002: _PIKLER,

  // Hirsh-Pasek & Golinkoff — playful vocal conversational duet
  act_004_language_001: _HPG, act_006_language_001: _HPG, act_006_language_002: _HPG, act_009_language_001: _HPG,

  // Harvard — serve-and-return (notice & respond) social/language routines
  act_002_social_002: _HARVARD_SR, act_002_language_001: _HARVARD_SR, act_002_language_002: _HARVARD_SR,
  act_004_language_002: _HARVARD_SR, act_009_social_002: _HARVARD_SR, act_009_language_002: _HARVARD_SR,
  act_012_language_001: _HARVARD_SR, act_012_language_002: _HARVARD_SR,

  // Lieberman — responsive caregiving / co-regulation (soothing, responsive feeding)
  act_002_social_001: _LIEBERMAN, act_006_social_001: _LIEBERMAN, act_006_cognitive_002: _LIEBERMAN,

  // Harvard — brain-building play / executive-function practice (games, attention, cause-effect)
  act_002_cognitive_001: _HARVARD_PLAY, act_002_cognitive_002: _HARVARD_PLAY,
  act_004_social_001: _HARVARD_PLAY, act_004_social_002: _HARVARD_PLAY, act_004_cognitive_001: _HARVARD_PLAY,
  act_006_social_002: _HARVARD_PLAY,
  act_009_social_001: _HARVARD_PLAY, act_009_cognitive_001: _HARVARD_PLAY, act_009_cognitive_002: _HARVARD_PLAY,
  act_012_social_001: _HARVARD_PLAY, act_012_social_002: _HARVARD_PLAY,
  act_012_cognitive_001: _HARVARD_PLAY, act_012_cognitive_002: _HARVARD_PLAY,

  // 3rd activity per (age × domain) — same mechanism-based attribution
  act_002_social_003: _LIEBERMAN, act_002_language_003: _HARVARD_SR, act_002_cognitive_003: _HARVARD_PLAY, act_002_movement_003: _PIKLER,
  act_004_social_003: _HARVARD_PLAY, act_004_language_003: _HPG, act_004_cognitive_003: _HARVARD_PLAY, act_004_movement_003: _PIKLER,
  act_006_social_003: _HARVARD_PLAY, act_006_language_003: _HPG, act_006_cognitive_003: _PIKLER, act_006_movement_003: _PIKLER,
  act_009_social_003: _HARVARD_PLAY, act_009_language_003: _HPG, act_009_cognitive_003: _HARVARD_PLAY, act_009_movement_003: _PIKLER,
  act_012_social_003: _HARVARD_PLAY, act_012_language_003: _HARVARD_SR, act_012_cognitive_003: _HARVARD_PLAY, act_012_movement_003: _PIKLER
};

function authorNoteFor(id) {
  return (typeof ACTIVITY_AUTHOR_NOTES !== "undefined" && ACTIVITY_AUTHOR_NOTES[id]) || null;
}
