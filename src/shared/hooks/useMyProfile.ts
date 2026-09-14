import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import * as profileApi from '../api/profile';
import type { UserProfile } from '../api/profile';
import { queryKeys } from '../query/queryClient';
import { cacheGet, cacheSet } from '../cache/queryCache';

export function useMyProfile() {
  const { userId, username: sessionUsername, status } = useAuth();
  const qc = useQueryClient();
  const enabled = status === 'authenticated' && !!userId;
  const cacheKey = `profile-me:${userId || '_'}`;

  const q = useQuery({
    queryKey: queryKeys.profileMe(userId || '_'),
    queryFn: async (): Promise<UserProfile> => {
      try {
        const p = await profileApi.getMyProfile();
        cacheSet(cacheKey, p, { persist: 'local' });
        return p;
      } catch {
        if (sessionUsername) {
          const p = await profileApi.getPublicProfile(sessionUsername);
          cacheSet(cacheKey, p, { persist: 'local' });
          return p;
        }
        throw new Error('profile_unavailable');
      }
    },
    enabled,
    staleTime: 60_000,
    placeholderData: () =>
      cacheGet<UserProfile>(cacheKey, 24 * 60 * 60_000, { allowStale: true, preferLocal: true }) || undefined,
  });

  return {
    profile: q.data ?? null,
    loading: enabled && q.isLoading && !q.data,
    error: q.error ? String((q.error as Error).message) : null,
    isFetching: q.isFetching,
    refresh: () => q.refetch(),
    invalidate: () => {
      if (userId) void qc.invalidateQueries({ queryKey: queryKeys.profileMe(userId) });
    },
  };
}
