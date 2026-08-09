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

## Splitting big screens into components (the "social" pattern)

`features/social` was already split into `screens/` (the tab shell) +
`components/` (FeedTab, DiscoverTab, sheets, etc). The **profile** feature
now follows the same pattern, and is the template for doing the rest:

```
features/profile/
├── screens/
│   ├── ProfileScreen.tsx        108 lines  (was 283)
│   ├── EditProfileScreen.tsx     97 lines  (was 246)
│   ├── SettingsScreen.tsx        90 lines  (was 246)
│   ├── SecurityScreen.tsx        51 lines  (was 348)
│   └── KYCScreen.tsx            195 lines  (was 1,226)
└── components/
    ├── ProfileCard.tsx, AvatarUploader.tsx, ReferralBanner.tsx, SignOutButton.tsx
    ├── ProfileFormField.tsx, CurrencyPickerView.tsx
    ├── SecurityMenu.tsx, ChangePinFlow.tsx, RecoveryPhraseView.tsx,
    │   ActiveSessionsView.tsx, AddressWhitelistView.tsx, types.ts
    └── kyc/
        ├── types.ts                 (DocType, Country list, validation)
        ├── StepIndicator.tsx, StepNavButtons.tsx
        ├── PersonalInfoStep.tsx, DocumentUploadStep.tsx,
        │   SelfieVerificationStep.tsx, ReviewStep.tsx
        └── SuccessView.tsx
```

Each screen file is now a thin **orchestrator**: it owns the state that
needs to survive across steps (or is needed for validation/review) and
renders the right child component, but none of the actual markup. KYC —
the largest screen in the app — went from one 1,226-line file doing
everything to a 195-line router plus 8 focused files, each independently
readable and testable. A multi-step flow like KYC gets its own
`components/<flow>/` subfolder (mirroring `features/social/components`)
rather than a flat dump, since it has enough pieces to need its own
sub-structure.

### New truly-shared components (used by 2+ features)

While splitting profile apart, five patterns turned out to be copy-pasted
identically across many screens (not just within profile), so they moved
up to `shared/components/`:

- **`ScreenHeader`** — the back-chevron + title row. Was duplicated in **20 of 27 screens**.
- **`ListSection`** / **`ListRow`** — the titled card + tappable row pattern (Profile's Account/Activity/Support lists, Settings' Preferences, Security's Protection/Actions).
- **`ToggleSwitch`** — the pill on/off switch used on Settings and Security.

## Native-only features kept as unused, documented source (not deleted)

Two features in the original design only make sense on a real mobile
device, not in a browser tab:

- **Device PIN lock** — a 4-digit PIN you set once to gate the whole app,
  backed by a phone's secure enclave/keychain. No web equivalent.
- **Biometric login** — Face ID / fingerprint via a native OS API. The
  closest web analog (WebAuthn) is a fundamentally different flow, not a
  drop-in replacement.

Rather than deleting this code, it was moved into its own files with a
`⚠️ NATIVE / MOBILE ONLY` comment block explaining why, and **left
unimported** on web:

- `features/onboarding/components/PinSetupFlow.tsx` — was inline in
  `OnboardingScreen.tsx`. On web, finishing the onboarding slides now
  navigates straight to sign up instead of into a PIN-creation phase.
- `features/auth/components/BiometricStep.tsx` — was inline in
  `AuthScreen.tsx`. On web, submitting login credentials now goes
  straight to the success state instead of into a biometric-confirm step
  (the "Use Biometric" quick-access button on the credentials step was
  also removed for the same reason).

If this project is ever wrapped in a native shell, both files are
complete, ready to import, and each has a comment describing exactly
how to wire it back in.

## Home / Wallet / Services split into components

Same recipe as Profile, applied to three more screens:

```
features/home/screens/HomeScreen.tsx        349 → 70 lines
features/wallet/screens/WalletScreen.tsx     299 → 49 lines
features/services/screens/ServicesScreen.tsx 531 → 159 lines
```

New feature-local components: `features/home/components/` (HomeHeader,
PortfolioHeroCard, KYCBanner, QuickActionsRow, MarketWatchlist,
RecentTransactionsList), `features/wallet/components/`
(BalanceSummaryCard, WalletQuickActions, ChainFilter, AssetsHistoryTabs,
AssetsList, WalletHistoryList), `features/services/components/`
(serviceData, ServiceHub, ProviderSelector, ServiceAmountInput,
PaymentSummaryCard, ServicePaymentSuccess).

Also fixed along the way:
- **`WalletScreen`** had dead state (`copied`/`handleCopy`/an unused
  `Copy` icon import) with no button ever calling it — dropped rather
  than carried into the new structure.
- **Home's and Wallet's "Recent transactions" lists use different color
  schemes** for the same transaction types (Home leans positive/green
  for incoming, Wallet leans destructive/red for outgoing). This looks
  like an inconsistency from the original generation rather than a
  shared bug, so each screen's `txTypeInfo` was kept local and
  unchanged rather than merged into one shared version that would have
  altered one screen's colors.



Follow the same recipe used for profile:
1. Read the screen top-to-bottom, note the natural sections (a form, a
   step, a card, a list, a modal sub-view).
2. Anything only that screen uses → `features/<feature>/components/Xyz.tsx`.
3. Anything 2+ features already share, or clearly will (headers, list
   rows, toggles) → `shared/components/`.
4. The screen file keeps only: local state that must survive across
   sub-views, the handlers that mutate it, and a thin `return` that picks
   which child to render.
5. Re-run the import checker (see below) after every screen.

The next-biggest screens to apply this to, in order of size: `OTCScreen`
(trade, ~89KB), `HelpCenterScreen` (support, ~49KB). All of wallet's
screens are now split — see below.

### How this was verified (no `npm install` available in this environment)

Two lightweight checks stood in for a full build:
1. A small Node script (`check_imports.js`) that walks every `.tsx`/`.ts`
   file, extracts relative import specifiers, and confirms each one
   resolves to a real file on disk.
2. `tsc --noEmit` (TypeScript's checker alone, with `skipLibCheck`) run
   across all files, filtered to genuine syntax/JSX errors (`TS1xxx`,
   `TS17xx`) and undefined-name errors (`TS2304`) — which is how a
   pre-existing bug in the original `WalletScreen.tsx` (`TrendingUp` used
   but never imported) was caught and fixed along the way.

## Wallet's remaining screens split into components

The rest of the wallet feature — the seven screens that actually move
money — got the same treatment:

```
features/wallet/screens/DepositScreen.tsx    849 → 88 lines
features/wallet/screens/WithdrawScreen.tsx   314 → 121 lines
features/wallet/screens/OnRampScreen.tsx     259 → 106 lines
features/wallet/screens/OffRampScreen.tsx    235 → 79 lines
features/wallet/screens/SwapScreen.tsx       979 → 266 lines
features/wallet/screens/SendScreen.tsx       903 → 278 lines
features/wallet/screens/ReceiveScreen.tsx    793 → 103 lines
```

New component subfolders: `features/wallet/components/{deposit,withdraw,
onramp,offramp,swap,send,receive}/` — 54 files total. Each screen file
is now an orchestrator holding only the state/business logic that has
to live above its steps (derived values, handlers, which step is
active); every step's markup lives in its own file.

**A deliberate non-merge, worth knowing about:** `DepositScreen` and
`ReceiveScreen` each had their own near-identical `generateAddress()` /
`NETWORKS` / `AssetDropdown`, but the two address-hash formulas are
actually different (`h * 31 + charCode` in Receive vs. `h * +charCode`
in Deposit), so they produce different mock addresses for the same
asset+network. Rather than silently unifying them into one shared
version — which would have changed one screen's generated addresses —
each kept its own copy (`components/deposit/types.ts` and
`components/receive/types.ts`), with a comment noting the discrepancy.
Worth a real decision (which formula is "correct") next time someone
touches either screen, but not something to fix silently mid-refactor.

With this, every screen in **wallet, profile, onboarding, auth, home,
and services** now follows the `screens/` + `components/` pattern. What's
left flat: `trade` (`OTCScreen`, `TradeScreen`, `TokenInfoScreen`) and
`support` (`HelpCenterScreen`, `AboutScreen`, `ChatScreen`).

## Trade and Support split into components

The last two features with flat screens got the same treatment.

```
features/trade/screens/OTCScreen.tsx         1,094 → 294 lines
features/trade/screens/TradeScreen.tsx         381 → 120 lines
features/trade/screens/TokenInfoScreen.tsx     404 → 85 lines

features/support/screens/HelpCenterScreen.tsx  511 → 112 lines
features/support/screens/ChatScreen.tsx        298 → 73 lines
features/support/screens/AboutScreen.tsx       172 → 39 lines
```

`OTCScreen` was the single largest file in the entire original codebase —
a peer-to-peer marketplace with 5 tabs, an escrow-tracked trade flow,
in-trade chat, a dispute pipeline, and merchant onboarding, all in one
file. It's now `features/trade/components/otc/`, 20 files: a shared
`types.ts` for the domain model (trades, listings, disputes), one file
per tab (`ListingsTab`, `ActiveTradesTab`, `OrdersAndDisputesTabs`,
`ProfileTab`), one per trade-flow step (`TradeFormStep`,
`TradeProcessingStep`, `ActiveTradeDetail`), and one per modal
(`DisputeModal`, `CreateListingModal`, `MerchantAppModal`).

`HelpCenterScreen`'s size was mostly data, not markup — roughly 100 lines
were a hard-coded database of ~90 help articles. That's now
`components/helpcenter/articleData.ts`, a plain data file with no JSX,
separate from the actual UI components (`CategoryGrid`, `ArticleList`,
`ArticleDetailSheet`, `SupportChatView`). Splitting data out from markup
like this is worth doing on any screen where a big chunk of the line
count is content rather than layout.

**Every screen in the app now follows the `screens/` + `components/`
pattern** — 147 component files across 11 features. The remaining
screens that are still single files but comfortably under ~180 lines
(`PortfolioScreen`, `PaymentMethodsScreen`, `NotificationsScreen`) don't
need it. The one screen worth a look next if this continues:
`RewardsScreen` (342 lines, `features/rewards/`) — the largest screen
left in the app that hasn't had this pass yet.

## RewardsScreen split into components

```
features/rewards/screens/RewardsScreen.tsx  343 → 114 lines
```

New files in `features/rewards/components/`: `rewardsData.ts` (badges,
tasks, seed data), `PointsAndStreakCards.tsx`, `RewardsTabs.tsx`
(Overview/Tasks/Badges), `RedeemModal.tsx`.

## Trade and OTC removed entirely

Per a product decision, the `trade` feature — `OTCScreen`,
`TradeScreen`, and `TokenInfoScreen`, along with every component under
them — was deleted outright rather than kept-but-unused. **Swap is the
only trading feature left** (`features/wallet/screens/SwapScreen.tsx`).

What changed to remove it cleanly:

- **Deleted** `src/features/trade/` in full (screens + ~35 component files).
- **`shared/data/mockData.ts`**: removed `'trade' | 'otc' | 'token-info'`
  from the `Screen` union, and removed the `OTCListing`/`otcListings`
  and `TokenDetail`/`tokenDetails` types and data — both were only ever
  consumed by the trade feature, so they'd have been dead weight.
- **`app/App.tsx`**: removed the `TradeScreen`/`OTCScreen`/
  `TokenInfoScreen` imports and their three `case` blocks in the screen
  switch, and removed `'trade'` from `MAIN_TABS`.
- **`features/home/components/MarketWatchlist.tsx`** callers: Home's
  "Markets" section used to link through to `trade` (See all) and
  `token-info` (tapping an asset). Both now point to `swap` instead,
  since that's the only remaining place to act on an asset from Home.
- **`features/services/components/serviceData.ts`**: the "Trading"
  group in the Services hub listed Trade, Swap, and OTC Desk — now
  lists only Swap.

One thing intentionally **not** touched: `SocialPost.type` in
`mockData.ts` has a `'trade'` value (a display-style tag for posts about
trades, e.g. `{ type: 'trade', tags: ['#SOL', ...] }`) — that's unrelated
content metadata for the social feed, not a reference to the removed
screens, so it's still there and still correct.

Verified with the same two checks as every other change in this
project: the import-resolution script (220 files, 0 broken imports) and
`tsc --noEmit` filtered to syntax/undefined-name errors (clean). A
project-wide grep for `TradeScreen`, `OTCScreen`, `TokenInfoScreen`,
`OTCListing`, `tokenDetails`, and any leftover `navigate('trade'/'otc'/
'token-info')` call confirms nothing references the removed feature
anymore.






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
5. **Apply the same `screens/` + `components/` split to the remaining big
   screens.** Done so far: `profile` (incl. `KYCScreen`), `onboarding`,
   `auth`, `home`, `wallet` (main screen), `services`. Still flat:
   `OTCScreen` (trade, ~89KB — the single biggest file left),
   `HelpCenterScreen` (support, ~49KB), `SendScreen` / `SwapScreen`
   (wallet, ~41KB each), `DepositScreen` (wallet, ~34KB), plus the
   remaining wallet screens (`ReceiveScreen`, `WithdrawScreen`,
   `OnRampScreen`, `OffRampScreen`, `PortfolioScreen`,
   `PaymentMethodsScreen`).
