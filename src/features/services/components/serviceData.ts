import {
  Smartphone, Wifi, Zap, Receipt, Trophy, CreditCard, Landmark, Gift,
  RefreshCw, ArrowRightLeft,
  type LucideIcon,
} from 'lucide-react';

export interface ServiceItem {
  id: string;
  label: string;
  icon: LucideIcon;
  description: string;
}

export interface ServiceGroup {
  title: string;
  subtitle: string;
  items: ServiceItem[];
}

export const SERVICE_GROUPS: ServiceGroup[] = [
  {
    title: 'Bills & Utilities',
    subtitle: 'Pay everyday essentials',
    items: [
      { id: 'data', label: 'Data Bundles', icon: Wifi, description: 'Buy internet data' },
      { id: 'airtime', label: 'Airtime', icon: Smartphone, description: 'Top up phone credit' },
      { id: 'electricity', label: 'Electricity', icon: Zap, description: 'Pay power bills' },
      { id: 'bills', label: 'TV & Water', icon: Receipt, description: 'DSTV, GOtv, water' },
    ],
  },
  {
    title: 'Trading',
    subtitle: 'Instant token exchange',
    items: [
      { id: 'swap', label: 'Swap', icon: RefreshCw, description: 'Instant token swap' },
    ],
  },
  {
    title: 'Rewards',
    subtitle: 'Earn as you go',
    items: [
      { id: 'rewards', label: 'Rewards', icon: Gift, description: 'Points & missions' },
    ],
  },
  {
    title: 'Finance',
    subtitle: 'Money in & out',
    items: [
      { id: 'onramp', label: 'Buy Crypto', icon: CreditCard, description: 'Card & bank deposit' },
      { id: 'offramp', label: 'Sell Crypto', icon: Landmark, description: 'Withdraw to bank' },
      { id: 'send', label: 'Send', icon: ArrowRightLeft, description: 'Transfer crypto' },
      { id: 'receive', label: 'Receive', icon: ArrowRightLeft, description: 'Get paid' },
    ],
  },
  {
    title: 'Gaming',
    subtitle: 'Fund & play',
    items: [
      { id: 'betting', label: 'Betting', icon: Trophy, description: 'Fund betting wallet' },
    ],
  },
];

export const PROVIDERS: Record<string, { name: string; logo: string; color: string }[]> = {
  data: [
    { name: 'MTN', logo: 'MTN', color: 'var(--muted-foreground)' },
    { name: 'Vodafone', logo: 'VDF', color: '#E60000' },
    { name: 'AirtelTigo', logo: 'AT', color: 'var(--muted-foreground)' },
  ],
  airtime: [
    { name: 'MTN', logo: 'MTN', color: 'var(--muted-foreground)' },
    { name: 'Vodafone', logo: 'VDF', color: '#E60000' },
    { name: 'AirtelTigo', logo: 'AT', color: 'var(--muted-foreground)' },
  ],
  electricity: [
    { name: 'ECG', logo: 'ECG', color: 'var(--muted-foreground)' },
    { name: 'VRA', logo: 'VRA', color: 'var(--muted-foreground)' },
  ],
  bills: [
    { name: 'DSTV', logo: 'DSTV', color: 'var(--muted-foreground)' },
    { name: 'GOtv', logo: 'GO', color: 'var(--muted-foreground)' },
    { name: 'Ghana Water', logo: 'GW', color: 'var(--muted-foreground)' },
  ],
  betting: [
    { name: 'SportyBet', logo: 'SB', color: 'var(--muted-foreground)' },
    { name: 'Betway', logo: 'BW', color: 'var(--muted-foreground)' },
    { name: '1xBet', logo: '1X', color: 'var(--muted-foreground)' },
  ],
};

export const DATA_BUNDLES = [
  { label: '500 MB', value: 2, popular: false },
  { label: '1 GB', value: 5, popular: false },
  { label: '5 GB', value: 15, popular: true },
  { label: '10 GB', value: 30, popular: false },
  { label: '20 GB', value: 50, popular: false },
  { label: 'Unlimited', value: 100, popular: false },
];

export const AIRTIME_AMOUNTS = [1, 2, 5, 10, 20, 50];

export const isBillService = (id: string) => ['data', 'airtime', 'electricity', 'bills', 'betting'].includes(id);
