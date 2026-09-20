import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
  Trash2,
  ExternalLink,
  CheckCircle2,
  Smartphone,
  Wifi,
  Zap,
  Tv,
  Trophy,
  Receipt,
} from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import { useNotifications } from '../../../shared/hooks/useNotifications';
import { queryClient, queryKeys } from '../../../shared/query/queryClient';
import * as notifApi from '../../../shared/api/notifications';
import { deleteNotification } from '../../../shared/api/notifications';
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

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'unread', label: 'Unread' },
  { id: 'money', label: 'Money' },
  { id: 'security', label: 'Security' },
];

function notifIcon(type: string, title?: string, body?: string) {
  const t = `${type || ''} ${title || ''} ${body || ''}`.toLowerCase();

  if (t.includes('airtime')) return Smartphone;
  if (t.includes('mobile data') || (t.includes('data') && t.includes('bill'))) return Wifi;
  if (t.includes('electric') || t.includes('power')) return Zap;
  if (t.includes('cable') || t.includes('tv &') || t.includes('tv and')) return Tv;
  if (t.includes('betting')) return Trophy;
  if (t.includes('bill_payment') || (t.includes('bill') && t.includes('payment'))) return Receipt;

  if (t.includes('deposit') || t.includes('receive')) return ArrowDownLeft;
  if (t.includes('withdraw') || t.includes('send') || t.includes('sold') || t === 'sell') return ArrowUpRight;
  if (t.includes('swap')) return RefreshCw;
  if (t.includes('buy') || t.includes('onramp') || t.includes('on-ramp')) return Plus;
  if (t.includes('security') || t.includes('login')) return Shield;
  if (t.includes('kyc')) return FileCheck;
  if (t.includes('reward') || t.includes('point') || t.includes('giveaway')) return Gift;
  if (t.includes('price')) return TrendingUp;

  return ArrowDownLeft;
}

function isMoneyType(type: string) {
  const t = (type || '').toLowerCase();
  if (t.includes('payment_received') || t.includes('swap') || t.includes('onramp') || t.includes('offramp') || t.includes('bill')) return true;

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
  if (t.includes('deposit') || t.includes('receive') || t.includes('buy') || t.includes('send')) {
    return { screen: 'history', label: 'View history' };
  }
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

  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  });
}

function groupByDate(rows: NotificationRow[]): Array<{ label: string; items: NotificationRow[] }> {
  const now = new Date();
  const startOfToday = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();

  const startOfYesterday = startOfToday - 86400000;
  const startOfWeek = startOfToday - 6 * 86400000;

  const buckets: Record<string, NotificationRow[]> = {
    Today: [],
    Yesterday: [],
    'This week': [],
    Earlier: [],
  };

  for (const n of rows) {
    const time = n.createdAt ? new Date(n.createdAt).getTime() : 0;

    if (Number.isNaN(time) || time <= 0) buckets.Earlier.push(n);
    else if (time >= startOfToday) buckets.Today.push(n);
    else if (time >= startOfYesterday) buckets.Yesterday.push(n);
    else if (time >= startOfWeek) buckets['This week'].push(n);
    else buckets.Earlier.push(n);
  }

  return Object.entries(buckets)
    .filter(([, items]) => items.length)
    .map(([label, items]) => ({ label, items }));
}

function titleOf(n: NotificationRow) {
  return String(n.title || n.type || 'Update');
}

const VENDOR_RE =
  /\b(vtpass|monnify|flutterwave|reloadly|paystack|binance|supabase|railway|shadowpay|payonus)\b/gi;

function scrubVendorText(text: string): string {
  return text
    .replace(VENDOR_RE, '')
    .replace(/\s*via\s+/gi, ' ')
    .replace(/\s{2,}/g, ' ')
    .replace(/\s*·\s*·+/g, ' · ')
    .replace(/^\s*·\s*|\s*·\s*$/g, '')
    .replace(/_http_\d+/gi, '')
    .replace(/:\s*\d{3}\b/g, '')
    .trim();
}

function bodyOf(n: NotificationRow) {
  return scrubVendorText(String(n.body || n.message || ''));
}

export function NotificationsScreen({ goBack, navigate }: NotificationsScreenProps) {
  const { userId, status } = useAuth();
  const { data: notifs, loading, refresh } = useNotifications(80);

  const [error, setError] = useState<{ code?: string; message?: string } | null>(null);
  const [selected, setSelected] = useState<NotificationRow | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [justMarkedAll, setJustMarkedAll] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTriggered = useRef(false);

  const selectionMode = selectedIds.size > 0;
  const unreadCount = notifs.filter((n) => !n.readAt).length;

  const load = useCallback(async () => {
    setError(null);

    try {
      await refresh();
    } catch (e) {
      if (e instanceof ApiError) {
        setError({ code: e.code, message: e.message });
      } else {
        setError({ message: 'Failed to load notifications' });
      }
    }
  }, [refresh]);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  }, []);

  const selectAllVisible = useCallback(() => {
    setSelectedIds(new Set(visible.map((n) => n.id)));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const startLongPress = (id: string) => {
    longPressTriggered.current = false;

    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
    }

    longPressTimer.current = setTimeout(() => {
      longPressTriggered.current = true;
      toggleSelection(id);
    }, 500);
  };

  const cancelLongPress = () => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }
  };

  useEffect(() => {
    return () => cancelLongPress();
  }, []);

  const visible = useMemo(() => {
    return notifs.filter((n) => {
      if (filter === 'unread') return !n.readAt;
      if (filter === 'money') return isMoneyType(String(n.type));
      if (filter === 'security') return isSecurityType(String(n.type));
      return true;
    });
  }, [notifs, filter]);

  const grouped = useMemo(() => groupByDate(visible), [visible]);

  useEffect(() => {
    if (!selectedIds.size) return;

    const existing = new Set(notifs.map((n) => n.id));

    setSelectedIds((prev) => {
      const next = new Set([...prev].filter((id) => existing.has(id)));
      return next.size === prev.size ? prev : next;
    });
  }, [notifs, selectedIds.size]);

  const handleDelete = async (id: string) => {
    try {
      await deleteNotification(id);

      queryClient.setQueryData(
        queryKeys.notifications(userId || '_', 30),
        (prev: NotificationRow[] | undefined) =>
          (prev || []).filter((n) => n.id !== id),
      );

      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications(userId || '_'),
      });
    } catch {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications(userId || '_'),
      });
    }
  };

  const handleDeleteSelected = async () => {
    if (!selectedIds.size || deleting) return;

    const ids = [...selectedIds];

    setDeleting(true);

    try {
      const results = await Promise.allSettled(
        ids.map((id) => deleteNotification(id)),
      );

      const deletedIds = new Set(
        ids.filter((_, index) => results[index].status === 'fulfilled'),
      );

      queryClient.setQueryData(
        queryKeys.notifications(userId || '_', 30),
        (prev: NotificationRow[] | undefined) =>
          (prev || []).filter((n) => !deletedIds.has(n.id)),
      );

      setSelectedIds((prev) => {
        const next = new Set([...prev].filter((id) => !deletedIds.has(id)));
        return next;
      });

      setConfirmDelete(false);

      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications(userId || '_'),
      });
    } finally {
      setDeleting(false);
    }
  };

  const openDetail = async (notif: NotificationRow) => {
    if (selectionMode) {
      toggleSelection(notif.id);
      return;
    }

    setSelected(notif);

    if (!notif.readAt && notif.id) {
      try {
        await notifApi.markNotificationRead(notif.id);

        if (userId) {
          queryClient.setQueryData(
            queryKeys.notifications(userId, 30),
            (prev: NotificationRow[] | undefined) =>
              (prev || []).map((n) =>
                n.id === notif.id
                  ? { ...n, readAt: new Date().toISOString() }
                  : n,
              ),
          );
        }
      } catch {
      }
    }
  };

  const markAllRead = async () => {
    if (!userId || unreadCount === 0) return;

    try {
      await notifApi.markAllNotificationsRead(userId);

      queryClient.setQueryData(
        queryKeys.notifications(userId, 30),
        (prev: NotificationRow[] | undefined) =>
          (prev || []).map((n) => ({
            ...n,
            readAt: n.readAt || new Date().toISOString(),
          })),
      );

      setJustMarkedAll(true);
      setTimeout(() => setJustMarkedAll(false), 1800);
    } catch {
    }
  };

  return (
    <div
      className="flex flex-col h-full relative"
      style={{ background: 'var(--background)' }}
    >
      <PageTop />

      <div className="flex items-center justify-between px-5 mb-3">
        <div className="flex items-center gap-3 min-w-0">
          <BackButton
            onClick={selectionMode ? clearSelection : goBack}
          />

          <h2
            className="truncate"
            style={{
              color: 'var(--foreground)',
              fontWeight: 800,
              fontSize: 21,
            }}
          >
            {selectionMode
              ? `${selectedIds.size} selected`
              : 'Notifications'}
          </h2>
        </div>

        {selectionMode ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={selectAllVisible}
              disabled={selectedIds.size === visible.length}
              className="px-3 py-2 rounded-full"
              style={{
                background:
                  selectedIds.size === visible.length
                    ? 'var(--muted)'
                    : 'var(--card)',
                color:
                  selectedIds.size === visible.length
                    ? 'var(--muted-foreground)'
                    : 'var(--foreground)',
                border: '1px solid var(--border)',
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              Select all
            </button>

            <button
              type="button"
              onClick={() => setConfirmDelete(true)}
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{
                background:
                  'color-mix(in srgb, var(--destructive) 14%, transparent)',
                color: 'var(--destructive)',
                border:
                  '1px solid color-mix(in srgb, var(--destructive) 20%, transparent)',
              }}
              aria-label="Delete selected notifications"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => void markAllRead()}
            disabled={unreadCount === 0}
            className="flex items-center gap-1.5"
            style={{
              color:
                unreadCount > 0
                  ? 'var(--primary)'
                  : 'var(--muted-foreground)',
              fontSize: 13,
              fontWeight: 600,
              opacity: unreadCount > 0 ? 1 : 0.45,
            }}
          >
            {justMarkedAll ? (
              <>
                <CheckCheck size={14} />
                Done
              </>
            ) : (
              'Mark all read'
            )}
          </button>
        )}
      </div>

      {!selectionMode && (
        <div className="px-5 pb-3">
          <div
            className="flex p-1 rounded-xl gap-1 overflow-x-auto"
            style={{
              background: 'var(--muted)',
              border: '1px solid var(--border)',
              scrollbarWidth: 'none',
            }}
          >
            {FILTERS.map((item) => {
              const active = filter === item.id;
              const count =
                item.id === 'unread' ? unreadCount : undefined;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setFilter(item.id)}
                  className="flex-1 min-w-max px-3 py-1.5 rounded-lg"
                  style={{
                    background: active ? 'var(--card)' : 'transparent',
                    color: active
                      ? 'var(--foreground)'
                      : 'var(--muted-foreground)',
                    border: active
                      ? '1px solid var(--border)'
                      : '1px solid transparent',
                    boxShadow: active
                      ? '0 1px 3px color-mix(in srgb, var(--foreground) 7%, transparent)'
                      : undefined,
                    fontSize: 12,
                    fontWeight: active ? 700 : 600,
                  }}
                >
                  <span className="inline-flex items-center gap-1.5">
                    {item.label}
                    {count ? (
                      <span
                        className="min-w-4 h-4 px-1 rounded-full flex items-center justify-center"
                        style={{
                          background: active
                            ? 'var(--primary)'
                            : 'var(--card)',
                          color: active
                            ? 'var(--primary-foreground, #fff)'
                            : 'var(--muted-foreground)',
                          fontSize: 9,
                          fontWeight: 800,
                        }}
                      >
                        {count > 99 ? '99+' : count}
                      </span>
                    ) : null}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {status === 'anonymous' && (
          <FeatureAlert
            reason="generic"
            message="Sign in to see your notification inbox."
          />
        )}

        {error && (
          <div
            className="rounded-2xl p-4 mb-4"
            style={{
              border: '1px solid var(--border)',
              background: 'var(--card)',
            }}
          >
            <FeatureAlert
              reason={mapApiCodeToReason(error.code)}
              message={error.message}
            />

            <button
              type="button"
              onClick={() => void load()}
              className="mt-2 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{
                background: 'var(--muted)',
                color: 'var(--foreground)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              <RefreshCw size={13} />
              Try again
            </button>
          </div>
        )}

        {loading && (
          <div className="space-y-2 pt-2">
            {[1, 2, 3].map((item) => (
              <div
                key={item}
                className="h-[72px] rounded-2xl animate-pulse"
                style={{ background: 'var(--muted)' }}
              />
            ))}
          </div>
        )}

        {!loading && !error && visible.length === 0 && (
          <div className="flex flex-col items-center py-12 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: 'var(--muted)' }}
            >
              <BellOff
                size={22}
                style={{ color: 'var(--muted-foreground)' }}
              />
            </div>

            <p
              style={{
                color: 'var(--foreground)',
                fontWeight: 700,
                fontSize: 15,
              }}
            >
              Nothing here
            </p>

            <p
              className="mt-1 px-6"
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 13,
                lineHeight: 1.45,
              }}
            >
              {filter === 'all'
                ? 'Deposits, swaps, withdrawals, and security alerts will show up here.'
                : 'No notifications in this filter.'}
            </p>

            {filter !== 'all' && (
              <button
                type="button"
                onClick={() => setFilter('all')}
                className="mt-4"
                style={{
                  color: 'var(--primary)',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                Show all
              </button>
            )}
          </div>
        )}

        {!loading &&
          !error &&
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
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                {group.items.map((notif, index) => {
                  const Icon = notifIcon(String(notif.type), titleOf(notif), bodyOf(notif));
                  const read = Boolean(notif.readAt);
                  const isSelected = selectedIds.has(notif.id);
                  const last = index === group.items.length - 1;

                  return (
                    <motion.button
                      key={notif.id}
                      type="button"
                      whileTap={{ scale: 0.985 }}
                      onPointerDown={() => startLongPress(notif.id)}
                      onPointerUp={cancelLongPress}
                      onPointerLeave={cancelLongPress}
                      onPointerCancel={cancelLongPress}
                      onClick={() => {
                        if (longPressTriggered.current) {
                          longPressTriggered.current = false;
                          return;
                        }

                        void openDetail(notif);
                      }}
                      className="w-full flex items-start gap-3 px-4 py-3.5 text-left"
                      style={{
                        borderBottom: last
                          ? 'none'
                          : '1px solid var(--border)',
                        background: isSelected
                          ? 'color-mix(in srgb, var(--primary) 13%, var(--card))'
                          : read
                            ? 'var(--card)'
                            : 'color-mix(in srgb, var(--primary) 4%, var(--card))',
                        boxShadow: isSelected
                          ? 'inset 3px 0 0 var(--primary)'
                          : undefined,
                      }}
                    >
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{
                          background: isSelected
                            ? 'var(--primary)'
                            : 'var(--muted)',
                          border: isSelected
                            ? '1px solid var(--primary)'
                            : '1px solid var(--border)',
                        }}
                      >
                        {isSelected ? (
                          <Check
                            size={19}
                            strokeWidth={3}
                            style={{
                              color: 'var(--primary-foreground, #fff)',
                            }}
                          />
                        ) : (
                          <Icon
                            size={18}
                            strokeWidth={2.1}
                            style={{ color: 'var(--muted-foreground)' }}
                          />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-baseline justify-between gap-2">
                          <p
                            className="truncate"
                            style={{
                              color: 'var(--foreground)',
                              fontWeight: read ? 550 : 750,
                              fontSize: 14,
                            }}
                          >
                            {titleOf(notif)}
                          </p>

                          <span
                            style={{
                              color: 'var(--muted-foreground)',
                              fontSize: 11,
                              flexShrink: 0,
                            }}
                          >
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

                      {!read && !isSelected && (
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

      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="absolute inset-0 z-[60] flex items-end"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              background: 'rgba(0,0,0,0.42)',
              backdropFilter: 'blur(4px)',
            }}
            onClick={() => !deleting && setConfirmDelete(false)}
          >
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 320 }}
              className="w-full rounded-t-[28px] px-5 pt-5 pb-7"
              style={{
                background: 'var(--background)',
                borderTop: '1px solid var(--border)',
                paddingBottom:
                  'max(28px, calc(20px + env(safe-area-inset-bottom)))',
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-center mb-5">
                <div
                  className="w-10 h-1 rounded-full"
                  style={{ background: 'var(--border)' }}
                />
              </div>

              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-11 h-11 rounded-2xl flex items-center justify-center"
                  style={{
                    background:
                      'color-mix(in srgb, var(--destructive) 12%, transparent)',
                  }}
                >
                  <Trash2
                    size={20}
                    style={{ color: 'var(--destructive)' }}
                  />
                </div>

                <div>
                  <p
                    style={{
                      color: 'var(--foreground)',
                      fontWeight: 800,
                      fontSize: 17,
                    }}
                  >
                    Delete notifications?
                  </p>
                  <p
                    style={{
                      color: 'var(--muted-foreground)',
                      fontSize: 13,
                      marginTop: 2,
                    }}
                  >
                    {selectedIds.size} notification
                    {selectedIds.size === 1 ? '' : 's'} will be deleted.
                  </p>
                </div>
              </div>

              <p
                className="mb-5"
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: 13,
                  lineHeight: 1.45,
                }}
              >
                This removes the selected notifications from your inbox.
              </p>

              <button
                type="button"
                disabled={deleting}
                onClick={() => void handleDeleteSelected()}
                className="w-full h-12 rounded-full flex items-center justify-center gap-2 mb-2"
                style={{
                  background: 'var(--destructive)',
                  color: 'var(--primary-foreground, #fff)',
                  fontWeight: 750,
                  fontSize: 14,
                  opacity: deleting ? 0.6 : 1,
                }}
              >
                <Trash2 size={16} />
                {deleting ? 'Deleting…' : 'Delete selected'}
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={() => setConfirmDelete(false)}
                className="w-full h-12 rounded-full"
                style={{
                  background: 'var(--muted)',
                  color: 'var(--foreground)',
                  border: '1px solid var(--border)',
                  fontWeight: 650,
                  fontSize: 14,
                }}
              >
                Cancel
              </button>
            </motion.div>
          </motion.div>
        )}

        {selected && (
          <motion.div
            className="absolute inset-0 z-50 flex flex-col"
            style={{ background: 'var(--background)' }}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'spring',
              damping: 30,
              stiffness: 340,
            }}
          >
            <div
              className="flex items-center justify-between px-5 pb-3"
              style={{
                paddingTop:
                  'max(12px, env(safe-area-inset-top))',
              }}
            >
              <h3
                style={{
                  color: 'var(--foreground)',
                  fontWeight: 800,
                  fontSize: 20,
                }}
              >
                Details
              </h3>

              <button
                type="button"
                onClick={() => setSelected(null)}
                className="w-9 h-9 rounded-full flex items-center justify-center"
                style={{
                  background: 'var(--muted)',
                  border: '1px solid var(--border)',
                }}
                aria-label="Close"
              >
                <X
                  size={18}
                  style={{ color: 'var(--foreground)' }}
                />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 pb-8">
              {(() => {
                const Icon = notifIcon(String(selected.type), titleOf(selected), bodyOf(selected));
                const link = deepLinkFor(String(selected.type));

                return (
                  <>
                    <div className="flex flex-col items-center text-center mb-6 mt-2">
                      <div
                        className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
                        style={{
                          background: 'var(--muted)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <Icon
                          size={28}
                          style={{ color: 'var(--muted-foreground)' }}
                          strokeWidth={2}
                        />
                      </div>

                      <p
                        style={{
                          color: 'var(--foreground)',
                          fontWeight: 800,
                          fontSize: 20,
                          lineHeight: 1.25,
                        }}
                      >
                        {titleOf(selected)}
                      </p>

                      <p
                        style={{
                          color: 'var(--muted-foreground)',
                          fontSize: 12,
                          marginTop: 8,
                        }}
                      >
                        {selected.createdAt
                          ? new Date(
                              selected.createdAt,
                            ).toLocaleString(undefined, {
                              dateStyle: 'medium',
                              timeStyle: 'short',
                            })
                          : ''}
                      </p>
                    </div>

                    {bodyOf(selected) && (
                      <div
                        className="rounded-2xl p-4 mb-4"
                        style={{
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                        }}
                      >
                        <p
                          style={{
                            color: 'var(--foreground)',
                            fontSize: 14,
                            lineHeight: 1.55,
                          }}
                        >
                          {bodyOf(selected)}
                        </p>
                      </div>
                    )}

                    <div
                      className="rounded-2xl px-4 py-1 mb-6"
                      style={{
                        background: 'var(--muted)',
                        border: '1px solid var(--border)',
                      }}
                    >
                      <div
                        className="flex justify-between py-2.5"
                        style={{
                          borderBottom: '1px solid var(--border)',
                        }}
                      >
                        <span
                          style={{
                            color: 'var(--muted-foreground)',
                            fontSize: 13,
                          }}
                        >
                          Category
                        </span>

                        <span
                          style={{
                            color: 'var(--foreground)',
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {isMoneyType(String(selected.type))
                            ? 'Money'
                            : isSecurityType(String(selected.type))
                              ? 'Security'
                              : 'Account'}
                        </span>
                      </div>

                      <div className="flex justify-between py-2.5">
                        <span
                          style={{
                            color: 'var(--muted-foreground)',
                            fontSize: 13,
                          }}
                        >
                          Status
                        </span>

                        <span
                          style={{
                            color: 'var(--foreground)',
                            fontSize: 13,
                            fontWeight: 600,
                          }}
                        >
                          {selected.readAt ? 'Read' : 'Unread'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (selected.id) {
                          void handleDelete(selected.id).then(() =>
                            setSelected(null),
                          );
                        }
                      }}
                      className="w-full py-3.5 rounded-full flex items-center justify-center gap-2 mb-3"
                      style={{
                        background:
                          'color-mix(in srgb, var(--destructive) 12%, transparent)',
                        color: 'var(--destructive)',
                        fontWeight: 700,
                        fontSize: 14,
                        border:
                          '1px solid color-mix(in srgb, var(--destructive) 18%, transparent)',
                      }}
                    >
                      <Trash2 size={16} />
                      Delete notification
                    </button>

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