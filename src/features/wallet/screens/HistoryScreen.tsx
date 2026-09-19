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
  Search,
  SlidersHorizontal,
  X,
  CalendarDays,
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
  { id: 'all', label: 'All activity' },
  { id: 'receive', label: 'Received' },
  { id: 'send', label: 'Sent' },
  { id: 'swap', label: 'Swaps' },
  { id: 'deposit', label: 'Deposits' },
  { id: 'withdraw', label: 'Withdrawals' },
  { id: 'buy', label: 'Buys' },
  { id: 'sell', label: 'Sells' },
  { id: 'onramp', label: 'Buy fiat' },
  { id: 'offramp', label: 'Cash out' },
];

const STATUS_OPTIONS: { id: StatusFilter; label: string }[] = [
  { id: 'all', label: 'Any status' },
  { id: 'confirmed', label: 'Confirmed' },
  { id: 'pending', label: 'Pending' },
  { id: 'failed', label: 'Failed' },
];

const RANGE_OPTIONS = [
  { id: '30d' as const, label: '30D' },
  { id: '90d' as const, label: '90D' },
  { id: '1y' as const, label: '1Y' },
  { id: 'all' as const, label: 'All' },
];

const TX_META: Record<
  string,
  {
    label: string;
    Icon: typeof ArrowDownLeft;
    tone: string;
    sign: string;
    bg: string;
  }
> = {
  receive: {
    label: 'Received',
    Icon: ArrowDownLeft,
    tone: 'var(--positive)',
    sign: '+',
    bg: 'color-mix(in oklab, var(--positive) 13%, transparent)',
  },

  send: {
    label: 'Sent',
    Icon: ArrowUpRight,
    tone: 'var(--foreground)',
    sign: '−',
    bg: 'var(--muted)',
  },

  swap: {
    label: 'Swapped',
    Icon: RefreshCw,
    tone: 'var(--primary)',
    sign: '',
    bg: 'color-mix(in oklab, var(--primary) 13%, transparent)',
  },

  buy: {
    label: 'Bought',
    Icon: Plus,
    tone: 'var(--positive)',
    sign: '+',
    bg: 'color-mix(in oklab, var(--positive) 13%, transparent)',
  },

  sell: {
    label: 'Sold',
    Icon: Minus,
    tone: 'var(--foreground)',
    sign: '−',
    bg: 'var(--muted)',
  },

  offramp: {
    label: 'Cash out',
    Icon: TrendingDown,
    tone: 'var(--foreground)',
    sign: '−',
    bg: 'var(--muted)',
  },

  onramp: {
    label: 'Bought',
    Icon: TrendingUp,
    tone: 'var(--positive)',
    sign: '+',
    bg: 'color-mix(in oklab, var(--positive) 13%, transparent)',
  },

  deposit: {
    label: 'Deposit',
    Icon: ArrowDownLeft,
    tone: 'var(--positive)',
    sign: '+',
    bg: 'color-mix(in oklab, var(--positive) 13%, transparent)',
  },

  withdraw: {
    label: 'Withdraw',
    Icon: ArrowUpRight,
    tone: 'var(--foreground)',
    sign: '−',
    bg: 'var(--muted)',
  },
};

function meta(type: string) {
  return TX_META[type] || TX_META.send;
}

function statusColor(status: string) {
  if (status === 'confirmed') return 'var(--positive)';
  if (status === 'pending') return '#F59E0B';
  if (status === 'failed') return 'var(--destructive)';
  return 'var(--muted-foreground)';
}

function groupByDay(
  txs: Transaction[],
): { label: string; items: Transaction[] }[] {
  const map = new Map<string, Transaction[]>();

  for (const tx of txs) {
    const key = tx.time?.split(',')[0]?.trim() || tx.time || 'Recent';

    if (!map.has(key)) {
      map.set(key, []);
    }

    map.get(key)!.push(tx);
  }

  return Array.from(map.entries()).map(([label, items]) => ({
    label,
    items,
  }));
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
      if (!ref.current?.contains(e.target as Node)) {
        onToggle();
      }
    };

    document.addEventListener('mousedown', onDoc);

    return () => {
      document.removeEventListener('mousedown', onDoc);
    };
  }, [open, onToggle]);

  return (
    <div ref={ref} className="relative z-40">
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 h-9 px-3 rounded-xl flex-shrink-0"
        style={{
          background: open
            ? 'var(--liquid-chip-on-bg)'
            : 'var(--card)',
          color: open
            ? 'var(--liquid-chip-on-text)'
            : 'var(--foreground)',
          border: open
            ? '1px solid var(--liquid-pill-border)'
            : '1px solid var(--border)',
          fontSize: 12,
          fontWeight: 650,
        }}
      >
        {label}
        <ChevronDown
          size={14}
          style={{
            opacity: 0.65,
            transform: open ? 'rotate(180deg)' : undefined,
            transition: 'transform 150ms ease',
          }}
        />
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
            />

            <motion.div
              key="chip-menu"
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.98 }}
              transition={{ duration: 0.14 }}
              className="absolute z-[50] left-0 mt-2 min-w-[190px] max-h-[52vh] overflow-y-auto rounded-2xl shadow-2xl"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
              }}
            >
              {children}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function TransactionRow({
  tx,
  onOpen,
  isLast,
  format,
}: {
  tx: Transaction;
  onOpen: () => void;
  isLast: boolean;
  format: (value: number) => string;
}) {
  const m = meta(tx.type);
  const Icon = m.Icon;

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

  const amountTone =
    m.sign === '+'
      ? 'var(--positive)'
      : m.sign === ''
        ? 'var(--foreground)'
        : 'var(--foreground)';

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.995 }}
      onClick={onOpen}
      className="w-full flex items-center text-left relative"
      style={{
        minHeight: 76,
        borderBottom: isLast
          ? 'none'
          : '1px solid color-mix(in oklab, var(--border) 72%, transparent)',
      }}
    >
      {/* Icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: m.bg,
        }}
      >
        <Icon
          size={17}
          style={{ color: m.tone }}
          strokeWidth={2.35}
        />
      </div>

      {/* Main information */}
      <div className="flex-1 min-w-0 ml-3.5 pr-3">
        <div
          className="truncate"
          style={{
            color: 'var(--foreground)',
            fontWeight: 700,
            fontSize: 13.5,
            letterSpacing: -0.1,
          }}
        >
          {tx.type === 'swap'
            ? `${tx.asset || '—'} → ${tx.assetTo || '—'}`
            : m.label}
        </div>

        <div className="flex items-center gap-1.5 mt-1.5 min-w-0">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{
              background: statusColor(tx.status),
            }}
          />

          <span
            className="truncate"
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 10.5,
              fontWeight: 550,
              textTransform: 'capitalize',
            }}
          >
            {tx.status}
          </span>

          {tx.asset && tx.type !== 'swap' && (
            <>
              <span
                style={{
                  color: 'var(--border)',
                  fontSize: 10,
                }}
              >
                •
              </span>

              <span
                className="truncate"
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: 10.5,
                  fontWeight: 600,
                }}
              >
                {tx.asset}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="text-right flex-shrink-0 max-w-[43%]">
        <div
          className="tabular-nums truncate"
          style={{
            color: amountTone,
            fontWeight: 750,
            fontSize: 13,
            letterSpacing: -0.15,
          }}
        >
          {amountPrimary}
        </div>

        {amountSecondary && (
          <div
            className="tabular-nums truncate mt-1"
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 10.5,
              fontWeight: 500,
            }}
          >
            {amountSecondary}
          </div>
        )}
      </div>
    </motion.button>
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

    if (range === '30d') {
      d.setDate(d.getDate() - 30);
    } else if (range === '90d') {
      d.setDate(d.getDate() - 90);
    } else {
      d.setFullYear(d.getFullYear() - 1);
    }

    return d.toISOString();
  }, [range]);

  const {
    data: apiTxs,
    loading,
    isFetching,
  } = useTransactions(500, {
    since: sinceIso,
  });

  const [typeFilter, setTypeFilter] =
    useState<TypeFilter>('all');

  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>('all');

  const [typeOpen, setTypeOpen] = useState(false);
  const [statusOpen, setStatusOpen] = useState(false);

  const [search, setSearch] = useState('');

  const [receiptTx, setReceiptTx] =
    useState<Transaction | null>(null);

  const txs = useMemo(() => {
    const mapped = filterHistoryForUi(
      (apiTxs || []).map(apiTxToUi),
    );

    const query = search.trim().toLowerCase();

    return mapped.filter((tx) => {
      if (
        typeFilter !== 'all' &&
        tx.type !== typeFilter
      ) {
        return false;
      }

      if (
        statusFilter !== 'all' &&
        tx.status !== statusFilter
      ) {
        return false;
      }

      if (query) {
        const haystack = [
          tx.type,
          tx.status,
          tx.asset,
          tx.assetTo,
          tx.id,
          tx.time,
          String(tx.amount),
          String(tx.amountTo),
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();

        if (!haystack.includes(query)) {
          return false;
        }
      }

      return true;
    });
  }, [
    apiTxs,
    typeFilter,
    statusFilter,
    search,
  ]);

  const groups = useMemo(
    () => groupByDay(txs),
    [txs],
  );

  const typeLabel =
    TYPE_OPTIONS.find(
      (o) => o.id === typeFilter,
    )?.label || 'All activity';

  const statusLabel =
    STATUS_OPTIONS.find(
      (o) => o.id === statusFilter,
    )?.label || 'Any status';

  const hasActiveFilters =
    typeFilter !== 'all' ||
    statusFilter !== 'all' ||
    search.trim().length > 0;

  const clearFilters = () => {
    setTypeFilter('all');
    setStatusFilter('all');
    setSearch('');
    setTypeOpen(false);
    setStatusOpen(false);
  };

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{
        background: 'var(--background)',
      }}
    >
      <PageTop />

      {/* Header */}
      <div className="px-5 pt-1 pb-4">
        <div className="flex items-center gap-3">
          <BackButton onClick={goBack} />

          <div className="flex-1 min-w-0">
            <h1
              style={{
                color: 'var(--foreground)',
                fontWeight: 800,
                fontSize: 20,
                letterSpacing: -0.45,
              }}
            >
              Transactions
            </h1>

            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                style={{
                  color: 'var(--muted-foreground)',
                  fontSize: 11.5,
                }}
              >
                {loading && !txs.length
                  ? 'Loading activity…'
                  : isFetching
                    ? 'Updating activity…'
                    : `${txs.length} ${txs.length === 1 ? 'transaction' : 'transactions'}`}
              </span>

              {isFetching && (
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{
                    background: 'var(--primary)',
                  }}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="px-5 pb-3">
        <div
          className="h-11 rounded-2xl flex items-center gap-2.5 px-3.5"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <Search
            size={17}
            style={{
              color: 'var(--muted-foreground)',
              flexShrink: 0,
            }}
          />

          <input
            value={search}
            onChange={(e) =>
              setSearch(e.target.value)
            }
            placeholder="Search transactions"
            className="flex-1 min-w-0 bg-transparent outline-none"
            style={{
              color: 'var(--foreground)',
              fontSize: 12.5,
              fontWeight: 500,
            }}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                background: 'var(--muted)',
              }}
            >
              <X
                size={13}
                style={{
                  color: 'var(--muted-foreground)',
                }}
              />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background: hasActiveFilters
                ? 'var(--liquid-chip-on-bg)'
                : 'var(--card)',
              color: hasActiveFilters
                ? 'var(--liquid-chip-on-text)'
                : 'var(--muted-foreground)',
              border: hasActiveFilters
                ? '1px solid var(--liquid-pill-border)'
                : '1px solid var(--border)',
            }}
          >
            <SlidersHorizontal size={15} />
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
                    typeFilter === o.id
                      ? 'color-mix(in oklab, var(--primary) 11%, transparent)'
                      : 'transparent',
                  color: 'var(--foreground)',
                  fontSize: 12.5,
                  fontWeight:
                    typeFilter === o.id
                      ? 700
                      : 500,
                }}
              >
                {o.label}

                {typeFilter === o.id && (
                  <Check
                    size={14}
                    style={{
                      color: 'var(--primary)',
                    }}
                  />
                )}
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
                    statusFilter === o.id
                      ? 'color-mix(in oklab, var(--primary) 11%, transparent)'
                      : 'transparent',
                  color: 'var(--foreground)',
                  fontSize: 12.5,
                  fontWeight:
                    statusFilter === o.id
                      ? 700
                      : 500,
                }}
              >
                {o.label}

                {statusFilter === o.id && (
                  <Check
                    size={14}
                    style={{
                      color: 'var(--primary)',
                    }}
                  />
                )}
              </button>
            ))}
          </FilterChip>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-9 px-3 rounded-xl flex items-center gap-1.5 flex-shrink-0"
              style={{
                color: 'var(--muted-foreground)',
                background: 'transparent',
                fontSize: 11.5,
                fontWeight: 650,
              }}
            >
              <X size={13} />
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Date range */}
      <div className="px-5 pb-4">
        <div
          className="h-10 p-1 rounded-xl flex items-center"
          style={{
            background: 'var(--muted)',
            border: '1px solid var(--border)',
          }}
        >
          {RANGE_OPTIONS.map((r) => {
            const active = range === r.id;

            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setRange(r.id)}
                className="flex-1 h-full rounded-[9px] transition-all"
                style={{
                  background: active
                    ? 'var(--card)'
                    : 'transparent',
                  color: active
                    ? 'var(--foreground)'
                    : 'var(--muted-foreground)',
                  boxShadow: active
                    ? '0 1px 3px color-mix(in oklab, var(--foreground) 10%, transparent)'
                    : 'none',
                  fontSize: 11,
                  fontWeight: active ? 750 : 600,
                }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transaction list */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-10">
        {/* Loading */}
        {loading && !txs.length && (
          <div
            className="overflow-hidden rounded-2xl"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-[76px] mx-3 border-b last:border-b-0 animate-pulse"
                style={{
                  borderColor: 'var(--border)',
                }}
              >
                <div className="flex items-center h-full gap-3">
                  <div
                    className="w-10 h-10 rounded-xl"
                    style={{
                      background: 'var(--muted)',
                    }}
                  />

                  <div className="flex-1 space-y-2">
                    <div
                      className="h-3.5 w-24 rounded"
                      style={{
                        background: 'var(--muted)',
                      }}
                    />

                    <div
                      className="h-2.5 w-16 rounded"
                      style={{
                        background: 'var(--muted)',
                      }}
                    />
                  </div>

                  <div
                    className="h-3.5 w-20 rounded"
                    style={{
                      background: 'var(--muted)',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty */}
        {!loading && txs.length === 0 && (
          <div className="flex flex-col items-center justify-center pt-16 px-8 text-center">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
              }}
            >
              {search || hasActiveFilters ? (
                <Search
                  size={23}
                  style={{
                    color: 'var(--muted-foreground)',
                  }}
                />
              ) : (
                <Inbox
                  size={23}
                  style={{
                    color: 'var(--muted-foreground)',
                  }}
                />
              )}
            </div>

            <p
              style={{
                color: 'var(--foreground)',
                fontWeight: 750,
                fontSize: 15,
              }}
            >
              {search || hasActiveFilters
                ? 'No matching transactions'
                : 'No activity yet'}
            </p>

            <p
              className="mt-1.5"
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 12,
                lineHeight: 1.5,
                maxWidth: 270,
              }}
            >
              {search || hasActiveFilters
                ? 'Try a different search or clear your filters.'
                : 'Deposits, swaps, transfers, and other wallet activity will appear here.'}
            </p>

            {(search || hasActiveFilters) && (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-4 h-9 px-4 rounded-xl"
                style={{
                  background: 'var(--muted)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  fontSize: 12,
                  fontWeight: 650,
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {/* Groups */}
        {!loading &&
          groups.map((group) => (
            <section
              key={group.label}
              className="mb-6"
            >
              {/* Date header */}
              <div className="flex items-center justify-between px-1 mb-2">
                <div className="flex items-center gap-2">
                  <CalendarDays
                    size={13}
                    style={{
                      color: 'var(--muted-foreground)',
                    }}
                  />

                  <span
                    style={{
                      color: 'var(--foreground)',
                      fontSize: 11,
                      fontWeight: 750,
                      letterSpacing: 0.25,
                    }}
                  >
                    {group.label}
                  </span>
                </div>

                <span
                  style={{
                    color: 'var(--muted-foreground)',
                    fontSize: 10,
                    fontWeight: 550,
                  }}
                >
                  {group.items.length}{' '}
                  {group.items.length === 1
                    ? 'transaction'
                    : 'transactions'}
                </span>
              </div>

              {/* Ledger */}
              <div
                className="px-3 rounded-2xl overflow-hidden"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                {group.items.map((tx, i) => (
                  <TransactionRow
                    key={tx.id}
                    tx={tx}
                    format={format}
                    isLast={
                      i === group.items.length - 1
                    }
                    onOpen={() =>
                      setReceiptTx(tx)
                    }
                  />
                ))}
              </div>
            </section>
          ))}
      </div>

      <TransactionReceipt
        tx={receiptTx}
        open={!!receiptTx}
        onClose={() => setReceiptTx(null)}
      />
    </div>
  );
}