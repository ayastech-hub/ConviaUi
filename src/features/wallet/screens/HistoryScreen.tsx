import { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft,
  ChevronDown,
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

const TYPE_OPTIONS: { id: TypeFilter; label: string }[] = [
  { id: 'all', label: 'All types' },
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

const STATUS_OPTIONS: { id: StatusFilter; label: string }[] = [
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

function FilterSelect<T extends string>({
  value,
  onChange,
  options,
  ariaLabel,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
  ariaLabel: string;
}) {
  return (
    <div className="relative flex-1 min-w-0">
      <select
        aria-label={ariaLabel}
        value={value}
        onChange={(e) => onChange(e.target.value as T)}
        className="w-full appearance-none h-11 pl-3.5 pr-9 rounded-2xl text-sm font-semibold outline-none"
        style={{
          background: 'var(--card)',
          border: '1px solid var(--border)',
          color: 'var(--foreground)',
        }}
      >
        {options.map((o) => (
          <option key={o.id} value={o.id}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown
        size={16}
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2"
        style={{ color: 'var(--muted-foreground)' }}
      />
    </div>
  );
}

interface Props {
  goBack: () => void;
}

/** Activity history with type + status dropdown filters. */
export function HistoryScreen({ goBack }: Props) {
  const { format } = useCurrency();
  const { data, loading } = useTransactions(80);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const all = useMemo(() => filterHistoryForUi(data.map(apiTxToUi)), [data]);

  const filtered = useMemo(() => {
    return all.filter((tx) => {
      if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
      if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
      return true;
    });
  }, [all, typeFilter, statusFilter]);

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

  const filtersOn = typeFilter !== 'all' || statusFilter !== 'all';

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />

      <div className="flex items-center gap-3 px-5 mb-4">
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
          </p>
        </div>
        {filtersOn && (
          <button
            type="button"
            onClick={() => {
              setTypeFilter('all');
              setStatusFilter('all');
            }}
            style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Dropdown filters */}
      <div className="flex gap-2.5 px-5 mb-4">
        <FilterSelect
          ariaLabel="Filter by type"
          value={typeFilter}
          onChange={setTypeFilter}
          options={TYPE_OPTIONS}
        />
        <FilterSelect
          ariaLabel="Filter by status"
          value={statusFilter}
          onChange={setStatusFilter}
          options={STATUS_OPTIONS}
        />
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-8">
        {loading && (
          <p className="py-16 text-center" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
            Loading activity…
          </p>
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
            <p className="mt-1 text-center px-6" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
              {filtersOn ? 'Nothing matches these filters.' : 'Activity will appear here.'}
            </p>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.title} className="mb-5">
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
                    style={{ borderBottom: last ? 'none' : '1px solid var(--border)' }}
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
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}>
                        {tx.time}
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
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: statusColor(tx.status) }} />
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
                        <p className="tabular-nums mt-0.5" style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                          {format(tx.valueUSD)}
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
