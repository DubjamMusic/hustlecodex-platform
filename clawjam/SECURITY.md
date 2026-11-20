# CLAWJAM security baseline

## Immediate repository finding

The existing root `.env.example` contained credential-shaped values instead of placeholders. Treat affected credentials as exposed. Revoke/rotate the corresponding AI provider keys immediately. Audit Git history and provider usage logs. Removing strings from the latest commit does not invalidate old keys or remove them from history.

## Non-negotiable controls

- No secrets in Git, source maps, client bundles, logs, issue comments or screenshots.
- Keep all provider credentials server-side; use a secret manager or deployment environment.
- Encrypt tenant integration credentials at rest using envelope encryption/KMS where available.
- Hash API keys with a modern password-hashing/HMAC scheme; show plaintext only once at creation.
- Use webhook signature/secret verification and idempotency for Telegram, GitHub and billing events.
- Tenant ID must come from authenticated server context and be enforced in every database query.
- Apply RBAC and per-integration scopes. Default deny.
- Require approval for publish, bulk send, payments, code merge, production deploy, infrastructure changes and destructive actions.
- Keep OpenClaw Gateway and database ports private. Do not expose port 18789.
- Use SSH keys, disable password/root SSH after a tested recovery path exists, restrict source IPs where practical, and enable firewall/fail2ban.
- Separate staging and production credentials and databases.
- Back up the database before schema migrations; test restore, not merely backup creation.
- Set per-tenant rate, concurrency, token and spend limits.
- Keep audit records for privileged actions and approval decisions.
- Treat prompts, uploaded files, repository contents and messages as untrusted input; never allow them to override system policy or tool permissions.

## Contabo inspection

Run `bash clawjam/ops/inspect-contabo.sh` from an authenticated SSH session. The script is read-only and intentionally avoids printing environment values, bot tokens, OpenClaw configuration, or full process command lines. Review its output before any changes.

## Incident response

1. Revoke leaked credentials at their issuing providers.
2. Generate replacements and update deployment secret stores.
3. Redeploy only after confirming the new values are not logged or exposed.
4. Review provider usage, GitHub audit events and server auth logs.
5. Coordinate Git history rewriting only after keys are revoked; rewriting history is not a substitute for rotation.
