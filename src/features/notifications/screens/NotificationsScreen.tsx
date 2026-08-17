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
import { useLanguage } from '../../../shared/context/LanguageContext';

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
  const { t } = useLanguage();
