import type { CardTheme, Gift, GiftKind, SplitMode } from './types';
import { refreshStatus, remainingAmount, remainingSlots } from './types';

const KEY = 'convia.gifts.v1';

function read(): Gift[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const list = JSON.parse(raw) as Gift[];
    return (Array.isArray(list) ? list : []).map((g) =>
      refreshStatus({
        ...g,
        claims: g.claims || [],
        splitMode: g.splitMode || 'equal',
        cardTheme: g.cardTheme || 'classic',
        creatorMask: g.creatorMask || maskId(g.creatorId || 'user'),
      }),
    );
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

function maskId(id: string): string {
  const s = (id || 'user').replace(/[^a-zA-Z0-9]/g, '');
  if (s.length < 4) return `${(s + 'user').slice(0, 2)}....${(s + '00').slice(-3)}`;
  return `${s.slice(0, 2)}....${s.slice(-3)}`;
}

export function listGifts(kind?: GiftKind): Gift[] {
  return read()
    .filter((g) => (kind ? g.kind === kind : true))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function listRecentClaims(limit = 8): { gift: Gift; amount: number; at: string; claimerMask: string; note: string }[] {
  const out: { gift: Gift; amount: number; at: string; claimerMask: string; note: string }[] = [];
  for (const g of read()) {
    for (const c of g.claims || []) {
      out.push({
        gift: g,
        amount: c.amount,
        at: c.at,
        claimerMask: c.claimerMask,
        note: g.note,
      });
    }
  }
  return out.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
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
  splitMode?: SplitMode;
  cardTheme?: CardTheme;
}): Gift {
  const slots = Math.max(1, Math.floor(input.slots));
  const totalAmount = Number(input.totalAmount);
  const splitMode = input.splitMode || 'equal';
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
    splitMode,
    note: input.note || '',
    expiresAt: input.expiresAt,
    status: 'open',
    createdAt: new Date().toISOString(),
    creatorId: input.creatorId || 'local',
    creatorMask: maskId(input.creatorId || 'local'),
    cardTheme: input.cardTheme || 'classic',
    claims: [],
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

export function claimGift(
  code: string,
  claimerId: string,
): { ok: true; gift: Gift; amount: number } | { ok: false; error: string } {
  const list = read();
  const i = list.findIndex((g) => g.code.toUpperCase() === code.trim().toUpperCase());
  if (i < 0) return { ok: false, error: 'Invalid passcode' };
  let g = refreshStatus(list[i]);
  if (g.status === 'expired') return { ok: false, error: 'This giveaway has expired' };
  if (g.status === 'cancelled') return { ok: false, error: 'Cancelled by creator' };
  if (g.status === 'claimed' || g.claimedCount >= g.slots) {
    return { ok: false, error: 'Fully claimed' };
  }
  if (g.creatorId && claimerId && g.creatorId === claimerId) {
    return { ok: false, error: "You can't claim your own" };
  }

  const leftSlots = remainingSlots(g);
  const leftAmt = remainingAmount(g);
  if (leftSlots <= 0 || leftAmt <= 0) return { ok: false, error: 'Fully claimed' };

  let amount: number;
  if (g.splitMode === 'equal' || leftSlots === 1) {
    amount = leftSlots === 1 ? leftAmt : Number((g.totalAmount / g.slots).toFixed(8));
    if (amount > leftAmt) amount = leftAmt;
  } else {
    // random: between 30% and 170% of equal share, capped by remaining
    const base = leftAmt / leftSlots;
    const factor = 0.3 + Math.random() * 1.4;
    amount = Number(Math.min(leftAmt * 0.85, Math.max(base * 0.2, base * factor)).toFixed(8));
    if (leftSlots === 1) amount = leftAmt;
  }

  g = {
    ...g,
    claimedCount: g.claimedCount + 1,
    claims: [
      ...(g.claims || []),
      {
        amount,
        at: new Date().toISOString(),
        claimerMask: maskId(claimerId),
        note: g.note,
      },
    ],
  };
  if (g.claimedCount >= g.slots || remainingAmount(g) <= 0) {
    g = { ...g, status: 'claimed' };
  }
  list[i] = g;
  write(list);
  return { ok: true, gift: g, amount };
}

export { remainingAmount, remainingSlots };
