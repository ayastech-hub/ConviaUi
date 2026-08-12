import { api } from './client';

export type NotificationRow = {
  id: string;
  userId?: string;
  type?: string;
  title?: string;
  body?: string;
  message?: string;
  readAt?: string | null;
  createdAt?: string;
  [key: string]: unknown;
};

export async function listNotifications(userId: string, limit = 30): Promise<NotificationRow[]> {
  const raw = await api.get<NotificationRow[] | { notifications?: NotificationRow[]; items?: NotificationRow[] }>(
    `/notifications/${userId}?limit=${limit}`,
  );
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray((raw as { notifications?: NotificationRow[] }).notifications)) {
    return (raw as { notifications: NotificationRow[] }).notifications;
  }
  if (raw && Array.isArray((raw as { items?: NotificationRow[] }).items)) {
    return (raw as { items: NotificationRow[] }).items;
  }
  return [];
}

export function markNotificationRead(notificationId: string) {
  return api.post(`/notifications/${notificationId}/read`);
}

export async function getNotificationPreferences(
  userId: string,
): Promise<Array<{ channel: string; enabled: boolean }>> {
  const raw = await api.get<
    Array<{ channel: string; enabled: boolean }> | { preferences?: Array<{ channel: string; enabled: boolean }> }
  >(`/notifications/${userId}/preferences`);
  if (Array.isArray(raw)) return raw;
  if (raw && Array.isArray((raw as { preferences?: unknown[] }).preferences)) {
    return (raw as { preferences: Array<{ channel: string; enabled: boolean }> }).preferences;
  }
  return [];
}

export function setNotificationPreference(userId: string, channel: 'in_app' | 'email' | 'sms' | 'push', enabled: boolean) {
  return api.put(`/notifications/${userId}/preferences`, { channel, enabled });
}
