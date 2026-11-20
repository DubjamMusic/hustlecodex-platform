# CLAWJAM SaaS

CLAWJAM is the multi-tenant commercial control plane built on the existing HustleCodeX application. It provides tenant accounts, subscriptions, metered AI/agent usage, Telegram bot management, GitHub workflows, music-creator workflows, and a controlled bridge to an existing Contabo-hosted OpenClaw runtime.

## Build principle

- Reuse the existing Next.js + TypeScript + Prisma + PostgreSQL application.
- Keep the Contabo/OpenClaw Gateway private. SaaS requests reach it only through an authenticated, outbound-initiated worker/connector.
- Treat each customer, bot, integration, task, memory record, and usage event as tenant-scoped.
- Require explicit approval for external side effects: publishing, sending bulk messages, spending money, deploying code, changing infrastructure, or deleting data.
- Do not store provider secrets in source control. Use environment/secret management and encrypt customer integration credentials at rest.

## Current status

This branch adds the SaaS architecture, operational safety baseline, a read-only Contabo inspection script, and a clean CLAWJAM environment template. It does not connect to or modify the VPS, create paid provider resources, run database migrations, or deploy production.

## Quick start

1. Review [ARCHITECTURE.md](./ARCHITECTURE.md) and [SECURITY.md](./SECURITY.md).
2. Run the read-only server inspection from a trusted SSH session:
   `bash ops/inspect-contabo.sh`
3. Review the report before making infrastructure changes.
4. Copy `.env.example` into the deployment secret store and fill only the integrations being enabled.
5. Implement the schema migration and API routes in small, tested pull requests.
6. Deploy the SaaS control plane separately from the Contabo agent runtime.

## Product modules

- SaaS tenancy, identity, RBAC and API keys
- Plans, subscriptions, quotas, usage ledger and billing webhooks
- Telegram bot provisioning, webhooks and command routing
- OpenClaw runtime connector and job orchestration
- GitHub App integration, repository automation and PR approvals
- Music creator workspace, release campaigns, asset briefs and distribution links
- Agent evaluation, audit trail, observability and cost controls

## Safety

The repository's legacy root `.env.example` had credential-shaped values. Those values must be treated as compromised and rotated with their providers. Git history should be audited and, if real keys were committed, history cleanup coordinated after revocation. Never paste secrets into issues, chat, logs, or commits.
