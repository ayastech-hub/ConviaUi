import { api } from './client';

export type ApiGiveaway = {
  id: string;
  creatorId: string;
  code: string;
  asset: string;
  totalAmount: string;
  remainingAmount: string;
  maxClaims: number;
  claimCount: number;
  splitType: string;
  status: string;
  expiresAt: string;
  theme?: string | null;
  message?: string | null;
  createdAt: string;
};

export function createGiveaway(body: {
  asset: string;
  amount: string;
  maxClaims: number;
  splitType: 'equal' | 'random';
  expiresAt: string;
  theme?: string;
  message?: string;
  pin?: string;
}) {
  return api.post<ApiGiveaway>('/giveaways', body, { idempotent: true });
}

export function listMyGiveaways() {
  return api.get<{ items: ApiGiveaway[] }>('/giveaways/mine');
}

export function getGiveawayByCode(code: string) {
  return api.get<ApiGiveaway>(`/giveaways/code/${encodeURIComponent(code)}`, { auth: false });
}

export function listGiveawayClaims(id: string) {
  return api.get<{
    items: Array<{ id: string; claimerId: string; amount: string; createdAt: string; claimerMask?: string }>;
  }>(`/giveaways/${encodeURIComponent(id)}/claims`);
}

export function claimGiveaway(code: string, pin?: string) {
  return api.post<{ amount: string; asset: string; giveawayId: string; claimId?: string }>(
    '/giveaways/claim',
    { code, ...(pin ? { pin } : {}) },
    { idempotent: true },
  );
}

export function cancelGiveaway(id: string, pin?: string) {
  return api.post<ApiGiveaway>(`/giveaways/${encodeURIComponent(id)}/cancel`, { ...(pin ? { pin } : {}) }, {
    idempotent: true,
  });
}
