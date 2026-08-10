# Internal team testing — readiness

## Environment

| App | Env |
|-----|-----|
| Backend | `NODE_ENV=production`, **`CORS_ORIGIN`** = comma-separated user + admin Vercel URLs |
| ConviaUi | `VITE_API_BASE_URL` = backend public URL |
| ConviaAdmin | `VITE_API_BASE_URL` = same backend |

## Staff access

1. Bootstrap admin user (`bootstrap-admin` / AdminUser row).
2. Optional moderator role for KYC/support-only testers.
3. Login on ConviaAdmin → role from **`GET /admin/me`**.

## Seed before money tests

- Admin → Chains & tokens (at least one chain + USDT/ETH variants)
- Admin → Service providers (bill + payment routes for NG/GH/…)
- Admin → Country controls (confirm nothing suspended accidentally)

## Security gates in this build

- User-scoped portfolio, transactions, wallets, rewards, notifications require **Bearer + matching userId**
- Support images: non-SVG images only; no SVG data URLs
- Production CORS does not reflect arbitrary origins without `CORS_ORIGIN`

## Suggested test script

1. Register user → Home portfolio (empty or zero)
2. KYC submit → Admin KYC approve → off-ramp / higher limits banners clear
3. Deposit info + QR for seeded token
4. Send small amount / withdraw (PIN if enabled)
5. Support case + image attachment → Admin Support desk reply/close
6. Moderator: cannot open Fees/Roles; can open KYC + Support + Ops scan
7. Admin: deposit scan, country suspend, provider toggle

## Known residual (not blockers for internal QA)

- Access tokens still in `localStorage` (XSS risk) — cookie session is follow-up
- Avatar upload, full MFA UI, object-storage for attachments
- FX display rates may be soft until FX service is bound
