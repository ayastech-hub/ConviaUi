import * as giveawaysApi from '../../shared/api/giveaways';
import type { ApiGiveaway } from '../../shared/api/giveaways';
import type { CardTheme, Gift, GiftKind, SplitMode } from './types';
import { refreshStatus } from './types';

function mapStatus(s: string): Gift['status'] {
  const x = (s || '').toLowerCase();
  if (x === 'cancelled' || x === 'canceled') return 'cancelled';
  if (x === 'expired') return 'expired';
  if (x === 'completed' || x === 'fully_claimed' || x === 'claimed') return 'claimed';
  return 'open';
}

function maskId(id: string): string {
  const s = (id || 'user').replace(/[^a-zA-Z0-9]/g, '');
  if (s.length < 4) return `${(s + 'user').slice(0, 2)}....${(s + '00').slice(-3)}`;
  return `${s.slice(0, 2)}....${s.slice(-3)}`;
}

/** Map backend giveaway → FE Gift model (giveaway kind only). */
export function mapApiGiveaway(row: ApiGiveaway): Gift {
  const total = Number(row.totalAmount) || 0;
  const remaining = Number(row.remainingAmount) || 0;
  const claimedCount = row.claimCount || 0;
  const slots = row.maxClaims || 1;
  const taken = Math.max(0, total - remaining);
  return refreshStatus({
    id: row.id,
    kind: 'giveaway',
    code: row.code,
    asset: row.asset,
    totalAmount: total,
    perClaimAmount: slots > 0 ? total / slots : total,
    slots,
    claimedCount,
    splitMode: (row.splitType === 'random' ? 'random' : 'equal') as SplitMode,
    note: row.message || '',
    expiresAt: row.expiresAt,
    status: mapStatus(row.status),
    createdAt: row.createdAt,
    creatorId: row.creatorId,
    creatorMask: maskId(row.creatorId),
    cardTheme: (row.theme as CardTheme) || 'classic',
    claims:
      claimedCount > 0
        ? [
            {
              amount: taken / Math.max(1, claimedCount),
              at: row.createdAt,
              claimerMask: '···',
            },
          ]
        : [],
  });
}

export async function listGifts(_kind?: GiftKind): Promise<Gift[]> {
  try {
    const res = await giveawaysApi.listMyGiveaways();
    return (res.items || []).map(mapApiGiveaway).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch {
    return [];
  }
}

export async function listRecentClaims(limit = 8): Promise<
  { gift: Gift; amount: number; at: string; claimerMask: string; note: string }[]
> {
  try {
    const gifts = await listGifts('giveaway');
    const out: { gift: Gift; amount: number; at: string; claimerMask: string; note: string }[] = [];
    for (const g of gifts.slice(0, 5)) {
      try {
        const claims = await giveawaysApi.listGiveawayClaims(g.id);
        for (const c of claims.items || []) {
          out.push({
            gift: g,
            amount: Number(c.amount) || 0,
            at: c.createdAt,
            claimerMask: c.claimerMask || maskId(c.claimerId),
            note: g.note,
          });
        }
      } catch {
        /* ignore per-gift */
      }
    }
    return out.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
  } catch {
    return [];
  }
}

export async function getGift(idOrCode: string): Promise<Gift | null> {
  const q = idOrCode.trim();
  try {
    const byCode = await giveawaysApi.getGiveawayByCode(q);
    return mapApiGiveaway(byCode);
  } catch {
    try {
      const mine = await listGifts();
      return mine.find((g) => g.id === q || g.code.toUpperCase() === q.toUpperCase()) || null;
    } catch {
      return null;
    }
  }
}

export async function createGift(input: {
  kind: GiftKind;
  asset: string;
  totalAmount: number;
  slots: number;
  note: string;
  expiresAt: string;
  creatorId: string;
  splitMode?: SplitMode;
  cardTheme?: CardTheme;
  pin?: string;
}): Promise<Gift> {
  const row = await giveawaysApi.createGiveaway({
    asset: input.asset,
    amount: String(input.totalAmount),
    maxClaims: Math.max(1, Math.floor(input.slots)),
    splitType: input.splitMode === 'random' ? 'random' : 'equal',
    expiresAt: input.expiresAt,
    theme: input.cardTheme,
    message: input.note || undefined,
    pin: input.pin,
  });
  return mapApiGiveaway(row);
}

export async function claimGift(
  code: string,
  _claimerId: string,
  pin?: string,
): Promise<{ ok: true; amount: number; gift: Gift } | { ok: false; error: string }> {
  try {
    const res = await giveawaysApi.claimGiveaway(code.trim(), pin);
    const gift =
      (await getGift(code)) ||
      ({
        id: res.giveawayId,
        kind: 'giveaway',
        code: code.trim().toUpperCase(),
        asset: res.asset,
        totalAmount: Number(res.amount) || 0,
        perClaimAmount: Number(res.amount) || 0,
        slots: 1,
        claimedCount: 1,
        splitMode: 'equal',
        note: '',
        expiresAt: new Date(Date.now() + 864e5).toISOString(),
        status: 'open',
        createdAt: new Date().toISOString(),
        creatorId: '',
        creatorMask: '····',
        cardTheme: 'classic',
        claims: [],
      } as Gift);
    return { ok: true, amount: Number(res.amount) || 0, gift };
  } catch (e: unknown) {
    const msg =
      e && typeof e === 'object' && 'body' in e
        ? String((e as { body?: { message?: string; code?: string } }).body?.message ||
            (e as { body?: { code?: string } }).body?.code ||
            (e as { message?: string }).message ||
            'Claim failed')
        : 'Claim failed';
    return { ok: false, error: msg };
  }
}

export async function cancelGift(id: string, pin?: string): Promise<Gift | null> {
  try {
    const row = await giveawaysApi.cancelGiveaway(id, pin);
    return mapApiGiveaway(row);
  } catch {
    return null;
  }
}
