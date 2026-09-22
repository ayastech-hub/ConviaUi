import type { Screen } from '../data/mockData';

const KEY = 'convia.recentlyUsed.v1';
const MAX = 8;

export type RecentEntry = {
  screen: Screen;
  param?: string;
  label: string;
  at: number;
};

const LABELS: Partial<Record<Screen, string>> = {
  rewards: 'Rewards',
  onramp: 'Buy crypto',
  offramp: 'Sell crypto',
  deposit: 'Deposit',
  withdraw: 'Withdraw',
  send: 'Send',
  swap: 'Swap',
  history: 'History',
  scan: 'QR pay',
  services: 'Bills',
  airtime: 'Airtime',
  data: 'Data',
  electricity: 'Electricity',
  tv: 'TV & cable',
  betting: 'Betting',
  giveaway: 'Gifts',
  request: 'Request',
  'request-link': 'Pay link',
  kyc: 'KYC',
  security: 'Security',
  notifications: 'Notifications',
  'payment-methods': 'Banks',
  'support-center': 'Support',
  profile: 'Account',
  settings: 'Settings',
  'edit-profile': 'Edit profile',
};

/** Screens worth tracking on the account “Recently used” row. */
const TRACKABLE = new Set<string>(Object.keys(LABELS));

export function trackRecentUse(screen: Screen, param?: string, labelOverride?: string): void {
  if (!TRACKABLE.has(screen)) return;
  // skip pure tab roots
  if (screen === 'home' || screen === 'wallet' || screen === 'profile' || screen === 'pay-hub') return;
  try {
    const raw = localStorage.getItem(KEY);
    let list: RecentEntry[] = raw ? (JSON.parse(raw) as RecentEntry[]) : [];
    if (!Array.isArray(list)) list = [];
    const label =
      labelOverride ||
      (param && screen === 'services' ? String(param) : LABELS[screen]) ||
      screen;
    list = list.filter((e) => !(e.screen === screen && (e.param || '') === (param || '')));
    list.unshift({ screen, param, label, at: Date.now() });
    list = list.slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(list));
    window.dispatchEvent(new Event('convia-recently-used'));
  } catch {
    /* ignore */
  }
}

export function readRecentlyUsed(): RecentEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as RecentEntry[];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}
