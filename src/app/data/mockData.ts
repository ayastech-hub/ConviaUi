export type Screen =
  | 'onboarding' | 'pin-setup'
  | 'login' | 'signup' | 'forgot-password'
  | 'home' | 'wallet' | 'trade' | 'social' | 'profile'
  | 'deposit' | 'withdraw' | 'swap' | 'offramp' | 'onramp' | 'otc'
  | 'send' | 'receive' | 'notifications' | 'rewards'
  | 'settings' | 'security' | 'kyc' | 'chat' | 'portfolio'
  | 'help-center' | 'about' | 'payment-methods';

export interface Asset {
  id: string;
  symbol: string;
  name: string;
  price: number;
  change24h: number;
  balance: number;
  valueUSD: number;
  color: string;
  bgColor: string;
  chains: string[];
  sparkline: number[];
}

export interface Transaction {
  id: string;
  type: 'send' | 'receive' | 'swap' | 'buy' | 'sell' | 'offramp' | 'onramp' | 'deposit' | 'withdraw';
  asset: string;
  assetTo?: string;
  amount: number;
  amountTo?: number;
  valueUSD: number;
  address?: string;
  username?: string;
  time: string;
  status: 'confirmed' | 'pending' | 'failed';
  hash?: string;
}

export interface SocialPost {
  id: string;
  user: { name: string; username: string; initials: string; color: string; verified: boolean };
  content: string;
  time: string;
  likes: number;
  comments: number;
  shares: number;
  liked: boolean;
  type: 'text' | 'trade' | 'achievement' | 'market';
  tags: string[];
  image?: string;
}

export interface OTCListing {
  id: string;
  seller: { name: string; initials: string; color: string; trades: number; rating: number; online: boolean };
  asset: 'USDT' | 'USDC';
  amount: number;
  rate: number;
  currency: string;
  currencySymbol: string;
  payMethods: string[];
  minOrder: number;
  maxOrder: number;
  type: 'buy' | 'sell';
}

export interface ChatContact {
  id: string;
  name: string;
  username: string;
  initials: string;
  color: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
}

export interface Notification {
  id: string;
  type: 'receive' | 'price' | 'security' | 'social' | 'reward' | 'kyc';
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: string;
}

const mkSparkline = (base: number, trend: 'up' | 'down' | 'flat') =>
  Array.from({ length: 12 }, (_, i) => {
    const drift = trend === 'up' ? i * 0.8 : trend === 'down' ? -i * 0.8 : 0;
    return base + drift + (Math.random() - 0.5) * base * 0.06;
  });

export const cryptoAssets: Asset[] = [
  {
    id: 'btc', symbol: 'BTC', name: 'Bitcoin',
    price: 67420.50, change24h: 2.34,
    balance: 0.0234, valueUSD: 1577.64,
    color: '#F7931A', bgColor: 'rgba(247,147,26,0.15)',
    chains: ['Bitcoin'], sparkline: mkSparkline(67000, 'up'),
  },
  {
    id: 'eth', symbol: 'ETH', name: 'Ethereum',
    price: 3284.20, change24h: -1.12,
    balance: 0.842, valueUSD: 2765.30,
    color: '#627EEA', bgColor: 'rgba(98,126,234,0.15)',
    chains: ['Ethereum', 'BASE'], sparkline: mkSparkline(3300, 'down'),
  },
  {
    id: 'sol', symbol: 'SOL', name: 'Solana',
    price: 178.45, change24h: 5.67,
    balance: 12.5, valueUSD: 2230.63,
    color: '#9945FF', bgColor: 'rgba(153,69,255,0.15)',
    chains: ['Solana'], sparkline: mkSparkline(175, 'up'),
  },
  {
    id: 'bnb', symbol: 'BNB', name: 'BNB Chain',
    price: 412.30, change24h: 0.89,
    balance: 2.1, valueUSD: 865.83,
    color: '#F3BA2F', bgColor: 'rgba(243,186,47,0.15)',
    chains: ['BSC'], sparkline: mkSparkline(410, 'flat'),
  },
  {
    id: 'usdt', symbol: 'USDT', name: 'Tether USD',
    price: 1.00, change24h: 0.01,
    balance: 1250.00, valueUSD: 1250.00,
    color: '#26A17B', bgColor: 'rgba(38,161,123,0.15)',
    chains: ['Ethereum', 'BSC', 'Solana', 'Tron'], sparkline: mkSparkline(1, 'flat'),
  },
  {
    id: 'usdc', symbol: 'USDC', name: 'USD Coin',
    price: 1.00, change24h: 0.00,
    balance: 850.00, valueUSD: 850.00,
    color: '#2775CA', bgColor: 'rgba(39,117,202,0.15)',
    chains: ['Ethereum', 'BASE', 'Solana'], sparkline: mkSparkline(1, 'flat'),
  },
];

export const portfolio = {
  totalUSD: 9539.40,
  totalNGN: 15_569_822,
  change24hUSD: 234.56,
  change24hPct: 2.52,
  allTimeGain: 3241.20,
  allTimeGainPct: 51.5,
};

export const portfolioChartData = Array.from({ length: 30 }, (_, i) => ({
  day: i,
  value: 6200 + Math.sin(i * 0.4) * 600 + i * 108 + (Math.random() - 0.3) * 300,
}));

export const recentTransactions: Transaction[] = [
  {
    id: 't1', type: 'receive', asset: 'ETH', amount: 0.15,
    valueUSD: 492.63, username: 'kwame_builds', time: '2h ago', status: 'confirmed',
  },
  {
    id: 't2', type: 'send', asset: 'USDT', amount: 250.00,
    valueUSD: 250.00, username: 'amara_fintech', time: '5h ago', status: 'confirmed',
  },
  {
    id: 't3', type: 'swap', asset: 'BNB', assetTo: 'USDC', amount: 0.5, amountTo: 206.15,
    valueUSD: 206.15, time: '1d ago', status: 'confirmed',
  },
  {
    id: 't4', type: 'offramp', asset: 'USDT', amount: 100.00,
    valueUSD: 100.00, time: '2d ago', status: 'confirmed',
  },
  {
    id: 't5', type: 'buy', asset: 'SOL', amount: 5,
    valueUSD: 892.25, time: '3d ago', status: 'confirmed',
  },
  {
    id: 't6', type: 'deposit', asset: 'USDT', amount: 500,
    valueUSD: 500, time: '4d ago', status: 'confirmed',
  },
];

export const socialPosts: SocialPost[] = [
  {
    id: 'p1',
    user: { name: 'Kwame Asante', username: 'kwame_builds', initials: 'KA', color: '#6366F1', verified: true },
    content: "Just closed a 5x on SOL this week. Convia's trading interface is fire — fastest execution I've seen for Africa. GM frens!",
    time: '12m ago', likes: 127, comments: 34, shares: 18, liked: false,
    type: 'trade', tags: ['#SOL', '#DeFiAfrica', '#Web3'],
  },
  {
    id: 'p2',
    user: { name: 'Amara Diallo', username: 'amara_fintech', initials: 'AD', color: '#EC4899', verified: true },
    content: 'Converted 500 USDT to 816,500 NGN in under 3 minutes. Off-ramp speed is unmatched. The future is now.',
    time: '45m ago', likes: 89, comments: 22, shares: 15, liked: true,
    type: 'trade', tags: ['#USDT', '#NGN', '#OffRamp'],
  },
  {
    id: 'p3',
    user: { name: 'Chidera Obi', username: 'chidera_eth', initials: 'CO', color: '#10B981', verified: false },
    content: 'ETH looking bullish on the 4H. Strong support at $3,200. This dip is an opportunity. DYOR.',
    time: '1h ago', likes: 56, comments: 19, shares: 8, liked: false,
    type: 'market', tags: ['#ETH', '#TA', '#Crypto'],
  },
  {
    id: 'p4',
    user: { name: 'Fatima Hassan', username: 'fatima_web3', initials: 'FH', color: '#F59E0B', verified: true },
    content: 'Reached 100 trades on Convia OTC! P2P in Africa is the real Web3 use case. Thank you community.',
    time: '2h ago', likes: 203, comments: 47, shares: 31, liked: false,
    type: 'achievement', tags: ['#OTC', '#P2P', '#Milestone'],
  },
  {
    id: 'p5',
    user: { name: 'Emeka Nwosu', username: 'emeka_defi', initials: 'EN', color: '#8B5CF6', verified: false },
    content: "BTC breaking ATH today? Watching that $68K level closely. Set my alerts on Convia. Let's see GM!",
    time: '3h ago', likes: 41, comments: 13, shares: 5, liked: false,
    type: 'market', tags: ['#BTC', '#ATH', '#Analysis'],
  },
];

export const otcListings: OTCListing[] = [
  {
    id: 'otc1',
    seller: { name: 'TradeMaster_NG', initials: 'TM', color: '#3B82F6', trades: 1847, rating: 4.97, online: true },
    asset: 'USDT', amount: 10000, rate: 1634, currency: 'NGN', currencySymbol: '₦',
    payMethods: ['Bank Transfer', 'OPay', 'Palmpay'],
    minOrder: 500, maxOrder: 10000, type: 'buy',
  },
  {
    id: 'otc2',
    seller: { name: 'CryptoKing_KE', initials: 'CK', color: '#10B981', trades: 923, rating: 4.92, online: true },
    asset: 'USDT', amount: 5000, rate: 135.20, currency: 'KES', currencySymbol: 'KSh',
    payMethods: ['M-Pesa', 'Bank Transfer'],
    minOrder: 100, maxOrder: 5000, type: 'buy',
  },
  {
    id: 'otc3',
    seller: { name: 'GoldTrader_GH', initials: 'GT', color: '#F59E0B', trades: 512, rating: 4.88, online: false },
    asset: 'USDC', amount: 3000, rate: 16.45, currency: 'GHS', currencySymbol: 'GH₵',
    payMethods: ['MTN MoMo', 'Bank Transfer'],
    minOrder: 100, maxOrder: 3000, type: 'sell',
  },
  {
    id: 'otc4',
    seller: { name: 'FastP2P_NG', initials: 'FP', color: '#EC4899', trades: 2341, rating: 4.99, online: true },
    asset: 'USDC', amount: 7500, rate: 1632, currency: 'NGN', currencySymbol: '₦',
    payMethods: ['Bank Transfer', 'Flutterwave'],
    minOrder: 200, maxOrder: 7500, type: 'buy',
  },
];

export const chatContacts: ChatContact[] = [
  { id: 'c1', name: 'Kwame Asante', username: 'kwame_builds', initials: 'KA', color: '#6366F1', lastMessage: 'Yo, send me that 0.1 ETH', time: '2m', unread: 3, online: true },
  { id: 'c2', name: 'Amara Diallo', username: 'amara_fintech', initials: 'AD', color: '#EC4899', lastMessage: 'Thanks for the swap tip!', time: '15m', unread: 0, online: true },
  { id: 'c3', name: 'TradeMaster_NG', username: 'trademaster_ng', initials: 'TM', color: '#3B82F6', lastMessage: 'OTC deal confirmed', time: '1h', unread: 1, online: false },
  { id: 'c4', name: 'Fatima Hassan', username: 'fatima_web3', initials: 'FH', color: '#F59E0B', lastMessage: 'Congrats on 100 trades!', time: '3h', unread: 0, online: false },
  { id: 'c5', name: 'Emeka Nwosu', username: 'emeka_defi', initials: 'EN', color: '#8B5CF6', lastMessage: 'Check my latest SOL analysis', time: '1d', unread: 0, online: true },
];

export const notifications: Notification[] = [
  { id: 'n1', type: 'receive', title: 'Received 0.15 ETH', body: '@kwame_builds sent you $492.63', time: '2h ago', read: false, icon: 'arrow-down-left' },
  { id: 'n2', type: 'price', title: 'BTC Price Alert', body: 'Bitcoin crossed $67,000', time: '3h ago', read: false, icon: 'trending-up' },
  { id: 'n3', type: 'reward', title: 'Daily Streak Bonus', body: 'You earned 50 Convia Points for 7-day streak', time: '8h ago', read: true, icon: 'flame' },
  { id: 'n4', type: 'social', title: 'New Follower', body: '@fatima_web3 started following you', time: '1d ago', read: true, icon: 'user-plus' },
  { id: 'n5', type: 'security', title: 'New Login Detected', body: 'Lagos, Nigeria · iPhone 15 Pro', time: '2d ago', read: true, icon: 'shield' },
  { id: 'n6', type: 'kyc', title: 'KYC Approved', body: 'Your identity has been verified', time: '3d ago', read: true, icon: 'badge-check' },
];

export const marketData = [
  { symbol: 'BTC', name: 'Bitcoin', price: 67420.50, change: 2.34, vol: '38.2B', mktCap: '1.32T' },
  { symbol: 'ETH', name: 'Ethereum', price: 3284.20, change: -1.12, vol: '18.7B', mktCap: '394.8B' },
  { symbol: 'SOL', name: 'Solana', price: 178.45, change: 5.67, vol: '4.2B', mktCap: '81.4B' },
  { symbol: 'BNB', name: 'BNB', price: 412.30, change: 0.89, vol: '1.8B', mktCap: '60.1B' },
  { symbol: 'XRP', name: 'XRP', price: 0.6234, change: 3.21, vol: '2.4B', mktCap: '34.2B' },
  { symbol: 'ADA', name: 'Cardano', price: 0.4812, change: -2.05, vol: '0.8B', mktCap: '17.1B' },
];

export const fmtUSD = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

export const fmtNGN = (n: number) =>
  new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN', maximumFractionDigits: 0 }).format(n);

export const fmtNum = (n: number, decimals = 4) => n.toFixed(decimals);
