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
  ChevronRight,
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

type RangeFilter = '30d' | '90d' | '1y' | 'all' | 'custom';

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

const QUICK_DATE_OPTIONS: {
  id: RangeFilter;
  label: string;
  description: string;
}[] = [
  {
    id: '30d',
    label: 'Last 30 days',
    description: 'Transactions from the last 30 days',
  },
  {
    id: '90d',
    label: 'Last 90 days',
    description: 'Transactions from the last 90 days',
  },
  {
    id: '1y',
    label: 'Last year',
    description: 'Transactions from the last 12 months',
  },
  {
    id: 'all',
    label: 'All time',
    description: 'Your complete transaction history',
  },
];

const TX_META: Record<
  string,
  {
    label: string;
    Icon: typeof ArrowDownLeft;
    sign: string;
  }
> = {
  receive: {
    label: 'Received',
    Icon: ArrowDownLeft,
    sign: '+',
  },

  send: {
    label: 'Sent',
    Icon: ArrowUpRight,
    sign: '−',
  },

  swap: {
    label: 'Swapped',
    Icon: RefreshCw,
    sign: '',
  },

  buy: {
    label: 'Bought',
    Icon: Plus,
    sign: '+',
  },

  sell: {
    label: 'Sold',
    Icon: Minus,
    sign: '−',
  },

  offramp: {
    label: 'Cash out',
    Icon: TrendingDown,
    sign: '−',
  },

  onramp: {
    label: 'Bought',
    Icon: TrendingUp,
    sign: '+',
  },

  deposit: {
    label: 'Deposit',
    Icon: ArrowDownLeft,
    sign: '+',
  },

  withdraw: {
    label: 'Withdraw',
    Icon: ArrowUpRight,
    sign: '−',
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
    const key =
      tx.time?.split(',')[0]?.trim() ||
      tx.time ||
      'Recent';

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

/* -------------------------------------------------------------------------- */
/* Filter chip                                                                */
/* -------------------------------------------------------------------------- */

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
    <div
      ref={ref}
      className={`relative flex-shrink-0 ${
        open ? 'z-[80]' : 'z-30'
      }`}
    >
      <button
        type="button"
        onClick={onToggle}
        className="flex items-center gap-1.5 h-9 px-3 rounded-xl"
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
            transform: open
              ? 'rotate(180deg)'
              : undefined,
            transition: 'transform 150ms ease',
          }}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="chip-menu"
            initial={{
              opacity: 0,
              y: 5,
              scale: 0.98,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: 4,
              scale: 0.98,
            }}
            transition={{
              duration: 0.14,
            }}
            className="absolute z-[90] left-0 mt-2 min-w-[190px] max-h-[52vh] overflow-y-auto rounded-2xl shadow-2xl"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Date filter                                                                */
/* -------------------------------------------------------------------------- */

function DateFilterSheet({
  open,
  range,
  customFrom,
  customTo,
  onClose,
  onApply,
}: {
  open: boolean;
  range: RangeFilter;
  customFrom: string;
  customTo: string;
  onClose: () => void;
  onApply: (
    range: RangeFilter,
    from: string,
    to: string,
  ) => void;
}) {
  const [draftRange, setDraftRange] =
    useState<RangeFilter>(range);

  const [draftFrom, setDraftFrom] =
    useState(customFrom);

  const [draftTo, setDraftTo] =
    useState(customTo);

  useEffect(() => {
    if (!open) return;

    setDraftRange(range);
    setDraftFrom(customFrom);
    setDraftTo(customTo);
  }, [open, range, customFrom, customTo]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', onKey);

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        'keydown',
        onKey,
      );
    };
  }, [open, onClose]);

  if (!open) return null;

  const canApplyCustom =
    draftRange !== 'custom' ||
    (!!draftFrom && !!draftTo);

  return (
    <AnimatePresence>
      <motion.div
        key="date-sheet"
        className="fixed inset-0 z-[120] flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          background:
            'color-mix(in oklab, var(--background) 72%, transparent)',
          backdropFilter: 'blur(3px)',
        }}
        onMouseDown={(e) => {
          if (e.target === e.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{
            y: '100%',
          }}
          animate={{
            y: 0,
          }}
          exit={{
            y: '100%',
          }}
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 34,
          }}
          className="w-full max-w-[520px] rounded-t-[28px] overflow-hidden"
          style={{
            background: 'var(--card)',
            borderTop: '1px solid var(--border)',
            boxShadow:
              '0 -18px 50px color-mix(in oklab, var(--background) 35%, transparent)',
          }}
          onMouseDown={(e) =>
            e.stopPropagation()
          }
        >
          {/* Handle */}
          <div className="flex justify-center pt-3">
            <div
              className="w-10 h-1 rounded-full"
              style={{
                background: 'var(--border)',
              }}
            />
          </div>

          {/* Header */}
          <div className="px-5 pt-4 pb-3 flex items-center justify-between">
            <div>
              <h2
                style={{
                  color: 'var(--foreground)',
                  fontSize: 17,
                  fontWeight: 800,
                  letterSpacing: -0.25,
                }}
              >
                Date
              </h2>

              <p
                className="mt-0.5"
                style={{
                  color:
                    'var(--muted-foreground)',
                  fontSize: 11.5,
                }}
              >
                Choose the period to show
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background: 'var(--muted)',
                border:
                  '1px solid var(--border)',
              }}
            >
              <X
                size={17}
                style={{
                  color:
                    'var(--muted-foreground)',
                }}
              />
            </button>
          </div>

          {/* Quick ranges */}
          <div className="px-5 pb-2">
            {QUICK_DATE_OPTIONS.map((option) => {
              const active =
                draftRange === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    setDraftRange(option.id)
                  }
                  className="w-full flex items-center text-left py-3.5"
                  style={{
                    borderBottom:
                      '1px solid color-mix(in oklab, var(--border) 65%, transparent)',
                  }}
                >
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{
                      background: active
                        ? 'var(--liquid-chip-on-bg)'
                        : 'var(--muted)',
                    }}
                  >
                    <CalendarDays
                      size={16}
                      style={{
                        color: active
                          ? 'var(--liquid-chip-on-text)'
                          : 'var(--muted-foreground)',
                      }}
                    />
                  </div>

                  <div className="ml-3 flex-1 min-w-0">
                    <div
                      style={{
                        color:
                          'var(--foreground)',
                        fontSize: 13,
                        fontWeight: active
                          ? 750
                          : 650,
                      }}
                    >
                      {option.label}
                    </div>

                    <div
                      className="mt-0.5"
                      style={{
                        color:
                          'var(--muted-foreground)',
                        fontSize: 10.5,
                      }}
                    >
                      {option.description}
                    </div>
                  </div>

                  {active && (
                    <Check
                      size={17}
                      style={{
                        color:
                          'var(--primary)',
                      }}
                    />
                  )}
                </button>
              );
            })}

            {/* Custom */}
            <button
              type="button"
              onClick={() =>
                setDraftRange('custom')
              }
              className="w-full flex items-center text-left py-3.5"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    draftRange === 'custom'
                      ? 'var(--liquid-chip-on-bg)'
                      : 'var(--muted)',
                }}
              >
                <CalendarDays
                  size={16}
                  style={{
                    color:
                      draftRange === 'custom'
                        ? 'var(--liquid-chip-on-text)'
                        : 'var(--muted-foreground)',
                  }}
                />
              </div>

              <div className="ml-3 flex-1">
                <div
                  style={{
                    color:
                      'var(--foreground)',
                    fontSize: 13,
                    fontWeight:
                      draftRange === 'custom'
                        ? 750
                        : 650,
                  }}
                >
                  Custom range
                </div>

                <div
                  className="mt-0.5"
                  style={{
                    color:
                      'var(--muted-foreground)',
                    fontSize: 10.5,
                  }}
                >
                  Choose exact start and end dates
                </div>
              </div>

              {draftRange === 'custom' ? (
                <Check
                  size={17}
                  style={{
                    color:
                      'var(--primary)',
                  }}
                />
              ) : (
                <ChevronRight
                  size={16}
                  style={{
                    color:
                      'var(--muted-foreground)',
                  }}
                />
              )}
            </button>
          </div>

          {/* Custom dates */}
          <AnimatePresence initial={false}>
            {draftRange === 'custom' && (
              <motion.div
                initial={{
                  height: 0,
                  opacity: 0,
                }}
                animate={{
                  height: 'auto',
                  opacity: 1,
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                }}
                className="overflow-hidden"
              >
                <div
                  className="mx-5 p-3.5 rounded-2xl"
                  style={{
                    background:
                      'var(--muted)',
                    border:
                      '1px solid var(--border)',
                  }}
                >
                  <div className="grid grid-cols-2 gap-3">
                    <label>
                      <span
                        className="block mb-1.5"
                        style={{
                          color:
                            'var(--muted-foreground)',
                          fontSize: 10.5,
                          fontWeight: 650,
                        }}
                      >
                        From
                      </span>

                      <input
                        type="date"
                        value={draftFrom}
                        max={
                          draftTo ||
                          undefined
                        }
                        onChange={(e) =>
                          setDraftFrom(
                            e.target.value,
                          )
                        }
                        className="w-full h-10 px-3 rounded-xl outline-none"
                        style={{
                          color:
                            'var(--foreground)',
                          background:
                            'var(--card)',
                          border:
                            '1px solid var(--border)',
                          fontSize: 11.5,
                        }}
                      />
                    </label>

                    <label>
                      <span
                        className="block mb-1.5"
                        style={{
                          color:
                            'var(--muted-foreground)',
                          fontSize: 10.5,
                          fontWeight: 650,
                        }}
                      >
                        To
                      </span>

                      <input
                        type="date"
                        value={draftTo}
                        min={
                          draftFrom ||
                          undefined
                        }
                        onChange={(e) =>
                          setDraftTo(
                            e.target.value,
                          )
                        }
                        className="w-full h-10 px-3 rounded-xl outline-none"
                        style={{
                          color:
                            'var(--foreground)',
                          background:
                            'var(--card)',
                          border:
                            '1px solid var(--border)',
                          fontSize: 11.5,
                        }}
                      />
                    </label>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Apply */}
          <div
            className="px-5 pt-4 pb-5"
            style={{
              paddingBottom:
                'max(20px, env(safe-area-inset-bottom))',
            }}
          >
            <button
              type="button"
              disabled={!canApplyCustom}
              onClick={() => {
                onApply(
                  draftRange,
                  draftFrom,
                  draftTo,
                );
              }}
              className="w-full h-11 rounded-xl transition-opacity"
              style={{
                background:
                  canApplyCustom
                    ? 'var(--primary)'
                    : 'var(--muted)',
                color:
                  canApplyCustom
                    ? 'var(--primary-foreground)'
                    : 'var(--muted-foreground)',
                fontSize: 12.5,
                fontWeight: 750,
                opacity: canApplyCustom
                  ? 1
                  : 0.6,
              }}
            >
              Apply date filter
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

/* -------------------------------------------------------------------------- */
/* Transaction row                                                            */
/* -------------------------------------------------------------------------- */

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
      : 'var(--foreground)';

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.995 }}
      onClick={onOpen}
      className="w-full flex items-center text-left"
      style={{
        minHeight: 76,
        borderBottom: isLast
          ? 'none'
          : '1px solid color-mix(in oklab, var(--border) 72%, transparent)',
      }}
    >
      {/* Neutral transaction icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background: 'var(--muted)',
          border:
            '1px solid color-mix(in oklab, var(--border) 80%, transparent)',
        }}
      >
        <Icon
          size={17}
          style={{
            color: 'var(--muted-foreground)',
          }}
          strokeWidth={2.2}
        />
      </div>

      {/* Main */}
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
              background:
                statusColor(tx.status),
            }}
          />

          <span
            className="truncate"
            style={{
              color:
                'var(--muted-foreground)',
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
                  color:
                    'var(--muted-foreground)',
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
              color:
                'var(--muted-foreground)',
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

/* -------------------------------------------------------------------------- */
/* Screen                                                                     */
/* -------------------------------------------------------------------------- */

interface Props {
  goBack: () => void;
}

export function HistoryScreen({ goBack }: Props) {
  const { format } = useCurrency();

  const [range, setRange] =
    useState<RangeFilter>('1y');

  const [customFrom, setCustomFrom] =
    useState('');

  const [customTo, setCustomTo] =
    useState('');

  const [dateOpen, setDateOpen] =
    useState(false);

  const sinceIso = useMemo(() => {
    if (range === 'all') {
      return undefined;
    }

    if (
      range === 'custom' &&
      customFrom
    ) {
      return new Date(
        `${customFrom}T00:00:00`,
      ).toISOString();
    }

    const d = new Date();

    if (range === '30d') {
      d.setDate(d.getDate() - 30);
    } else if (range === '90d') {
      d.setDate(d.getDate() - 90);
    } else {
      d.setFullYear(
        d.getFullYear() - 1,
      );
    }

    return d.toISOString();
  }, [
    range,
    customFrom,
  ]);

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

  const [typeOpen, setTypeOpen] =
    useState(false);

  const [statusOpen, setStatusOpen] =
    useState(false);

  const [search, setSearch] =
    useState('');

  const [receiptTx, setReceiptTx] =
    useState<Transaction | null>(null);

  const txs = useMemo(() => {
    const mapped =
      filterHistoryForUi(
        (apiTxs || []).map(apiTxToUi),
      );

    const query =
      search.trim().toLowerCase();

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

        if (
          !haystack.includes(query)
        ) {
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

  const dateLabel =
    range === '30d'
      ? '30 days'
      : range === '90d'
        ? '90 days'
        : range === '1y'
          ? '1 year'
          : range === 'all'
            ? 'All time'
            : customFrom && customTo
              ? `${customFrom} – ${customTo}`
              : 'Custom range';

  const hasActiveFilters =
    typeFilter !== 'all' ||
    statusFilter !== 'all' ||
    search.trim().length > 0 ||
    range !== '1y';

  const clearFilters = () => {
    setTypeFilter('all');
    setStatusFilter('all');
    setSearch('');
    setRange('1y');
    setCustomFrom('');
    setCustomTo('');
    setTypeOpen(false);
    setStatusOpen(false);
  };

  return (
    <div
      className="flex flex-col h-full overflow-hidden"
      style={{
        background:
          'var(--background)',
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
                color:
                  'var(--foreground)',
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
                  color:
                    'var(--muted-foreground)',
                  fontSize: 11.5,
                }}
              >
                {loading && !txs.length
                  ? 'Loading activity…'
                  : isFetching
                    ? 'Updating activity…'
                    : `${txs.length} ${
                        txs.length === 1
                          ? 'transaction'
                          : 'transactions'
                      }`}
              </span>

              {isFetching && (
                <span
                  className="w-1.5 h-1.5 rounded-full animate-pulse"
                  style={{
                    background:
                      'var(--primary)',
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
            background:
              'var(--card)',
            border:
              '1px solid var(--border)',
          }}
        >
          <Search
            size={17}
            style={{
              color:
                'var(--muted-foreground)',
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
              color:
                'var(--foreground)',
              fontSize: 12.5,
              fontWeight: 500,
            }}
          />

          {search && (
            <button
              type="button"
              onClick={() =>
                setSearch('')
              }
              className="w-6 h-6 rounded-full flex items-center justify-center"
              style={{
                background:
                  'var(--muted)',
              }}
            >
              <X
                size={13}
                style={{
                  color:
                    'var(--muted-foreground)',
                }}
              />
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="px-5 pb-4 relative z-30">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* Filter icon */}
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
            style={{
              background:
                hasActiveFilters
                  ? 'var(--liquid-chip-on-bg)'
                  : 'var(--card)',
              color:
                hasActiveFilters
                  ? 'var(--liquid-chip-on-text)'
                  : 'var(--muted-foreground)',
              border:
                hasActiveFilters
                  ? '1px solid var(--liquid-pill-border)'
                  : '1px solid var(--border)',
            }}
          >
            <SlidersHorizontal
              size={15}
            />
          </div>

          {/* Type */}
          <FilterChip
            open={typeOpen}
            label={typeLabel}
            onToggle={() => {
              setTypeOpen(
                (o) => !o,
              );
              setStatusOpen(false);
            }}
          >
            {TYPE_OPTIONS.map(
              (o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setTypeFilter(
                      o.id,
                    );
                    setTypeOpen(
                      false,
                    );
                  }}
                  className="flex items-center justify-between w-full px-3.5 py-2.5 text-left"
                  style={{
                    background:
                      typeFilter ===
                      o.id
                        ? 'color-mix(in oklab, var(--primary) 11%, transparent)'
                        : 'transparent',
                    color:
                      'var(--foreground)',
                    fontSize: 12.5,
                    fontWeight:
                      typeFilter ===
                      o.id
                        ? 700
                        : 500,
                  }}
                >
                  {o.label}

                  {typeFilter ===
                    o.id && (
                    <Check
                      size={14}
                      style={{
                        color:
                          'var(--primary)',
                      }}
                    />
                  )}
                </button>
              ),
            )}
          </FilterChip>

          {/* Status */}
          <FilterChip
            open={statusOpen}
            label={statusLabel}
            onToggle={() => {
              setStatusOpen(
                (o) => !o,
              );
              setTypeOpen(false);
            }}
          >
            {STATUS_OPTIONS.map(
              (o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(
                      o.id,
                    );
                    setStatusOpen(
                      false,
                    );
                  }}
                  className="flex items-center justify-between w-full px-3.5 py-2.5 text-left"
                  style={{
                    background:
                      statusFilter ===
                      o.id
                        ? 'color-mix(in oklab, var(--primary) 11%, transparent)'
                        : 'transparent',
                    color:
                      'var(--foreground)',
                    fontSize: 12.5,
                    fontWeight:
                      statusFilter ===
                      o.id
                        ? 700
                        : 500,
                  }}
                >
                  {o.label}

                  {statusFilter ===
                    o.id && (
                    <Check
                      size={14}
                      style={{
                        color:
                          'var(--primary)',
                      }}
                    />
                  )}
                </button>
              ),
            )}
          </FilterChip>

          {/* Date */}
          <button
            type="button"
            onClick={() =>
              setDateOpen(true)
            }
            className="h-9 px-3 rounded-xl flex items-center gap-1.5 flex-shrink-0"
            style={{
              background:
                range !== '1y'
                  ? 'var(--liquid-chip-on-bg)'
                  : 'var(--card)',
              color:
                range !== '1y'
                  ? 'var(--liquid-chip-on-text)'
                  : 'var(--foreground)',
              border:
                range !== '1y'
                  ? '1px solid var(--liquid-pill-border)'
                  : '1px solid var(--border)',
              fontSize: 12,
              fontWeight: 650,
            }}
          >
            <CalendarDays
              size={14}
              style={{
                opacity: 0.75,
              }}
            />

            <span className="max-w-[105px] truncate">
              {dateLabel}
            </span>

            <ChevronDown
              size={13}
              style={{
                opacity: 0.65,
              }}
            />
          </button>

          {/* Clear */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="h-9 px-3 rounded-xl flex items-center gap-1.5 flex-shrink-0"
              style={{
                color:
                  'var(--muted-foreground)',
                background:
                  'transparent',
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

      {/* Transaction list */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-10">
        {/* Loading */}
        {loading && !txs.length && (
          <div
            className="overflow-hidden rounded-2xl"
            style={{
              background:
                'var(--card)',
              border:
                '1px solid var(--border)',
            }}
          >
            {[1, 2, 3, 4, 5, 6].map(
              (i) => (
                <div
                  key={i}
                  className="h-[76px] mx-3 border-b last:border-b-0 animate-pulse"
                  style={{
                    borderColor:
                      'var(--border)',
                  }}
                >
                  <div className="flex items-center h-full gap-3">
                    <div
                      className="w-10 h-10 rounded-xl"
                      style={{
                        background:
                          'var(--muted)',
                      }}
                    />

                    <div className="flex-1 space-y-2">
                      <div
                        className="h-3.5 w-24 rounded"
                        style={{
                          background:
                            'var(--muted)',
                        }}
                      />

                      <div
                        className="h-2.5 w-16 rounded"
                        style={{
                          background:
                            'var(--muted)',
                        }}
                      />
                    </div>

                    <div
                      className="h-3.5 w-20 rounded"
                      style={{
                        background:
                          'var(--muted)',
                      }}
                    />
                  </div>
                </div>
              ),
            )}
          </div>
        )}

        {/* Empty */}
        {!loading &&
          txs.length === 0 && (
            <div className="flex flex-col items-center justify-center pt-16 px-8 text-center">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background:
                    'var(--card)',
                  border:
                    '1px solid var(--border)',
                }}
              >
                {search ||
                hasActiveFilters ? (
                  <Search
                    size={23}
                    style={{
                      color:
                        'var(--muted-foreground)',
                    }}
                  />
                ) : (
                  <Inbox
                    size={23}
                    style={{
                      color:
                        'var(--muted-foreground)',
                    }}
                  />
                )}
              </div>

              <p
                style={{
                  color:
                    'var(--foreground)',
                  fontWeight: 750,
                  fontSize: 15,
                }}
              >
                {search ||
                hasActiveFilters
                  ? 'No matching transactions'
                  : 'No activity yet'}
              </p>

              <p
                className="mt-1.5"
                style={{
                  color:
                    'var(--muted-foreground)',
                  fontSize: 12,
                  lineHeight: 1.5,
                  maxWidth: 270,
                }}
              >
                {search ||
                hasActiveFilters
                  ? 'Try a different search or clear your filters.'
                  : 'Deposits, swaps, transfers, and other wallet activity will appear here.'}
              </p>

              {(search ||
                hasActiveFilters) && (
                <button
                  type="button"
                  onClick={
                    clearFilters
                  }
                  className="mt-4 h-9 px-4 rounded-xl"
                  style={{
                    background:
                      'var(--muted)',
                    border:
                      '1px solid var(--border)',
                    color:
                      'var(--foreground)',
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
          groups.map(
            (group) => (
              <section
                key={group.label}
                className="mb-6"
              >
                {/* Date heading */}
                <div className="flex items-center justify-between px-1 mb-2">
                  <div className="flex items-center gap-2">
                    <CalendarDays
                      size={13}
                      style={{
                        color:
                          'var(--muted-foreground)',
                      }}
                    />

                    <span
                      style={{
                        color:
                          'var(--foreground)',
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
                      color:
                        'var(--muted-foreground)',
                      fontSize: 10,
                      fontWeight: 550,
                    }}
                  >
                    {
                      group.items
                        .length
                    }{' '}
                    {group.items
                      .length === 1
                      ? 'transaction'
                      : 'transactions'}
                  </span>
                </div>

                {/* Ledger */}
                <div
                  className="px-3 rounded-2xl overflow-hidden"
                  style={{
                    background:
                      'var(--card)',
                    border:
                      '1px solid var(--border)',
                  }}
                >
                  {group.items.map(
                    (
                      tx,
                      i,
                    ) => (
                      <TransactionRow
                        key={
                          tx.id
                        }
                        tx={tx}
                        format={
                          format
                        }
                        isLast={
                          i ===
                          group
                            .items
                            .length -
                            1
                        }
                        onOpen={() =>
                          setReceiptTx(
                            tx,
                          )
                        }
                      />
                    ),
                  )}
                </div>
              </section>
            ),
          )}
      </div>

      {/* Date filter */}
      <DateFilterSheet
        open={dateOpen}
        range={range}
        customFrom={customFrom}
        customTo={customTo}
        onClose={() =>
          setDateOpen(false)
        }
        onApply={(
          nextRange,
          from,
          to,
        ) => {
          setRange(nextRange);
          setCustomFrom(from);
          setCustomTo(to);
          setDateOpen(false);
        }}
      />

      {/* Receipt */}
      <TransactionReceipt
        tx={receiptTx}
        open={!!receiptTx}
        onClose={() =>
          setReceiptTx(null)
        }
      />
    </div>
  );
}