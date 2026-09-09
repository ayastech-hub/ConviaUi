import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  TrendingUp,
  Shield,
  Gift,
  FileCheck,
  ArrowDownLeft,
  ArrowUpRight,
  RefreshCw,
  Plus,
  Check,
  X,
  BellOff,
  CheckCheck,
  ExternalLink,
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import * as notifApi from '../../../shared/api/notifications';
import type { NotificationRow } from '../../../shared/api/notifications';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { ApiError } from '../../../shared/api/types';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';

interface NotificationsScreenProps {
  goBack: () => void;
  navigate?: (screen: string) => void;
}

type Filter = 'all' | 'unread' | 'money' | 'security';

function notifIcon(type: string) {
  const t = (type || '').toLowerCase();
  if (t.includes('deposit') || t.includes('receive'))
    return { Icon: ArrowDownLeft, tone: 'var(--positive)' };
  if (t.includes('withdraw') || t.includes('send') || t.includes('sold') || t === 'sell')
    return { Icon: ArrowUpRight, tone: 'var(--foreground)' };
  if (t.includes('swap')) return { Icon: RefreshCw, tone: 'var(--primary)' };
  if (t.includes('buy') || t.includes('onramp') || t.includes('on-ramp'))
    return { Icon: Plus, tone: 'var(--positive)' };
  if (t.includes('security') || t.includes('login'))
    return { Icon: Shield, tone: 'var(--destructive)' };
  if (t.includes('kyc')) return { Icon: FileCheck, tone: 'var(--positive)' };
  if (t.includes('reward') || t.includes('point')) return { Icon: Gift, tone: 'var(--primary)' };
  if (t.includes('price')) return { Icon: TrendingUp, tone: 'var(--foreground)' };
  return { Icon: ArrowDownLeft, tone: 'var(--muted-foreground)' };
}

function isMoneyType(type: string) {
  const t = (type || '').toLowerCase();
  return (
    t.includes('deposit') ||
    t.includes('withdraw') ||
    t.includes('send') ||
    t.includes('receive') ||
    t.includes('swap') ||
    t.includes('buy') ||
    t.includes('sell') ||
    t.includes('onramp') ||
    t.includes('offramp') ||
    t.includes('payment')
  );
}

function isSecurityType(type: string) {
  const t = (type || '').toLowerCase();
  return t.includes('security') || t.includes('login') || t.includes('kyc');
}

function deepLinkFor(type: string): { screen: string; label: string } | null {
  const t = (type || '').toLowerCase();
  if (t.includes('kyc')) return { screen: 'kyc', label: 'View verification' };
  if (t.includes('security') || t.includes('login')) return { screen: 'security', label: 'Review security' };
  if (t.includes('reward')) return { screen: 'rewards', label: 'Open rewards' };
  if (t.includes('swap')) return { screen: 'swap', label: 'Open swap' };
  if (t.includes('withdraw') || t.includes('offramp')) return { screen: 'history', label: 'View history' };
  if (t.includes('deposit') || t.includes('receive') || t.includes('buy') || t.includes('send'))
    return { screen: 'history', label: 'View history' };
  if (t.includes('price')) return { screen: 'home', label: 'Open wallet' };
  return null;
}

function relativeTime(iso: string | undefined): string {
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
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

function groupByDate(rows: NotificationRow[]): Array<{ label: string; items: NotificationRow[] }> {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const startOfWeek = startOfToday - 6 * 86400000;
  const buckets: Record<string, NotificationRow[]> = {
    Today: [],
    Yesterday: [],
    'This week': [],
    Earlier: [],
  };
  for (const n of rows) {
    const t = n.createdAt ? new Date(n.createdAt).getTime() : 0;
    if (Number.isNaN(t) || t <= 0) buckets.Earlier.push(n);
    else if (t >= startOfToday) buckets.Today.push(n);
    else if (t >= startOfYesterday) buckets.Yesterday.push(n);
    else if (t >= startOfWeek) buckets['This week'].push(n);
    else buckets.Earlier.push(n);
  }
  return Object.entries(buckets)
    .filter(([, items]) => items.length > 0)
    .map(([label, items]) => ({ label, items }));
}

function titleOf(n: NotificationRow) {
  return String(n.title || n.type || 'Update');
}
function bodyOf(n: NotificationRow) {
  return String(n.body || n.message || '');
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

  const visible = useMemo(() => {
    return notifs.filter((n) => {
      if (filter === 'unread') return !n.readAt;
      if (filter === 'money') return isMoneyType(String(n.type));
      if (filter === 'security') return isSecurityType(String(n.type));
      return true;
    });
  }, [notifs, filter]);

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

  const FILTERS: { id: Filter; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'unread', label: unreadCount ? `Unread · ${unreadCount}` : 'Unread' },
    { id: 'money', label: 'Money' },
    { id: 'security', label: 'Security' },
  ];

  return (
    <div className="flex flex-col h-full relative" style={{ background: 'var(--background)' }}>
      <PageTop />

      <div className="flex items-center justify-between px-5 mb-3">
        <div className="flex items-center gap-3">
          <BackButton onClick={goBack} />
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22 }}>Notifications</h2>
        </div>
        <button
          type="button"
          onClick={() => void markAllRead()}
          disabled={unreadCount === 0}
          className="flex items-center gap-1.5"
          style={{
            color: unreadCount > 0 ? 'var(--primary)' : 'var(--muted-foreground)',
            fontSize: 13,
            fontWeight: 600,
            opacity: unreadCount > 0 ? 1 : 0.45,
          }}
        >
          {justMarkedAll ? (
            <>
              <CheckCheck size={14} /> Done
            </>
          ) : (
            'Mark all read'
          )}
        </button>
      </div>

      {/* Category chips — scrollable */}
      <div className="flex gap-2 overflow-x-auto px-5 pb-3 mb-1" style={{ scrollbarWidth: 'none' }}>
        {FILTERS.map((f) => {
          const on = filter === f.id;
          return (
            <button
              key={f.id}
              type="button"
              onClick={() => setFilter(f.id)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full"
              style={{
                background: on ? 'var(--foreground)' : 'var(--card)',
                color: on ? 'var(--background)' : 'var(--muted-foreground)',
                border: on ? 'none' : '1px solid var(--border)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {status === 'anonymous' && (
          <FeatureAlert reason="generic" message="Sign in to see your notification inbox." />
        )}

        {error && (
          <div
            className="rounded-2xl p-4 mb-4"
            style={{ border: '1px solid var(--border)', background: 'var(--card)' }}
          >
            <FeatureAlert reason={mapApiCodeToReason(error.code)} message={error.message} />
            <button
              type="button"
              onClick={() => void load()}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}
            >
              <RefreshCw size={13} /> Try again
            </button>
          </div>
        )}

        {loading && (
          <p className="py-16 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
            Loading notifications…
          </p>
        )}

        {!loading && !error && visible.length === 0 && (
          <div className="flex flex-col items-center py-16 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: 'var(--muted)' }}
            >
              <BellOff size={22} style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>Nothing here</p>
            <p className="mt-1 px-6" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
              {filter === 'all'
                ? 'Deposits, swaps, withdrawals, and security alerts will show up here.'
                : 'No notifications in this filter.'}
            </p>
            {filter !== 'all' && (
              <button
                type="button"
                onClick={() => setFilter('all')}
                className="mt-4"
                style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}
              >
                Show all
              </button>
            )}
          </div>
        )}

        {!loading && !error &&
          grouped.map((group) => (
            <div key={group.label} className="mb-5">
              <p
                className="px-0.5 mb-2"
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.5,
                  textTransform: 'uppercase',
                }}
              >
                {group.label}
              </p>
              <div
                className="rounded-[20px] overflow-hidden"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                {group.items.map((notif, i) => {
                  const { Icon, tone } = notifIcon(String(notif.type));
                  const read = Boolean(notif.readAt);
                  const last = i === group.items.length - 1;
                  return (
                    <motion.button
                      key={notif.id}
                      type="button"
                      whileTap={{ scale: 0.99 }}
                      onClick={() => void openDetail(notif)}
                      className="w-full flex items-start gap-3 px-4 py-3.5 text-left"
                      style={{
                        borderBottom: last ? 'none' : '1px solid var(--border)',
                        background: read
                          ? 'transparent'
                          : 'color-mix(in srgb, var(--primary) 6%, transparent)',
                      }}
                    >
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--muted)' }}
                      >
                        <Icon size={18} style={{ color: tone }} strokeWidth={2.2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p
                            className="truncate"
                            style={{
                              color: 'var(--foreground)',
                              fontWeight: read ? 500 : 700,
                              fontSize: 14,
                            }}
                          >
                            {titleOf(notif)}
                          </p>
                          <span style={{ color: 'var(--muted-foreground)', fontSize: 11, flexShrink: 0 }}>
                            {relativeTime(notif.createdAt)}
                          </span>
                        </div>
                        {bodyOf(notif) && (
                          <p
                            className="line-clamp-2"
                            style={{
                              color: 'var(--muted-foreground)',
                              fontSize: 13,
                              marginTop: 3,
                              lineHeight: 1.4,
                            }}
                          >
                            {bodyOf(notif)}
                          </p>
                        )}
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
            </div>
          ))}
      </div>

      {/* Full-page detail */}
      <AnimatePresence>
        {selected && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col"
            style={{ background: 'var(--background)' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 340 }}
          >
            <div
              className="flex items-center justify-between px-5 pb-3"
              style={{ paddingTop: 'max(12px, env(safe-area-inset-top))' }}
            >
              <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20 }}>Details</h3>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{ background: 'var(--muted)' }}
                aria-label="Close"
              >
                <X size={18} style={{ color: 'var(--foreground)' }} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-8">
              {(() => {
                const { Icon, tone } = notifIcon(String(selected.type));
                const link = deepLinkFor(String(selected.type));
                return (
                  <>
                    <div className="flex flex-col items-center text-center mb-6 mt-2">
                      <div
                        className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
                        style={{ background: 'var(--muted)' }}
                      >
                        <Icon size={28} style={{ color: tone }} strokeWidth={2} />
                      </div>
                      <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, lineHeight: 1.25 }}>
                        {titleOf(selected)}
                      </p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 8 }}>
                        {selected.createdAt
                          ? new Date(selected.createdAt).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : ''}
                      </p>
                    </div>

                    {bodyOf(selected) && (
                      <div
                        className="rounded-2xl p-4 mb-4"
                        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                      >
                        <p style={{ color: 'var(--foreground)', fontSize: 14, lineHeight: 1.55 }}>
                          {bodyOf(selected)}
                        </p>
                      </div>
                    )}

                    <div
                      className="rounded-2xl px-4 py-1 mb-6"
                      style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
                    >
                      <div
                        className="flex justify-between py-2.5"
                        style={{ borderBottom: '1px solid var(--border)' }}
                      >
                        <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Category</span>
                        <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
                          {isMoneyType(String(selected.type))
                            ? 'Money'
                            : isSecurityType(String(selected.type))
                              ? 'Security'
                              : 'Account'}
                        </span>
                      </div>
                      <div className="flex justify-between py-2.5">
                        <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Status</span>
                        <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
                          {selected.readAt ? 'Read' : 'Unread'}
                        </span>
                      </div>
                    </div>

                    {link && navigate && (
                      <button
                        type="button"
                        className="w-full py-3.5 rounded-full flex items-center justify-center gap-2 mb-3"
                        style={{
                          background: 'var(--primary)',
                          color: 'var(--primary-foreground, #fff)',
                          fontWeight: 700,
                          fontSize: 15,
                        }}
                        onClick={() => {
                          setSelected(null);
                          navigate(link.screen);
                        }}
                      >
                        <ExternalLink size={16} />
                        {link.label}
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => setSelected(null)}
                      className="w-full py-3.5 rounded-full"
                      style={{
                        background: 'var(--muted)',
                        color: 'var(--foreground)',
                        fontWeight: 600,
                        fontSize: 15,
                        border: '1px solid var(--border)',
                      }}
                    >
                      Close
                    </button>
                  </>
                );
              })()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
