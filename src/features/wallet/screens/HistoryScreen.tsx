import { useMemo, useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft,
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

function DropdownFilter<T extends string>({
  value,
  onChange,
  options,
  label,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
  label: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = options.find((o) => o.id === value)?.label ?? label;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  return (
    <div className="relative flex-1 min-w-0" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between gap-2 h-11 px-3.5 rounded-2xl text-left"
        style={{
          background: open ? 'var(--muted)' : 'var(--card)',
          border: `1px solid ${open ? 'var(--primary)' : 'var(--border)'}`,
        }}
      >
        <div className="min-w-0">
          <p style={{ color: 'var(--muted-foreground)', fontSize: 10, fontWeight: 600, letterSpacing: 0.3 }}>
            {label}
          </p>
          <p
            className="truncate"
            style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600, marginTop: 1 }}
          >
            {selected}
          </p>
        </div>
        <ChevronDown
          size={16}
          style={{
            color: 'var(--muted-foreground)',
            transform: open ? 'rotate(180deg)' : undefined,
            transition: 'transform 0.15s',
            flexShrink: 0,
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-[calc(100%+6px)] z-40 rounded-2xl overflow-hidden max-h-56 overflow-y-auto"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              boxShadow: '0 16px 40px rgba(0,0,0,0.35)',
            }}
          >
            {options.map((o) => {
              const active = o.id === value;
              return (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    onChange(o.id);
                    setOpen(false);
                  }}
                  className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 text-left"
                  style={{
                    background: active ? 'var(--muted)' : 'transparent',
                    borderBottom: '1px solid var(--border)',
                  }}
                >
                  <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: active ? 700 : 500 }}>
                    {o.label}
                  </span>
                  {active && <Check size={14} style={{ color: 'var(--primary)' }} />}
                </button>
              );
            })}
          </motion.div>
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
  const { data, loading } = useTransactions(80);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const all = useMemo(() => filterHistoryForUi(data.map(apiTxToUi)), [data]);
  const filtered = useMemo(
    () =>
      all.filter((tx) => {
        if (typeFilter !== 'all' && tx.type !== typeFilter) return false;
        if (statusFilter !== 'all' && tx.status !== statusFilter) return false;
        return true;
      }),
    [all, typeFilter, statusFilter],
  );

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    for (const tx of filtered) {
      const k = groupKey(tx.time);
      if (!map.has(k)) map.set(k, []);
      map.get(k)!.push(tx);
    }
    return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({ title: g, items: map.get(g)! }));
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
        <h1 className="flex-1" style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22 }}>
          History
        </h1>
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

      <div className="flex gap-2.5 px-5 mb-4 relative z-30">
        <DropdownFilter label="Type" value={typeFilter} onChange={setTypeFilter} options={TYPE_OPTIONS} />
        <DropdownFilter
          label="Status"
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
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2 }}>{tx.time}</p>
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
