type Listener = (offline: boolean) => void;
let offline = false;
const listeners = new Set<Listener>();
const FORCE_KEY = 'convia.forceMock';

export function isForceMock(): boolean {
  try {
    if (localStorage.getItem(FORCE_KEY) === '1') return true;
  } catch {
    /* */
  }
  try {
    const env = (import.meta as ImportMeta & { env: Record<string, string> }).env;
    if (env?.VITE_USE_MOCKS === 'true' || env?.VITE_USE_MSW === 'true' || env?.VITE_FORCE_MOCK === 'true') {
      return true;
    }
  } catch {
    /* */
  }
  return false;
}
export function setForceMock(on: boolean) {
  try {
    if (on) localStorage.setItem(FORCE_KEY, '1');
    else localStorage.removeItem(FORCE_KEY);
  } catch {
    /* */
  }
  setApiOffline(on || offline);
}
export function isApiOffline(): boolean {
  return offline || isForceMock();
}
export function setApiOffline(value: boolean) {
  const next = value || isForceMock();
  if (next === offline) return;
  offline = next;
  listeners.forEach((l) => l(offline));
}
export function subscribeApiOffline(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Fully unlocked demo user — KYC approved, not frozen, balances + history intact.
 * Login: demo@convia.app / any password (when mock is on)
 */
export const MOCK_USER = {
  userId: 'usr_demo_001',
  username: 'ada_okonkwo',
  displayName: 'Ada Okonkwo',
  email: 'demo@convia.app',
  preferredCurrency: 'NGN',
  country: 'NG',
  phone: '+2348012345678',
  accessToken: 'mock-access-token-demo-verified',
  refreshToken: 'mock-refresh-token-demo-verified',
  sessionId: 'sess_demo_001',
  kycStatus: 'approved' as const,
  isFrozen: false,
  frozenReason: null as string | null,
  hasPin: true,
  bio: 'Building on Convia',
  avatarUrl: null as string | null,
} as const;


/** Bank directory by country for add-bank picker (mock). */
export const MOCK_DIRECTORY_BANKS: Record<string, { code: string; name: string }[]> = {
  NG: [
    { code: '058', name: 'Guaranty Trust Bank' },
    { code: '044', name: 'Access Bank' },
    { code: '033', name: 'United Bank for Africa' },
    { code: '011', name: 'First Bank of Nigeria' },
    { code: '057', name: 'Zenith Bank' },
    { code: '232', name: 'Sterling Bank' },
    { code: '050', name: 'Ecobank Nigeria' },
    { code: '070', name: 'Fidelity Bank' },
    { code: '214', name: 'First City Monument Bank' },
    { code: '221', name: 'Stanbic IBTC Bank' },
    { code: '032', name: 'Union Bank of Nigeria' },
    { code: '035', name: 'Wema Bank' },
    { code: '076', name: 'Polaris Bank' },
    { code: '082', name: 'Keystone Bank' },
    { code: '101', name: 'Providus Bank' },
    { code: '100', name: 'Suntrust Bank' },
    { code: '301', name: 'Jaiz Bank' },
    { code: '999', name: 'Opay' },
    { code: '120001', name: 'PalmPay' },
    { code: '50515', name: 'Kuda Bank' },
  ],
  GH: [
    { code: 'GCB', name: 'GCB Bank' },
    { code: 'EBG', name: 'Ecobank Ghana' },
    { code: 'ADB', name: 'Agricultural Development Bank' },
    { code: 'CAL', name: 'CalBank' },
    { code: 'FBN', name: 'FBNBank Ghana' },
    { code: 'STD', name: 'Stanbic Bank Ghana' },
    { code: 'ABB', name: 'Absa Bank Ghana' },
  ],
  KE: [
    { code: 'KCB', name: 'KCB Bank' },
    { code: 'EQT', name: 'Equity Bank' },
    { code: 'COOP', name: 'Co-operative Bank' },
    { code: 'SCB', name: 'Standard Chartered Kenya' },
    { code: 'ABSA', name: 'Absa Bank Kenya' },
  ],
  ZA: [
    { code: 'FNB', name: 'First National Bank' },
    { code: 'STD', name: 'Standard Bank' },
    { code: 'ABSA', name: 'Absa' },
    { code: 'NED', name: 'Nedbank' },
    { code: 'CAP', name: 'Capitec' },
  ],
};

/** Saved bank accounts for off-ramp / bills testing */
export const MOCK_BANK_ACCOUNTS = [
  {
    id: 'ba_demo_1',
    type: 'bank' as const,
    bankName: 'GTBank',
    bankCode: '058',
    accountNumber: '0123456789',
    accountName: 'Ada Okonkwo',
    currency: 'NGN',
  },
  {
    id: 'ba_demo_2',
    type: 'bank' as const,
    bankName: 'Access Bank',
    bankCode: '044',
    accountNumber: '9876543210',
    accountName: 'Ada Okonkwo',
    currency: 'NGN',
  },
];
