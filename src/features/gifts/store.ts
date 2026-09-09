import type { Gift, GiftKind } from './types';
import { refreshStatus, remainingAmount } from './types';

const KEY = 'convia.gifts.v1';

function read(): Gift[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Gift[];
    return (Array.isArray(list) ? list : []).map((g) => refreshStatus(g));
  } catch {
    return [];
  }
}

function write(list: Gift[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

function codeGen(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let s = '';
  for (let i = 0; i < 8; i++) s += alphabet[Math.floor(Math.random() * alphabet.length)];
  return s;
}

export function listGifts(): Gift[] {
  return read().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getGift(idOrCode: string): Gift | null {
  const q = idOrCode.trim().toUpperCase();
  const hit = read().find((g) => g.id === idOrCode || g.code.toUpperCase() === q);
  return hit ? refreshStatus(hit) : null;
}

export function createGift(input: {
  kind: GiftKind;
  asset: string;
  totalAmount: number;
  slots: number;
  note: string;
  expiresAt: string;
  creatorId: string;
}): Gift {
  const slots = Math.max(1, Math.floor(input.slots));
  const totalAmount = Number(input.totalAmount);
  const perClaimAmount = Number((totalAmount / slots).toFixed(8));
  const gift: Gift = {
    id: `gift_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    kind: input.kind,
    code: codeGen(),
    asset: input.asset.toUpperCase(),
    totalAmount,
    perClaimAmount,
    slots,
    claimedCount: 0,
    note: input.note || '',
    expiresAt: input.expiresAt,
    status: 'open',
    createdAt: new Date().toISOString(),
    creatorId: input.creatorId || 'local',
  };
  const list = read();
  list.unshift(gift);
  write(list);
  return gift;
}

export function cancelGift(id: string): Gift | null {
  const list = read();
  const i = list.findIndex((g) => g.id === id);
  if (i < 0) return null;
  let g = refreshStatus(list[i]);
  if (g.status !== 'open') return g;
  g = { ...g, status: 'cancelled' };
  list[i] = g;
  write(list);
  return g;
}

export function claimGift(code: string, claimerId: string): { ok: true; gift: Gift } | { ok: false; error: string } {
  const list = read();
  const i = list.findIndex((g) => g.code.toUpperCase() === code.trim().toUpperCase());
  if (i < 0) return { ok: false, error: 'Invalid code' };
  let g = refreshStatus(list[i]);
  if (g.status === 'expired') return { ok: false, error: 'This giveaway/cheque has expired' };
  if (g.status === 'cancelled') return { ok: false, error: 'Cancelled by creator' };
  if (g.status === 'claimed' || g.claimedCount >= g.slots) {
    return { ok: false, error: 'Fully claimed' };
  }
  if (g.creatorId && claimerId && g.creatorId === claimerId) {
    return { ok: false, error: "You can't claim your own" };
  }
  g = {
    ...g,
    claimedCount: g.claimedCount + 1,
  };
  if (g.claimedCount >= g.slots) g = { ...g, status: 'claimed' };
  list[i] = g;
  write(list);
  return { ok: true, gift: g };
}

export { remainingAmount };
