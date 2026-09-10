import type { PaymentRequest } from './types';
import { refreshRequest } from './types';

const KEY = 'convia.payreq.v1';

function read(): PaymentRequest[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as PaymentRequest[];
    return (Array.isArray(list) ? list : []).map((r) => refreshRequest(r));
  } catch {
    return [];
  }
}

function write(list: PaymentRequest[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function codeGen(): string {
  const a = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = 'PR';
  for (let i = 0; i < 8; i++) s += a[Math.floor(Math.random() * a.length)];
  return s;
}

export function listRequests(creatorId?: string): PaymentRequest[] {
  return read()
    .filter((r) => (creatorId ? r.creatorId === creatorId : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getRequest(idOrCode: string): PaymentRequest | null {
  const q = idOrCode.trim().toUpperCase();
  const hit = read().find((r) => r.id === idOrCode || r.code.toUpperCase() === q);
  return hit ? refreshRequest(hit) : null;
}

export function createRequest(input: {
  asset: string;
  amount: number;
  note: string;
  expiresAt: string;
  creatorId: string;
  creatorLabel: string;
}): PaymentRequest {
  const item: PaymentRequest = {
    id: `pr_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    code: codeGen(),
    asset: input.asset.toUpperCase(),
    amount: Number(input.amount),
    note: input.note || '',
    status: 'open',
    createdAt: new Date().toISOString(),
    expiresAt: input.expiresAt,
    creatorId: input.creatorId || 'local',
    creatorLabel: input.creatorLabel || 'Convia user',
  };
  const list = read();
  list.unshift(item);
  write(list);
  return item;
}

export function cancelRequest(id: string): PaymentRequest | null {
  const list = read();
  const i = list.findIndex((r) => r.id === id);
  if (i < 0) return null;
  let r = refreshRequest(list[i]);
  if (r.status !== 'open') return r;
  r = { ...r, status: 'cancelled' };
  list[i] = r;
  write(list);
  return r;
}

export function payRequest(
  code: string,
  payerId: string,
): { ok: true; request: PaymentRequest } | { ok: false; error: string } {
  const list = read();
  const i = list.findIndex((r) => r.code.toUpperCase() === code.trim().toUpperCase());
  if (i < 0) return { ok: false, error: 'Payment link not found' };
  let r = refreshRequest(list[i]);
  if (r.status === 'expired') return { ok: false, error: 'This request has expired' };
  if (r.status === 'cancelled') return { ok: false, error: 'Request was cancelled' };
  if (r.status === 'paid') return { ok: false, error: 'Already paid' };
  if (r.creatorId && payerId && r.creatorId === payerId) {
    return { ok: false, error: "You can't pay your own request" };
  }
  r = {
    ...r,
    status: 'paid',
    paidBy: payerId,
    paidAt: new Date().toISOString(),
  };
  list[i] = r;
  write(list);
  return { ok: true, request: r };
}
