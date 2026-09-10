import {
  Smartphone,
  Wifi,
  Zap,
  Receipt,
  Trophy,
  CreditCard,
  Landmark,
  Gift,
  RefreshCw,
  ArrowUpRight,
  Shield,
  Link2,
  type LucideIcon,
} from 'lucide-react';

export interface ServiceItem {
  id: string;
  label: string;
  icon: LucideIcon;
  description?: string;
}

export interface ServiceGroup {
  title: string;
  items: ServiceItem[];
}

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    title: 'Utilities',
    items: [
      { id: 'airtime', label: 'Airtime', icon: Smartphone },
      { id: 'data', label: 'Data', icon: Wifi },
      { id: 'electricity', label: 'Electricity', icon: Zap },
      { id: 'bills', label: 'TV & cable', icon: Receipt },
      { id: 'betting', label: 'Betting', icon: Trophy },
    ],
  },
  {
    title: 'Finance',
    items: [
      { id: 'vault', label: 'Dollar Vault', icon: Shield },
      { id: 'onramp', label: 'Buy', icon: CreditCard },
      { id: 'offramp', label: 'Sell', icon: Landmark },
      { id: 'send', label: 'Send', icon: ArrowUpRight },
      { id: 'swap', label: 'Swap', icon: RefreshCw },
    ],
  },
  {
    title: 'Share',
    items: [
      { id: 'giveaway', label: 'Giveaway', icon: Gift },
      { id: 'request-link', label: 'Request link', icon: Link2 },
    ],
  },
  {
    title: 'Account',
    items: [
      { id: 'rewards', label: 'Rewards', icon: Gift },
      { id: 'history', label: 'History', icon: Receipt },
    ],
  },
];

export const PROVIDERS: Record<string, { name: string; logo: string; color: string }[]> = {
  data: [
    { name: 'MTN', logo: 'MTN', color: 'var(--muted-foreground)' },
    { name: 'Vodafone', logo: 'VDF', color: 'var(--muted-foreground)' },
    { name: 'AirtelTigo', logo: 'AT', color: 'var(--muted-foreground)' },
  ],
  airtime: [
    { name: 'MTN', logo: 'MTN', color: 'var(--muted-foreground)' },
    { name: 'Vodafone', logo: 'VDF', color: 'var(--muted-foreground)' },
    { name: 'AirtelTigo', logo: 'AT', color: 'var(--muted-foreground)' },
  ],
  electricity: [
    { name: 'ECG', logo: 'ECG', color: 'var(--muted-foreground)' },
    { name: 'VRA', logo: 'VRA', color: 'var(--muted-foreground)' },
  ],
  bills: [
    { name: 'DSTV', logo: 'DSTV', color: 'var(--muted-foreground)' },
    { name: 'GOtv', logo: 'GOtv', color: 'var(--muted-foreground)' },
  ],
  betting: [
    { name: 'Betway', logo: 'BW', color: 'var(--muted-foreground)' },
    { name: 'SportyBet', logo: 'SB', color: 'var(--muted-foreground)' },
  ],
};

export const AMOUNTS: Record<string, number[]> = {
  airtime: [5, 10, 20, 50, 100],
  data: [10, 20, 50, 100],
  electricity: [20, 50, 100, 200],
  bills: [50, 100, 200],
  betting: [10, 20, 50, 100],
};

/** Preset data plans for ServiceAmountInput */
export const DATA_BUNDLES: { label: string; value: number; popular?: boolean }[] = [
  { label: '1GB · 30 days', value: 3 },
  { label: '2GB · 30 days', value: 5, popular: true },
  { label: '5GB · 30 days', value: 10 },
  { label: '10GB · 30 days', value: 18 },
  { label: '20GB · 30 days', value: 30 },
  { label: '50GB · 30 days', value: 60 },
];

/** Preset airtime amounts (USD-equivalent display) */
export const AIRTIME_AMOUNTS = [1, 2, 5, 10, 20, 50];

export const isBillService = (id: string) =>
  ['data', 'airtime', 'electricity', 'bills', 'betting'].includes(id);

