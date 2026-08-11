import React, { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, TrendingUp, Shield, Gift, FileCheck, ArrowDownLeft, Check, Loader } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import * as notifApi from '../../../shared/api/notifications';
import type { NotificationRow } from '../../../shared/api/notifications';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { ApiError } from '../../../shared/api/types';

interface NotificationsScreenProps {
  goBack: () => void;
}

const notifIcon = (type: string) => {
  const m: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
    receive: { icon: ArrowDownLeft, bg: 'var(--muted)', color: 'var(--foreground)' },
    payment_received: { icon: ArrowDownLeft, bg: 'var(--muted)', color: 'var(--foreground)' },
    price: { icon: TrendingUp, bg: 'var(--muted)', color: 'var(--foreground)' },
    security: { icon: Shield, bg: 'var(--muted)', color: 'var(--destructive)' },
    login_new_device: { icon: Shield, bg: 'var(--muted)', color: 'var(--destructive)' },
    reward: { icon: Gift, bg: 'var(--muted)', color: 'var(--muted-foreground)' },
    kyc: { icon: FileCheck, bg: 'var(--muted)', color: 'var(--foreground)' },
  };
  return m[type] ?? m.receive;
};

/** Live inbox from GET /notifications/:userId. */
export function NotificationsScreen({ goBack }: NotificationsScreenProps) {
  const { userId, status } = useAuth();
  const [notifs, setNotifs] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ code?: string; message?: string } | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setNotifs([]);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const list = await notifApi.listNotifications(userId);
      setNotifs(Array.isArray(list) ? list : []);
    } catch (err) {
      if (err instanceof ApiError) setError({ code: err.code, message: err.message });
      else setError({ message: 'Could not load notifications' });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const unreadCount = notifs.filter((n) => !n.readAt).length;

  const markAllRead = async () => {
    const unread = notifs.filter((n) => !n.readAt);
    await Promise.allSettled(unread.map((n) => notifApi.markNotificationRead(n.id)));
    await load();
  };

  const toggleRead = async (id: string) => {
    const row = notifs.find((n) => n.id === id);
    if (!row || row.readAt) return;
    try {
      await notifApi.markNotificationRead(id);
      setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, readAt: new Date().toISOString() } : n)));
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center justify-between px-5 mb-5">
        <div className="flex items-center gap-3">
          <motion.button
            whileTap={{ scale: 0.9 }}
            onClick={goBack}
            aria-label="Go back"
            className="w-10 h-10 rounded-2xl flex items-center justify-center"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
          </motion.button>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Notifications</h2>
          {unreadCount > 0 && (
            <span
              className="px-2 py-0.5 rounded-full"
              style={{ background: 'var(--foreground)', color: 'var(--background)', fontSize: 10, fontWeight: 700 }}
            >
              {unreadCount}
            </span>
          )}
        </div>
        <button
          onClick={() => void markAllRead()}
          disabled={unreadCount === 0}
          style={{
            color: unreadCount > 0 ? 'var(--primary)' : 'var(--muted-foreground)',
            fontSize: 13,
            fontWeight: 600,
            opacity: unreadCount > 0 ? 1 : 0.5,
          }}
        >
          Mark all read
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        {status === 'anonymous' && (
          <FeatureAlert reason="generic" message="Sign in to see your notification inbox." />
        )}
        {error && <FeatureAlert reason={mapApiCodeToReason(error.code)} message={error.message} />}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
          </div>
        )}
        {!loading && notifs.length === 0 && (
          <div className="flex flex-col items-center justify-center" style={{ paddingTop: 80 }}>
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
              style={{ background: 'var(--muted)' }}
            >
              <Check size={28} style={{ color: 'var(--foreground)' }} />
            </div>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16, marginBottom: 4 }}>All caught up</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>No notifications yet</p>
          </div>
        )}
        {!loading && notifs.length > 0 && (
          <div className="rounded-[20px] overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {notifs.map((notif, i) => {
              const info = notifIcon(String(notif.type || 'receive'));
              const Icon = info.icon;
              const title = String(notif.title || notif.type || 'Update');
              const body = String(notif.body || notif.message || '');
              const read = Boolean(notif.readAt);
              return (
                <motion.button
                  key={notif.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.03 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => void toggleRead(notif.id)}
                  className="flex items-start gap-3 px-4 py-4 relative w-full text-left"
                  style={{
                    borderBottom: i < notifs.length - 1 ? '1px solid var(--border)' : 'none',
                    background: !read ? 'var(--muted)' : 'var(--card)',
                  }}
                >
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ background: info.bg }}
                  >
                    <Icon size={18} style={{ color: info.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{title}</p>
                    {body && (
                      <p
                        style={{
                          color: 'var(--muted-foreground)',
                          fontSize: 13,
                          marginTop: 4,
                          lineHeight: 1.45,
                          whiteSpace: 'pre-wrap',
                        }}
                      >
                        {body}
                      </p>
                    )}
                    {notif.payload && (notif.payload as { amount?: string }).amount && (
                      <p style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 600, marginTop: 6 }}>
                        {(notif.payload as { amount?: string; asset?: string }).amount}
                        {(notif.payload as { asset?: string }).asset
                          ? ` ${(notif.payload as { asset?: string }).asset}`
                          : ''}
                      </p>
                    )}
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 10, marginTop: 4 }}>
                      {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}
                    </p>
                  </div>
                  {!read && (
                    <span
                      className="w-2 h-2 rounded-full flex-shrink-0 mt-2"
                      style={{ background: 'var(--primary)' }}
                    />
                  )}
                </motion.button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
