# Convia UI — Live Integration Guide

This document explains how the Convia frontend is wired to the `coviaBackend` API, what was removed from mock mode, how compliance (KYC) surfaces work, and how to extend the app without reintroducing hardcoded market data.

---

## 1. Architecture overview

| Layer | Role |
|---|---|
| **Screens** (`src/features/*/screens`) | UI flows only — navigation, layout, local step state |
| **Hooks** (`src/shared/hooks`) | Data access + cache (`usePortfolio`, `useTokenRegistry`, `useSupportedCountries`, `useKycStatus`, `useMyProfile`, …) |
| **API modules** (`src/shared/api`) | Thin HTTP clients over the Fastify backend |
| **Auth** (`AuthContext` + `client.ts`) | Session tokens, refresh, 401 recovery |
| **Cache** (`queryCache.ts`) | Memory + `sessionStorage` so tab switches do not flash empty states |

Stack navigation lives in `src/app/navigation.ts` (`navigate` / `goBack` / `switchTab`). Main tabs: **Home**, **Wallet**, **Profile**. **Services** is the center FAB; **Swap** is a push route from the bottom bar (not a tab reset).

---

## 2. Environment

Set the API base URL for production builds:

```bash
VITE_API_BASE_URL=https://<your-railway-host>
```

Default in code is `http://localhost:4000`. CORS is enabled on the backend (`@fastify/cors`); browser OPTIONS preflights must return 2xx or login never runs.

---

## 3. Auth & first visit

- **Onboarding** shows once per browser (`localStorage` flag).
- **Register**: username is **optional**; backend may derive one from email.
- **Login / register** responses can include `username`, `displayName`, `country`, `preferredCurrency`.
- Session is stored under `convia.session`. Logout clears session **and** query cache.

---

## 4. Profile & KYC

| UI | API |
|---|---|
| Profile card / edit | `GET/PATCH /profiles/me` |
| Public handle | `GET /profiles/:username` |
| KYC status | `GET /compliance/:userId/kyc` (via compliance client) |
| KYC submit | security/compliance submit endpoint used by `KYCScreen` |

**Rules enforced in UI:**

- If KYC status is **approved** (or verified/complete), the KYC form is **not** shown again — status only.
- If **pending / in_review**, same: status screen, no re-form.
- Home KYC banner and wallet feature banners **hide** when approved.
- Profile → KYC row shows live status text (“Verified” / “In review…”).

Backend remains the source of truth; the UI only previews gates and maps error codes (`kyc_required`, `country_feature_suspended`, etc.) via `FeatureAlert`.

---

## 5. Token & chain registry (no mock assets in pickers)

| Endpoint | Use |
|---|---|
| `GET /tokens` | Catalog for send/receive/deposit/swap/ramp pickers |
| `GET /chains` | Wallet chain filter pills |
| `GET /tokens/:symbol/chains?direction=` | Per-asset networks for deposit/withdraw |

Hook: **`useTokenRegistry`**. If the admin has not seeded tokens, lists are empty — the UI shows loading/empty states instead of inventing BTC/ETH rows.

Balances still come from **`GET /portfolio/:userId`** (ledger holdings), not from the registry.

---

## 6. Countries, banks, currencies

Supported **operating markets** (Yellow Card / bank rails) are **not** hardcoded in feature screens:

| Endpoint | Use |
|---|---|
| `GET /banks/countries` | Country chips (payment methods, services, profile country, currency list) |
| `GET /banks?country=XX` | Bank directory when adding an account |
| `GET/POST/DELETE /users/:userId/bank-accounts` | Saved payout accounts |

Hooks: **`useSupportedCountries`**, **`useBanksForCountry`**.

**Settings → Currency** builds the selectable list from currencies returned with those countries (plus USD for display). Rates in the UI are soft display factors until a live FX quote endpoint is bound into `CurrencyContext`.

**Payment Methods UX**

1. List of linked banks (API).
2. Primary CTA: **Add bank account**.
3. Full-screen sheet: country chips → bank dropdown (directory) → account number → save.
4. Account **name** is assigned server-side from KYC identity (client does not send `accountName`).

**Off-ramp** loads the same bank-account API; there is no mock GTBank row in context.

---

## 7. Money flows (live)

| Feature | Primary APIs |
|---|---|
| Deposit / receive | `GET /wallets/:userId/deposit-info`, addresses; QR generated **on device** |
| Send / withdraw | `POST /payments/send`, `POST /crypto/withdraw` (+ PIN where required) |
| Swap | Backend swap routes (quote/execute as implemented) |
| On-ramp / off-ramp | `POST /fiat/onramp/*`, `POST /fiat/offramp/initiate`, eligibility |
| Bills | `GET /bills/markets`, `GET /bills/billers`, `POST /bills/pay` |
| Notifications | List + mark read under `/notifications` |
| Rewards | `GET /rewards/:userId` |

Idempotency: mutating clients pass `Idempotency-Key` where the shared `api` client supports `idempotent: true`.

---

## 8. Blank screens — common causes

1. **Missing React hook import** (`useEffect` used but not imported) — fixed for On-ramp / Swap / similar. If a screen is white, check the browser console first.
2. **Empty token registry** — pickers wait on `GET /tokens`; seed admin tokens/chains.
3. **Anonymous session** — many routes need Bearer token; banners prompt sign-in.
4. **CORS** — OPTIONS 404 on Railway before CORS plugin deploy.

---

## 9. Theme (dark / light)

`darkMode` is stored in `localStorage` (`convia.theme`) and applied to **`document.documentElement`** with class `dark`, so CSS variables under `.dark` apply globally. Settings and Profile toggles call the same `setDarkMode` from `App`.

---

## 10. What must never be re-hardcoded

- Token symbols / chain lists for money UIs → registry API  
- Country lists for banks, bills, profile country → `/banks/countries` (or `/bills/markets`)  
- Bank names for a country → `/banks?country=`  
- User greeting / profile identity → session + `/profiles/me`  
- Portfolio balances → `/portfolio/:userId`  
- KYC state → compliance endpoint (not a local boolean)  
- Saved banks → `/users/:id/bank-accounts`  

`src/shared/data/mockData.ts` may still export **types** and residual demo arrays; feature screens must not use those arrays as production fallbacks for balances, banks, or markets.

---

## 11. Suggested next hardening (senior backlog)

1. Live FX into `CurrencyContext` (replace static display rates).  
2. Portfolio history series from backend snapshots (replace flat sparkline).  
3. Avatar upload when storage endpoint exists.  
4. Card vault only if a PCI-compliant provider is integrated — until then, prefer bank rails only.  
5. Per-session revoke UI already partially wired; confirm against `security` routes.  
6. E2E smoke: register → KYC gate → add bank → off-ramp eligibility.

---

## 12. Deploy checklist

1. Backend: CORS, public `GET /tokens`, `GET /chains`, `GET /banks/countries`.  
2. Frontend: `VITE_API_BASE_URL` on Vercel.  
3. Seed tokens/chains and confirm `/banks?country=NG` returns rows.  
4. Smoke login, home greeting, payment methods add-bank sheet, swap from bottom bar, settings theme toggle.

---

*Maintained alongside ConviaUi live wiring. Prefer route handlers in `coviaBackend` over outdated README text when APIs disagree.*
