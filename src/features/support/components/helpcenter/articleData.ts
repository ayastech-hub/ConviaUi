import {
  Shield, CreditCard, TrendingUp, User, Zap, HelpCircle, Wallet, ArrowLeftRight, type LucideIcon,
} from 'lucide-react';

export interface HelpCategory {
  icon: LucideIcon;
  title: string;
  desc: string;
  key: string;
}

export interface HelpArticle {
  id: string;
  title: string;
  category: string;
  time: string;
  summary: string;
  steps: string[];
}

export const categories: HelpCategory[] = [
  { icon: User, title: 'Account & KYC', desc: 'Sign up, profile, verification', key: 'Account' },
  { icon: Wallet, title: 'Wallet & Crypto', desc: 'Deposit, send, receive, addresses', key: 'Wallet' },
  { icon: CreditCard, title: 'Banks & Cash-out', desc: 'Bank accounts, off-ramp', key: 'Payments' },
  { icon: ArrowLeftRight, title: 'Swap & Trade', desc: 'Swap tokens inside Convia', key: 'Trading' },
  { icon: Zap, title: 'On-Ramp & Bills', desc: 'Buy crypto, airtime, utilities', key: 'Services' },
  { icon: Shield, title: 'Security', desc: 'PIN, sessions, whitelist', key: 'Security' },
  { icon: HelpCircle, title: 'General', desc: 'Supported countries & FAQ', key: 'General' },
];

/**
 * In-app knowledge base aligned with live ConviaUi + coviaBackend behaviour.
 * Categories must match `key` for filtering.
 */
export const allArticles: HelpArticle[] = [
  // ── Account ──
  {
    id: 'kyc',
    title: 'How to verify your identity (KYC)',
    category: 'Account',
    time: '4 min',
    summary: 'KYC unlocks higher limits, off-ramp, and some fiat features. The server enforces status; the app only shows guides and banners.',
    steps: [
      'Open Profile → KYC Verification.',
      'If status is already Approved or In review, the form will not show again — only your status.',
      'Complete personal details, upload a government ID, and take a selfie when asked.',
      'Submit and wait for review. Home may show a banner until you are approved.',
      'Country on your profile can lock after successful verification and cannot be self-changed.',
    ],
  },
  {
    id: 'signup',
    title: 'Create a Convia account',
    category: 'Account',
    time: '2 min',
    summary: 'Email + password registration issues a session immediately so you can use the app without a second login.',
    steps: [
      'Open Sign up from the auth screen.',
      'Enter email and a strong password (confirm password on signup).',
      'Username is optional — if you skip it, the backend derives one from your email.',
      'Agree to terms, then submit. Wallets and ledger accounts are provisioned for you.',
      'You land on Home signed in. Complete KYC when you need cash-out or higher limits.',
    ],
  },
  {
    id: 'login',
    title: 'Sign in and stay signed in',
    category: 'Account',
    time: '2 min',
    summary: 'Sessions use access + refresh tokens stored on this device.',
    steps: [
      'Use the same email and password you registered with.',
      'If login fails in the browser, check that the API is reachable and CORS is enabled.',
      'Your session is stored locally; signing out clears it and cached portfolio data.',
      'Use Forgot password only if that recovery flow is enabled for your environment.',
    ],
  },
  {
    id: 'profile',
    title: 'Edit display name, bio, and country',
    category: 'Account',
    time: '2 min',
    summary: 'Profile data comes from GET/PATCH /profiles/me — not mock names.',
    steps: [
      'Profile → Edit Profile.',
      'Update display name, bio, preferred currency, and country (from supported markets).',
      'Save. Country may be rejected with country_locked after KYC approval.',
      'Avatar upload is not required for core money features.',
    ],
  },
  {
    id: 'onboarding',
    title: 'First visit onboarding',
    category: 'Account',
    time: '1 min',
    summary: 'Onboarding slides appear only the first time this browser loads the app.',
    steps: [
      'Complete or skip the intro slides.',
      'A local flag remembers that you have seen onboarding.',
      'Clearing site data will show onboarding again.',
    ],
  },

  // ── Wallet ──
  {
    id: 'deposit',
    title: 'Deposit crypto to your Convia wallet',
    category: 'Wallet',
    time: '3 min',
    summary: 'Deposits credit after on-chain detection to your custodial address for the selected asset and network.',
    steps: [
      'Open Wallet → Deposit, or Receive.',
      'Pick a token from the live registry (not a hardcoded list).',
      'Choose a network that supports deposits for that token.',
      'Copy the address or scan the QR (generated on your device).',
      'Send only the matching asset on that network. Wrong network can mean loss of funds.',
      'Balances update from the ledger/portfolio API after the deposit scanner confirms.',
    ],
  },
  {
    id: 'receive',
    title: 'Receive crypto (QR & address)',
    category: 'Wallet',
    time: '2 min',
    summary: 'Receive uses your real deposit address from the wallet API.',
    steps: [
      'Wallet → Receive → select asset and network.',
      'Share the QR or copy the address.',
      'Optional: request a specific amount for display only — the chain transfer is still a normal deposit.',
      'Sign in is required to load your address.',
    ],
  },
  {
    id: 'send',
    title: 'Send crypto or pay a username',
    category: 'Wallet',
    time: '4 min',
    summary: 'External sends use withdraw; username payments use the payments API. Hold-to-confirm may require your transaction PIN.',
    steps: [
      'Wallet → Send (or scan a QR from Home).',
      'Select asset, enter amount, and destination address or Convia username.',
      'Review network fees and limits. KYC may be required for larger transfers.',
      'Confirm (hold-to-send / PIN where shown).',
      'Track status under recent activity on Home or Wallet.',
    ],
  },
  {
    id: 'withdraw',
    title: 'Withdraw to an external wallet',
    category: 'Wallet',
    time: '3 min',
    summary: 'Withdrawals go through crypto withdraw endpoints and may need PIN + KYC.',
    steps: [
      'Wallet → Withdraw.',
      'Choose asset, network, amount, and destination address.',
      'Whitelisted addresses may be required for some policies.',
      'Enter PIN if prompted and confirm.',
      'If you see kyc_required, complete verification first.',
    ],
  },
  {
    id: 'portfolio',
    title: 'Understanding your portfolio balance',
    category: 'Wallet',
    time: '2 min',
    summary: 'Home and Portfolio show ledger totals from the API — never invented balances.',
    steps: [
      'Home hero shows total portfolio value when you are signed in.',
      'LIVE means data came from the portfolio endpoint.',
      'Per-asset rows reflect holdings; empty registry does not invent tokens.',
      'Pull to refresh or revisit the tab — cached values avoid a blank flash while refetching.',
    ],
  },

  // ── Payments ──
  {
    id: 'add-bank',
    title: 'Add a bank account for cash-out',
    category: 'Payments',
    time: '3 min',
    summary: 'Banks and countries come from the bank directory API for supported markets only.',
    steps: [
      'Profile → Payment Methods (or Off-ramp → Add bank).',
      'Tap Add bank account.',
      'Select your country from the supported list.',
      'Open the bank dropdown and pick your bank (live directory).',
      'Enter the account number and save.',
      'Account name is set server-side from your KYC legal name — you cannot spoof it.',
    ],
  },
  {
    id: 'offramp',
    title: 'Sell crypto for local currency (off-ramp)',
    category: 'Payments',
    time: '4 min',
    summary: 'Off-ramp needs approved KYC and at least one saved bank account.',
    steps: [
      'Complete KYC until status is approved.',
      'Add a bank account under Payment Methods.',
      'Open Off-ramp, choose asset and amount, select your bank.',
      'Review fees and confirm.',
      'Eligibility API may block you with complete_kyc or add_payment_details — follow the banner.',
    ],
  },
  {
    id: 'supported-countries',
    title: 'Supported countries for banking',
    category: 'Payments',
    time: '2 min',
    summary: 'Convia focuses on defined operating markets (e.g. NG, GH, KE, ZA, UG, TZ, EG) exposed by the API.',
    steps: [
      'Country chips in Payment Methods and Services load from GET /banks/countries.',
      'Bank lists load from GET /banks?country=XX.',
      'If a country shows no banks, the directory has no rows yet for that market.',
      'Settings currency options follow those market currencies plus USD for display.',
    ],
  },

  // ── Trading ──
  {
    id: 'swap',
    title: 'Swap one crypto for another',
    category: 'Trading',
    time: '3 min',
    summary: 'Swap is available from the bottom bar and uses the live token registry for pairs.',
    steps: [
      'Tap Swap on the bottom navigation.',
      'Select From and To assets (registry tokens).',
      'Enter amount, review rate, slippage, and route summary.',
      'Confirm the swap. Errors such as kyc_required surface as in-app alerts.',
      'If the screen is blank, refresh — the app needs a successful load of the token catalog.',
    ],
  },

  // ── Services ──
  {
    id: 'onramp',
    title: 'Buy crypto with cash (on-ramp)',
    category: 'Services',
    time: '3 min',
    summary: 'On-ramp partners (e.g. provider rails) fund your Convia balance in supported markets.',
    steps: [
      'Open On-ramp from Home quick actions or Wallet.',
      'Choose asset, amount, and payment method when offered.',
      'Follow payment instructions for your country.',
      'Crypto appears in portfolio after the provider confirms settlement.',
      'KYC can increase limits; banners explain blocks before you submit.',
    ],
  },
  {
    id: 'bills',
    title: 'Pay airtime, data, and bills',
    category: 'Services',
    time: '3 min',
    summary: 'Services center uses billers from the bills API for your selected country.',
    steps: [
      'Tap the center Services button.',
      'Pick a category (airtime, data, electricity, etc.).',
      'Select country, provider/biller, amount, and customer reference (phone or meter).',
      'Confirm pay. Idempotent requests protect against double charges on retry.',
      'Failed pays show API error codes mapped to readable alerts.',
    ],
  },

  // ── Security ──
  {
    id: 'pin',
    title: 'Transaction PIN',
    category: 'Security',
    time: '2 min',
    summary: 'PIN protects sensitive moves like withdraw and some sends.',
    steps: [
      'Profile → Security Center to set or change PIN when available.',
      'Enter PIN when the withdraw/send flow requests it.',
      'Never share your PIN or seed phrase with anyone, including support.',
    ],
  },
  {
    id: 'seed',
    title: 'Wallet keys (not exportable)',
    category: 'Security',
    time: '3 min',
    summary: 'Convia is custodial: deposit addresses are app-managed. Seed/private key export is disabled so balances stay consistent with the ledger.',
    steps: [
      'Private keys and seed phrases are not available in the app.',
      'To move funds out, use Withdraw or Send inside Convia so the ledger and chain stay aligned.',
      'Convia support will never ask for a seed phrase.',
    ],
  },
  {
    id: 'sessions',
    title: 'Devices and sessions',
    category: 'Security',
    time: '2 min',
    summary: 'You can review and end sessions from Security when the API lists them.',
    steps: [
      'Open Security Center.',
      'Review active sessions if listed.',
      'Sign out on this device from Profile to clear local tokens.',
      'New-device logins may trigger notifications when device tracking is enabled.',
    ],
  },
  {
    id: 'whitelist',
    title: 'Address whitelist',
    category: 'Security',
    time: '2 min',
    summary: 'Some withdrawals only allow pre-approved addresses.',
    steps: [
      'Add trusted external addresses under Security / whitelist if the feature is enabled.',
      'Withdrawals to non-whitelisted addresses may return address_not_whitelisted.',
      'Double-check chain and address before saving.',
    ],
  },

  // ── General ──
  {
    id: 'theme',
    title: 'Dark and light mode',
    category: 'General',
    time: '1 min',
    summary: 'Theme preference is saved in this browser.',
    steps: [
      'Profile → Settings → Dark Mode, or the toggle on Profile.',
      'Preference is stored as convia.theme and applied to the whole page.',
      'Switching should update colors immediately across all screens.',
    ],
  },
  {
    id: 'currency-display',
    title: 'Display currency',
    category: 'General',
    time: '2 min',
    summary: 'Display currency converts USD portfolio figures for readability.',
    steps: [
      'Settings → Currency.',
      'Options follow supported market currencies from the bank directory.',
      'This is a display preference; ledger accounting remains in product assets.',
    ],
  },
  {
    id: 'notifications',
    title: 'Notifications',
    category: 'General',
    time: '2 min',
    summary: 'In-app inbox is loaded from the notifications API when you are signed in.',
    steps: [
      'Tap the bell on Home.',
      'Unread count uses live inbox data when available.',
      'Settings can control push/email preferences when the backend exposes preference channels.',
    ],
  },
  {
    id: 'errors',
    title: 'Understanding feature blocks and errors',
    category: 'General',
    time: '3 min',
    summary: 'Banners map backend codes so you know why an action is blocked.',
    steps: [
      'kyc_required / kyc_pending — finish or wait for identity verification.',
      'country_feature_suspended — this product is paused in your market.',
      'address_not_whitelisted — use or add an approved address.',
      'Sign-in prompts appear when the session is missing or expired.',
      'Retry after fixing the underlying requirement; do not spam confirm on money actions.',
    ],
  },
  {
    id: 'support-contact',
    title: 'Contact support',
    category: 'General',
    time: '1 min',
    summary: 'Use in-app Help chat for guided answers; email for account-specific cases.',
    steps: [
      'Help Center → chat button for quick product guidance.',
      'Email support@convia.app for account recovery that needs human review.',
      'Never send passwords, full card numbers, or seed phrases by email.',
    ],
  },
];

export function articlesForCategory(key: string | null): HelpArticle[] {
  if (!key) return allArticles;
  return allArticles.filter((a) => a.category === key);
}
