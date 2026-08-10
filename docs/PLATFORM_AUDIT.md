# Convia Platform — Comprehensive Code Review & Audit

**Date:** 2026-08-10  
**Scope:** `coviaBackend` · `ConviaUi` (user app) · `ConviaAdmin` (ops console)  
**Method:** Static review of routes, services, UI wiring, auth/RBAC, and data-handling patterns against product intent (live money rails, KYC, multi-market Africa ops).

---

## Executive summary

| Area | Assessment |
|------|------------|
| **Feature completeness** | Core money paths (auth, portfolio, send/withdraw, deposit info, banks, bills, KYC gates, support cases) are largely wired end-to-end. Gaps remain around avatar upload, MFA enroll UI, live FX rates, portfolio sparklines, address-verification admin UI, and some admin screens that still assume richer mock payloads than the API returns. |
| **Architecture** | Backend is intentionally layered (routes → services → Prisma/ledger) with real plugins for RBAC, ownership, freeze, and idempotency — a strong foundation. Frontends mixed custom cache then TanStack Query; admin route-tree generation has been a recurring failure mode. |
| **Code quality** | Readable feature folders on the user app; admin template quality varies. Backend comments document known simplifications honestly. Technical debt is concentrated in README drift, attachment storage, and token-in-localStorage. |
| **Security** | Ownership plugin closes a serious IDOR class on body-scoped user IDs. Residual risks: tokens in `localStorage`, support attachments as data URLs in DB, permissive CORS default, global rate limit only, portfolio/history GETs by `:userId` without self-check, admin role probe by trial-and-error. |

**Priority order for remediation:** (1) auth token storage & CORS lockdown, (2) IDOR on read endpoints, (3) support attachment storage, (4) complete admin/user feature mismatches, (5) FX and catalog completeness.

---

## 1. Feature completeness report

### 1.1 Matrix (user product)

| Capability | Backend | ConviaUi | Gap |
|------------|---------|----------|-----|
| Register / login / session refresh | Yes | Yes | Forgot-password UI may over-promise if email provider not configured |
| Onboarding (first visit only) | N/A (client) | Yes | — |
| Portfolio balances | `GET /portfolio/:userId` | Live via TanStack Query | **Read IDOR risk** if any client can pass another userId |
| Deposit / receive + QR | Wallet deposit-info + client QR | Yes | Depends on registry seed data |
| Send / withdraw + PIN | payments + crypto + security | Yes (hold-to-confirm) | Confirm PIN path on every confirm in all edge flows |
| Swap | swap routes | Screen + bottom nav | Quote/execute error UX still thin |
| On-ramp / off-ramp | fiat routes + eligibility | Screens | Provider config must exist in admin |
| Banks / payment methods | banks + bank-accounts | Live countries/banks | Cards remain local drafts only (no PCI vault) |
| Bills / services | bills markets/billers/pay | Services screen | Needs bill provider rows per country |
| KYC submit + status | compliance | Form + gates + banners | Admin KYC queue decides; country lock after approve |
| Profile edit | profiles/me | Yes | **Avatar upload** not implemented (explicitly excluded earlier) |
| Notifications | notifications | Screen | Preference channels partial |
| Rewards | rewards | Screen | Rule engine admin incomplete in UI |
| Support cases + attachments | support routes | Support Centre | Attachments stored as data URLs (see security) |
| Help / About articles | Client content | Full | Not CMS-backed (acceptable) |
| MFA / TOTP enroll | security routes exist | **UI incomplete** | Backend ahead of user UI |
| Session list / revoke | security sessions | Partial | Full device manager UX incomplete |
| Address whitelist | policies referenced | Partial UI | Confirm every withdraw path enforces |

### 1.2 Matrix (admin / ops)

| Capability | Backend | ConviaAdmin | Gap |
|------------|---------|-------------|-----|
| Login + role probe (admin vs moderator) | Auth + AdminUser + RBAC | Yes | Role is inferred by probing routes, not a dedicated `/admin/me` |
| Users list / detail | Yes | Users page | Detail depth depends on API shape |
| KYC queue + decide | Yes | Yes | — |
| Address verification queue | Yes | **No dedicated page** | Backend exists; UI missing |
| Support desk | Yes | Yes | — |
| Withdrawal **history** | `GET /admin/withdrawals` | History UI | Approve/reject still exist for admin but not primary UX (correct for auto-withdraw) |
| Deposit history + manual scan | Yes (moderator+) | Ops tools | — |
| Country controls | Yes | Yes (mod view / admin edit) | — |
| Bill + payment providers | CRUD added | Service providers page | Must match real provider keys in code |
| Chains & tokens | chain-registry | Strong reference UI | — |
| Fees | fee-configs | Yes | — |
| Treasury | Yes | Yes | Read-model may be stale if sync job weak |
| Roles / permissions / admin users | Yes | Roles page | Permissions are bookkeeping; **RBAC still primarily role-key**, not fine-grained permission checks |
| Analytics / reports | overview endpoints | Pages present | Likely thin real metrics vs mock-era expectations |
| Announcements | POST | Page | Confirm list/GET if UI needs history |
| OTC | Removed from product | Removed from admin | Good alignment |

### 1.3 Explicit mismatches

1. **Address verification** — Backend queue + decide; **no ConviaAdmin page**. Moderators cannot operate this without API clients.  
2. **`/admin/me` (or role claim in JWT)** — Frontend guesses role via treasury vs KYC probe; brittle and noisy in logs.  
3. **Permissions table** — Stored and editable in Roles UI; **runtime authorization still largely `role.key`**. Operators may think linking permissions changes access.  
4. **Avatar** — Profile UI excludes upload; no durable media pipeline.  
5. **Card payments** — User “cards” are local drafts; backend is bank/fiat-provider oriented. Do not market as saved cards.  
6. **Display FX rates** — Currency context still soft/static relative to true FX service.  
7. **Portfolio GET by userId** — UI always sends self; **API does not enforce self** the way money POSTs do.  
8. **routeTree.gen.ts (Admin)** — New routes must be registered manually or via TanStack generate; missing entries caused “This page didn’t load.” Process risk remains.

---

## 2. Architecture & logic improvements

### 2.1 What works well

- **Backend plugin stack:** `rbacPlugin`, `ownershipPlugin` (`requiresSelf`), `freezeCheckPlugin`, `idempotencyPlugin`, Helmet, rate limit, CORS — appropriate for a fintech API.  
- **Ledger-centric balances** instead of trusting client-reported holdings.  
- **Country + provider config tables** for multi-market routing without hardcoding product lists in UI.  
- **User app feature folders** (`features/wallet`, `profile`, `services`) with shared API modules.  
- **TanStack Query on ConviaUi** (recent) — correct direction for heavy API usage (cache, dedupe, focus refetch).  
- **Admin/moderator split** documented in code comments and reflected in nav guards.

### 2.2 Anti-patterns & inefficiencies

| Issue | Why it hurts | Better approach |
|-------|----------------|-----------------|
| **Tokens in `localStorage`** (user + admin) | XSS ⇒ full session theft | Prefer **httpOnly secure cookies** (BFF or same-site API) or at least memory + short-lived access token with rotating refresh in httpOnly cookie |
| **Custom `queryCache` + TanStack Query** | Two sources of truth | Migrate fully to QueryClient; delete sessionStorage cache helpers once hooks are stable |
| **Screen enum + giant `App.tsx` switch** (user) | Navigation grows linearly; hard to code-split | Adopt file-based or nested router (as Admin already does) or lazy route map |
| **Role detection by probing endpoints** | Extra latency, confusing 403s, fragile | `GET /admin/me` → `{ userId, roleKeys[], permissions[] }` after login |
| **Support attachments as JSON data URLs in Postgres** | DB bloat, backup cost, XSS if rendered unsafely | Object storage (S3/R2) + signed URLs; store only metadata; virus scan |
| **Global 100 req/min rate limit** | Shared across login and public catalog | Per-route limits: stricter on `/auth/*`, looser on public GET catalogs |
| **CORS `origin: true` when env unset** | Reflects any Origin in some setups | **Fail closed** in production: require `CORS_ORIGIN` allowlist |
| **Audit log `actorId: 'admin'` string literals** | Weak accountability | Always use authenticated admin `userId` from token |
| **Frontend hard dependency on seeded tokens/chains** | Empty registries ⇒ blank money UIs | Admin bootstrap checklist + empty-state CTAs linking to registry |

### 2.3 Suggested target architecture (12-week horizon)

1. **API:** Keep Fastify modules; add OpenAPI generated from Zod; contract tests user ↔ admin clients.  
2. **Auth:** Cookie session or BFF for browsers; device binding already partially present — finish consistent enforcement.  
3. **User UI:** TanStack Query everywhere; optional TanStack Router; feature-based API hooks only.  
4. **Admin UI:** Codegen route tree in CI (`tsr generate`); shared design primitives already good — standardize all pages on Chain Registry section pattern.  
5. **Jobs:** Deposit scan, treasury recompute, notification fan-out as explicit BullMQ jobs with dashboards in Ops.

---

## 3. Senior developer review (quality, maintainability, scalability)

### 3.1 Strengths

- Honest inline documentation of product pivots (OTC removal, auto-withdraw vs approval queue).  
- Zod validation on many write paths.  
- Idempotency keys on money-moving POSTs.  
- Separation of **moderator** (support/KYC) vs **admin** (platform blast radius).  
- User app progressively replaced mocks with live hooks and compliance banners mapped to backend codes.

### 3.2 Maintainability risks

1. **Backend README vs code** — Documented drift; `docs/API.md` and route handlers must be the source of truth; automate snapshot of routes.  
2. **Large route files** (`admin.ts`) — Split into `admin-users`, `admin-finance`, `admin-config` routers.  
3. **Type sharing** — Three repos duplicate DTO shapes; publish a small `@convia/api-types` package or OpenAPI client generation.  
4. **Admin template residue** — Some pages still structured for richer mock fields (`username` on withdrawal rows). Normalize to actual Prisma select lists.  
5. **Tests** — No evidence of systematic integration tests for ownership, RBAC, and ledger invariants in this review pass. **Highest leverage investment.**

### 3.3 Scalability notes

- Deposit scan over all chains is fine at low volume; partition by chain and cursor blocks as volume grows.  
- Support attachment data URLs will not scale past low ticket volume.  
- Portfolio summary should be read-model / cache (Redis) if `TRACKED_ASSETS` and ledger joins grow.  
- Rate limit and DB connection pool sizing need production metrics, not defaults alone.

### 3.4 Code quality scorecard (subjective)

| Project | Clarity | Consistency | Testability | Ops readiness |
|---------|---------|-------------|-------------|-----------------|
| coviaBackend | B+ | B | C (needs tests) | B- |
| ConviaUi | B | B- (nav + residual mock types) | C | B- |
| ConviaAdmin | B | B (after routeTree fix) | C | B |

---

## 4. Cybersecurity audit

### 4.1 Critical / high

| ID | Finding | Location | Recommendation |
|----|---------|----------|----------------|
| **S1** | **Session tokens in `localStorage`** | ConviaUi `client.ts` / AuthContext; ConviaAdmin `auth-store` | XSS in either SPA yields full account takeover. Move to httpOnly `Secure; SameSite` cookies or hardened BFF. |
| **S2** | **IDOR on read-by-userId** | e.g. `GET /portfolio/:userId`, transaction history patterns | Enforce `userId === token.sub` (or admin role) on all user-scoped GETs, not only POSTs with `requiresSelf`. |
| **S3** | **Support message `dataUrl` in database** | support service (≤400KB images) | Stored XSS if admin/user UI renders HTML; also privacy (PII in screenshots). Use object storage + Content-Type sniffing + CSP; never execute SVG inline without sanitization. |
| **S4** | **CORS default allow-all when `CORS_ORIGIN` unset** | `app.ts` | Production must set explicit origins (Vercel user + admin hosts). |

### 4.2 Medium

| ID | Finding | Recommendation |
|----|---------|----------------|
| **S5** | Global rate limit only | Separate limits for auth, support upload, admin scan |
| **S6** | Admin actions sometimes audit as `actorId: 'admin'` | Bind actor to real admin user id |
| **S7** | Permissions not enforced at runtime | Either implement permission checks or hide UI that implies they work |
| **S8** | Manual deposit scan (moderator) | Powerful ops tool — rate-limit, audit, consider dual-control for production |
| **S9** | Seed / recovery material UX | Ensure never logged; warn; prefer not to expose full seed in web app if custodial model allows |
| **S10** | GitHub PAT appeared in chat history for pushes | **Rotate the token immediately** if it was a real production PAT; use fine-scoped PATs or GitHub App; never embed in client |

### 4.3 Low / hardening

- Enable CSP on admin and user apps (Helmet CSP currently disabled on API for flexibility).  
- Subresource integrity / dependency pinning; audit `npm audit` in CI.  
- Webhook signature verification paths exist for fiat — keep raw-body only on those routes.  
- Ensure password min length + breach checks (min 8 is baseline only).  
- Freeze + KYC server enforcement must remain authoritative; client banners are UX only (already the stated design).

### 4.4 AuthN / AuthZ model (current)

```
Bearer access JWT
  ├─ User routes: session valid + optional requiresSelf + optional requiresUnfrozen
  ├─ Admin routes: AdminUser → Role.key ∈ requiredRole
  └─ Moderator: subset (KYC, users, support, withdrawals history, deposit scan, country read)
```

**Gap:** No continuous step-up auth for high-risk admin actions (approve KYC bulk, provider disable, deposit scan) beyond single session.

---

## 5. Recommended backlog (prioritized)

### P0 — Security & correctness (1–2 weeks)

1. Rotate any exposed GitHub tokens.  
2. Lock CORS to known frontends in production.  
3. Add self-ownership (or admin) checks on all `:userId` **GET** money/data routes.  
4. Stop storing attachment bytes in Postgres; use object storage.  
5. Add `/admin/me` and stop role probing.

### P1 — Product completeness (2–4 weeks)

1. Address verification admin UI.  
2. MFA enroll/verify screens on user Security.  
3. Live FX for display currency.  
4. Empty-state guidance when token registry is empty.  
5. Contract tests: send, withdraw, KYC gate, support close.

### P2 — Engineering excellence

1. OpenAPI + generated clients.  
2. CI: `tsr generate` for admin; lint route tree drift.  
3. Split `admin.ts`; integration test suite for RBAC matrix.  
4. Unify ConviaUi on TanStack Query only; remove dual cache.  
5. Observability: structured audit for every admin money-adjacent action.

---

## 6. Conclusion

Convia has moved from mock-heavy UI to a **credible multi-app fintech stack**: custodial ledger API, compliance-aware user app, and role-split admin console. The most important remaining work is not more screens — it is **hardening identity boundaries (IDOR + token storage)**, **scaling support media**, and **closing the last backend↔admin gaps** (address verification, `/admin/me`, true permission enforcement or honest UI).

Treat server-side KYC, freeze, ownership, and idempotency as the source of truth; keep client alerts as progressive disclosure only.

---

*Report generated from static review of the three repositories under `/home/workdir/artifacts`. Runtime load tests and penetration tests were not executed in this pass.*
