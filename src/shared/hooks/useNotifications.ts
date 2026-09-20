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
      const rows = Array.isArray(list) ? list : Array.isArray((list as { items?: unknown })?.items)
        ? (list as { items: NotificationRow[] }).items
        : Array.isArray((list as { notifications?: unknown })?.notifications)
          ? (list as { notifications: NotificationRow[] }).notifications
          : [];
      cacheSet(cacheKey, rows, { persist: 'local' });
      return rows;
    },
    enabled,
    staleTime: 15_000,
    placeholderData: () =>
      cacheGet<NotificationRow[]>(cacheKey, 24 * 60 * 60_000, { allowStale: true, preferLocal: true }) ||
      undefined,
  });

  const data = Array.isArray(q.data) ? q.data : [];
  const unread = data.filter((n) => !n.readAt && !(n as { read?: boolean }).read).length;

  return {
    data,
    unread,
    loading: enabled && q.isLoading && !q.data,
    isFetching: q.isFetching,
    refresh: () => q.refetch(),
    invalidate: () => {
      if (userId) void qc.invalidateQueries({ queryKey: queryKeys.notifications(userId) });
    },
  };
}
