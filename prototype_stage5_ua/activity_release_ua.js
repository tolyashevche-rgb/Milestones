// Parent-facing activity release boundary for Stage 5 UA.
//
// `authoredDraftIds` means only that the required source fields are structurally complete.
// It is NOT expert approval. `expertApprovedIds` stays empty until attributable review decisions
// are recorded outside the runtime bundle. Unknown IDs and unknown channels fail closed in app5.js.
const ACTIVITY_RELEASE_UA = Object.freeze({
  schema: "milestones.activity-release.ua.v1",
  source: "data/activity_library_0_12_months_ua.csv",
  requiredFields: Object.freeze(["setup", "steps", "what_to_watch", "claim_limit", "stop_rules"]),
  authoredDraftIds: Object.freeze([
    "act_002_social_001",
    "act_002_social_002",
    "act_002_language_001",
    "act_002_language_002",
    "act_002_cognitive_001",
    "act_002_movement_001",
    "act_004_social_001",
    "act_004_language_001",
    "act_004_language_002",
    "act_004_cognitive_001",
    "act_004_cognitive_002",
    "act_004_movement_001",
    "act_006_social_001",
    "act_006_social_002",
    "act_006_language_001",
    "act_006_cognitive_001",
    "act_006_cognitive_002",
    "act_006_movement_001",
    "act_006_movement_002",
    "act_009_social_001",
    "act_009_social_002",
    "act_009_language_001",
    "act_009_language_002",
    "act_009_cognitive_001",
    "act_009_movement_001",
    "act_009_movement_002",
    "act_012_social_001",
    "act_012_language_001",
    "act_012_language_002",
    "act_012_cognitive_001",
    "act_012_cognitive_002",
    "act_012_movement_001",
    "act_012_movement_002"
  ]),
  expertApprovedIds: Object.freeze([])
});
