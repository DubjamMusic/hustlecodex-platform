# CLAWJAM implementation backlog

## Phase 0 — preflight and recovery
- [ ] Revoke any provider credentials committed in the legacy root environment template.
- [ ] Audit Git history for actual secrets and review provider usage.
- [ ] Run `ops/inspect-contabo.sh` over SSH and save the redacted report securely.
- [ ] Confirm VPS package, OS, memory, storage, firewall, Docker and OpenClaw status.
- [ ] Confirm database provider, backup/restore path and Redis availability.
- [ ] Confirm the current ClawGuide Telegram integration and preserve its read-only allowlist.

## Phase 1 — commercial SaaS kernel
- [ ] Add Tenant, TenantMember, Plan, Subscription, ApiCredential, UsageEvent and AuditEvent schema models.
- [ ] Add authenticated tenant context and role-based authorization.
- [ ] Add API key create/revoke/rotate flow; store only hashes.
- [ ] Add plan entitlement service and usage reservation/settlement ledger.
- [ ] Add idempotent billing webhook and subscription state reconciliation.
- [ ] Add tenant-scoped admin dashboard and onboarding.
- [ ] Add tests for cross-tenant isolation, quota boundaries, webhook replay and usage idempotency.

## Phase 2 — Telegram and OpenClaw
- [ ] Add tenant-owned BotInstance and encrypted token references.
- [ ] Add Telegram webhook validation and bot-to-tenant routing.
- [ ] Add pairing/allowlist for administrative commands.
- [ ] Add connector registration, heartbeat and revocation.
- [ ] Add signed task envelopes, task allowlist, timeouts, budgets and audit events.
- [ ] Implement one low-risk read-only OpenClaw workflow first.

## Phase 3 — GitHub and music workflows
- [ ] Install a least-privilege GitHub App and verify webhook signatures.
- [ ] Implement repository discovery, issue creation and draft PR creation.
- [ ] Require approval before merge or deployment.
- [ ] Add artist workspace, release checklist, campaign planner and asset metadata.
- [ ] Integrate only official music APIs/OAuth scopes; require approval before publishing.

## Phase 4 — growth and reliability
- [ ] Add agent evaluation datasets and scorecards.
- [ ] Add cost attribution by tenant, bot, agent, model and workflow.
- [ ] Add dead-letter queue, retry policy and operator replay controls.
- [ ] Add customer export/deletion workflows and retention controls.
- [ ] Add white-label configuration and reseller administration.
- [ ] Add production alerts, backup restore drills and incident runbooks.

## Acceptance gates
- No cross-tenant read/write is possible in automated tests.
- Billing webhook replays cannot double-credit or double-charge.
- Every billable operation has a usage event and tenant attribution.
- Customer requests cannot invoke arbitrary shell commands.
- Public internet cannot reach the OpenClaw Gateway or database.
- External publishing, messaging blasts, merges, deployments and destructive actions require approval.
- VPS changes are not applied until the inspection report and rollback plan are reviewed.
