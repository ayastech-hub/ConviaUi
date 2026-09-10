export type RequestStatus = 'open' | 'paid' | 'cancelled' | 'expired';

export interface PaymentRequest {
  id: string;
  code: string;
  asset: string;
  amount: number;
  note: string;
  status: RequestStatus;
  createdAt: string;
  expiresAt: string;
  creatorId: string;
  creatorLabel: string;
  paidBy?: string;
  paidAt?: string;
}

export function payUrl(code: string): string {
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/?pay=${encodeURIComponent(code)}`;
  }
  return `https://convia.app/pay/${code}`;
}

export function refreshRequest(r: PaymentRequest, now = Date.now()): PaymentRequest {
  if (r.status !== 'open') return r;
  if (new Date(r.expiresAt).getTime() <= now) return { ...r, status: 'expired' };
  return r;
}
