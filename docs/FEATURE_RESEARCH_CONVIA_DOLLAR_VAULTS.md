# Convia Product & Growth Research
## Recommendation: **Dollar Vaults** (Stablecoin Savings + Auto-Protect)

**Document type:** Product + Marketing leadership presentation  
**Audience:** Founders, product, engineering, growth  
**Date:** September 2026  
**Classification:** Internal strategy  

---

## 1. Executive summary

**Recommendation:** Ship **Dollar Vaults** as Convia’s next flagship feature — a simple, trusted way for users to hold value in USD-linked stablecoins (USDT/USDC), optionally earn yield, and auto-convert excess Naira so inflation does not silently destroy balances.

**Why this wins**

| Signal | Evidence |
|--------|----------|
| Preference | ~**95%** of crypto-active Nigerians prefer to be paid in stablecoins (YouGov / BVNK / Coinbase, 2026) |
| Behaviour | Nigeria ranks among the world’s largest crypto markets; stablecoins dominate retail on-chain activity in Sub-Saharan Africa |
| Retention | Neobank research: inflation-hedge products are the difference between a “utility app” and a **primary financial home** |
| Competition gap | Many wallets offer trade + bills; few own the narrative *“your money does not lose value while it sits here”* |
| Unit economics | Vault balances increase AUM, swap/spread volume on convert, and lifetime value far more than one-off bill payments |

**One-line positioning**

> *Convia protects what you earn — keep Naira for spending, park the rest in Dollar Vaults.*

---

## 2. Problem statement

### 2.1 The user problem (stated plainly)

A typical Convia user in Lagos or Abuja:

1. Receives income or crypto inflows in **Naira or mixed assets**.
2. Leaves balance sitting because “I’ll use it later.”
3. **Naira purchasing power erodes** under sustained high inflation (often discussed in the **20–30%+** range in retail narratives; exact CPI varies by period).
4. They already know USDT is the informal savings unit — friends quote prices in dollars, freelancers ask to be paid in stablecoins.
5. Today they **leave Convia** to Binance P2P, a savings app, or a WhatsApp OTC desk to “dollarise.”

**Pain:** Convia is used for *moving* money (deposit, swap, bills, withdraw) but not for *keeping* money. That makes us transactional, not habitual.

### 2.2 The business problem

| Metric at risk | Why |
|----------------|-----|
| **Retention / DAU** | No reason to open the app on non-transaction days |
| **Share of wallet** | Value stored elsewhere → spend and referrals happen elsewhere |
| **CAC payback** | High acquisition cost vs low repeat sessions if we only earn on ramp fees |
| **Brand** | “Another crypto wallet” vs “the place my money is safe from inflation” |

### 2.3 Problem framing (jobs-to-be-done)

> When I get paid or hold crypto,  
> I want to **preserve dollar value without becoming a day trader**,  
> so I can sleep and still pay bills in Naira when I need to.

Current Convia covers *pay* and *move*. It under-serves *protect* and *grow slowly*.

---

## 3. Market & research context

### 3.1 Nigeria / Africa crypto reality (2025–2026)

- Nigeria remains Africa’s dominant crypto market by on-chain volume and user count (tens of millions of owners regionally; Nigeria alone often cited ~**20M+**).
- Usage is **utility-led**, not pure speculation: remittances, savings against FX stress, P2P, bills.
- Chainalysis-class reports place Sub-Saharan Africa among the **fastest-growing** crypto regions; Nigeria is a top global inflow market.
- **Stablecoins** are the practical unit of account for many retail users — not BTC day-trading.

### 3.2 What competitors and adjacent products prove

| Pattern | What the market shows |
|---------|------------------------|
| **Cash out first, then trust** | Nigerians test wallets by withdrawing; trust is earned after successful exits (Bitget Wallet leadership commentary, 2026) |
| **Payments > trading** | Large wallets report payment users overtaking traders — everyday finance is the growth engine |
| **Stablecoin savings / vaults** | Neobank playbooks explicitly list USDT savings and auto-hedge rules as retention levers |
| **Group / collaborative wallets** | Local fintechs digitise *ajo*/contribution culture (e.g. group wallets) — social money is real, but secondary to personal inflation protection |
| **Cards + cashback** | High CAC; interchange alone is thin; works best *on top of* sticky balances |
| **Referrals** | Strong for acquisition; weak as a *core product* if the product itself is not sticky |

### 3.3 Insight we will own

Users do not need another “Earn 200% APY” DeFi casino.  
They need **boring, clear, dollar protection** with one toggle:

- Auto-convert NGN above a threshold → USDT vault  
- Manual “Move to Dollar Vault”  
- Optional modest yield (partner-sourced, risk-disclosed)  
- One-tap “Break vault → NGN for bills”

That is **Convia Dollar Vaults**.

---

## 4. Solution overview

### 4.1 Product definition

**Dollar Vaults** = a first-class balance bucket inside Convia, denominated in USD-stable value (USDT/USDC), separate from the spendable wallet for bills and transfers.

**Core capabilities (MVP)**

1. **Create / view vault** — balance in USD and NGN equivalent  
2. **Deposit to vault** — from USDT/USDC wallet or convert NGN → stablecoin at live rate  
3. **Withdraw from vault** — to wallet (stablecoin) or off-ramp path  
4. **Auto-Protect rule** — “If NGN wallet > ₦X, convert surplus to vault”  
5. **History** — vault deposits, converts, yields (if any)  
6. **Risk & disclosure** — stablecoin issuer risk, no principal guarantee banner  

**Phase 2**

7. **Yield toggle** — opt-in yield via licensed partner / treasury (capped, transparent APY)  
8. **Goals** — “Rent in USD”, “School fees 2027” target vaults  
9. **Referral boost** — bonus vault credit when invitee funds a vault (growth loop)

### 4.2 User flows (happy path)

```
Home → “Protect balance” card
  → Dollar Vaults
    → Move ₦50,000 → vault (quote → confirm → done)
    → Toggle Auto-Protect (threshold ₦100,000)
    → Later: Pay electricity → pull from NGN; if short, “Break ₦5,000 from vault”
```

### 4.3 Why this fits *our* codebase

Convia already has:

- Portfolio / balances  
- On-ramp / off-ramp  
- Swap  
- Bills / services  
- KYC gates  
- History + notifications  

Dollar Vaults is mostly **product composition + ledger rules**, not a greenfield chain. Engineering can extend existing swap + balance models with a `vault` product type and clear accounting.

---

## 5. Goals, non-goals, success metrics

### 5.1 Goals

| Goal | Measure (90 days post-launch) |
|------|-------------------------------|
| Adoption | ≥ **25%** of MAU create or fund a vault |
| Habit | ≥ **2** vault-related sessions / funded user / month |
| Retention | +**15%** D30 retention for vault users vs non-vault cohort |
| Volume | Vault-sourced convert volume ≥ **20%** of total swap NGN↔stable |
| Trust | Support tickets on “where is my money” &lt; **1%** of vault users |

### 5.2 Non-goals (explicit)

- Not a high-risk leveraged yield farm  
- Not a bank deposit with NDIC-style guarantee (must communicate clearly)  
- Not replacing P2P merchant desks in v1  
- Not a full brokerage or stock app  

### 5.3 North-star

**% of user net worth (in-app) held in Dollar Vaults** — the clearest signal we became the savings home, not a pipe.

---

## 6. Marketing narrative

### 6.1 Positioning

| Layer | Message |
|-------|---------|
| **Problem** | Naira in a normal wallet quietly loses value |
| **Promise** | Dollar Vaults keep purchasing power clearer |
| **Proof** | Live rate, instant move, same Convia KYC and history |
| **Personality** | Calm, adult, local — not “degen” |

### 6.2 Campaign angles

1. **“Stop the silent leak”** — inflation as the villain  
2. **“Paid in Naira, saved in dollars”** — freelancers & remote workers  
3. **“Bills in Naira, future in USD”** — dual-balance mental model  
4. **Trust sequence** — deposit small → vault small → cash out once → then raise limits (matches Nigerian wallet test behaviour)

### 6.3 Channels

| Channel | Play |
|---------|------|
| In-app | Home banner + empty-state on large NGN balance |
| WhatsApp / communities | Creator scripts: “I moved salary remainder to Convia Vault” |
| Referral | “Invite → both get ₦X vault boost after first vault fund” |
| Content | Short videos: Auto-Protect setup in 30 seconds |

### 6.4 Launch name options

- **Dollar Vaults** (clear, preferred)  
- **USD Protect**  
- **Stable Save**  

Recommendation: **Dollar Vaults** — plain language beats crypto jargon.

---

## 7. Competitive differentiation

| Player type | Typical offer | Convia wedge |
|-------------|---------------|--------------|
| Global CEX | P2P + earn, complex UX | Simpler vault + bills in one app |
| Local fintech | Naira savings @ high nominal rate | Real **FX protection**, not only Naira interest |
| Pure Web3 wallet | Self-custody, weak local offramp | Already integrated on/off-ramp + KYC |
| Card-first apps | Spend crypto | We add *reason to hold* before spend |

**Differentiation sentence for investors/press**

> Convia is building the inflation-aware wallet for Nigeria: spend in Naira, save in dollars, same app.

---

## 8. Risks & mitigations

| Risk | Mitigation |
|------|------------|
| Regulatory framing of “savings/yield” | Partner with licensed entities; conservative copy; no “bank deposit” claims |
| Stablecoin depeg / issuer risk | Diversify USDT/USDC; hard risk disclosures; optional insurance later |
| Users confuse vault with locked funds | Instant unlock in MVP; no lockups until yield phase |
| Trust (cash-out test) | Fast offramp path from vault remains first-class |
| Support load | Crystal-clear FAQ + in-flow education screens |
| Yield expectations | Default vault = **0% protect-only**; yield is opt-in |

---

## 9. Delivery plan (phased)

### Phase 0 — Design & ledger (1–2 weeks)

- UX: home entry, vault screen, Auto-Protect sheet, disclosures  
- Ledger: `vault_balance`, convert legs, audit trail  
- Feature flags + KYC gate (align with withdraw level)

### Phase 1 — MVP Protect (3–5 weeks)

- Manual NGN → vault and vault → wallet  
- Vault balance on home  
- History + notifications (`vault_funded`, `auto_protect_ran`)  
- Analytics events  

### Phase 2 — Auto-Protect + goals (2–3 weeks)

- Threshold rules  
- Named goals (rent, school)  
- Smarter home prompts  

### Phase 3 — Yield + growth loop (parallel / later)

- Opt-in APY with partner  
- Referral vault boost  
- Seasonal campaigns (“Salary week Protect”)

---

## 10. Engineering sketch (for the team)

```
Wallet NGN ──convert──► Vault USDT (ledger account type: VAULT)
Wallet USDT ──transfer──► Vault USDT
Vault USDT ──break──► Wallet USDT or NGN (via existing swap/offramp)
Auto-Protect job: periodic or post-credit rule evaluation
```

**Reuse**

- Swap quote engine for convert  
- FeatureAlert / KYC gates  
- Notifications taxonomy (money category)  
- History filters (add type `vault`)

**New**

- Vault API endpoints  
- Rule engine for Auto-Protect  
- Compliance copy CMS  

---

## 11. Alternatives considered (and why not first)

| Idea | Pros | Why not #1 |
|------|------|------------|
| **In-app P2P marketplace** | Huge NG volumes | Trust, disputes, ops-heavy, regulatory heat |
| **Group wallets (ajo)** | Cultural fit | Narrower ICP; complex permissions |
| **Crypto debit card** | Spend narrative | Capital intensive; thin interchange; needs balances first |
| **Heavy referral only** | Cheap CAC | Does not fix retention if product is hollow |
| **Copy trading** | Engagement | Misaligned with “utility wallet” brand |

**Sequence:** Dollar Vaults → balances stick → *then* card / groups / advanced earn.

---

## 12. Decision request

**Approve Dollar Vaults as the next major product bet**, with:

1. Phase 1 MVP scoped as above  
2. Marketing narrative locked to inflation protection  
3. Success metrics reviewed at day 30 / 90  
4. Yield explicitly **not** in MVP  

---

## 13. Appendix — research sources (indicative)

- TechCabal (2026): Nigerian wallet trust behaviour (“cash out first”); stablecoin payment preference survey mentions  
- Chainalysis-class geography reports: SSA growth; Nigeria inflow leadership  
- Quidax / neobank commentary: stablecoin savings and auto-hedge as retention tools  
- Industry launches: group wallets, spend wallets, mobile-money ↔ crypto rails across Africa  
- Remittance cost context: Sub-Saharan corridors remain expensive vs digital asset rails  

*(Internal teams should attach primary PDFs and survey extracts before external sharing.)*

---

## 14. Closing

Convia already moves money well.  
Growth now depends on becoming the place money **stays** because it feels safer than the alternatives.

**Dollar Vaults** is that feature: simple enough for mass market, deep enough for retention, honest enough for Nigerian trust dynamics, and aligned with where African crypto actually is in 2026 — **stablecoins as savings, not casino chips**.

---

*Prepared by: Product Lead + Marketing (strategy exercise)*  
*For: Convia leadership*  
