# Convia — Frontend Architecture

## Why this restructure

The project shipped from Figma Make as a single flat folder:
`src/app/components/screens/` held all **27 screens** (some 60–90KB) side by
side with no grouping, plus a `components/` folder mixing shared UI,
feature widgets, and shadcn primitives together. There was no way to tell
what belonged together, and shared pieces occasionally reached into
screen files to grab a component (e.g. `AssetPicker` importing `AssetIcon`
straight out of `HomeScreen.tsx`) — a real production bug waiting to
happen the moment `HomeScreen` changed shape.

This pass reorganizes the code by **feature/domain**, in line with how
most mid-to-large React codebases scale (Bulletproof React / Screaming
Architecture style), and pulls truly shared code into one place.

## New layout

```
src/
├── main.tsx
├── styles/                     # global css (unchanged)
├── app/                        # app shell — owns routing/composition only
│   ├── App.tsx                 # phone-frame shell + screen switch
│   ├── navigation.ts           # useNavigation() stack-based router hook
│   └── providers/
│       └── AppProviders.tsx    # single place to add global context providers
│
├── features/                   # one folder per product domain
│   ├── onboarding/screens/
│   ├── auth/screens/
│   ├── home/screens/
│   ├── wallet/screens/         # Wallet, Send, Receive, Deposit, Withdraw,
│   │                           # Swap, OnRamp, OffRamp, Portfolio, PaymentMethods
│   ├── trade/screens/          # Trade, OTC, TokenInfo
│   ├── social/
│   │   ├── screens/            # SocialScreen (tab shell)
│   │   └── components/         # FeedTab, DiscoverTab, MessagesTab, sheets, types
│   ├── profile/screens/        # Profile, EditProfile, Settings, Security, KYC
│   ├── support/screens/        # HelpCenter, About, Chat
│   ├── notifications/screens/
│   ├── rewards/screens/
│   └── services/screens/
│
└── shared/                     # code with no single feature owner
    ├── components/
    │   ├── ui/                 # shadcn primitives — unchanged, untouched
    │   ├── figma/               # ImageWithFallback
    │   ├── ConviaLogo.tsx
    │   ├── BottomNav.tsx
    │   ├── AssetIcon.tsx       # ← extracted out of HomeScreen (see below)
    │   ├── AssetPicker.tsx
    │   ├── TransactionReceipt.tsx
    │   ├── QRCodeDisplay.tsx
    │   ├── QRScanner.tsx
    │   ├── CameraCapture.tsx
    │   └── ReferralModal.tsx
    ├── context/                # CurrencyContext, PaymentMethodsContext
    ├── data/                   # mockData.ts (types + seed data — see note below)
    └── utils/                  # qrPayload.ts
```

## Rule of thumb going forward

- **A screen only used by one feature** lives in `features/<feature>/screens`.
- **A component only used by one feature** lives in `features/<feature>/components`
  (see `features/social/components`).
- **Anything imported by two or more features** goes in `shared/`. Nothing
  in `shared/` may import from `features/`. This one rule prevents circular
  coupling between features as the app grows.

## Bug fixed during the move

`AssetIcon` (the little "first letter of the symbol" fallback avatar) was
defined inside `HomeScreen.tsx` and re-exported from there. **Ten other
files** — `AssetPicker`, `WalletScreen`, `SendScreen`, `ReceiveScreen`,
`SwapScreen`, `DepositScreen`, `WithdrawScreen`, `OnRampScreen`,
`OffRampScreen`, `PortfolioScreen`, `TradeScreen` — imported it from there.
That means every one of those files was implicitly coupled to
`HomeScreen`'s existence and file path. It's now `shared/components/AssetIcon.tsx`,
a real standalone component, imported the same way everywhere.

## Suggested next steps (not done in this pass, to keep the diff reviewable)

1. **Split `mockData.ts`** (currently ~20KB of types + seed data in one file)
   into `shared/data/types.ts` (interfaces: `Screen`, `Transaction`, `Asset`…)
   and `shared/data/mock/*.ts` (the actual seed arrays), so screens that only
   need a type don't pull in mock data, and so mock data is easy to later
   swap for real API calls.
2. **Introduce a real router.** `react-router` is already a dependency but
   unused — the app drives navigation with a hand-rolled stack in
   `app/navigation.ts`. That's fine for a prototype, but it means no
   deep-linking, no browser back button, and no shareable URLs. Because
   every screen only talks to `navigate`/`goBack`/`switchTab`, swapping the
   hook's implementation for one backed by `react-router` is a localized
   change.
3. **Add a `services/` (API) layer** once this connects to a real backend —
   e.g. `shared/services/wallet.ts`, `shared/services/kyc.ts` — so screens
   stop reading directly from static mock arrays.
4. **Barrel files** (`features/wallet/index.ts` exporting all wallet
   screens) if the number of cross-feature imports grows; skipped here
   since `App.tsx` is currently the only cross-feature consumer.
5. **Co-locate large screens' sub-pieces.** A few screens are still very
   large (`OTCScreen.tsx` ~89KB, `KYCScreen.tsx` ~65KB, `HelpCenterScreen.tsx`
   ~49KB). Worth breaking each into `OTCScreen/index.tsx` +
   `OTCScreen/*.tsx` step components once someone touches them again.
