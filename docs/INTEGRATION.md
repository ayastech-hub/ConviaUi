# Going fully live (senior integration plan)

This UI shipped as a high-fidelity Figma Make prototype with **local mock data**. The backend (`coviaBackend`) is a real Fastify + Prisma + ledger system. This document is the path from mock → production.

## Principles

1. **One API client** — never call `fetch` from screens. All HTTP goes through `src/shared/api/client.ts`.
2. **Auth is global state** — `AuthProvider` owns tokens, refresh, and userId. Screens consume `useAuth()`.
3. **Feature modules map 1:1 to backend domains** — `api/auth.ts`, `api/wallet.ts`, `api/swap.ts`, …
4. **Idempotency at the edge of money movement** — generate UUID keys in the client for withdraw, swap execute, bills pay, fiat orders.
5. **Optimistic UI only where rollback is safe** — never optimistically debit balances; wait for ledger confirmation.
6. **Mocks become fallbacks, then die** — `VITE_USE_MOCKS=true` keeps demo mode; default is live.

## Recommended architecture

```
src/
  shared/
    api/
      client.ts          # base fetch, auth header, refresh, errors
      types.ts           # shared DTO types
      auth.ts
      profile.ts
      wallet.ts
      portfolio.ts
      swap.ts
      fiat.ts
      payments.ts
      bills.ts
      rewards.ts
      security.ts
      notifications.ts
      transactions.ts
    context/
      AuthContext.tsx    # session + tokens in memory + localStorage
    hooks/
      usePortfolio.ts
      useBalances.ts
      ...
  features/*/screens    # call hooks / api modules only
```

### Why not React Query / TanStack immediately?

Add it once live endpoints are stable. Start with thin async functions + local component state so failure modes (freeze, country_suspended, idempotency replay) are explicit. Introduce TanStack Query in a second pass for cache, stale-while-revalidate, and background refresh of portfolio/prices.

### Why not put the API base URL in code?

Railway / Vercel / local all differ. Use:

```
VITE_API_BASE_URL=https://api.your-domain.com
```

Never commit secrets. Access tokens live in memory; refresh token + sessionId in `localStorage` under a single key (`convia.session`).

## Phased rollout

| Phase | Scope | Done when |
|---|---|---|
| **0** | Docs + client + AuthContext + first-visit onboarding | This PR |
| **1** | Auth register / login / refresh / logout live | User can create account against real API |
| **2** | Portfolio + balances + addresses + tx history | Home & Wallet show real numbers |
| **3** | Deposit info + receive QR from real addresses | Receive screen is live |
| **4** | Swap quote + execute | Swap is live (subject to Li.Fi + country controls) |
| **5** | Fiat on/off-ramp + bank accounts | Buy/Sell live where providers configured |
| **6** | Crypto withdraw + whitelist + security sessions | Send live with server-side limits |
| **7** | Bills + rewards + notifications | Services hub fully live |
| **8** | Remove mockData usage from screens | `VITE_USE_MOCKS` deleted |

## Onboarding rule (product)

- Show onboarding **only on the first browser visit** (`localStorage.convia.onboardingSeen !== '1'`).
- After the user finishes slides or taps skip → set the flag.
- Subsequent loads: if session exists → `home`; else → `login` (or `signup` CTA on login).

## Error UX mapping

| Backend `code` | UI treatment |
|---|---|
| `username_taken` | Inline on signup username/email |
| `refresh_token_reused` | Force logout + security message |
| `country_feature_suspended` | Feature-level empty state |
| `address_not_whitelisted` | Deep-link to Security → whitelist |
| `limit_exceeded` / `below_minimum` | Amount field error with limits |
| `swap_provider_unavailable` | Retry + status page |
| `5xx` / network | Toast + retry |

## Security notes

- Never log access tokens.
- Clear `convia.session` on logout and on refresh reuse.
- All money POSTs must send `Idempotency-Key`.
- Trust **server** balances; client mock balances are display-only until Phase 2.

## Local backend

```bash
cd coviaBackend
cp .env.example .env   # fill DATABASE_URL, JWT_SECRET, SUPABASE_*, KMS_*
npm i && npx prisma db push
npm run dev            # :4000
```

UI:

```bash
cd ConviaUi
echo "VITE_API_BASE_URL=http://localhost:4000" > .env.local
npm i && npm run dev
```

## Known backend gaps that affect UI

From backend README §9 (do not assume these work):

- Bitcoin / Tron withdrawal signing incomplete
- Some fee config keys recorded but not applied
- Fiat webhook raw-body opt-in may be missing on one route

Design UI empty/error states for these instead of infinite spinners.
