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

export function listNotifications(userId: string, limit = 30) {
  return api.get<NotificationRow[]>(`/notifications/${userId}?limit=${limit}`);
}

export function markNotificationRead(notificationId: string) {
  return api.post(`/notifications/${notificationId}/read`);
}

export function getNotificationPreferences(userId: string) {
  return api.get<Array<{ channel: string; enabled: boolean }>>(`/notifications/${userId}/preferences`);
}

export function setNotificationPreference(userId: string, channel: 'in_app' | 'email' | 'sms' | 'push', enabled: boolean) {
  return api.put(`/notifications/${userId}/preferences`, { channel, enabled });
}
