import * as requestLinksApi from '../../shared/api/requestLinks';
import type { ApiRequestLink } from '../../shared/api/requestLinks';
import type { PaymentRequest } from './types';

function mapStatus(s: string): PaymentRequest['status'] {
  const x = (s || '').toLowerCase();
  if (x === 'paid' || x === 'completed') return 'paid';
  if (x === 'cancelled' || x === 'canceled') return 'cancelled';
  if (x === 'expired') return 'expired';
  return 'open';
}

export function mapApiLink(row: ApiRequestLink): PaymentRequest {
  return {
    id: row.id,
    code: row.code,
    asset: row.asset,
    amount: Number(row.amount) || 0,
    note: row.note || '',
    status: mapStatus(row.status),
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
    creatorId: row.requesterId,
    creatorLabel: row.requesterUsername || 'User',
    paidBy: undefined,
    paidAt: undefined,
  };
}

export async function listRequests(_userId?: string): Promise<PaymentRequest[]> {
  try {
    const res = await requestLinksApi.listMyRequestLinks();
    return (res.items || [])
      .map(mapApiLink)
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export async function getRequest(idOrCode: string): Promise<PaymentRequest | null> {
  const q = idOrCode.trim();
  try {
    const byCode = await requestLinksApi.getRequestLinkByCode(q);
    return mapApiLink(byCode);
  } catch {
    try {
      const mine = await listRequests();
      return mine.find((r) => r.id === q || r.code.toUpperCase() === q.toUpperCase()) || null;
    } catch {
      return null;
    }
  }
}

export async function createRequest(input: {
  asset: string;
  amount: number;
  note: string;
  expiresAt: string;
  creatorId: string;
  pin?: string;
}): Promise<PaymentRequest> {
  const row = await requestLinksApi.createRequestLink({
    asset: input.asset,
    amount: String(input.amount),
    note: input.note || undefined,
    expiresAt: input.expiresAt,
    pin: input.pin,
  });
  return mapApiLink(row);
}

export async function cancelRequest(id: string): Promise<PaymentRequest | null> {
  try {
    const row = await requestLinksApi.cancelRequestLink(id);
    return mapApiLink(row);
  } catch {
    return null;
  }
}

export async function payRequest(
  code: string,
  _payerId: string,
  pin?: string,
): Promise<{ ok: true; request: PaymentRequest } | { ok: false; error: string }> {
  try {
    const res = await requestLinksApi.payRequestLink(code.trim(), pin);
    const request =
      (await getRequest(code)) ||
      ({
        id: res.id,
        code: code.trim().toUpperCase(),
        asset: res.asset,
        amount: Number(res.amount) || 0,
        note: '',
        status: 'paid' as const,
        expiresAt: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        creatorId: '',
        creatorLabel: 'User',
      } as PaymentRequest);
    return { ok: true, request: { ...request, status: 'paid' } };
  } catch (e: unknown) {
    const msg =
      e && typeof e === 'object' && 'body' in e
        ? String((e as { body?: { message?: string; code?: string } }).body?.message ||
            (e as { body?: { code?: string } }).body?.code ||
            'Payment failed')
        : 'Payment failed';
    return { ok: false, error: msg };
  }
}
