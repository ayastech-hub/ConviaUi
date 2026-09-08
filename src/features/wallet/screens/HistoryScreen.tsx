import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  Inbox,
} from 'lucide-react';
import type { Transaction } from '../../../shared/data/mockData';
import { TransactionReceipt } from '../../../shared/components/TransactionReceipt';
import { PageTop } from '../../../shared/components/PageTop';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { useTransactions } from '../../../shared/hooks/useTransactions';
import { apiTxToUi, filterHistoryForUi } from '../../../shared/utils/mapApiToUi';

type TypeFilter =
  | 'all'
  | 'receive'
  | 'send'
  | 'swap'
  | 'buy'
  | 'sell'
  | 'deposit'
  | 'withdraw'
  | 'onramp'
  | 'offramp';

type StatusFilter = 'all' | 'confirmed' | 'pending' | 'failed';

const TYPE_CHIPS: { id: TypeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'receive', label: 'Received' },
  { id: 'send', label: 'Sent' },
  { id: 'swap', label: 'Swap' },
  { id: 'deposit', label: 'Deposit' },
  { id: 'withdraw', label: 'Withdraw' },
  { id: 'buy', label: 'Buy' },
  { id: 'sell', label: 'Sell' },
  { id: 'onramp', label: 'On-ramp' },
  { id: 'offramp', label: 'Off-ramp' },
];

const STATUS_CHIPS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Any status' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'pending', label: 'Pending' },
  { id: 'failed', label: 'Failed' },
];

const TX_META: Record<
  string,
  { label: string; Icon: typeof ArrowDownLeft; tone: string; sign: string }
> = {
  receive: { label: 'Received', Icon: ArrowDownLeft, tone: 'var(--positive)', sign: '+' },
  send: { label: 'Sent', Icon: ArrowUpRight, tone: 'var(--foreground)', sign: '−' },
  swap: { label: 'Swapped', Icon: RefreshCw, tone: 'var(--primary)', sign: '↔' },
  buy: { label: 'Bought', Icon: Plus, tone: 'var(--positive)', sign: '+' },
  sell: { label: 'Sold', Icon: Minus, tone: 'var(--foreground)', sign: '−' },
  offramp: { label: 'Cash out', Icon: TrendingDown, tone: 'var(--foreground)', sign: '−' },
  onramp: { label: 'Bought', Icon: TrendingUp, tone: 'var(--positive)', sign: '+' },
  deposit: { label: 'Deposit', Icon: ArrowDownLeft, tone: 'var(--positive)', sign: '+' },
  withdraw: { label: 'Withdraw', Icon: ArrowUpRight, tone: 'var(--foreground)', sign: '−' },
};

function meta(type: string) {
  return TX_META[type] ?? TX_META.receive;
}

function statusColor(s: string) {
  if (s === 'confirmed') return 'var(--positive)';
  if (s === 'failed') return 'var(--destructive)';
  return 'var(--warning, #F59E0B)';
}

function groupKey(time: string): string {
  const t = (time || '').toLowerCase();
  if (t.includes('m ago') || t.includes('h ago') || t.includes('just') || t === 'today') return 'Today';
  if (t.includes('1d') || t.includes('yesterday')) return 'Yesterday';
  if (t.includes('d ago') || t.includes('day')) return 'This week';
  return 'Earlier';
}

const GROUP_ORDER = ['Today', 'Yesterday', 'This week', 'Earlier'];

interface Props {
  goBack: () => void;
}

/**
 * Enterprise activity history — search, type + status filters, date groups.
 */
export function HistoryScreen({ goBack }: Props) {
  const { format } = useCurrency();
  const { data, loading, source } = useTransactions(80);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [q, setQ] = useState('');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const all = useMemo(() => filterHistoryForUi(data.map(apiTxToUi)), [data]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      if (!needle) return true;
      const hay = [
        tx.type,
        tx.asset,
        tx.assetTo,
        tx.username,
        tx.address,
        tx.hash,
        tx.time,
        String(tx.amount),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return hay.includes(needle);
    });
  }, [all, typeFilter, statusFilter, q]);

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of filtered) {
      const k = groupKey(tx.time);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(tx);
    }
    return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({
      title: g,
      items: map.get(g)!,
    }));
  }, [filtered]);

  const activeFilters =
    (typeFilter !== 'all' ? 1 : 0) + (statusFilter !== 'all' ? 1 : 0) + (q.trim() ? 1 : 0);

  const clearFilters = () => {
    setTypeFilter('all');
    setStatusFilter('all');
    setQ('');
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />

      {/* Header */}
      <div className="flex items-center gap-3 px-5 mb-3">
        <motion.button
          type="button"
          whileTap={{ scale: 0.9 }}
          onClick={goBack}
          aria-label="Back"
          className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div className="flex-1 min-w-0">
          <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, lineHeight: 1.1 }}>
            History
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}>
            {loading ? 'Loading…' : `${filtered.length} transaction${filtered.length === 1 ? '' : 's'}`}
            {source === 'live' ? ' · live' : source === 'mock' || !loading ? ' · demo' : ''}
          </p>
        </div>
        {activeFilters > 0 && (
          <button
            type="button"
            onClick={clearFilters}
            style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}
          >
            Clear
          </button>
        )}
      </div>

      {/* Search */}
      <div className="px-5 mb-3">
        <div
          className="flex items-center gap-2.5 px-3.5 h-11 rounded-2xl"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search asset, type, hash…"
            className="flex-1 bg-transparent outline-none text-sm"
            style={{ color: 'var(--foreground)' }}
          />
        </div>
      </div>

      {/* Type filters */}
      <div
        className="flex gap-2 overflow-x-auto px-5 pb-2 mb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {TYPE_CHIPS.map((c) => {
          const on = typeFilter === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setTypeFilter(c.id)}
              className="flex-shrink-0 px-3.5 py-1.5 rounded-full"
              style={{
                background: on ? 'var(--foreground)' : 'var(--card)',
                color: on ? 'var(--background)' : 'var(--muted-foreground)',
                border: on ? 'none' : '1px solid var(--border)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* Status filters */}
      <div
        className="flex gap-2 overflow-x-auto px-5 pb-3 mb-1"
        style={{ scrollbarWidth: 'none' }}
      >
        {STATUS_CHIPS.map((c) => {
          const on = statusFilter === c.id;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => setStatusFilter(c.id)}
              className="flex-shrink-0 px-3 py-1 rounded-full"
              style={{
                background: on ? 'var(--muted)' : 'transparent',
                color: on ? 'var(--foreground)' : 'var(--muted-foreground)',
                border: `1px solid ${on ? 'var(--border)' : 'transparent'}`,
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {loading && (
          <div className="py-16 text-center">
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Loading activity…</p>
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="py-16 flex flex-col items-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-3"
              style={{ background: 'var(--muted)' }}
            >
              <Inbox size={24} style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>No activity</p>
            <p
              className="mt-1 text-center px-8"
              style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.4 }}
            >
              {activeFilters
                ? 'Nothing matches these filters. Try clearing them.'
                : 'Deposits, swaps, and transfers will show up here.'}
            </p>
            {activeFilters > 0 && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 px-4 py-2 rounded-full"
                style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {groups.map((group) => (
            <motion.div
              key={group.title}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5"
            >
              <p
                className="mb-2 px-0.5"
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 0.6,
                  textTransform: 'uppercase',
                }}
              >
                {group.title}
              </p>
              <div
                className="rounded-[20px] overflow-hidden"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                {group.items.map((tx, i) => {
                  const m = meta(tx.type);
                  const Icon = m.Icon;
                  const last = i === group.items.length - 1;
                  const amountLine =
                    tx.type === 'swap'
                      ? `${tx.amount} ${tx.asset || ''} → ${tx.amountTo ?? '—'} ${tx.assetTo || ''}`
                      : `${m.sign}${Number(tx.amount).toLocaleString(undefined, {
                          maximumFractionDigits: 6,
                        })} ${tx.asset || ''}`;

                  return (
                    <motion.button
                      key={tx.id}
                      type="button"
                      whileTap={{ scale: 0.985 }}
                      onClick={() => setReceiptTx(tx)}
                      className="w-full flex items-center gap-3 px-4 py-3.5 text-left"
                      style={{
                        borderBottom: last ? 'none' : '1px solid var(--border)',
                      }}
                    >
                      <div
                        className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                        style={{ background: 'var(--muted)' }}
                      >
                        <Icon size={18} style={{ color: m.tone }} strokeWidth={2.2} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
                          {tx.type === 'swap'
                            ? `${tx.asset || '—'} → ${tx.assetTo || '—'}`
                            : `${m.label}${tx.asset ? ` · ${tx.asset}` : ''}`}
                        </p>
                        <p
                          style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}
                          className="truncate"
                        >
                          {tx.time}
                          {tx.username ? ` · @${tx.username}` : ''}
                        </p>
                      </div>
                      <div className="text-right flex-shrink-0 pl-2">
                        <p
                          className="tabular-nums"
                          style={{
                            color: m.sign === '+' ? 'var(--positive)' : 'var(--foreground)',
                            fontWeight: 600,
                            fontSize: 13,
                          }}
                        >
                          {amountLine}
                        </p>
                        <div className="flex items-center justify-end gap-1.5 mt-1">
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ background: statusColor(tx.status) }}
                          />
                          <span
                            style={{
                              color: 'var(--muted-foreground)',
                              fontSize: 11,
                              textTransform: 'capitalize',
                            }}
                          >
                            {tx.status}
                          </span>
                        </div>
                        {tx.valueUSD > 0 && tx.type !== 'swap' && (
                          <p
                            className="tabular-nums mt-0.5"
                            style={{ color: 'var(--muted-foreground)', fontSize: 11 }}
                          >
                            {format(tx.valueUSD)}
                          </p>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <TransactionReceipt tx={receiptTx} open={!!receiptTx} onClose={() => setReceiptTx(null)} />
    </div>
  );
}
