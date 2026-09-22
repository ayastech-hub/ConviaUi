/** Shared domain types (no seed / mock data). */

export type Screen =
  | 'onboarding'
  | 'pin-setup'
  | 'login'
  | 'signup'
  | 'forgot-password'
  | 'home'
  | 'wallet'
  | 'profile'
  | 'deposit'
  | 'withdraw'
  | 'swap'
  | 'offramp'
  | 'onramp'
  | 'vault'
  | 'send'
  | 'request'
  | 'receive'
  | 'scan'
  | 'history'
  | 'notifications'
  | 'rewards'
  | 'settings'
  | 'security'
  | 'kyc'
  | 'chat'
  | 'portfolio'
  | 'help-center'
  | 'about'
  | 'privacy'
  | 'terms'
  | 'support-center'
  | 'payment-methods'
    | 'edit-profile'
  | 'token'
  | 'giveaway'
  | 'request-link'
  | 'pay'
  | 'pay-hub'
  | 'explore'
  | 'rates';

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
  type:
    | 'send'
    | 'receive'
    | 'swap'
    | 'buy'
    | 'sell'
    | 'offramp'
    | 'onramp'
    | 'deposit'
    | 'withdraw'
    | 'vault_in'
    | 'vault_out'
    | 'airtime'
    | 'data'
    | 'electricity'
    | 'cable'
    | 'betting'
    | 'bill'
    | 'giveaway'
    | 'request'
    | 'reward';
  asset: string;
  assetTo?: string;
  amount: number;
  amountTo?: number;
  valueUSD: number;
  address?: string;
  username?: string;
  time: string;
  createdAt?: string;
  status: 'confirmed' | 'pending' | 'failed';
  hash?: string;
  network?: string;
  chainKey?: string;
  reference?: string;
  orderId?: string;
  feeAmount?: string;
  feeAsset?: string;
  fiatAmount?: string;
  fiatCurrency?: string;
  counterparty?: string;
  title?: string;
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

export type NotificationKind =
  | 'deposit_confirmed'
  | 'withdrawal_update'
  | 'swap_completed'
  | 'payment_sent'
  | 'payment_received'
  | 'bill_success'
  | 'kyc_approved'
  | 'kyc_rejected'
  | 'security_alert'
  | 'reward'
  | 'giveaway'
  | 'system'
  | 'info';

export interface Notification {
  id: string;
  type: NotificationKind | string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  icon: string;
}
