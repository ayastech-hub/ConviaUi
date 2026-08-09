# Convia API Reference (Frontend integration)

> **Important:** The backend README is partially outdated. Prefer **route source code** (`src/routes/*`, services) over README tables when they disagree (verified Aug 2026).

Source of truth (in priority order): route handlers → services → README:
 [coviaBackend README](https://github.com/ayastech-hub/coviaBackend) §5–§6 and route implementations under `src/routes/*`.

**Base URL:** `VITE_API_BASE_URL` (default `http://localhost:4000`)

**Legend**
- 🪪 Bearer access token required (`Authorization: Bearer <accessToken>`)
- 🔑 `Idempotency-Key` header required (UUID, 24h TTL)
- ❄️ Blocked when the user account is frozen
- 🔒 Admin / moderator only

**Standard error shape**
```json
{ "code": "string_error_code", "message": "optional human message", "...": "extra fields" }
```

---

## Feature → endpoint map

| UI feature | Primary endpoints |
|---|---|
| Onboarding / Auth | `/auth/register`, `/auth/login`, `/auth/refresh`, `/auth/logout`, `/auth/phone/*`, `/auth/email/*`, `/auth/mfa/*` |
| Profile / Settings | `/profiles/me`, `/profiles/:username`, `/profiles/check-username` |
| Home / Portfolio | `/portfolio/:userId`, `/wallets/:userId/balances`, price feeds via portfolio |
| Wallet addresses / deposit | `/wallets/:userId/addresses`, `/wallets/:userId/deposit-info` |
| Send / withdraw crypto | `POST /crypto/withdraw` 🔑❄️🪪 |
| Swap | `GET /swap/quote`, `POST /swap/execute` 🔑❄️ |
| Buy / Sell fiat | `/fiat/onramp/*`, `/fiat/offramp/*`, `/fiat/quote`, bank accounts |
| Payments (P2P transfer) | `/payments/*` |
| Bills (airtime, data, utilities) | `/bills/*` 🔑 |
| Rewards / referrals | `/rewards/*`, `/referrals/*` |
| Security / sessions / PIN | `/security/*` |
| Notifications | `/notifications/*` |
| Token info / chains | `/tokens/:symbol/chains`, `/network-status` |
| Transaction history | `/users/:userId/transactions*` |
| Health | `/health`, `/health/ready` |

Social, OTC, and trading order-book routes may still appear in older README sections; production backend has dropped social and unused trading/OTC (see `prisma/manual_drop_social.sql`, `manual_drop_unused_trading_otc.sql`). **Do not call them from this UI.**

---

## 1. Auth — `/auth/*`

| Method | Path | Body / notes |
|---|---|---|
| `POST` | `/auth/register` | `{ email, password, username }` → `{ userId, evmAddress, solanaAddress, bitcoinAddress, tronAddress, accessToken, refreshToken, sessionId }`. `409 username_taken` |
| `POST` | `/auth/login` | `{ email, password, deviceId? }` → `{ accessToken, refreshToken, sessionId, userId, isNewDevice }` |
| `POST` | `/auth/refresh` | `{ sessionId, refreshToken }` → new token pair. `401 refresh_token_reused` = treat as compromise, force re-login |
| `POST` | `/auth/logout` | `{ sessionId }` → `204` |
| `GET` | `/auth/oauth/:provider?redirectTo=` | `{ url }` redirect target |
| `POST` | `/auth/magic-link` | `{ email }` → `202` |
| `POST` | `/auth/phone/send-otp` | `{ phone }` → `202` |
| `POST` | `/auth/phone/verify-otp` | `{ phone, code }` → session tokens |
| `GET` | `/auth/session` | Bearer → `{ userId }` |
| `POST` | `/auth/mfa/enroll` | `{ userId }` → TOTP secret / QR payload |
| `POST` | `/auth/mfa/confirm` | `{ userId, code }` |
| `POST` | `/auth/mfa/verify` | `{ userId, code }` |
| `POST` | `/auth/mfa/disable` | `{ userId }` → `204` |
| `POST` | `/auth/email/send-verification` | `{ userId, email }` |
| `POST` | `/auth/email/verify` | `{ token }` |

Register provisions **four** custodial chain addresses (EVM, Solana, Bitcoin, Tron), starter ledger accounts, portfolio shell, and a welcome notification in one call.

---

## 2. Profiles — `/profiles/*`

| Method | Path | Auth | Notes |
|---|---|---|---|
| `GET` | `/profiles/:username` | public | Public fields; `403 profile_private` |
| `PATCH` | `/profiles/me` | 🪪 | `{ displayName?, bio?, avatarUrl?, country?, preferredCurrency?, themePreference? }` |
| `PUT` | `/profiles/me/social-links` | 🪪 | Replace full map |
| `PUT` | `/profiles/me/privacy` | 🪪 | `{ visibility }` |
| `GET` | `/profiles/:username/qr-data` | public | `{ url }` for client-side QR |
| `GET` | `/profiles/:username/reputation` | public | level, xp, verified tier |
| `POST` | `/profiles/check-username` | public | query `username` → `{ available, reason? }` |

---

## 3. Wallets — `/wallets/*`

| Method | Path | Notes |
|---|---|---|
| `GET` | `/wallets/:userId/addresses` | `[{ chainFamily, address }, ...]` |
| `GET` | `/wallets/:userId/deposit-info?asset=&chainKey=` | address, confirmations, contract |
| `GET` | `/wallets/:userId/balances` | `{ userId, balances: [{ chainKey, chainFamily, address, asset, ledgerBalance, onChainBalance, inSync }] }` |

---

## 4. Crypto withdraw — `/crypto/*`

| Method | Path | Auth | Body |
|---|---|---|---|
| `POST` | `/crypto/withdraw` | 🔑❄️🪪 | `{ userId, destinationAddress, asset, amount, chainKey, chainFamily }` |

Response: `{ withdrawalRequestId, ledgerTransactionId, txHash, netAmount, feeAmount }`

Common errors: `invalid_address`, `limit_exceeded`, `address_not_whitelisted`, `chain_not_supported`, `below_minimum`.

Bitcoin / Tron signing may still be incomplete — see backend known gaps.

---

## 5. Fiat on/off-ramp — `/fiat/*`

| Method | Path | Notes |
|---|---|---|
| `POST` | `/fiat/onramp/quote` | Quote buy crypto with fiat |
| `POST` | `/fiat/onramp/orders` | 🔑 Place on-ramp order |
| `POST` | `/fiat/offramp/initiate` | 🔑 Sell crypto → bank |
| `GET` | `/fiat/offramp/eligibility/:userId` | Eligibility / limits |
| `POST` | `/fiat/deposit/initiate` | Bank collection request |
| `GET` | `/fiat/deposit/:userId` | Deposit history |
| `POST` | `/fiat/bank-accounts` | Link bank account |
| `GET` | `/fiat/bank-accounts/:userId` | List linked accounts |
| `POST` | `/fiat/bank-accounts/:id/verify` | Verify account |
| `GET` | `/fiat/quote` | Generic FX quote |
| `POST` | `/fiat/webhooks/:provider` | Provider only |

Balances are **crypto-only** on-platform; fiat is converted at the edge.

---

## 6. Portfolio — `/portfolio/*`

| Method | Path | Notes |
|---|---|---|
| `GET` | `/portfolio/:userId` | `{ totalValueUsd: string, holdings: [{ asset, quantity, priceUsd, valueUsd }] }` — from ledger + price feed; starter assets USD/BTC/ETH/SOL |

---

## 7. Payments — `/payments/*`

Internal user-to-user transfers against the ledger. Requires 🪪, often 🔑 and ❄️. See backend README §6.8 for exact payloads.

---

## 8. Swap — `/swap/*`

| Method | Path | Notes |
|---|---|---|
| `GET` | `/swap/quote` | Query: from/to chain+asset, amount, addresses, slippageBps → Li.Fi quote |
| `POST` | `/swap/execute` | 🔑❄️ body `{ userId, fromAsset, toAsset, amount, fromChain, toChain, slippageBps? }` |

Provider: Li.Fi. Country controls may return `403 country_feature_suspended`.

---

## 9. Rewards & referrals

`/rewards/*`, `/referrals/*` — points, streaks, redeem, referral codes. See backend §6.13.

---

## 10. Security — `/security/*`

Sessions, device list, PIN / mnemonic recovery flows, address whitelist, active sessions revoke. Aligns with Profile → Security screens.

---

## 11. Notifications — `/notifications/*`

List / mark-read / preferences for the authenticated user.

---

## 12. Bills — `/bills/*`

| Method | Path | Notes |
|---|---|---|
| Categories / billers | list by country | Airtime, data, electricity, etc. |
| `POST` | `/bills/validate` | Confirm customer reference |
| `POST` | `/bills/pay` | 🔑❄️🪪 debit + provider call |
| `GET` | `/bills/:userId/history` | History |

---

## 13. Transaction history

`/users/:userId/transactions*` — newest first, filterable. Use for Home recent list and Wallet history tab.

---

## 14. Health

| Path | Purpose |
|---|---|
| `GET /health` | Liveness |
| `GET /health/ready` | Readiness (DB etc.) |

---

## Idempotency

Any route marked 🔑 **must** send:

```
Idempotency-Key: <uuid-v4>
```

Replaying the same key within TTL returns the original response instead of double-executing money movement.

---

## Auth header

```
Authorization: Bearer <accessToken>
```

On `401`, attempt `/auth/refresh` once with stored `sessionId` + `refreshToken`. On refresh failure or `refresh_token_reused`, clear session and route to login.
