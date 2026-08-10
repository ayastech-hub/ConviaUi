# ConviaUi ↔ coviaBackend (omnibus)

Backend cloned at `/home/workdir/coviaBackend` (latest main).

## Money model

| Feature | API | Notes |
|---------|-----|--------|
| Portfolio | `GET /portfolio/:userId` | Canonical assets (USDT, ETH, …) |
| Internal send | `POST /payments/send` | No chain |
| Swap | `GET/POST /swap/*` | Internal ledger only |
| Crypto deposit | `GET /wallets/.../deposit-info` | Chain matters |
| Crypto withdraw | `POST /crypto/withdraw` | Chain + HotWallet |
| Local on-ramp | `POST /fiat/local/onramp` | Paystack / Flutterwave |
| Local off-ramp | `POST /fiat/local/offramp` | Debit ledger + bank payout |

## Env

`VITE_API_BASE_URL` → Railway (or local `:4000`).
