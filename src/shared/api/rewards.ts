import { api } from './client';

export function getRewardsProfile(userId: string) {
  return api.get<Record<string, unknown>>(`/rewards/${userId}`);
}

export function getReferralCode(userId: string) {
  return api.get<{ code: string; shareUrl: string }>(`/referrals/${userId}/code`);
}

export function getReferralStats(userId: string) {
  return api.get<Record<string, unknown>>(`/referrals/${userId}/stats`);
}
