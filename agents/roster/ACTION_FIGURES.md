# Action Figure Roster — wave `2026-09-17-drop-zone`

This wave does **not** extend the boardroom enum (`planner | executor | monitor | data_agent`).
Those four stay in `boardroom-agent-orchestrator`. These figures are **job skins** bound to real `DubjamMusic` repos.

Merge rule for this wave: **branch + PR only**. No silent `main` pushes.

## Figure grid

| ID | Codename | Class | Primary repo | Merge |
| --- | --- | --- | --- | --- |
| drop-scout | Drop Scout | field | fortnite-guide-builder | pr-only |
| concordance-cartographer | Concordance Cartographer | story | chromatic-concordance-ui | draft-pr |
| bounty-ranger | Bounty Ranger | lab | hustlecodex-bounty-agents | draft-pr |
| cloud-steward | Cloud Steward | ops | james-os-cloud-manager | pr-only |
| prestige-auditor | Prestige Auditor | score | prestige_console | pr-only |
| boardroom-chair | Boardroom Chair | ops | boardroom-agent-orchestrator | pr-only |
| taskforce-dispatcher | Taskforce Dispatcher | bridge | ai-agent-taskforce | pr-only |
| codex-librarian | Codex Librarian | bridge | Codex-hub | pr-only |
| aura-mixer | Aura Mixer | story | aura-music-interface | draft-pr |
| manus-bridge | Manus Bridge | bridge | ai-agent-manus-integration | pr-only |

Affirm + Challenge stay in `hustlecodex-platform/agents/` as the decision-loop pair. Do not rewrite them in this wave.

## Knowledge required (compressed)

- Field figures: live game / map / overlay constraints.
- Ops figures: env drift without leaking secrets.
- Score figures: geometric-mean density, not raw XP.
- Story figures: in-world copy + cue maps, no stolen media.
- Bridge figures: adapters and indexes, not a second orchestrator.
- Lab figures: in-scope bounty work only.

## Automated implementation loop

1. Dispatcher picks 1–3 figures with a new `WAVE_ID`.
2. Each figure opens a **unique** feature branch (`figure/<id>-<yyyymmdd>`).
3. Patch one primary path only.
4. Open PR. Chair holds merge.
5. Auditor writes N/V/S/D + density + output hash.
6. Next run **must** pick a different figure set and a different file.

## Tests to run this wave

- `assertNoBoardroomClone` over every figure.
- `pickWave(3)` returns 3 unique ids.
- PR exists on `feat/action-figure-roster-20260917` and is not merged by the agent.

## Separate issues (do not mix into this PR)

- Boardroom enum migration if new roles must become first-class DB values.
- Private-repo CI tokens for Cloud Steward.
- Bounty Ranger program-scope config file.
