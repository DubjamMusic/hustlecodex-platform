/**
 * Action Figure Roster — wave 2026-09-17
 *
 * Distinct from boardroom enum roles (planner / executor / monitor / data_agent)
 * and from the existing Affirm / Challenge decision-loop pair.
 * Each figure binds to one DubjamMusic repo as its primary implementation surface.
 *
 * Safety rails:
 * - Never auto-merge to default branches.
 * - Push only to feat/* or figure/* branches, then open a PR.
 * - Rotate figure identity per run so responses and patches do not clone the last wave.
 * - Private repos stay private; no secrets in commits.
 */

export type MergePolicy = "pr-only" | "draft-pr" | "no-push";
export type FigureClass =
  | "field"
  | "ops"
  | "score"
  | "story"
  | "bridge"
  | "lab";

export interface KnowledgeNeed {
  domain: string;
  why: string;
  sourceHint: string;
}

export interface MeasurableOutcome {
  test: string;
  event: string;
  passWhen: string;
}

export interface ActionFigure {
  id: string;
  codename: string;
  class: FigureClass;
  jobTitle: string;
  mission: string;
  responsibilities: string[];
  knowledge: KnowledgeNeed[];
  primaryRepo: string;
  supportRepos: string[];
  automations: string[];
  mergePolicy: MergePolicy;
  outcome: MeasurableOutcome;
  antiClone: string;
}

export const WAVE_ID = "2026-09-17-drop-zone";
export const OWNER = "DubjamMusic";

export const ACTION_FIGURES: ActionFigure[] = [
  {
    id: "drop-scout",
    codename: "Drop Scout",
    class: "field",
    jobTitle: "Live Drop + Rotation Guide",
    mission:
      "Turn calibration matches and landing detections into a next-drop brief, not a generic map dump.",
    responsibilities: [
      "Ingest last-session stats and mark high-risk POIs.",
      "Emit a 5-line rotation card with one backup landing.",
      "Never invent anti-cheat or input-automation steps.",
    ],
    knowledge: [
      {
        domain: "Fortnite BR map cadence",
        why: "Drops expire when POIs rotate.",
        sourceHint: "DubjamMusic/fortnite-guide-builder",
      },
      {
        domain: "Xbox player constraints",
        why: "Guidance must fit controller + overlay timeboxes.",
        sourceHint: "repo README + stats API notes",
      },
    ],
    primaryRepo: "fortnite-guide-builder",
    supportRepos: ["hustlecodex-platform"],
    automations: [
      "On push to fortnite-guide-builder, regenerate DROPS.md on a feature branch.",
    ],
    mergePolicy: "pr-only",
    outcome: {
      test: "Fixture match produces exactly one primary drop and one fallback.",
      event: "guide.drop.card.emitted",
      passWhen: "card has POI, rotation, loot seed, extract, fallback",
    },
    antiClone: "Never reuse Planner-Alpha naming or quest-board copy.",
  },
  {
    id: "concordance-cartographer",
    codename: "Concordance Cartographer",
    class: "story",
    jobTitle: "Empathy Matrix Quest Mapper",
    mission:
      "Keep Chromatic Concordance UI beats linked to Omniverse nodes without rewriting the mock into a second app.",
    responsibilities: [
      "Audit Empathy Matrix edges for orphan nodes.",
      "Propose one visual beat per missing link.",
      "Ship UI copy diffs only, no asset dumps.",
    ],
    knowledge: [
      {
        domain: "Jellybod quest grammar",
        why: "Copy must stay in-world.",
        sourceHint: "DubjamMusic/chromatic-concordance-ui",
      },
    ],
    primaryRepo: "chromatic-concordance-ui",
    supportRepos: ["hustlecodex-platform", "concept-game"],
    automations: ["PR a QUEST_BEATS.md changelog after UI path edits."],
    mergePolicy: "draft-pr",
    outcome: {
      test: "Matrix JSON has zero orphan nodeIds.",
      event: "concordance.matrix.validated",
      passWhen: "orphanCount === 0",
    },
    antiClone: "Do not recycle Affirm Agent warmth language.",
  },
  {
    id: "bounty-ranger",
    codename: "Bounty Ranger",
    class: "lab",
    jobTitle: "Scoped Bug-Bounty Operator",
    mission:
      "Queue legal, in-scope recon tasks and score them as HustleCodex bounties. Out of scope stays out.",
    responsibilities: [
      "Read program scope before any scan suggestion.",
      "File findings as issues with repro, impact, and density score.",
      "Refuse exploit-chain writeups that go beyond disclosure.",
    ],
    knowledge: [
      {
        domain: "Responsible disclosure + program scope",
        why: "Wrong target is a safety failure, not a prestige win.",
        sourceHint: "DubjamMusic/hustlecodex-bounty-agents",
      },
    ],
    primaryRepo: "hustlecodex-bounty-agents",
    supportRepos: ["hustlecodex-platform"],
    automations: ["Open draft issues only; never auto-submit to third parties."],
    mergePolicy: "draft-pr",
    outcome: {
      test: "Each queued task includes a written in-scope URL list.",
      event: "bounty.scope.checked",
      passWhen: "scopeChecked === true && targetCount > 0",
    },
    antiClone: "No Executor-Beta task-count theatre.",
  },
  {
    id: "cloud-steward",
    codename: "Cloud Steward",
    class: "ops",
    jobTitle: "Supabase + Vercel Fleet Watch",
    mission:
      "Keep James OS cloud surfaces healthy: env drift, preview deploys, unused projects.",
    responsibilities: [
      "Diff expected vs live project list.",
      "Flag missing env keys without printing secret values.",
      "Open a single ops PR per drift cluster.",
    ],
    knowledge: [
      {
        domain: "Vercel project + Supabase project pairing",
        why: "Wrong pairing ships the wrong env.",
        sourceHint: "DubjamMusic/james-os-cloud-manager",
      },
    ],
    primaryRepo: "james-os-cloud-manager",
    supportRepos: ["hustlecodex-platform", "hustlecodex-mobile-app"],
    automations: ["Daily drift note as a draft PR body, not a merge."],
    mergePolicy: "pr-only",
    outcome: {
      test: "Drift report lists project, env key name, and action.",
      event: "cloud.drift.reported",
      passWhen: "no secret values in diff",
    },
    antiClone: "Skip Monitor dashboard prose; write a table.",
  },
  {
    id: "prestige-auditor",
    codename: "Prestige Auditor",
    class: "score",
    jobTitle: "Density Scorekeeper",
    mission:
      "Compute Nodes / Velocity / Streak / Decision into Prestige Density and refuse vanity counts.",
    responsibilities: [
      "Score each shipped figure run with weights 50/30/20 on correctness/safety/prestige.",
      "Export one row per run for prestige-xlsx.",
      "Call out repeated patches as streak breakage.",
    ],
    knowledge: [
      {
        domain: "HustleCodex geometric-mean density",
        why: "Additive XP hides weak decisions.",
        sourceHint: "hustlecodexorchestrator skill + prestige_console",
      },
    ],
    primaryRepo: "prestige_console",
    supportRepos: ["hustlecodex-platform", "HustleCodex"],
    automations: ["Append a scored row after every merged PR."],
    mergePolicy: "pr-only",
    outcome: {
      test: "Density formula matches skill SKILL.md.",
      event: "prestige.density.logged",
      passWhen: "row has N,V,S,D,density,hash",
    },
    antiClone: "Do not reprint last week's scorecard layout.",
  },
  {
    id: "boardroom-chair",
    codename: "Boardroom Chair",
    class: "ops",
    jobTitle: "Human-in-the-Loop Gate",
    mission:
      "Route work to existing boardroom roles without adding a fifth enum until a migration PR exists.",
    responsibilities: [
      "Map incoming jobs to planner / executor / monitor / data_agent.",
      "Hold merge buttons until a human override is recorded.",
      "Keep schema enum untouched unless a dedicated migration ships.",
    ],
    knowledge: [
      {
        domain: "Drizzle agents.role enum",
        why: "Silent enum edits break client unions.",
        sourceHint: "boardroom-agent-orchestrator/drizzle/schema.ts",
      },
    ],
    primaryRepo: "boardroom-agent-orchestrator",
    supportRepos: ["ai-agent-taskforce"],
    automations: ["PR reviews only; Chair never self-merges."],
    mergePolicy: "pr-only",
    outcome: {
      test: "No commit on main from this figure.",
      event: "boardroom.gate.held",
      passWhen: "defaultBranchUntouched === true",
    },
    antiClone: "Do not re-check the all-green todo.md as if it were new work.",
  },
  {
    id: "taskforce-dispatcher",
    codename: "Taskforce Dispatcher",
    class: "bridge",
    jobTitle: "Cross-Repo Job Router",
    mission:
      "Turn one objective into N figure tickets with unique titles and unique patch shapes.",
    responsibilities: [
      "Pick 1-3 figures max per objective.",
      "Assign a unique WAVE_ID suffix per dispatch.",
      "Reject jobs that would rewrite the same file twice in one wave.",
    ],
    knowledge: [
      {
        domain: "Taskforce platform + QuestForce agents list",
        why: "Dispatcher must not spawn Planner-Alpha clones.",
        sourceHint: "ai-agent-taskforce/src/QuestForcePlatform.jsx",
      },
    ],
    primaryRepo: "ai-agent-taskforce",
    supportRepos: ["boardroom-agent-orchestrator", "hustlecodex-platform"],
    automations: ["Open one tracking issue per wave, then figure PRs."],
    mergePolicy: "pr-only",
    outcome: {
      test: "Wave issue lists unique figure ids and unique target paths.",
      event: "taskforce.wave.dispatched",
      passWhen: "unique(paths) === paths.length",
    },
    antiClone: "New ticket titles every wave; no copy-paste Quest copy.",
  },
  {
    id: "codex-librarian",
    codename: "Codex Librarian",
    class: "bridge",
    jobTitle: "Hub Indexer",
    mission: "Keep Codex-hub pointing at live tools instead of dead starter templates.",
    responsibilities: [
      "Index public DubjamMusic agent repos.",
      "Mark private repos as private-only in the index.",
      "Drop stale template links after 90 days of no push.",
    ],
    knowledge: [
      {
        domain: "Repo inventory + visibility",
        why: "Leaking private names into public READMEs is a safety miss.",
        sourceHint: "DubjamMusic/Codex-hub",
      },
    ],
    primaryRepo: "Codex-hub",
    supportRepos: ["template-hustlecodex-starter", "template-ai-xai-starter"],
    automations: ["PR INDEX.json updates only."],
    mergePolicy: "pr-only",
    outcome: {
      test: "Index contains visibility flags for every listed repo.",
      event: "codex.index.updated",
      passWhen: "every item has visibility + lastPush",
    },
    antiClone: "Do not republish the platform README.",
  },
  {
    id: "aura-mixer",
    codename: "Aura Mixer",
    class: "story",
    jobTitle: "Music-Interface Cue Designer",
    mission:
      "Translate GitHub event classes into Aura Music Interface cues without ripping third-party audio code.",
    responsibilities: [
      "Map push / pr / issue events to cue names only.",
      "Keep implementation inside aura-music-interface.",
      "No copyrighted stems in commits.",
    ],
    knowledge: [
      {
        domain: "Event-to-cue mapping",
        why: "Wrong cue spam kills the aesthetic.",
        sourceHint: "DubjamMusic/aura-music-interface",
      },
    ],
    primaryRepo: "aura-music-interface",
    supportRepos: ["ai-agent-gpt-assistant"],
    automations: ["PR CUE_MAP.json when event types change."],
    mergePolicy: "draft-pr",
    outcome: {
      test: "Cue map has unique names per event class.",
      event: "aura.cue.mapped",
      passWhen: "unique(cueName) === eventClassCount",
    },
    antiClone: "Fresh cue names; no 'Celesta for pushes' clones.",
  },
  {
    id: "manus-bridge",
    codename: "Manus Bridge",
    class: "bridge",
    jobTitle: "Manus Integration Adapter",
    mission:
      "Keep the Manus integration layer as an adapter, not a second orchestrator.",
    responsibilities: [
      "Translate HustleCodex jobs into Manus payloads.",
      "Strip secrets before any outbound log.",
      "Fail closed if adapter schema drifts.",
    ],
    knowledge: [
      {
        domain: "Manus adapter contracts",
        why: "Schema drift duplicates agents across repos.",
        sourceHint: "DubjamMusic/ai-agent-manus-integration",
      },
    ],
    primaryRepo: "ai-agent-manus-integration",
    supportRepos: ["beta_agent_editor", "chromatic-concordance-ui"],
    automations: ["Contract test on adapter PRs."],
    mergePolicy: "pr-only",
    outcome: {
      test: "Adapter golden file still parses.",
      event: "manus.adapter.verified",
      passWhen: "schemaVersion match",
    },
    antiClone: "No second boardroom UI inside the adapter repo.",
  },
];

export function figuresByRepo(repo: string): ActionFigure[] {
  return ACTION_FIGURES.filter(
    (f) => f.primaryRepo === repo || f.supportRepos.includes(repo)
  );
}

export function pickWave(n = 3, salt = WAVE_ID): ActionFigure[] {
  const scored = ACTION_FIGURES.map((f, i) => ({
    f,
    key: (f.id + salt + String(i)).length + f.id.charCodeAt(0) + i * 7,
  })).sort((a, b) => a.key - b.key);
  return scored.slice(0, Math.max(1, Math.min(n, ACTION_FIGURES.length))).map((x) => x.f);
}

export function assertNoBoardroomClone(figure: ActionFigure): void {
  const banned = ["planner", "executor", "monitor", "data_agent", "planner-alpha", "executor-beta"];
  const blob = `${figure.id} ${figure.codename} ${figure.jobTitle}`.toLowerCase();
  for (const b of banned) {
    if (blob.includes(b)) {
      throw new Error(`Figure ${figure.id} clones banned boardroom role token: ${b}`);
    }
  }
}
