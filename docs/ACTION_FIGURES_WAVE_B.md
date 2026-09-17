# Action Figures — Wave B (2026-09-17)

Wave A already exists and is frozen: Cipher, Nexus, Specter, Affirm, Challenge.

Wave B adds five *different* figures so the next automation pass does not reprint the same manifesto.

| Figure | Job | Outcome | Repo surfaces |
| --- | --- | --- | --- |
| Forge | Implementation engineer | Test-first PR | platform, gpt-assistant, taskforce |
| Loom | Quest designer | 12-minute playable spec | platform, chromatic-concordance-ui |
| Ledger | Density accountant | Recomputable N/V/S/D | prestige_console, platform |
| Relay | GitHub router | Named figure before write | platform, boardroom |
| Pulse | Streak coach | Artifact today or named blocker | fortnite-guide-builder, mobile, aura |

## Merge policy
All writes land on `figure/<id>/<slug>` and open a PR. `main` is not a drop zone.

## 5-minute verification
1. Open this PR.
2. Confirm five new `.github/agents/*.agent.md` files and `agents/roster.json`.
3. Run `node --experimental-strip-types agents/dispatch.test.ts` locally or wait for `Figure roster` Action.
