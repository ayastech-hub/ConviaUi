# Convia UI g

Frontend for Convia — Africa's financial universe (crypto wallet, swap, fiat on/off-ramp, bills, rewards).

## Architectureh

Feature/domain layout. See [ARCHITECTURE.md](./ARCHITECTURE.md).

## Live API integration

Backend: [coviaBackend](https://github.com/ayastech-hub/coviaBackend)

| Doc | Purpose |
|---|---|
| [docs/API.md](./docs/API.md) | Endpoint reference mapped to UI features |
| [docs/INTEGRATION.md](./docs/INTEGRATION.md) | Senior plan: phases, client design, error UX |

### Quick start (with local API)

```bash
# Backend (separate terminal)
cd coviaBackend && cp .env.example .env  # fill DB, JWT, Supabase, KMS
npm i && npx prisma db push && npm run dev   # :4000

# UI
cp .env.example .env.local
# VITE_API_BASE_URL=http://localhost:4000
npm i && npm run dev
```

### What is already live-wired

- **Auth** — `POST /auth/login`, `POST /auth/register`, refresh, logout via `AuthProvider`
- **API client** — `src/shared/api/client.ts` (Bearer, idempotency keys, 401 refresh)
- **Onboarding** — shown only on first browser visit (`localStorage.convia.onboardingSeen`)

Screens still rendering mock balances will switch in integration phases 2–8 (see INTEGRATION.md).

## Scripts

```bash
npm i
npm run dev
npm run build
```


## Mock API (MSW)

When the backend is down, **Mock Service Worker** serves local data so every screen stays usable.

```bash
npm i
npx msw init public/ --save   # once — copies mockServiceWorker.js
npm run dev                   # MSW starts automatically in development
```

| Control | How |
|--------|-----|
| Default in `npm run dev` | MSW on (set `VITE_USE_MSW=false` to disable) |
| Force mocks anytime | `localStorage.setItem('convia.forceMock','1')` then reload |
| Always on (e.g. demo deploy) | `VITE_USE_MSW=true` |

Handlers live in `src/mocks/handlers.ts` and reuse `src/shared/api/mockHandlers.ts` (same catalog as the offline client fallback).


## Demo / mock testing

Local `npm run dev` enables the mock API layer automatically.

| Field | Value |
|--------|--------|
| Email | `demo@convia.app` |
| Password | any (e.g. `demo1234`) |
| User | Ada Okonkwo (`ada_okonkwo`) |
| KYC | **Approved** |
| Frozen | No |
| Portfolio | ~$9,539 with balances |
| Banks | GTBank + Access (NGN) |
| PIN | Set |

```bash
npm install
npm run msw:init   # once
npm run dev
```

Optional: `localStorage.setItem('convia.forceMock','1')` to force mocks outside dev.
