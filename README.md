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
