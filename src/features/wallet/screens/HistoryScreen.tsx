import { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronDown,
  Check,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  Inbox,
  SlidersHorizontal,
} from 'lucide-react';
import type { Transaction } from '../../../shared/data/mockData';
import { TransactionReceipt } from '../../../shared/components/TransactionReceipt';
import { formatTokenAmount } from '../../../shared/utils/formatAmount';
import { PageTop } from '../../../shared/components/PageTop';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { useTransactions } from '../../../shared/hooks/useTransactions';
import { apiTxToUi, filterHistoryForUi } from '../../../shared/utils/mapApiToUi';
import { BackButton } from '../../../shared/components/BackButton';

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

const TYPE_OPTIONS: { id: TypeFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'receive', label: 'Received' },
  { id: 'send', label: 'Sent' },
  { id: 'swap', label: 'Swap' },
  { id: 'deposit', label: 'Deposit' },
  { id: 'withdraw', label: 'Withdraw' },
  { id: 'buy', label: 'Buy' },
  { id: 'sell', label: 'Sell' },
  { id: 'onramp', label: 'Buy fiat' },
  { id: 'offramp', label: 'Cash out' },
];

const STATUS_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Any status' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'pending', label: 'Pending' },
  { id: 'failed', label: 'Failed' },
];

const TX_META: Record<
  string,
  { label: string; Icon: typeof ArrowDownLeft; tone: string; sign: string; bg: string }
> = {
  receive: { label: 'Received', Icon: ArrowDownLeft, tone: 'var(--positive)', sign: '+', bg: 'color-mix(in oklab, var(--positive) 14%, transparent)' },
  send: { label: 'Sent', Icon: ArrowUpRight, tone: 'var(--foreground)', sign: '−', bg: 'var(--muted)' },
  swap: { label: 'Swapped', Icon: RefreshCw, tone: 'var(--primary)', sign: '', bg: 'color-mix(in oklab, var(--primary) 14%, transparent)' },
  buy: { label: 'Bought', Icon: Plus, tone: 'var(--positive)', sign: '+', bg: 'color-mix(in oklab, var(--positive) 14%, transparent)' },
  sell: { label: 'Sold', Icon: Minus, tone: 'var(--foreground)', sign: '−', bg: 'var(--muted)' },
  offramp: { label: 'Cash out', Icon: TrendingDown, tone: 'var(--foreground)', sign: '−', bg: 'var(--muted)' },
  onramp: { label: 'Bought', Icon: TrendingUp, tone: 'var(--positive)', sign: '+', bg: 'color-mix(in oklab, var(--positive) 14%, transparent)' },
  deposit: { label: 'Deposit', Icon: ArrowDownLeft, tone: 'var(--positive)', sign: '+', bg: 'color-mix(in oklab, var(--positive) 14%, transparent)' },
  withdraw: { label: 'Withdraw', Icon: ArrowUpRight, tone: 'var(--foreground)', sign: '−', bg: 'var(--muted)' },
};

function meta(type: string) {
  return TX_META[type] || TX_META.send;
}

function statusColor(s: string) {
  if (s === 'confirmed') return 'var(--positive)';
  if (s === 'pending') return '#F59E0B';
  if (s === 'failed') return 'var(--destructive)';
  return 'var(--muted-foreground)';
}

function groupByDay(txs: Transaction[]): { label: string; items: Transaction[] }[] {
  const map = new Map<string, Transaction[]>();
  for (const tx of txs) {
    const key = tx.time?.split(',')[0]?.trim() || tx.time || 'Recent';
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(tx);
  }
  return Array.from(map.entries()).map(([label, items]) => ({ label, items }));
}

function FilterChip({
  open,
  label,
  onToggle,
  children,
}: {
  open: boolean;
  label: string;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onToggle();
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open, onToggle]);

  return (
    <div ref={ref} className="relative z-30">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 h-9 px-3.5 rounded-full"
        style={{
          background: open ? 'var(--liquid-chip-on-bg)' : 'var(--muted)',
          color: open ? 'var(--liquid-chip-on-text)' : 'var(--foreground)',
          border: open ? '1px solid var(--liquid-pill-border)' : '1px solid var(--border)',
          fontSize: 12,
          fontWeight: 650,
        }}
      >
        {label}
        <ChevronDown size={14} style={{ opacity: 0.7 }} />
      </button>
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="chip-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[45]"
              style={{ background: 'transparent' }}
              onClick={onToggle}
            />
            <motion.div
              key="chip-menu"
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4 }}
              transition={{ duration: 0.15 }}
              className="absolute z-[50] left-0 mt-2 min-w-[200px] max-h-[50vh] overflow-y-auto rounded-2xl shadow-xl"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

interface Props {
  goBack: () => void;
}

export function HistoryScreen({ goBack }: Props) {
  const { format } = useCurrency();
  const [range, setRange] = useState<'30d' | '90d' | '1y' | 'all'>('1y');
  const sinceIso = useMemo(() => {
    if (range === 'all') return undefined;
    const d = new Date();
    if (range === '30d') d.setDate(d.getDate() - 30);
    else if (range === '90d') d.setDate(d.getDate() - 90);
    else d.setFullYear(d.getFullYear() - 1);
    return d.toISOString();
  }, [range]);
  const { data: apiTxs, loading, isFetching } = useTransactions(500, { since: sinceIso });
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [typeOpen, setTypeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  

  const txs = useMemo(() => {
    const mapped = filterHistoryForUi((apiTxs || []).map(apiTxToUi));
    return mapped.filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      return true;
    });
  }, [apiTxs, typeFilter, statusFilter]);

  const groups = useMemo(() => groupByDay(txs), [txs]);
  const typeLabel = TYPE_OPTIONS.find((o) => o.id === typeFilter)?.label || 'All';
  const statusLabel = STATUS_OPTIONS.find((o) => o.id === statusFilter)?.label || 'Any status';

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />

      {/* Header */}
      <div className="flex items-center gap-3 px-5 mb-1">
        <BackButton onClick={goBack} />
        <div className="flex-1 min-w-0">
          <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18, letterSpacing: -0.3 }}>
            Transactions
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 1 }}>
            {loading && !txs.length ? 'Loading…' : isFetching ? 'Updating…' : 'Your wallet history'}
          </p>
        </div>
      </div>
      {/* Filters */}
      <div className="px-5 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar relative z-20">
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <SlidersHorizontal size={15} style={{ color: 'var(--muted-foreground)' }} />
        </div>
        <FilterChip
          open={typeOpen}
          label={typeLabel}
          onToggle={() => {
            setTypeOpen((o) => !o);
            setStatusOpen(false);
          }}
        >
          {TYPE_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                setTypeFilter(o.id);
                setTypeOpen(false);
              }}
              className="flex items-center justify-between w-full px-3.5 py-2.5 text-left"
              style={{
                background:
                  typeFilter === o.id ? 'color-mix(in oklab, var(--primary) 12%, transparent)' : 'transparent',
                color: 'var(--foreground)',
                fontSize: 13,
                fontWeight: typeFilter === o.id ? 700 : 500,
              }}
            >
              {o.label}
              {typeFilter === o.id && <Check size={14} style={{ color: 'var(--primary)' }} />}
            </button>
          ))}
        </FilterChip>
        <FilterChip
          open={statusOpen}
          label={statusLabel}
          onToggle={() => {
            setStatusOpen((o) => !o);
            setTypeOpen(false);
          }}
        >
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => {
                setStatusFilter(o.id);
                setStatusOpen(false);
              }}
              className="flex items-center justify-between w-full px-3.5 py-2.5 text-left"
              style={{
                background:
                  statusFilter === o.id ? 'color-mix(in oklab, var(--primary) 12%, transparent)' : 'transparent',
                color: 'var(--foreground)',
                fontSize: 13,
                fontWeight: statusFilter === o.id ? 700 : 500,
              }}
            >
              {o.label}
              {statusFilter === o.id && <Check size={14} style={{ color: 'var(--primary)' }} />}
            </button>
          ))}
        </FilterChip>
      </div>

      {/* Date range */}
      <div className="px-5 pb-2 flex items-center gap-2 overflow-x-auto no-scrollbar">
        {([
          { id: '30d' as const, label: '30 days' },
          { id: '90d' as const, label: '90 days' },
          { id: '1y' as const, label: '1 year' },
          { id: 'all' as const, label: 'All time' },
        ]).map((r) => (
          <button
            key={r.id}
            type="button"
            onClick={() => setRange(r.id)}
            className="h-8 px-3 rounded-full"
            style={{
              background: range === r.id ? 'var(--liquid-chip-on-bg)' : 'var(--muted)',
              color: range === r.id ? 'var(--liquid-chip-on-text)' : 'var(--foreground)',
              border: range === r.id ? '1px solid var(--liquid-pill-border)' : '1px solid var(--border)',
              fontSize: 11,
              fontWeight: 650,
            }}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-5 pb-10">
        {loading && !txs.length && (
          <div className="space-y-3 pt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div
                key={i}
                className="h-[72px] rounded-2xl animate-pulse"
                style={{ background: 'var(--muted)' }}
              />
            ))}
          </div>
        )}

        {!loading && txs.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-16 px-6 text-center">
            <div
              className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <Inbox size={28} style={{ color: 'var(--muted-foreground)' }} />
            </div>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>No activity yet</p>
            <p className="mt-1.5" style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.45 }}>
              Deposits, swaps, and transfers will show up here.
            </p>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.label} className="mb-5">
            <p
              className="px-1 mb-2 sticky top-0 z-10 py-1"
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 11,
                fontWeight: 700,
                letterSpacing: 0.5,
                textTransform: 'uppercase',
                background: 'var(--background)',
              }}
            >
              {group.label}
            </p>
            <div
              className="rounded-[20px] overflow-hidden"
              style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            >
              {group.items.map((tx, i) => {
                const m = meta(tx.type);
                const Icon = m.Icon;
                const last = i === group.items.length - 1;
                const amountPrimary =
                  tx.type === 'swap'
                    ? `${formatTokenAmount(tx.amount)} ${tx.asset || ''}`
                    : `${m.sign}${formatTokenAmount(tx.amount)} ${tx.asset || ''}`;
                const amountSecondary =
                  tx.type === 'swap'
                    ? `→ ${formatTokenAmount(tx.amountTo)} ${tx.assetTo || ''}`
                    : tx.valueUSD > 0
                      ? format(tx.valueUSD)
                      : null;

                return (
                  <motion.button
                    key={tx.id}
                    type="button"
                    whileTap={{ scale: 0.99 }}
                    onClick={() => setReceiptTx(tx)}
                    className="flex items-center gap-3 w-full px-3.5 py-3.5 text-left"
                    style={{
                      borderBottom: last ? 'none' : '1px solid var(--border)',
                    }}
                  >
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0"
                      style={{ background: m.bg }}
                    >
                      <Icon size={18} style={{ color: m.tone }} strokeWidth={2.25} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p
                        className="truncate"
                        style={{ color: 'var(--foreground)', fontWeight: 650, fontSize: 14 }}
                      >
                        {tx.type === 'swap'
                          ? `${tx.asset || '—'} → ${tx.assetTo || '—'}`
                          : m.label}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0"
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
                        {tx.asset && tx.type !== 'swap' && (
                          <>
                            <span style={{ color: 'var(--border)', fontSize: 11 }}>·</span>
                            <span style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>
                              {tx.asset}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 pl-2 max-w-[42%]">
                      <p
                        className="tabular-nums truncate"
                        style={{
                          color: m.sign === '+' ? 'var(--positive)' : 'var(--foreground)',
                          fontWeight: 700,
                          fontSize: 13,
                        }}
                      >
                        {amountPrimary}
                      </p>
                      {amountSecondary && (
                        <p
                          className="tabular-nums truncate mt-0.5"
                          style={{ color: 'var(--muted-foreground)', fontSize: 11 }}
                        >
                          {amountSecondary}
                        </p>
                      )}
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <TransactionReceipt tx={receiptTx} open={!!receiptTx} onClose={() => setReceiptTx(null)} />
    </div>
  );
}
