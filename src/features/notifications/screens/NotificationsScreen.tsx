import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  TrendingUp,
  Shield,
  Gift,
  FileCheck,
  ArrowDownLeft,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  Copy,
  CheckCheck,
  BellOff,
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

type Filter = 'all' | 'unread';

const notifIcon = (type: string) => {
  const m: Record<string, { icon: React.ElementType; bg: string; color: string }> = {
    receive: { icon: ArrowDownLeft, bg: 'var(--muted)', color: 'var(--foreground)' },
    payment_received: { icon: ArrowDownLeft, bg: 'var(--muted)', color: 'var(--foreground)' },
    deposit_confirmed: { icon: ArrowDownLeft, bg: 'color-mix(in srgb, var(--positive) 14%, transparent)', color: 'var(--positive)' },
    price: { icon: TrendingUp, bg: 'var(--muted)', color: 'var(--foreground)' },
    security: { icon: Shield, bg: 'color-mix(in srgb, var(--destructive) 14%, transparent)', color: 'var(--destructive)' },
    login_new_device: { icon: Shield, bg: 'color-mix(in srgb, var(--destructive) 14%, transparent)', color: 'var(--destructive)' },
    reward: { icon: Gift, bg: 'var(--muted)', color: 'var(--muted-foreground)' },
    reward_claim: { icon: Gift, bg: 'var(--muted)', color: 'var(--muted-foreground)' },
    kyc: { icon: FileCheck, bg: 'var(--muted)', color: 'var(--foreground)' },
    kyc_approved: { icon: FileCheck, bg: 'color-mix(in srgb, var(--positive) 14%, transparent)', color: 'var(--positive)' },
    kyc_rejected: { icon: FileCheck, bg: 'color-mix(in srgb, var(--destructive) 14%, transparent)', color: 'var(--destructive)' },
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

/** "3m", "2h", "Yesterday", "Mar 4" — compact, scannable, no wall of digits */
function relativeTime(iso: string | undefined): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const min = Math.floor(diffMs / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day === 1) return 'Yesterday';
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

/** Groups into scan-friendly buckets so a long inbox reads like a timeline, not a list */
function groupByDate(rows: NotificationRow[]): Array<{ label: string; items: NotificationRow[] }> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const startOfWeek = startOfToday - 6 * 86400000;

  const buckets: Record<string, NotificationRow[]> = { Today: [], Yesterday: [], 'This week': [], Earlier: [] };
  for (const n of rows) {
    const t = n.createdAt ? new Date(n.createdAt).getTime() : 0;
    if (t >= startOfToday) buckets.Today.push(n);
    else if (t >= startOfYesterday) buckets.Yesterday.push(n);
    else if (t >= startOfWeek) buckets['This week'].push(n);
    else buckets.Earlier.push(n);
  }
  return Object.entries(buckets)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

function SkeletonRow({ delay = 0 }: { delay?: number }) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3.5"
      style={{ borderBottom: '1px solid var(--border)' }}
    >
      <motion.div
        className="w-10 h-10 rounded-xl flex-shrink-0"
        style={{ background: 'var(--muted)' }}
        animate={{ opacity: [0.5, 0.9, 0.5] }}
        transition={{ duration: 1.4, repeat: Infinity, delay, ease: 'easeInOut' }}
      />
      <div className="flex-1 min-w-0 flex flex-col gap-2 pt-0.5">
        <motion.div
          className="rounded-full"
          style={{ height: 10, width: '55%', background: 'var(--muted)' }}
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: delay + 0.1, ease: 'easeInOut' }}
        />
        <motion.div
          className="rounded-full"
          style={{ height: 8, width: '85%', background: 'var(--muted)' }}
          animate={{ opacity: [0.5, 0.9, 0.5] }}
          transition={{ duration: 1.4, repeat: Infinity, delay: delay + 0.15, ease: 'easeInOut' }}
        />
      </div>
    </div>
  );
}

function PayloadRow({ k, v }: { k: string; v: string }) {
  const [copied, setCopied] = useState(false);
  const onCopy = async () => {
    try {
      await navigator.clipboard.writeText(v);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* clipboard unavailable — silently ignore, this is a convenience affordance */
    }
  };
  return (
    <button
      type="button"
      onClick={onCopy}
      className="w-full flex justify-between items-center gap-3 px-3 py-2.5 text-left"
      style={{ borderBottom: '1px solid var(--border)' }}
      aria-label={`Copy ${k}`}
    >
      <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{k}</span>
      <span className="flex items-center gap-1.5 min-w-0">
        <span
          className="text-right break-all"
          style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}
        >
          {v}
        </span>
        {copied ? (
          <Check size={12} style={{ color: 'var(--positive)', flexShrink: 0 }} />
        ) : (
          <Copy size={12} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
        )}
      </span>
    </button>
  );
}

export function NotificationsScreen({ goBack, navigate }: NotificationsScreenProps) {
  const { userId, status } = useAuth();
  const [notifs, setNotifs] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<{ code?: string; message?: string } | null>(null);
  const [selected, setSelected] = useState<NotificationRow | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [justMarkedAll, setJustMarkedAll] = useState(false);

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
  const visible = useMemo(
    () => (filter === 'unread' ? notifs.filter((n) => !n.readAt) : notifs),
    [notifs, filter],
  );
  const grouped = useMemo(() => groupByDate(visible), [visible]);

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
    if (!userId || unreadCount === 0) return;
    try {
      await notifApi.markAllNotificationsRead(userId);
      setNotifs((prev) => prev.map((n) => ({ ...n, readAt: n.readAt || new Date().toISOString() })));
      setJustMarkedAll(true);
      setTimeout(() => setJustMarkedAll(false), 1800);
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

      <div className="flex items-center justify-between px-5 mb-4">
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
              aria-live="polite"
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
          className="flex items-center gap-1.5"
          style={{
            color: unreadCount > 0 ? 'var(--primary)' : 'var(--muted-foreground)',
            fontSize: 13,
            fontWeight: 600,
            opacity: unreadCount > 0 ? 1 : 0.5,
          }}
        >
          <AnimatePresence mode="wait" initial={false}>
            {justMarkedAll ? (
              <motion.span
                key="done"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-1.5"
              >
                <CheckCheck size={14} /> Done
              </motion.span>
            ) : (
              <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Mark all read
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Filter tabs — only worth showing once there's something to filter */}
      {notifs.length > 0 && (
        <div className="flex items-center gap-2 px-5 mb-4" role="tablist" aria-label="Filter notifications">
          {(['all', 'unread'] as Filter[]).map((f) => (
            <button
              key={f}
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className="px-3.5 py-1.5 rounded-full relative"
              style={{
                fontSize: 12.5,
                fontWeight: 600,
                color: filter === f ? 'var(--primary-foreground, var(--background))' : 'var(--muted-foreground)',
                background: filter === f ? 'var(--primary)' : 'var(--muted)',
                border: '1px solid var(--border)',
                transition: 'color 0.15s ease',
              }}
            >
              {f === 'all' ? 'All' : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ''}`}
            </button>
          ))}
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {status === 'anonymous' && (
          <FeatureAlert reason="generic" message="Sign in to see your notification inbox." />
        )}

        {error && (
          <div
            className="rounded-[16px] p-4 mb-4 flex flex-col gap-3"
            style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
          >
            <FeatureAlert reason={mapApiCodeToReason(error.code)} message={error.message} />
            <button
              type="button"
              onClick={() => void load()}
              className="self-start flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 12.5, fontWeight: 600 }}
            >
              <RefreshCw size={13} /> Try again
            </button>
          </div>
        )}

        {loading && (
          <div className="rounded-[20px] overflow-hidden" style={{ border: '1px solid var(--border)' }} aria-busy="true" aria-label="Loading notifications">
            {[0, 1, 2, 3, 4].map((i) => (
              <SkeletonRow key={i} delay={i * 0.08} />
            ))}
          </div>
        )}

        {!loading && !error && visible.length === 0 && notifs.length === 0 && (
          <div className="flex flex-col items-center py-16 gap-3 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--muted)' }}
            >
              <Check size={24} style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <div>
              <p style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 600 }}>You're all caught up</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 2 }}>
                Activity on your account will show up here.
              </p>
            </div>
          </div>
        )}

        {!loading && !error && visible.length === 0 && notifs.length > 0 && (
          <div className="flex flex-col items-center py-16 gap-3 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--muted)' }}
            >
              <BellOff size={22} style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <div>
              <p style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 600 }}>No unread notifications</p>
              <button
                type="button"
                onClick={() => setFilter('all')}
                style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600, marginTop: 4 }}
              >
                Show all
              </button>
            </div>
          </div>
        )}

        {!loading && !error && grouped.length > 0 && (
          <div className="flex flex-col gap-5">
            {grouped.map((group) => (
              <div key={group.label}>
                <p
                  className="px-1 mb-2"
                  style={{ color: 'var(--muted-foreground)', fontSize: 11.5, fontWeight: 700, letterSpacing: 0.4, textTransform: 'uppercase' }}
                >
                  {group.label}
                </p>
                <div className="rounded-[20px] overflow-hidden" style={{ border: '1px solid var(--border)' }}>
                  {group.items.map((notif, i) => {
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
                        className="w-full flex items-start gap-3 px-4 py-3.5 text-left focus-visible:outline-none focus-visible:ring-2"
                        style={{
                          background: read ? 'var(--card)' : 'color-mix(in srgb, var(--primary) 5%, var(--card))',
                          borderBottom: i < group.items.length - 1 ? '1px solid var(--border)' : 'none',
                          transition: 'background 0.3s ease',
                        }}
                      >
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                          style={{ background: info.bg }}
                        >
                          <Icon size={18} style={{ color: info.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-baseline justify-between gap-2">
                            <p
                              className="truncate"
                              style={{ color: 'var(--foreground)', fontWeight: read ? 500 : 700, fontSize: 14 }}
                            >
                              {title}
                            </p>
                            <span style={{ color: 'var(--muted-foreground)', fontSize: 11, flexShrink: 0 }}>
                              {relativeTime(notif.createdAt)}
                            </span>
                          </div>
                          {body && (
                            <p
                              className="line-clamp-2"
                              style={{
                                color: 'var(--muted-foreground)',
                                fontSize: 13,
                                marginTop: 3,
                                lineHeight: 1.45,
                              }}
                            >
                              {body}
                            </p>
                          )}
                        </div>
                        {!read && (
                          <span
                            aria-hidden="true"
                            className="w-2 h-2 rounded-full flex-shrink-0 mt-1.5"
                            style={{ background: 'var(--primary)' }}
                          />
                        )}
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            ))}
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
              role="dialog"
              aria-modal="true"
              aria-label="Notification detail"
            >
              <div className="flex items-center justify-between px-5 pt-4 pb-2">
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>Notification</p>
                <button
                  type="button"
                  aria-label="Close"
                  onClick={() => setSelected(null)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center focus-visible:outline-none focus-visible:ring-2"
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
                      <PayloadRow key={row.k} k={row.k} v={row.v} />
                    ))}
                  </div>
                )}

                {deepLinkFor(String(selected.type)) && navigate && (
                  <button
                    type="button"
                    className="w-full py-3.5 rounded-[16px] flex items-center justify-center gap-2 text-white focus-visible:outline-none focus-visible:ring-2"
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
