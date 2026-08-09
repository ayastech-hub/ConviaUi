import { Trophy, Zap, Globe, Star, Handshake, Gem, Calendar, TrendingUp, Send, RefreshCw, CheckCircle2, type LucideIcon } from 'lucide-react';

export interface Badge {
  name: string;
  icon: LucideIcon;
  desc: string;
  earned: boolean;
}

export const initialBadges: Badge[] = [
  { name: 'First Trade', icon: Trophy, desc: 'Completed first trade', earned: true },
  { name: 'Speed Sender', icon: Zap, desc: 'Sent 10 payments', earned: true },
  { name: 'DeFi Explorer', icon: Globe, desc: 'Used off-ramp 5 times', earned: true },
  { name: 'Swap Master', icon: Star, desc: 'Completed 10 swaps', earned: false },
  { name: 'OTC Master', icon: Handshake, desc: 'Complete 50 OTC trades', earned: false },
  { name: 'Diamond Hands', icon: Gem, desc: 'Hold BTC for 90 days', earned: false },
];

export interface RewardTask {
  id: string;
  label: string;
  points: number;
  done: boolean;
  icon: LucideIcon;
}

export const initialTasks: RewardTask[] = [
  { id: 'daily-login', label: 'Daily login', points: 10, done: true, icon: Calendar },
  { id: 'complete-trade', label: 'Complete 1 trade', points: 25, done: true, icon: TrendingUp },
  { id: 'send-friend', label: 'Send to 1 friend', points: 20, done: false, icon: Send },
  { id: 'complete-swap', label: 'Complete a swap', points: 15, done: false, icon: RefreshCw },
  { id: 'complete-kyc', label: 'Complete KYC', points: 100, done: true, icon: CheckCircle2 },
];

export type RedeemState = 'idle' | 'processing' | 'success';
