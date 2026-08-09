import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import * as profileApi from '../api/profile';
import type { UserProfile } from '../api/profile';
import { queryKeys } from '../query/queryClient';

export function useMyProfile() {
  const { userId, username: sessionUsername, status } = useAuth();
  const qc = useQueryClient();
  const enabled = status === 'authenticated' && !!userId;

  const q = useQuery({
    queryKey: queryKeys.profileMe(userId || '_'),
    queryFn: async (): Promise<UserProfile> => {
      try {
        return await profileApi.getMyProfile();
      } catch {
        if (sessionUsername) {
          return await profileApi.getPublicProfile(sessionUsername);
        }
        throw new Error('profile_unavailable');
      }
    },
    enabled,
  });

  return {
    profile: q.data ?? null,
    loading: enabled && q.isLoading,
    error: q.error ? String((q.error as Error).message) : null,
    isFetching: q.isFetching,
    refresh: () => q.refetch(),
    invalidate: () => {
      if (userId) void qc.invalidateQueries({ queryKey: queryKeys.profileMe(userId) });
    },
  };
}
