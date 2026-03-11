# MVP Launch Checklist — "Viable Launched MVP (A)"

> **MVP Choice A: Landing Page + Waitlist**
>
> This document defines what "launched" means for the first HustleCodex MVP, the
> release process, and the 5-minute verification checklist every reviewer must
> complete before approving a production deploy.

---

## Minimum Feature Requirements

A build qualifies as a **Viable Launched MVP (A)** when **all** of the
following are true:

| # | Requirement | Pass Criteria |
|---|-------------|---------------|
| 1 | **Landing page loads** | `GET /` returns HTTP 200 with valid HTML in under 3 s on a standard connection |
| 2 | **Waitlist form exists** | A form with at least one email-type input is visible without scrolling on a 1280×800 viewport |
| 3 | **Submission success state** | Submitting the form shows a success/confirmation message (backend may be stubbed — see §Next Steps) |
| 4 | **No blocking console errors** | Browser devtools show zero `console.error` calls on page load |
| 5 | **Basic accessibility** | Page has a meaningful `<h1>`, all form inputs have associated `<label>` elements, and is keyboard-navigable |
| 6 | **Performance baseline** | Lighthouse performance score ≥ 70 (mobile or desktop) |
| 7 | **Smoke test passes** | The `Smoke Test` GitHub Actions workflow completes green on the PR |

### Stubbed / Next-Step Items

The following are **not** required for MVP A but must be tracked as open issues:

- Real waitlist persistence (database or third-party service such as Mailchimp / ConvertKit)
- Email confirmation to the subscriber
- Admin view / export of waitlist entries
- GDPR consent checkbox and privacy policy page

---

## Release Steps

```
1. Open PR → automated CI + Smoke Test workflows run
2. Reviewer completes 5-Minute Verification Checklist (see below)
3. PR approved → merge to `main`
4. Vercel Preview Deploy is created automatically (no action required)
5. Preview URL shared for final stakeholder sign-off
6. Trigger Production Deploy:
   - Via Vercel dashboard: "Promote to Production"
   - OR merge/push to the branch configured as Vercel's production branch
7. Verify production URL with the same 5-minute checklist
8. Close the related GitHub issue and post release notes in Discussions
```

---

## 5-Minute Verification Checklist (for Reviewers)

Complete this checklist on **both** the Vercel Preview URL and the production
URL before closing a release.

### Automated (run by CI — check the Actions tab)
- [ ] `CI` workflow — green ✅
- [ ] `Smoke Test` workflow — green ✅

### Manual (< 5 minutes)

**Functional**
- [ ] Open the root URL (`/`) — page loads, no blank screen
- [ ] Waitlist form is visible above the fold
- [ ] Enter a test email and submit — success message appears
- [ ] Refresh the page — no JS errors in the browser console

**Accessibility (quick check)**
- [ ] Tab through the page with keyboard only — focus order is logical
- [ ] Form inputs have visible labels

**Performance (optional but recommended)**
- [ ] Run Lighthouse in Chrome DevTools → Performance ≥ 70

**Mobile**
- [ ] Resize browser to 375 px wide (or use DevTools device emulation) — layout is usable

---

## Waitlist Backend — Stub Behaviour

Until a real backend is wired up, the waitlist form **must** behave as follows
so that the MVP A criteria above are met:

1. On submit, display a success message such as:
   > "You're on the list! We'll be in touch soon."
2. Do **not** log the submitted email value; log only a non-PII indicator such as `"[waitlist] form submitted"`.
3. The stub should be clearly marked with a `// TODO: replace with real API
   call` comment and a linked GitHub issue.

---

## Related Resources

- [CI Workflow](../.github/workflows/ci.yml)
- [Smoke Test Workflow](../.github/workflows/smoke-test.yml)
- [PR Template](../.github/pull_request_template.md)
- [API Documentation](./API.md)
