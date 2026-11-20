# CLAWJAM — SaaS-first architecture

## 1. Product boundary

CLAWJAM is a multi-tenant SaaS product. The SaaS control plane owns customers, plans, entitlements, bot configuration, integration metadata, task records, audit events and usage accounting. Contabo hosts the existing OpenClaw runtime and optional long-running workers. OpenClaw is an execution dependency, not the SaaS database or public API.

## 2. Deployment topology

```text
Artist / Customer
  | Web dashboard / Telegram bot
  v
Next.js SaaS control plane (existing application)
  | Auth + tenant RBAC + entitlement checks
  | PostgreSQL / Prisma
  | Redis-backed queue (when provisioned)
  | Billing webhooks / GitHub App / Telegram webhook
  v
Signed task envelope + tenant-scoped capability
  |
  v
CLAWJAM connector on Contabo (outbound TLS connection)
  |
  v
Private OpenClaw Gateway + isolated agent workspaces
  |
  +--> AI model providers (provider adapter / spend ceilings)
  +--> GitHub API (installation-scoped permissions)
  +--> Music service APIs (official OAuth/API only)
  +--> Telegram Bot API
```

The OpenClaw Gateway must not be exposed directly to the public internet. Prefer a connector that polls or maintains an authenticated outbound connection to the SaaS queue. Do not open port 18789 publicly. Keep SSH restricted, use key authentication, and rotate any credential that may have been disclosed.

## 3. Existing stack and migration strategy

The inspected repository is a Next.js TypeScript application with Prisma/PostgreSQL, existing AI decision-loop code and Vercel deployment hooks. Preserve it. Do not replace Prisma with Drizzle or rewrite the application before a working vertical slice exists.

Recommended responsibilities:

| Layer | Responsibility |
| --- | --- |
| Next.js | Dashboard, API routes, Telegram and billing webhooks |
| Prisma + PostgreSQL | Tenants, users, subscriptions, bots, jobs, audit and usage ledger |
| Redis | Queue, rate-limit counters and short-lived coordination |
| Contabo connector | Secure bridge to OpenClaw and long-running workers |
| OpenClaw | Agent sessions, skills, tool execution and channel orchestration |
| GitHub App | Repository installation, scoped automation, PRs and CI |
| Stripe (or chosen billing provider) | Checkout, subscriptions, invoices and signed webhook events |
| AI provider adapter | Model routing, fallback, token accounting and spend caps |

Use the current app's router and installed dependency versions. Avoid introducing a second backend framework until repository inspection justifies it.

## 4. Tenant and authorization model

Minimum entities (additive Prisma migration after VPS and database backup/inspection):

- Tenant: id, slug, name, status, planId, createdAt
- TenantMember: tenantId, userId, role, status
- ApiCredential: tenantId, name, hashedSecret, scopes, lastUsedAt, revokedAt
- Subscription: tenantId, provider, providerCustomerId, providerSubscriptionId, status, periodEnd
- Plan: code, features, includedCredits, concurrencyLimit, retentionDays
- UsageEvent: tenantId, actorId, eventKey (unique), meter, quantity, unit, estimatedCost, metadata, occurredAt
- BotInstance: tenantId, channel, externalBotId, encryptedCredentialRef, status, config
- Integration: tenantId, provider, externalAccountId, encryptedCredentialRef, scopes, status
- AgentJob: tenantId, requestedBy, runtime, taskType, status, idempotencyKey, inputRef, resultRef, cost, startedAt, finishedAt
- Approval: tenantId, jobId, action, payloadDigest, requestedAt, decidedBy, decidedAt, status
- AuditEvent: tenantId, actorId, action, resourceType, resourceId, requestId, metadata, createdAt

Every tenant-owned query must include tenantId from authenticated server context, never from a client-supplied body alone. Use role checks and resource ownership checks at the service boundary. Add database constraints and indexes for tenantId + createdAt/status. Consider PostgreSQL row-level security as defense in depth after the application-level policy is tested.

## 5. Metering and billing correctness

- Append immutable usage events with a unique idempotency key.
- Meter model input/output tokens, agent execution seconds, storage, bot messages and premium integrations separately.
- Estimate cost at execution time; reconcile with provider invoices/actual usage later.
- Check plan entitlement and available credits before dispatch.
- Reserve estimated credits before expensive execution; settle actual usage after completion; release unused reservation on failure.
- Never rely on client-side counters or client-provided prices.
- Process billing webhooks with signature verification, idempotency and replay protection.
- Entitlement changes derive from verified billing state, not redirect query parameters.

## 6. Job lifecycle and feedback loop

```text
REQUESTED -> POLICY_CHECKED -> QUEUED -> RUNNING
     |             |              |        |
     v             v              v        v
  REJECTED       APPROVAL      RETRYABLE  SUCCEEDED
                   |            FAILURE
                   v               |
                APPROVED           v
                               FAILED / DEAD_LETTER
```

Each job has tenantId, idempotencyKey, deadline, maxAttempts, capability set, budget ceiling and audit trail. Agent output is untrusted until validated. Evaluation agents may critique outputs and create improvement proposals, but must not merge code, deploy, publish, spend or alter infrastructure without explicit human approval.

## 7. Integration boundaries

### Telegram
- Webhook secret token verification; reject requests with invalid secret.
- Bind each bot token to one tenant and encrypt it at rest.
- Pairing/allowlist for admin commands; no public administrative commands by default.
- Separate customer bot traffic from owner/admin operations.
- Rate-limit per tenant, bot and user.

### OpenClaw / Contabo
- Keep Gateway private; use a dedicated non-root service account and isolated workspaces.
- Connector authenticates to SaaS with short-lived, revocable credentials.
- Allowlist task types and tools. Do not expose arbitrary shell execution to customer tenants.
- Resource quotas, timeouts, concurrency limits and per-tenant spend budgets.
- Log task metadata, not secrets or full private user content by default.

### GitHub
- Prefer GitHub App installation tokens with least-privilege repository permissions.
- Read repositories only when authorized by tenant installation.
- Create branches and pull requests; require human review before merge/deploy.
- Verify webhook signatures and deduplicate delivery IDs.

### Music platforms
- Use official APIs and OAuth scopes only.
- Do not scrape private endpoints or automate fake engagement/streams.
- Separate content generation from publishing; require user approval before release.
- Store source attribution, rights/ownership metadata and asset provenance.

## 8. Cost-optimised delivery sequence

1. Secure/inspect Contabo and identify existing OpenClaw state.
2. Ship tenant/auth/role model and onboarding.
3. Ship plan entitlements, usage ledger and billing webhook.
4. Ship Telegram bot management and one safe bot workflow.
5. Ship the outbound Contabo connector and one OpenClaw task type.
6. Ship GitHub App integration and PR-based code workflow.
7. Ship music creator workspace and release campaign workflow.
8. Add agent evaluations, analytics, customer self-service and white-label plans.

Do not provision extra infrastructure until current Contabo capacity, database location and Redis availability are known.
