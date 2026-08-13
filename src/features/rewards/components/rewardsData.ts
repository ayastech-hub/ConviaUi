import { Trophy, Zap, Globe, Star, Handshake, Gem, TrendingUp, Send, RefreshCw, CheckCircle2, type LucideIcon } from 'lucide-react';

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
  /** true only after successful claim (credits applied) */
  done: boolean;
  /** task progress finished; may still need claim */
  completed?: boolean;
  canClaim?: boolean;
  icon: LucideIcon;
}

/** Empty seed — live tasks come from the API only (no mock daily login). */
export const initialTasks: RewardTask[] = [];

export type RedeemState = 'idle' | 'processing' | 'success';
