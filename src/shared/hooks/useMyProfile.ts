import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import * as profileApi from '../api/profile';
import type { UserProfile } from '../api/profile';
import { ApiError } from '../api/types';
import { cacheGet, cacheSet, cacheInvalidate } from '../cache/queryCache';

export function useMyProfile() {
  const { userId, username: sessionUsername, status } = useAuth();
  const cacheKey = userId ? `profile:me:${userId}` : '';
  const cached = cacheKey ? cacheGet<UserProfile>(cacheKey) : undefined;

  const [profile, setProfile] = useState<UserProfile | null>(cached ?? null);
  const [loading, setLoading] = useState(!cached && status === 'authenticated');
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (status !== 'authenticated' || !userId) {
      setProfile(null);
      setLoading(false);
      return;
    }
    const key = `profile:me:${userId}`;
    const existing = cacheGet<UserProfile>(key);
    if (existing) {
      setProfile(existing);
      setLoading(false);
    } else {
      setLoading((prev) => (profile ? false : true));
    }
    try {
      const data = await profileApi.getMyProfile();
      cacheSet(key, data);
      setProfile(data);
      setError(null);
    } catch (err) {
      if (sessionUsername) {
        try {
          const pub = await profileApi.getPublicProfile(sessionUsername);
          cacheSet(key, pub);
          setProfile(pub);
          setError(null);
          return;
        } catch {
          /* fall through */
        }
      }
      setError(err instanceof ApiError ? err.code : 'profile_unavailable');
    } finally {
      setLoading(false);
    }
  }, [status, userId, sessionUsername, profile]);

  useEffect(() => {
    if (status === 'loading') return;
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, userId]);

  return {
    profile,
    loading,
    error,
    refresh,
    invalidate: () => {
      if (userId) cacheInvalidate(`profile:me:${userId}`);
    },
  };
}
