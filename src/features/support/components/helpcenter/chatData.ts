export type ChatMessage = {
  id: string;
  text: string;
  sender: 'user' | 'support';
  time: string;
  status: 'sent' | 'read';
};

export const quickReplies = [
  'How do I complete KYC?',
  'How do I deposit crypto?',
  'How do I add a bank?',
  'How does swap work?',
  'Supported countries?',
];

export const initialMessages: ChatMessage[] = [
  {
    id: 's0',
    text: 'Hi — I am the Convia guide. Ask about KYC, deposits, send, swap, banks, off-ramp, bills, or security. For account recovery that needs a human, email support@convia.app.',
    sender: 'support',
    time: 'Just now',
    status: 'read',
  },
];

/** Keyword → answer, grounded in real product behaviour. */
const REPLIES: { keys: string[]; answer: string }[] = [
  {
    keys: ['kyc', 'verify', 'verification', 'identity'],
    answer:
      'Open Profile → KYC Verification. If you are already approved or in review, the form stays hidden and only status is shown. Approved KYC unlocks off-ramp and higher limits; the API still enforces this server-side.',
  },
  {
    keys: ['deposit', 'receive', 'address', 'qr'],
    answer:
      'Use Wallet → Deposit or Receive. Pick a token and network from the live registry, then copy the address or scan the QR. Send only the matching asset on that network. Balances update after on-chain detection.',
  },
  {
    keys: ['send', 'transfer', 'withdraw'],
    answer:
      'Send supports external addresses and Convia usernames. Withdraw goes to an external wallet and may need your transaction PIN and KYC. Watch for errors like kyc_required or address_not_whitelisted.',
  },
  {
    keys: ['swap', 'exchange', 'trade'],
    answer:
      'Tap Swap on the bottom bar. Choose From/To assets from the registry, set amount and slippage, then confirm. If Swap is blank, the token catalog may still be loading — pull to refresh or reopen.',
  },
  {
    keys: ['bank', 'off-ramp', 'offramp', 'cash out', 'payout'],
    answer:
      'Add a bank under Payment Methods: choose a supported country, pick a bank from the directory, enter the account number. Off-ramp needs approved KYC plus a saved bank. Account name is set from KYC on the server.',
  },
  {
    keys: ['on-ramp', 'onramp', 'buy crypto', 'buy'],
    answer:
      'On-ramp lets you buy crypto with local payment methods in supported markets. Follow the amount and payment instructions; funds appear in portfolio after the provider settles.',
  },
  {
    keys: ['bill', 'airtime', 'data', 'electricity', 'services'],
    answer:
      'Open Services (center button). Select country, category, biller, and customer reference, then pay. Billers are loaded from the API for that country — not a static list.',
  },
  {
    keys: ['password', 'login', 'sign in', 'account'],
    answer:
      'Sign in with the email and password you used at registration. Username on signup is optional. Sessions are stored on this device; Sign out clears them. For locked accounts, contact support@convia.app.',
  },
  {
    keys: ['pin', 'seed', 'security', '2fa'],
    answer:
      'Use Security Center for PIN and session controls. Never share your PIN or seed with anyone. Support will never ask for your full seed phrase.',
  },
  {
    keys: ['country', 'nigeria', 'ghana', 'kenya', 'supported'],
    answer:
      'Banking and bill markets come from the backend country directory (for example NG, GH, KE, ZA, UG, TZ, EG). If a country has no banks in the app, the directory has no entries yet.',
  },
  {
    keys: ['theme', 'dark', 'light'],
    answer:
      'Toggle Dark Mode in Settings or Profile. The choice is saved in this browser and applied across the app.',
  },
  {
    keys: ['balance', 'portfolio', 'money'],
    answer:
      'Home shows your live portfolio total when signed in. Figures come from the ledger API. Cached values may show briefly while refreshing so the screen does not go empty.',
  },
];

export function getBotResponse(input: string): string {
  const q = input.toLowerCase();
  for (const row of REPLIES) {
    if (row.keys.some((k) => q.includes(k))) return row.answer;
  }
  return 'I can help with KYC, deposit/receive, send/withdraw, swap, banks & off-ramp, on-ramp, bills, security, and supported countries. Try one of those topics, or email support@convia.app for account-specific help.';
}
