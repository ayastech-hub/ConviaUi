# Profile feature ↔ API coverage

## Implemented against live API

| UI | API |
|---|---|
| Profile card (name, handle, KYC badge) | `GET /profiles/:username`, `GET /compliance/:userId/kyc` |
| Edit profile (displayName, bio, country, currency, avatarUrl) | `PATCH /profiles/me` |
| Sign out | `POST /auth/logout` |
| Active sessions list | `GET /security/:userId/sessions` |
| Transaction PIN set/change | `POST/PUT /security/:userId/transaction-pin` |
| Recovery phrase reveal | `POST /security/:userId/recovery-phrase/reveal` |
| Withdrawal whitelist | `GET/POST/DELETE /security/:userId/withdrawal-whitelist` |
| KYC submit | `POST /compliance/:userId/kyc/submit` |
| Referral code banner | `GET /referrals/:userId/code` |

Username is stored on register in the local session (backend login does not return username; there is no `GET /profiles/me`).

## No dedicated backend API (or incomplete) — still UI-only / limited

| Feature | Notes |
|---|---|
| **Change email / phone on Edit Profile** | No profile endpoints for email/phone; auth has phone OTP / email verify separately, not wired to edit form |
| **Username change** | No API to rename username after registration |
| **Avatar file upload** | API only accepts `avatarUrl` (https URL). No media upload service — local file picker cannot persist |
| **KYC document/selfie binary upload** | Submit requires **hosted image URLs**; no upload endpoint — UI still captures locally but sends placeholder URLs until an upload service exists |
| **Revoke individual session** | List only; no `DELETE /security/.../sessions/:id` (only current session logout) |
| **MFA enroll/confirm UI** | Backend has `/auth/mfa/*` but Security screen has no MFA enrollment flow wired |
| **Anti-phishing code UI** | `GET /security/:userId/anti-phishing-code` exists, not shown in UI |
| **API keys management UI** | `/security/:userId/api-keys` exists, no screen |
| **Address proof (compliance address)** | `POST/GET /compliance/:userId/address` exists, not in KYC UI |
| **Privacy visibility control UI** | `PUT /profiles/me/privacy` exists, no settings toggle wired |
| **Payment methods (cards)** | Bank accounts API exists (`/users/:userId/bank-accounts`); saved **cards** are local context only — no card vault API |
| **Currency picker as preferences** | Can use `preferredCurrency` on PATCH me; Settings currency picker may still be local `CurrencyContext` only |
| **Notifications badge count on Profile** | Notifications API exists but Profile badge still static |
| **Rewards points badge on Profile row** | `GET /rewards/:userId` exists; Profile list badge still hard-coded until Rewards screen is wired |

Prefer route source code over backend README when extending.
