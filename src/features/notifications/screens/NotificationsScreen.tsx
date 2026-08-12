import React, { useCallback, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  TrendingUp,
  Shield,
  Gift,
  FileCheck,
  ArrowDownLeft,
  Check,
  Loader,
  X,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import * as notifApi from '../../../shared/api/notifications';
import type { NotificationRow } from '../../../shared/api/notifications';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { ApiError } from '../../../shared/api/types';

interface NotificationsScreenProps {
  goBack: () => void;
  /** Optional deep-link into app sections from a notification */
  navigate?: (screen: string) => void;
}

const notifIcon = (type: string) => {
  const m: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
    receive: { icon: ArrowDownLeft, bg: 'var(--muted)', color: 'var(--foreground)' },
    payment_received: { icon: ArrowDownLeft, bg: 'var(--muted)', color: 'var(--foreground)' },
    deposit_confirmed: { icon: ArrowDownLeft, bg: 'var(--muted)', color: 'var(--positive)' },
    price: { icon: TrendingUp, bg: 'var(--muted)', color: 'var(--foreground)' },
    security: { icon: Shield, bg: 'var(--muted)', color: 'var(--destructive)' },
    login_new_device: { icon: Shield, bg: 'var(--muted)', color: 'var(--destructive)' },
    reward: { icon: Gift, bg: 'var(--muted)', color: 'var(--muted-foreground)' },
    reward_claim: { icon: Gift, bg: 'var(--muted)', color: 'var(--muted-foreground)' },
    kyc: { icon: FileCheck, bg: 'var(--muted)', color: 'var(--foreground)' },
    kyc_approved: { icon: FileCheck, bg: 'var(--muted)', color: 'var(--positive)' },
    kyc_rejected: { icon: FileCheck, bg: 'var(--muted)', color: 'var(--destructive)' },
    withdrawal_completed: { icon: ArrowDownLeft, bg: 'var(--muted)', color: 'var(--foreground)' },
  };
  return m[type] ?? m.receive;
};

function payloadEntries(payload: Record<string, unknown> | null | undefined): Array<{ k: string; v: string }> {
  if (!payload || typeof payload !== 'object') return [];
  const skip = new Set(['title', 'body', 'message']);
  const out: Array<{ k: string; v: string }> = [];
  for (const [k, v] of Object.entries(payload)) {
    if (skip.has(k) || v == null || v === '') continue;
    if (typeof v === 'object') {
      try {
        out.push({ k, v: JSON.stringify(v) });
      } catch {
        /* skip */
      }
      continue;
    }
    out.push({ k, v: String(v) });
  }
  return out;
}

function deepLinkFor(type: string): string | null {
  const t = (type || '').toLowerCase();
  if (t.includes('kyc')) return 'kyc';
  if (t.includes('withdraw')) return 'wallet';
  if (t.includes('deposit') || t.includes('receive')) return 'wallet';
  if (t.includes('swap')) return 'swap';
  if (t.includes('reward')) return 'rewards';
  if (t.includes('support') || t.includes('ticket')) return 'support';
  if (t.includes('security') || t.includes('login')) return 'security';
  return null;
}

export function NotificationsScreen({ goBack, navigate }: NotificationsScreenProps) {
  const { userId, status } = useAuth();
  const [notifs, setNotifs] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ code?: string; message?: string } | null>(null);
  const [selected, setSelected] = useState<NotificationRow | null>(null);

  const load = useCallback(async () => {
    if (!userId) {
      setNotifs([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const rows = await notifApi.fetchNotifications(userId);
      setNotifs(Array.isArray(rows) ? rows : []);
    } catch (e) {
      if (e instanceof ApiError) setError({ code: e.code, message: e.message });
      else setError({ message: 'Failed to load notifications' });
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    void load();
  }, [load]);

  const unreadCount = notifs.filter((n) => !n.readAt).length;

  const openDetail = async (notif: NotificationRow) => {
    setSelected(notif);
    if (!notif.readAt && notif.id) {
      try {
        await notifApi.markNotificationRead(notif.id);
        setNotifs((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, readAt: new Date().toISOString() } : n)),
        );
      } catch {
        /* ignore */
      }
    }
  };

  const markAllRead = async () => {
    if (!userId) return;
    try {
      await notifApi.markAllNotificationsRead(userId);
      setNotifs((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
    } catch {
      /* ignore */
    }
  };

  const titleOf = (n: NotificationRow) =>
    String(n.title || (n.payload as { title?: string })?.title || n.type || 'Update');
  const bodyOf = (n: NotificationRow) =>
    String(n.body || n.message || (n.payload as { body?: string })?.body || '');

  return (
    <div className="flex flex-col h-full relative" style={{ background: 'var(--background)' }}>
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

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {status === 'anonymous' && (
          <FeatureAlert reason="generic" message="Sign in to see your notification inbox." />
        )}
        {error && <FeatureAlert reason={mapApiCodeToReason(error.code)} message={error.message} />}
        {loading && (
          <div className="flex justify-center py-12">
            <Loader className="animate-spin" size={22} style={{ color: 'var(--muted-foreground)' }} />
          </div>
        )}
        {!loading && notifs.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-2">
            <Check size={28} style={{ color: 'var(--muted-foreground)' }} />
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>No notifications yet</p>
          </div>
        )}
        {!loading && notifs.length > 0 && (
          <div className="rounded-[20px] overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {notifs.map((notif, i) => {
              const info = notifIcon(String(notif.type || 'receive'));
              const Icon = info.icon;
              const title = titleOf(notif);
              const body = bodyOf(notif);
              const read = Boolean(notif.readAt);
              return (
                <motion.button
                  key={notif.id}
                  type="button"
                  whileTap={{ scale: 0.99 }}
                  onClick={() => void openDetail(notif)}
                  className="w-full flex items-start gap-3 px-4 py-3.5 text-left"
                  style={{
                    background: read ? 'var(--muted)' : 'var(--card)',
                    borderBottom: i < notifs.length - 1 ? '1px solid var(--border)' : 'none',
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
                        className="line-clamp-2"
                        style={{
                          color: 'var(--muted-foreground)',
                          fontSize: 13,
                          marginTop: 4,
                          lineHeight: 1.45,
                        }}
                      >
                        {body}
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

      {/* Detail sheet */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col justify-end"
            style={{ background: 'rgba(0,0,0,0.55)' }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="rounded-t-[24px] max-h-[85%] overflow-y-auto"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>Notification</p>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setSelected(null)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--muted)' }}
                >
                  <X size={18} style={{ color: 'var(--foreground)' }} />
                </button>
              </div>
              <div className="px-5 pb-8">
                <div className="flex items-center gap-3 mb-4">
                  {(() => {
                    const info = notifIcon(String(selected.type || 'receive'));
                    const Icon = info.icon;
                    return (
                      <div
                        className="w-12 h-12 rounded-2xl flex items-center justify-center"
                        style={{ background: info.bg }}
                      >
                        <Icon size={22} style={{ color: info.color }} />
                      </div>
                    );
                  })()}
                  <div>
                    <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>
                      {titleOf(selected)}
                    </h3>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                      {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : ''}
                      {selected.type ? ` · ${selected.type}` : ''}
                    </p>
                  </div>
                </div>

                {bodyOf(selected) && (
                  <p
                    style={{
                      color: 'var(--foreground)',
                      fontSize: 15,
                      lineHeight: 1.55,
                      marginBottom: 16,
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {bodyOf(selected)}
                  </p>
                )}

                {payloadEntries(selected.payload as Record<string, unknown>).length > 0 && (
                  <div
                    className="rounded-[16px] overflow-hidden mb-4"
                    style={{ border: '1px solid var(--border)' }}
                  >
                    {payloadEntries(selected.payload as Record<string, unknown>).map((row) => (
                      <div
                        key={row.k}
                        className="flex justify-between gap-3 px-3 py-2.5"
                        style={{ borderBottom: '1px solid var(--border)' }}
                      >
                        <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{row.k}</span>
                        <span
                          className="text-right break-all"
                          style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}
                        >
                          {row.v}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {deepLinkFor(String(selected.type)) && navigate && (
                  <button
                    type="button"
                    className="w-full py-3.5 rounded-[16px] flex items-center justify-center gap-2 text-white"
                    style={{ background: 'var(--primary)', fontWeight: 700 }}
                    onClick={() => {
                      const screen = deepLinkFor(String(selected.type));
                      setSelected(null);
                      if (screen) navigate(screen);
                    }}
                  >
                    <ExternalLink size={16} />
                    Open related screen
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
