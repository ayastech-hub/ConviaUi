import { Trophy, Zap, Globe, Star, Handshake, Gem, type LucideIcon } from 'lucide-react';

export interface Badge {
  name: string;
  icon: LucideIcon;
  desc: string;
  earned: boolean;
}

export const initialBadges: Badge[] = [
  { name: 'First Trade', icon: Trophy, desc: 'Completed first trade', earned: false },
  { name: 'Speed Sender', icon: Zap, desc: 'Sent 10 payments', earned: false },
  { name: 'DeFi Explorer', icon: Globe, desc: 'Used off-ramp 5 times', earned: false },
  { name: 'Swap Master', icon: Star, desc: 'Completed 10 swaps', earned: false },
  { name: 'OTC Master', icon: Handshake, desc: 'Complete 50 OTC trades', earned: false },
  { name: 'Diamond Hands', icon: Gem, desc: 'Hold BTC for 90 days', earned: false },
];

export interface RewardTask {
  id: string;
  label: string;
  points: number;
  done: boolean;
  completed?: boolean;
  canClaim?: boolean;
  expired?: boolean;
  status?: string;
  icon: LucideIcon;
}

export const initialTasks: RewardTask[] = [];

export type RedeemState = 'idle' | 'processing' | 'success';
