import {
  useMemo,
  useState,
  useRef,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
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
  X,
  CalendarDays,
  ChevronRight,
  Smartphone,
  Wifi,
  Zap,
  Tv,
  Trophy,
  Receipt,
  Gift,
  Link2,
  Award,
} from 'lucide-react';

import type { Transaction } from '../../../shared/data/mockData';
import { getTxColor, getTxSign } from '../../../shared/utils/transactionHelpers';
import { TransactionReceipt } from '../../../shared/components/TransactionReceipt';
import { formatTokenAmount } from '../../../shared/utils/formatAmount';
import { PageTop } from '../../../shared/components/PageTop';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { useTransactions } from '../../../shared/hooks/useTransactions';
import {
  apiTxToUi,
  filterHistoryForUi,
} from '../../../shared/utils/mapApiToUi';
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
  | 'offramp'
  | 'airtime'
  | 'data'
  | 'electricity'
  | 'cable'
  | 'betting'
  | 'giveaway';

type StatusFilter =
  | 'all'
  | 'confirmed'
  | 'pending'
  | 'failed';

type RangeFilter = '30d' | 'all' | 'custom';

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
  { id: 'airtime', label: 'Airtime' },
  { id: 'data', label: 'Mobile data' },
  { id: 'electricity', label: 'Electricity' },
  { id: 'cable', label: 'TV & cable' },
  { id: 'betting', label: 'Betting' },
  { id: 'giveaway', label: 'Giveaways' },
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
  airtime: {
    label: 'Airtime',
    Icon: Smartphone,
    sign: '−',
  },
  data: {
    label: 'Mobile data',
    Icon: Wifi,
    sign: '−',
  },
  electricity: {
    label: 'Electricity',
    Icon: Zap,
    sign: '−',
  },
  cable: {
    label: 'TV & cable',
    Icon: Tv,
    sign: '−',
  },
  betting: {
    label: 'Betting',
    Icon: Trophy,
    sign: '−',
  },
  bill: {
    label: 'Bill payment',
    Icon: Receipt,
    sign: '−',
  },
  giveaway: {
    label: 'Giveaway',
    Icon: Gift,
    sign: '',
  },
  request: {
    label: 'Payment request',
    Icon: Link2,
    sign: '',
  },
  reward: {
    label: 'Reward',
    Icon: Award,
    sign: '+',
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

function groupByDay(txs: Transaction[]) {
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
  children: ReactNode;
}) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const [position, setPosition] = useState({
    top: 0,
    left: 0,
    width: 220,
  });

  const updatePosition = useCallback(() => {
    const button = buttonRef.current;
    if (!button) return;

    const rect = button.getBoundingClientRect();
    const width = Math.min(240, window.innerWidth - 24);
    const estimatedHeight = Math.min(360, window.innerHeight * 0.52);
    const spaceBelow = window.innerHeight - rect.bottom;

    const top =
      spaceBelow >= estimatedHeight + 12
        ? rect.bottom + 8
        : Math.max(12, rect.top - estimatedHeight - 8);

    const left = Math.min(
      Math.max(12, rect.left),
      window.innerWidth - width - 12,
    );

    setPosition({ top, left, width });
  }, []);

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const handleOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (
        !buttonRef.current?.contains(target) &&
        !menuRef.current?.contains(target)
      ) {
        onToggle();
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onToggle();
      }
    };

    const handleResize = () => updatePosition();
    const handleScroll = () => updatePosition();

    document.addEventListener('mousedown', handleOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [open, onToggle, updatePosition]);

  const menu =
    typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, y: 5, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 4, scale: 0.98 }}
                transition={{ duration: 0.14 }}
                className="fixed overflow-y-auto rounded-2xl shadow-2xl"
                style={{
                  top: position.top,
                  left: position.left,
                  width: position.width,
                  maxHeight: '52vh',
                  zIndex: 9999,
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                {children}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="relative flex-shrink-0">
        <button
          ref={buttonRef}
          type="button"
          onClick={onToggle}
          className="flex h-9 items-center gap-1.5 rounded-xl px-3"
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
      </div>

      {menu}
    </>
  );
}

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
  onApply: (range: RangeFilter, from: string, to: string) => void;
}) {
  const [draftRange, setDraftRange] = useState<RangeFilter>(range);
  const [draftFrom, setDraftFrom] = useState(customFrom);
  const [draftTo, setDraftTo] = useState(customTo);

  useEffect(() => {
    if (!open) return;

    setDraftRange(range);
    setDraftFrom(customFrom);
    setDraftTo(customTo);
  }, [open, range, customFrom, customTo]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKey);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKey);
    };
  }, [open, onClose]);

  if (!open || typeof document === 'undefined') {
    return null;
  }

  const customDatesValid =
    draftRange !== 'custom' ||
    (!!draftFrom && !!draftTo && draftFrom <= draftTo);

  return createPortal(
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 z-[120] flex items-end justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        style={{
          background:
            'color-mix(in oklab, var(--background) 72%, transparent)',
          backdropFilter: 'blur(3px)',
        }}
        onMouseDown={(event) => {
          if (event.target === event.currentTarget) {
            onClose();
          }
        }}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{
            type: 'spring',
            stiffness: 420,
            damping: 34,
          }}
          className="w-full max-w-[520px] overflow-hidden rounded-t-[26px]"
          style={{
            background: 'var(--card)',
            borderTop: '1px solid var(--border)',
            boxShadow:
              '0 -18px 50px color-mix(in oklab, var(--background) 35%, transparent)',
          }}
          onMouseDown={(event) => event.stopPropagation()}
        >
          <div className="flex justify-center pt-2.5">
            <div
              className="h-1 w-9 rounded-full"
              style={{ background: 'var(--border)' }}
            />
          </div>

          <div className="flex items-center justify-between px-5 pb-2 pt-3">
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
                  color: 'var(--muted-foreground)',
                  fontSize: 11,
                }}
              >
                Choose a date range
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-xl"
              style={{
                background: 'var(--muted)',
                border: '1px solid var(--border)',
              }}
            >
              <X
                size={16}
                style={{ color: 'var(--muted-foreground)' }}
              />
            </button>
          </div>

          <div className="px-5">
            {QUICK_DATE_OPTIONS.map((option) => {
              const active = draftRange === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setDraftRange(option.id)}
                  className="flex w-full items-center py-3"
                  style={{
                    borderBottom:
                      '1px solid color-mix(in oklab, var(--border) 65%, transparent)',
                  }}
                >
                  <div
                    className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
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

                  <div className="ml-3 min-w-0 flex-1 text-left">
                    <div
                      style={{
                        color: 'var(--foreground)',
                        fontSize: 13,
                        fontWeight: active ? 750 : 650,
                      }}
                    >
                      {option.label}
                    </div>
                    <div
                      className="mt-0.5"
                      style={{
                        color: 'var(--muted-foreground)',
                        fontSize: 10.5,
                      }}
                    >
                      {option.description}
                    </div>
                  </div>

                  {active && (
                    <Check
                      size={17}
                      style={{ color: 'var(--primary)' }}
                    />
                  )}
                </button>
              );
            })}

            <button
              type="button"
              onClick={() => setDraftRange('custom')}
              className="flex w-full items-center py-3"
            >
              <div
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
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

              <div className="ml-3 flex-1 text-left">
                <div
                  style={{
                    color: 'var(--foreground)',
                    fontSize: 13,
                    fontWeight: draftRange === 'custom' ? 750 : 650,
                  }}
                >
                  Custom range
                </div>
                <div
                  className="mt-0.5"
                  style={{
                    color: 'var(--muted-foreground)',
                    fontSize: 10.5,
                  }}
                >
                  Choose exact start and end dates
                </div>
              </div>

              {draftRange === 'custom' ? (
                <Check
                  size={17}
                  style={{ color: 'var(--primary)' }}
                />
              ) : (
                <ChevronRight
                  size={16}
                  style={{ color: 'var(--muted-foreground)' }}
                />
              )}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {draftRange === 'custom' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div
                  className="mx-5 rounded-2xl p-3"
                  style={{
                    background: 'var(--muted)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div className="grid grid-cols-2 gap-2.5">
                    <label>
                      <span
                        className="mb-1 block"
                        style={{
                          color: 'var(--muted-foreground)',
                          fontSize: 10.5,
                          fontWeight: 650,
                        }}
                      >
                        From
                      </span>

                      <input
                        type="date"
                        value={draftFrom}
                        max={draftTo || undefined}
                        onChange={(event) =>
                          setDraftFrom(event.target.value)
                        }
                        className="h-9 w-full rounded-xl px-2.5 outline-none"
                        style={{
                          color: 'var(--foreground)',
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          fontSize: 11,
                        }}
                      />
                    </label>

                    <label>
                      <span
                        className="mb-1 block"
                        style={{
                          color: 'var(--muted-foreground)',
                          fontSize: 10.5,
                          fontWeight: 650,
                        }}
                      >
                        To
                      </span>

                      <input
                        type="date"
                        value={draftTo}
                        min={draftFrom || undefined}
                        onChange={(event) =>
                          setDraftTo(event.target.value)
                        }
                        className="h-9 w-full rounded-xl px-2.5 outline-none"
                        style={{
                          color: 'var(--foreground)',
                          background: 'var(--card)',
                          border: '1px solid var(--border)',
                          fontSize: 11,
                        }}
                      />
                    </label>
                  </div>

                  {draftFrom &&
                    draftTo &&
                    draftFrom > draftTo && (
                      <p
                        className="mt-2"
                        style={{
                          color: 'var(--destructive)',
                          fontSize: 10.5,
                        }}
                      >
                        The start date must be before the end date.
                      </p>
                    )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div
            className="px-5 pb-4 pt-3"
            style={{
              paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
            }}
          >
            <button
              type="button"
              disabled={!customDatesValid}
              onClick={() => {
                if (!customDatesValid) return;

                onApply(draftRange, draftFrom, draftTo);
              }}
              className="h-10 w-full rounded-xl"
              style={{
                background: customDatesValid
                  ? 'var(--primary)'
                  : 'var(--muted)',
                color: customDatesValid
                  ? 'var(--primary-foreground)'
                  : 'var(--muted-foreground)',
                fontSize: 12,
                fontWeight: 750,
                opacity: customDatesValid ? 1 : 0.6,
              }}
            >
              Apply date filter
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body,
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
  const displayLabel = (tx as { title?: string }).title || m.label;
  const Icon = m.Icon;

  const sign = getTxSign(tx.type);
  const amountPrimary =
    tx.type === 'swap'
      ? `${formatTokenAmount(tx.amount)} ${tx.asset || ''}`
      : `${sign}${formatTokenAmount(tx.amount)} ${tx.asset || ''}`;

  const amountSecondary =
    tx.type === 'swap'
      ? `→ ${formatTokenAmount(tx.amountTo)} ${tx.assetTo || ''}`
      : tx.valueUSD > 0
        ? format(tx.valueUSD)
        : null;

  const amountTone = getTxColor(tx.type);

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.995 }}
      onClick={onOpen}
      className="flex w-full items-center text-left"
      style={{
        minHeight: 68,
        borderBottom: isLast
          ? 'none'
          : '1px solid color-mix(in oklab, var(--border) 72%, transparent)',
      }}
    >
      <div
        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl"
        style={{
          background: 'var(--muted)',
          border:
            '1px solid color-mix(in oklab, var(--border) 80%, transparent)',
        }}
      >
        <Icon
          size={16}
          strokeWidth={2.2}
          style={{ color: 'var(--muted-foreground)' }}
        />
      </div>

      <div className="ml-3 min-w-0 flex-1 pr-3">
        <div
          className="truncate"
          style={{
            color: 'var(--foreground)',
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {tx.type === 'swap'
            ? `${tx.asset || '—'} → ${tx.assetTo || '—'}`
            : m.label}
        </div>

        <div className="mt-1 flex min-w-0 items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 flex-shrink-0 rounded-full"
            style={{ background: statusColor(tx.status) }}
          />

          <span
            className="truncate"
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 10,
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
                  fontSize: 10,
                  fontWeight: 600,
                }}
              >
                {tx.asset}
              </span>
            </>
          )}
        </div>
      </div>

      <div className="max-w-[43%] flex-shrink-0 text-right">
        <div
          className="truncate tabular-nums"
          style={{
            color: amountTone,
            fontWeight: 750,
            fontSize: 12.5,
          }}
        >
          {amountPrimary}
        </div>

        {amountSecondary && (
          <div
            className="mt-0.5 truncate tabular-nums"
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 10,
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

  const [range, setRange] = useState<RangeFilter>('30d');
  const [customFrom, setCustomFrom] = useState('');
  const [customTo, setCustomTo] = useState('');
  const [dateOpen, setDateOpen] = useState(false);

  const sinceIso = useMemo(() => {
    if (range === 'all') return undefined;

    if (range === 'custom' && customFrom) {
      const date = new Date(`${customFrom}T00:00:00`);

      if (Number.isNaN(date.getTime())) {
        return undefined;
      }

      return date.toISOString();
    }

    const date = new Date();
    date.setDate(date.getDate() - 30);

    return date.toISOString();
  }, [range, customFrom]);

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
      if (typeFilter !== 'all' && tx.type !== typeFilter) {
        return false;
      }

      if (statusFilter !== 'all' && tx.status !== statusFilter) {
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
  }, [apiTxs, typeFilter, statusFilter, search]);

  const groups = useMemo(() => groupByDay(txs), [txs]);

  const typeLabel =
    TYPE_OPTIONS.find((option) => option.id === typeFilter)?.label ||
    'All activity';

  const statusLabel =
    STATUS_OPTIONS.find(
      (option) => option.id === statusFilter,
    )?.label || 'Any status';

  const dateLabel =
    range === '30d'
      ? '30 days'
      : range === 'all'
        ? 'All time'
        : customFrom && customTo
          ? `${customFrom} – ${customTo}`
          : 'Custom';

  const hasActiveFilters =
    typeFilter !== 'all' ||
    statusFilter !== 'all' ||
    search.trim().length > 0 ||
    range !== '30d';

  const clearFilters = () => {
    setTypeFilter('all');
    setStatusFilter('all');
    setSearch('');
    setRange('30d');
    setCustomFrom('');
    setCustomTo('');
    setTypeOpen(false);
    setStatusOpen(false);
  };

  return (
    <div
      className="flex h-full flex-col overflow-hidden"
      style={{ background: 'var(--background)' }}
    >
      <PageTop />

      <div className="px-5 pb-3 pt-0.5">
        <div className="flex items-center gap-3">
          <BackButton onClick={goBack} />

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

          {isFetching && (
            <span
              className="ml-auto h-1.5 w-1.5 animate-pulse rounded-full"
              style={{ background: 'var(--primary)' }}
            />
          )}
        </div>
      </div>

      <div className="px-5 pb-2.5">
        <div
          className="flex h-10 items-center gap-2.5 rounded-2xl px-3"
          style={{
            background: 'var(--card)',
            border: '1px solid var(--border)',
          }}
        >
          <Search
            size={16}
            style={{
              color: 'var(--muted-foreground)',
              flexShrink: 0,
            }}
          />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search transactions"
            className="min-w-0 flex-1 bg-transparent text-sm outline-none"
            style={{
              color: 'var(--foreground)',
              fontSize: 12,
              fontWeight: 500,
            }}
          />

          {search && (
            <button
              type="button"
              onClick={() => setSearch('')}
              className="flex h-6 w-6 items-center justify-center rounded-full"
              style={{ background: 'var(--muted)' }}
            >
              <X
                size={13}
                style={{ color: 'var(--muted-foreground)' }}
              />
            </button>
          )}
        </div>
      </div>

      <div className="relative z-30 px-5 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          <FilterChip
            open={typeOpen}
            label={typeLabel}
            onToggle={() => {
              setTypeOpen((open) => !open);
              setStatusOpen(false);
            }}
          >
            {TYPE_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setTypeFilter(option.id);
                  setTypeOpen(false);
                }}
                className="flex w-full items-center justify-between px-3.5 py-2.5 text-left"
                style={{
                  background:
                    typeFilter === option.id
                      ? 'color-mix(in oklab, var(--primary) 11%, transparent)'
                      : 'transparent',
                  color: 'var(--foreground)',
                  fontSize: 12.5,
                  fontWeight: typeFilter === option.id ? 700 : 500,
                }}
              >
                {option.label}

                {typeFilter === option.id && (
                  <Check
                    size={14}
                    style={{ color: 'var(--primary)' }}
                  />
                )}
              </button>
            ))}
          </FilterChip>

          <FilterChip
            open={statusOpen}
            label={statusLabel}
            onToggle={() => {
              setStatusOpen((open) => !open);
              setTypeOpen(false);
            }}
          >
            {STATUS_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                onClick={() => {
                  setStatusFilter(option.id);
                  setStatusOpen(false);
                }}
                className="flex w-full items-center justify-between px-3.5 py-2.5 text-left"
                style={{
                  background:
                    statusFilter === option.id
                      ? 'color-mix(in oklab, var(--primary) 11%, transparent)'
                      : 'transparent',
                  color: 'var(--foreground)',
                  fontSize: 12.5,
                  fontWeight:
                    statusFilter === option.id ? 700 : 500,
                }}
              >
                {option.label}

                {statusFilter === option.id && (
                  <Check
                    size={14}
                    style={{ color: 'var(--primary)' }}
                  />
                )}
              </button>
            ))}
          </FilterChip>

          <button
            type="button"
            onClick={() => setDateOpen(true)}
            className="flex h-9 flex-shrink-0 items-center gap-1.5 rounded-xl px-3"
            style={{
              background:
                range !== '30d'
                  ? 'var(--liquid-chip-on-bg)'
                  : 'var(--card)',
              color:
                range !== '30d'
                  ? 'var(--liquid-chip-on-text)'
                  : 'var(--foreground)',
              border:
                range !== '30d'
                  ? '1px solid var(--liquid-pill-border)'
                  : '1px solid var(--border)',
              fontSize: 12,
              fontWeight: 650,
            }}
          >
            <CalendarDays size={14} style={{ opacity: 0.75 }} />
            <span className="max-w-[110px] truncate">{dateLabel}</span>
            <ChevronDown size={13} style={{ opacity: 0.65 }} />
          </button>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={clearFilters}
              className="flex h-9 flex-shrink-0 items-center gap-1.5 rounded-xl px-2.5"
              style={{
                color: 'var(--muted-foreground)',
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

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-7">
        {loading && !txs.length && (
          <div
            className="overflow-hidden rounded-2xl"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
            }}
          >
            {[1, 2, 3, 4, 5].map((item) => (
              <div
                key={item}
                className="mx-3 flex h-[68px] items-center gap-3 border-b last:border-b-0"
                style={{ borderColor: 'var(--border)' }}
              >
                <div
                  className="h-9 w-9 rounded-xl"
                  style={{ background: 'var(--muted)' }}
                />

                <div className="flex-1 space-y-2">
                  <div
                    className="h-3 w-24 rounded"
                    style={{ background: 'var(--muted)' }}
                  />
                  <div
                    className="h-2.5 w-16 rounded"
                    style={{ background: 'var(--muted)' }}
                  />
                </div>

                <div
                  className="h-3 w-20 rounded"
                  style={{ background: 'var(--muted)' }}
                />
              </div>
            ))}
          </div>
        )}

        {!loading && txs.length === 0 && (
          <div className="flex flex-col items-center justify-center px-8 pt-14 text-center">
            <div
              className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
              }}
            >
              {search || hasActiveFilters ? (
                <Search
                  size={21}
                  style={{ color: 'var(--muted-foreground)' }}
                />
              ) : (
                <Inbox
                  size={21}
                  style={{ color: 'var(--muted-foreground)' }}
                />
              )}
            </div>

            <p
              style={{
                color: 'var(--foreground)',
                fontWeight: 750,
                fontSize: 14,
              }}
            >
              {search || hasActiveFilters
                ? 'No matching transactions'
                : 'No activity yet'}
            </p>

            <p
              className="mt-1 max-w-[260px]"
              style={{
                color: 'var(--muted-foreground)',
                fontSize: 11.5,
                lineHeight: 1.5,
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
                className="mt-3 h-8 rounded-xl px-3.5"
                style={{
                  background: 'var(--muted)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  fontSize: 11.5,
                  fontWeight: 650,
                }}
              >
                Clear filters
              </button>
            )}
          </div>
        )}

        {!loading &&
          groups.map((group) => (
            <section key={group.label} className="mb-4">
              <div className="mb-1.5 flex items-center gap-2 px-1">
                <CalendarDays
                  size={12}
                  style={{ color: 'var(--muted-foreground)' }}
                />

                <span
                  style={{
                    color: 'var(--foreground)',
                    fontSize: 10.5,
                    fontWeight: 750,
                    letterSpacing: 0.25,
                  }}
                >
                  {group.label}
                </span>
              </div>

              <div
                className="overflow-hidden rounded-2xl px-3"
                style={{
                  background: 'var(--card)',
                  border: '1px solid var(--border)',
                }}
              >
                {group.items.map((tx, index) => (
                  <TransactionRow
                    key={tx.id}
                    tx={tx}
                    format={format}
                    isLast={index === group.items.length - 1}
                    onOpen={() => setReceiptTx(tx)}
                  />
                ))}
              </div>
            </section>
          ))}
      </div>

      <DateFilterSheet
        open={dateOpen}
        range={range}
        customFrom={customFrom}
        customTo={customTo}
        onClose={() => setDateOpen(false)}
        onApply={(nextRange, from, to) => {
          setRange(nextRange);
          setCustomFrom(from);
          setCustomTo(to);
          setDateOpen(false);
        }}
      />

      <TransactionReceipt
        tx={receiptTx}
        open={!!receiptTx}
        onClose={() => setReceiptTx(null)}
      />
    </div>
  );
}