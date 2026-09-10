export type GiftKind = 'cheque' | 'giveaway';
export type GiftStatus = 'open' | 'claimed' | 'expired' | 'cancelled';
export type SplitMode = 'equal' | 'random';
export type CardTheme = 'classic' | 'gift' | 'midnight' | 'aurora';

export interface GiftClaimRecord {
  amount: number;
  at: string;
  claimerMask: string;
  note?: string;
}

export interface Gift {
  id: string;
  kind: GiftKind;
  code: string;
  asset: string;
  totalAmount: number;
  /** Fixed for equal; average for random display */
  perClaimAmount: number;
  slots: number;
  claimedCount: number;
  splitMode: SplitMode;
  note: string;
  expiresAt: string;
  status: GiftStatus;
  createdAt: string;
  creatorId: string;
  creatorMask: string;
  cardTheme: CardTheme;
  claims: GiftClaimRecord[];
}

export function remainingSlots(g: Gift): number {
  return Math.max(0, g.slots - g.claimedCount);
}

export function remainingAmount(g: Gift): number {
  const taken = g.claims.reduce((s, c) => s + c.amount, 0);
  return Math.max(0, Number((g.totalAmount - taken).toFixed(8)));
}

export function claimUrl(code: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/?claim=${encodeURIComponent(code)}`;
  }
  return `https://convia.app/claim/${code}`;
}

export function refreshStatus(g: Gift, now = Date.now()): Gift {
  if (g.status !== 'open') return g;
  if (new Date(g.expiresAt).getTime() <= now) {
    return { ...g, status: 'expired' };
  }
  if (g.claimedCount >= g.slots || remainingAmount(g) <= 0) {
    return { ...g, status: 'claimed' };
  }
  return g;
}
