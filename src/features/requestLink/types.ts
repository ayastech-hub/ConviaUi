export type RequestStatus = 'open' | 'paid' | 'cancelled' | 'expired';

export interface PaymentRequest {
  id: string;
  code: string;
  asset: string;
  /** Human amount for display; prefer amountStr for API */
  amount: number;
  amountStr: string;
  note: string;
  status: RequestStatus;
  createdAt: string;
  expiresAt: string;
  creatorId: string;
  creatorLabel: string;
  creatorAvatar?: string | null;
  paidBy?: string;
  paidAt?: string;
}

/** Canonical share URL: /pay/CODE (SPA rewrite must map to index.html) */
export function payUrl(code: string): string {
  const c = encodeURIComponent(String(code || '').trim());
  if (typeof window !== 'undefined' && window.location?.origin) {
    return `${window.location.origin}/pay/${c}`;
  }
  return `https://convia.app/pay/${c}`;
}

export function refreshRequest(r: PaymentRequest, now = Date.now()): PaymentRequest {
  if (r.status !== 'open') return r;
  if (r.expiresAt && Date.parse(r.expiresAt) < now) {
    return { ...r, status: 'expired' };
  }
  return r;
}
