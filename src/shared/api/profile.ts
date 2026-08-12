import { api } from './client';

export type UserProfile = {
  userId?: string;
  username: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  bio?: string | null;
  country?: string | null;
  preferredCurrency?: string | null;
  themePreference?: string | null;
  profileVisibility?: string;
  socialLinks?: Record<string, string> | null;
  email?: string | null;
  isFrozen?: boolean;
  frozenReason?: string | null;
  [key: string]: unknown;
};

export function getMyProfile() {
  return api.get<UserProfile>('/profiles/me');
}

export function getPublicProfile(username: string) {
  return api.get<UserProfile>(`/profiles/${encodeURIComponent(username)}`, { auth: false });
}

export function updateMyProfile(body: {
  displayName?: string;
  bio?: string;
  avatarUrl?: string;
  country?: string;
  preferredCurrency?: string;
  themePreference?: 'system' | 'light' | 'dark';
}) {
  return api.patch<UserProfile>('/profiles/me', body);
}

export function updatePrivacy(visibility: 'public' | 'followers_only' | 'private') {
  return api.put('/profiles/me/privacy', { visibility });
}

export function checkUsername(username: string) {
  return api.post<{ available: boolean; reason?: string }>(
    `/profiles/check-username?username=${encodeURIComponent(username)}`,
    undefined,
    { auth: false },
  );
}

export function getProfileQrData(username: string) {
  return api.get<{ url: string }>(`/profiles/${encodeURIComponent(username)}/qr-data`, { auth: false });
}

export function getReputation(username: string) {
  return api.get<{
    level: number;
    xp: number;
    verified: boolean;
    verificationTier: number;
    achievementCount: number;
  }>(`/profiles/${encodeURIComponent(username)}/reputation`, { auth: false });
}
