# Backend Spec: Dollar Vault (MVP)

**Status:** Conditional product approval — Phase 1 **manual only**  
**Audience:** Backend / ledger / compliance engineers  
**Frontend:** Screens `vault`, home `VaultHomeCard`, client `src/shared/api/vault.ts`

---

## 1. Product rules (do not violate)

| Rule | Detail |
|------|--------|
| **Not “savings”** | API copy, emails, and error strings must say **Dollar Vault / USD-linked holding**, never “savings account” |
| **No yield in MVP** | No interest, no APY field, no staking |
| **No lock-up** | Every vault position is withdrawable anytime (subject to liquidity + KYC) |
| **No Auto-Protect in MVP** | No scheduled/automatic NGN→vault jobs yet |
| **Ledger is source of truth** | Do **not** store only a mutable `vault_balance` float; post double-entry ledger lines |
| **Underlying assets** | Positions in **USDT** and/or **USDC**; UI may show a single `$` total |

---

## 2. Domain model

```
User
 ├── Wallet accounts (existing)
 │    ├── NGN (fiat ledger)
 │    ├── USDT
 │    └── USDC
 └── Vault
      ├── VaultAccount (product container)
      └── VaultPosition[]  (asset = USDT | USDC, quantity)
```

**Suggested tables**

```text
vault_accounts
  id, user_id, status (active|frozen), created_at

vault_positions
  id, vault_account_id, asset (USDT|USDC), quantity (decimal), updated_at

ledger_entries  (existing or extend)
  id, user_id, account_type (WALLET_NGN|WALLET_USDT|WALLET_USDC|VAULT_USDT|VAULT_USDC),
  direction (debit|credit), amount, asset, ref_type, ref_id, created_at

vault_quotes
  id, user_id, side, amount_in, asset_in, amount_out, asset_out,
  rate, fee_amount, fee_asset, fee_bps, expires_at, status

vault_moves
  id, user_id, quote_id, ledger_tx_id, status, created_at
```

Every move creates **paired ledger entries** (debit source, credit destination) plus fee entry if applicable.

---

## 3. HTTP API

Base path prefix: existing API base (e.g. Railway).

### 3.1 `GET /vault/:userId`

Returns aggregated vault state.

```json
{
  "totalUsd": "1240.00",
  "usdt": "800.00",
  "usdc": "440.00",
  "ngnEquivalent": "1860000",
  "rateNgnPerUsd": "1500"
}
```

**Auth:** session user must match `:userId` (or admin).  
**KYC:** read allowed at same level as viewing portfolio.

---

### 3.2 `POST /vault/quote/to-vault`

Move **NGN (or stable from wallet)** into vault.

Request:

```json
{
  "userId": "usr_…",
  "amountNgn": "100000",
  "asset": "USDT"
}
```

Optional: `amountStable` + `asset` for wallet USDT/USDC → vault (no FX).

Response:

```json
{
  "quoteId": "q_…",
  "side": "ngn_to_vault",
  "amountIn": "100000",
  "assetIn": "NGN",
  "amountOut": "66.00",
  "assetOut": "USDT",
  "rate": "1500",
  "feeAmount": "0.67",
  "feeAsset": "USDT",
  "feeBps": 100,
  "expiresAt": "2026-09-08T12:00:00Z"
}
```

**Fee model (decide & lock before launch)**

Recommended default for MVP:

- **Fee:** `100 bps (1%)` on the USD notional for NGN→vault converts  
- Or **spread-only** (no line-item fee) — if spread-only, still return `feeBps: 0` and document mid vs executed rate in ledger metadata  

Quotes expire in **60 seconds**. Execute must reject expired quotes.

---

### 3.3 `POST /vault/quote/from-vault`

```json
{
  "userId": "usr_…",
  "amountUsd": "50",
  "target": "ngn",
  "asset": "USDT"
}
```

`target`: `ngn` | `wallet`  
- `wallet` → credit wallet USDT/USDC (no FX)  
- `ngn` → convert via existing FX/off-ramp path

---

### 3.4 `POST /vault/execute`

```json
{
  "userId": "usr_…",
  "quoteId": "q_…"
}
```

Response:

```json
{
  "ok": true,
  "ledgerTransactionId": "ltx_…",
  "quoteId": "q_…",
  "amountIn": "100000",
  "amountOut": "66.00",
  "status": "completed"
}
```

**Idempotency:** accept `Idempotency-Key` header; same key + body → same result.

**Failure modes:** insufficient balance, KYC gate, quote expired, liquidity, frozen user → structured `ApiError` codes.

Suggested codes:

| Code | Meaning |
|------|---------|
| `VAULT_QUOTE_EXPIRED` | Re-quote required |
| `VAULT_INSUFFICIENT_BALANCE` | Source account short |
| `VAULT_KYC_REQUIRED` | Same gate as withdraw/off-ramp |
| `VAULT_FROZEN` | Account frozen |
| `VAULT_LIQUIDITY` | Cannot fill |

---

### 3.5 `GET /vault/:userId/activity?limit=30`

```json
{
  "items": [
    {
      "id": "vm_…",
      "type": "vault_in",
      "amountUsd": "66.00",
      "amountNgn": "100000",
      "asset": "USDT",
      "status": "completed",
      "ledgerTransactionId": "ltx_…",
      "createdAt": "…"
    }
  ]
}
```

Types: `vault_in` | `vault_out`

Also mirror these into the global transactions feed so History can filter them later.

---

## 4. Ledger posting examples

### NGN → Vault USDT (₦100,000, rate 1500, fee 1% on USD)

```
Debit  WALLET_NGN     100000 NGN
Credit SYSTEM_FX                (internal)
Credit VAULT_USDT     66.00 USDT   (user vault)
Credit FEE_REVENUE     0.67 USDT   (or NGN equivalent)
```

Exact internal FX accounts should match your existing swap/on-ramp design.

### Vault USDT → Wallet USDT ($20)

```
Debit  VAULT_USDT   20 USDT
Credit WALLET_USDT  20 USDT
```

### Vault USDT → NGN

Reuse existing off-ramp/swap settlement legs; source account is `VAULT_USDT` not `WALLET_USDT`.

---

## 5. Compliance & risk (required before prod)

1. **Legal review** of all user-facing strings (no deposit/savings guarantee language).  
2. **Stablecoin issuer risk** assessment (USDT/USDC).  
3. **KYC:** vault convert from NGN should use **same gate as offramp/withdraw** (or documented lighter tier if counsel allows).  
4. **Reconciliation:** daily job — sum `vault_positions` vs custodial/exchange balances.  
5. **Support playbook:** failed execute, partial fill, user disputes.

---

## 6. Analytics events

| Event | Properties |
|-------|------------|
| `vault_view` | userId |
| `vault_quote_requested` | side, amountIn, assetIn |
| `vault_quote_received` | quoteId, feeBps |
| `vault_execute_success` | quoteId, amountOut |
| `vault_execute_fail` | code |

**North-star (product):** % of eligible Convia balances held in Dollar Vault / **Monthly Protected Balance** — not “% of net worth.”

---

## 7. Out of scope (do not build yet)

- Auto-Protect / scheduled conversion  
- Yield / Earn  
- Goals / named vaults  
- Referral vault bonuses  
- Card spend against vault  

---

## 8. Acceptance tests

1. User with NGN can quote + execute → vault USDT increases, NGN decreases, ledger balanced.  
2. Expired quote cannot execute.  
3. Insufficient NGN returns `VAULT_INSUFFICIENT_BALANCE`.  
4. Frozen user blocked.  
5. `GET /vault/:id` totals = sum of positions.  
6. Activity list shows move after execute.  
7. Idempotent execute does not double-credit.

---

## 9. Frontend contract

Client already expects the shapes in `src/shared/api/vault.ts`.  
Mock handlers under MSW/client mock path `/vault` for local demo.

---

*Owner: Product + Backend*  
*MVP: Manual Dollar Vault only*
