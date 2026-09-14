import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import { fetchNotifications, type NotificationRow } from '../api/notifications';
import { queryKeys } from '../query/queryClient';
import { cacheGet, cacheSet } from '../cache/queryCache';

export function useNotifications(limit = 30) {
  const { userId, status } = useAuth();
  const qc = useQueryClient();
  const enabled = status === 'authenticated' && !!userId;
  const cacheKey = `notif:${userId || '_'}:${limit}`;

  const q = useQuery({
    queryKey: queryKeys.notifications(userId || '_', limit),
    queryFn: async () => {
      const list = await fetchNotifications(userId!, limit);
      cacheSet(cacheKey, list, { persist: 'local' });
      return list;
    },
    enabled,
    staleTime: 15_000,
    placeholderData: () =>
      cacheGet<NotificationRow[]>(cacheKey, 24 * 60 * 60_000, { allowStale: true, preferLocal: true }) ||
      undefined,
  });

  const unread = (q.data || []).filter((n) => !n.readAt && !(n as { read?: boolean }).read).length;

  return {
    data: (q.data as NotificationRow[] | undefined) ?? [],
    unread,
    loading: enabled && q.isLoading && !q.data,
    isFetching: q.isFetching,
    refresh: () => q.refetch(),
    invalidate: () => {
      if (userId) void qc.invalidateQueries({ queryKey: queryKeys.notifications(userId) });
    },
  };
}
