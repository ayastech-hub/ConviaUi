import { api } from './client';

export function getRewardsProfile(userId: string) {
  return api.get<{ xp?: number; level?: number; points?: number; balance?: number }>(`/rewards/${userId}`);
}

export type LiveRewardTask = {
  id: string;
  title: string;
  description?: string | null;
  type: string;
  config?: Record<string, unknown>;
  points: number;
  isActive?: boolean;
  progress?: Record<string, unknown>;
  completedAt?: string | null;
  claimed?: boolean;
  canClaim?: boolean;
  expired?: boolean;
  status?: string;
  endsAt?: string | null;
};

export function listRewardTasks(userId: string) {
  return api.get<{ tasks: LiveRewardTask[] }>(`/rewards/${userId}/tasks`);
}

export function claimRewardTask(userId: string, taskId: string) {
  return api.post<{ taskId: string; points: number; usdtCredited?: string; claimed: boolean }>(
    `/rewards/${userId}/tasks/${taskId}/claim`,
    {},
    { idempotent: true },
  );
}

export function getReferralCode(userId: string) {
  return api.get<{ code: string; shareUrl: string }>(`/referrals/${userId}/code`);
}

export function getReferralStats(userId: string) {
  return api.get<Record<string, unknown>>(`/referrals/${userId}/stats`);
}

/** Record daily login (points / streak). */
export function recordDailyLogin(userId: string) {
  return api.post<{ points?: number; streak?: number; alreadyClaimed?: boolean }>(
    `/rewards/${userId}/daily-login`,
    {},
  );
}
