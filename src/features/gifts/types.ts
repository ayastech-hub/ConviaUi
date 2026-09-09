export type GiftKind = 'cheque' | 'giveaway';
export type GiftStatus = 'open' | 'claimed' | 'expired' | 'cancelled';

export interface Gift {
  id: string;
  kind: GiftKind;
  code: string;
  asset: string;
  /** Total locked at create */
  totalAmount: number;
  /** Equal per-slot for giveaway; same as total for cheque */
  perClaimAmount: number;
  /** Max claims (1 for cheque) */
  slots: number;
  claimedCount: number;
  note: string;
  expiresAt: string;
  status: GiftStatus;
  createdAt: string;
  creatorId: string;
}

export function remainingSlots(g: Gift): number {
  return Math.max(0, g.slots - g.claimedCount);
}

export function remainingAmount(g: Gift): number {
  return Math.max(0, g.totalAmount - g.claimedCount * g.perClaimAmount);
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
  if (g.claimedCount >= g.slots) {
    return { ...g, status: 'claimed' };
  }
  return g;
}
