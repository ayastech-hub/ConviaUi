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
} from 'lucide-react';

import type { Transaction } from '../../../shared/data/mockData';
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
  | 'offramp';

type StatusFilter =
  | 'all'
  | 'confirmed'
  | 'pending'
  | 'failed';

type RangeFilter =
  | '30d'
  | 'all'
  | 'custom';

/* -------------------------------------------------------------------------- */
/* Filter options                                                             */
/* -------------------------------------------------------------------------- */

const TYPE_OPTIONS: {
  id: TypeFilter;
  label: string;
}[] = [
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

const STATUS_OPTIONS: {
  id: StatusFilter;
  label: string;
}[] = [
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

/* -------------------------------------------------------------------------- */
/* Transaction metadata                                                       */
/* -------------------------------------------------------------------------- */

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
  if (status === 'confirmed') {
    return 'var(--positive)';
  }

  if (status === 'pending') {
    return '#F59E0B';
  }

  if (status === 'failed') {
    return 'var(--destructive)';
  }

  return 'var(--muted-foreground)';
}

/* -------------------------------------------------------------------------- */
/* Group transactions by day                                                  */
/* -------------------------------------------------------------------------- */

function groupByDay(
  txs: Transaction[],
): {
  label: string;
  items: Transaction[];
}[] {
  const map = new Map<
    string,
    Transaction[]
  >();

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

  return Array.from(map.entries()).map(
    ([label, items]) => ({
      label,
      items,
    }),
  );
}

/* -------------------------------------------------------------------------- */
/* Filter chip                                                                */
/*                                                                            */
/* Important: the menu is rendered into document.body.                       */
/* This prevents the horizontal filter scroller from clipping the menu.      */
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
  children: ReactNode;
}) {
  const buttonRef =
    useRef<HTMLButtonElement>(null);

  const menuRef =
    useRef<HTMLDivElement>(null);

  const [position, setPosition] =
    useState({
      top: 0,
      left: 0,
      width: 220,
    });

  const updatePosition = useCallback(() => {
    const button =
      buttonRef.current;

    if (!button) return;

    const rect =
      button.getBoundingClientRect();

    const width = Math.min(
      240,
      window.innerWidth - 24,
    );

    const estimatedHeight = Math.min(
      360,
      window.innerHeight * 0.52,
    );

    const spaceBelow =
      window.innerHeight - rect.bottom;

    let top: number;

    if (
      spaceBelow >=
      estimatedHeight + 12
    ) {
      top = rect.bottom + 8;
    } else {
      top = Math.max(
        12,
        rect.top -
          estimatedHeight -
          8,
      );
    }

    const left = Math.min(
      Math.max(12, rect.left),
      window.innerWidth -
        width -
        12,
    );

    setPosition({
      top,
      left,
      width,
    });
  }, []);

  useEffect(() => {
    if (!open) return;

    updatePosition();

    const handleResize = () => {
      updatePosition();
    };

    const handleScroll = () => {
      updatePosition();
    };

    const handleOutside = (
      event: MouseEvent,
    ) => {
      const target =
        event.target as Node;

      const insideButton =
        buttonRef.current?.contains(
          target,
        );

      const insideMenu =
        menuRef.current?.contains(
          target,
        );

      if (
        !insideButton &&
        !insideMenu
      ) {
        onToggle();
      }
    };

    const handleKeyDown = (
      event: KeyboardEvent,
    ) => {
      if (event.key === 'Escape') {
        onToggle();
      }
    };

    document.addEventListener(
      'mousedown',
      handleOutside,
    );

    document.addEventListener(
      'keydown',
      handleKeyDown,
    );

    window.addEventListener(
      'resize',
      handleResize,
    );

    window.addEventListener(
      'scroll',
      handleScroll,
      true,
    );

    return () => {
      document.removeEventListener(
        'mousedown',
        handleOutside,
      );

      document.removeEventListener(
        'keydown',
        handleKeyDown,
      );

      window.removeEventListener(
        'resize',
        handleResize,
      );

      window.removeEventListener(
        'scroll',
        handleScroll,
        true,
      );
    };
  }, [
    open,
    onToggle,
    updatePosition,
  ]);

  const menu =
    typeof document !== 'undefined'
      ? createPortal(
          <AnimatePresence>
            {open && (
              <motion.div
                ref={menuRef}
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
                className="fixed overflow-y-auto rounded-2xl shadow-2xl"
                style={{
                  top: position.top,
                  left: position.left,
                  width: position.width,
                  maxHeight: '52vh',
                  zIndex: 9999,
                  background:
                    'var(--card)',
                  border:
                    '1px solid var(--border)',
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
              transition:
                'transform 150ms ease',
            }}
          />
        </button>
      </div>

      {menu}
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Date filter sheet                                                          */
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
  }, [
    open,
    range,
    customFrom,
    customTo,
  ]);

  useEffect(() => {
    if (!open) return;

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow =
      'hidden';

    const handleKey = (
      event: KeyboardEvent,
    ) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener(
      'keydown',
      handleKey,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      document.removeEventListener(
        'keydown',
        handleKey,
      );
    };
  }, [open, onClose]);

  if (
    !open ||
    typeof document === 'undefined'
  ) {
    return null;
  }

  const customDatesValid =
    draftRange !== 'custom' ||
    (!!draftFrom &&
      !!draftTo &&
      draftFrom <= draftTo);

  return createPortal(
    <AnimatePresence>
      <motion.div
        key="date-sheet"
        className="fixed inset-0 z-[120] flex items-end justify-center"
        initial={{
          opacity: 0,
        }}
        animate={{
          opacity: 1,
        }}
        exit={{
          opacity: 0,
        }}
        style={{
          background:
            'color-mix(in oklab, var(--background) 72%, transparent)',
          backdropFilter:
            'blur(3px)',
        }}
        onMouseDown={(event) => {
          if (
            event.target ===
            event.currentTarget
          ) {
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
            background:
              'var(--card)',
            borderTop:
              '1px solid var(--border)',
            boxShadow:
              '0 -18px 50px color-mix(in oklab, var(--background) 35%, transparent)',
          }}
          onMouseDown={(event) =>
            event.stopPropagation()
          }
        >
          {/* Handle */}
          <div className="flex justify-center pt-3">
            <div
              className="w-10 h-1 rounded-full"
              style={{
                background:
                  'var(--border)',
              }}
            />
          </div>

          {/* Header */}
          <div className="px-5 pt-4 pb-3 flex items-center justify-between">
            <div>
              <h2
                style={{
                  color:
                    'var(--foreground)',
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
                Choose when to show transactions
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 rounded-xl flex items-center justify-center"
              style={{
                background:
                  'var(--muted)',
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

          {/* Quick date options */}
          <div className="px-5 pb-2">
            {QUICK_DATE_OPTIONS.map(
              (option) => {
                const active =
                  draftRange ===
                  option.id;

                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() =>
                      setDraftRange(
                        option.id,
                      )
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
                        background:
                          active
                            ? 'var(--liquid-chip-on-bg)'
                            : 'var(--muted)',
                      }}
                    >
                      <CalendarDays
                        size={16}
                        style={{
                          color:
                            active
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
                          fontWeight:
                            active
                              ? 750
                              : 650,
                        }}
                      >
                        {
                          option.label
                        }
                      </div>

                      <div
                        className="mt-0.5"
                        style={{
                          color:
                            'var(--muted-foreground)',
                          fontSize: 10.5,
                        }}
                      >
                        {
                          option.description
                        }
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
              },
            )}

            {/* Custom range */}
            <button
              type="button"
              onClick={() =>
                setDraftRange(
                  'custom',
                )
              }
              className="w-full flex items-center text-left py-3.5"
            >
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{
                  background:
                    draftRange ===
                    'custom'
                      ? 'var(--liquid-chip-on-bg)'
                      : 'var(--muted)',
                }}
              >
                <CalendarDays
                  size={16}
                  style={{
                    color:
                      draftRange ===
                      'custom'
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
                      draftRange ===
                      'custom'
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

              {draftRange ===
              'custom' ? (
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

          {/* Custom date fields */}
          <AnimatePresence initial={false}>
            {draftRange ===
              'custom' && (
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
                    {/* From */}
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
                        value={
                          draftFrom
                        }
                        max={
                          draftTo ||
                          undefined
                        }
                        onChange={(event) =>
                          setDraftFrom(
                            event
                              .target
                              .value,
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

                    {/* To */}
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
                        value={
                          draftTo
                        }
                        min={
                          draftFrom ||
                          undefined
                        }
                        onChange={(event) =>
                          setDraftTo(
                            event
                              .target
                              .value,
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

                  {draftFrom &&
                    draftTo &&
                    draftFrom >
                      draftTo && (
                      <p
                        className="mt-2"
                        style={{
                          color:
                            'var(--destructive)',
                          fontSize: 10.5,
                        }}
                      >
                        The start date must be
                        before the end date.
                      </p>
                    )}
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
              disabled={
                !customDatesValid
              }
              onClick={() => {
                if (
                  !customDatesValid
                ) {
                  return;
                }

                onApply(
                  draftRange,
                  draftFrom,
                  draftTo,
                );
              }}
              className="w-full h-11 rounded-xl transition-opacity"
              style={{
                background:
                  customDatesValid
                    ? 'var(--primary)'
                    : 'var(--muted)',
                color:
                  customDatesValid
                    ? 'var(--primary-foreground)'
                    : 'var(--muted-foreground)',
                fontSize: 12.5,
                fontWeight: 750,
                opacity:
                  customDatesValid
                    ? 1
                    : 0.6,
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
      ? `${formatTokenAmount(
          tx.amount,
        )} ${tx.asset || ''}`
      : `${m.sign}${formatTokenAmount(
          tx.amount,
        )} ${tx.asset || ''}`;

  const amountSecondary =
    tx.type === 'swap'
      ? `→ ${formatTokenAmount(
          tx.amountTo,
        )} ${tx.assetTo || ''}`
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
      whileTap={{
        scale: 0.995,
      }}
      onClick={onOpen}
      className="w-full flex items-center text-left"
      style={{
        minHeight: 76,
        borderBottom: isLast
          ? 'none'
          : '1px solid color-mix(in oklab, var(--border) 72%, transparent)',
      }}
    >
      {/* Neutral icon */}
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{
          background:
            'var(--muted)',
          border:
            '1px solid color-mix(in oklab, var(--border) 80%, transparent)',
        }}
      >
        <Icon
          size={17}
          strokeWidth={2.2}
          style={{
            color:
              'var(--muted-foreground)',
          }}
        />
      </div>

      {/* Main transaction information */}
      <div className="flex-1 min-w-0 ml-3.5 pr-3">
        <div
          className="truncate"
          style={{
            color:
              'var(--foreground)',
            fontWeight: 700,
            fontSize: 13.5,
            letterSpacing: -0.1,
          }}
        >
          {tx.type === 'swap'
            ? `${tx.asset || '—'} → ${
                tx.assetTo || '—'
              }`
            : m.label}
        </div>

        <div className="flex items-center gap-1.5 mt-1.5 min-w-0">
          <span
            className="w-1.5 h-1.5 rounded-full flex-shrink-0"
            style={{
              background:
                statusColor(
                  tx.status,
                ),
            }}
          />

          <span
            className="truncate"
            style={{
              color:
                'var(--muted-foreground)',
              fontSize: 10.5,
              fontWeight: 550,
              textTransform:
                'capitalize',
            }}
          >
            {tx.status}
          </span>

          {tx.asset &&
            tx.type !== 'swap' && (
              <>
                <span
                  style={{
                    color:
                      'var(--border)',
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

export function HistoryScreen({
  goBack,
}: Props) {
  const { format } =
    useCurrency();

  /*
   * Default is now Last 30 days.
   */
  const [range, setRange] =
    useState<RangeFilter>('30d');

  const [customFrom, setCustomFrom] =
    useState('');

  const [customTo, setCustomTo] =
    useState('');

  const [dateOpen, setDateOpen] =
    useState(false);

  /* ------------------------------------------------------------------------ */
  /* Date query                                                               */
  /* ------------------------------------------------------------------------ */

  const sinceIso = useMemo(() => {
    if (range === 'all') {
      return undefined;
    }

    if (
      range === 'custom' &&
      customFrom
    ) {
      const date = new Date(
        `${customFrom}T00:00:00`,
      );

      if (
        Number.isNaN(
          date.getTime(),
        )
      ) {
        return undefined;
      }

      return date.toISOString();
    }

    const date = new Date();

    /*
     * Default quick filter:
     * Last 30 days.
     */
    date.setDate(
      date.getDate() - 30,
    );

    return date.toISOString();
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

  /* ------------------------------------------------------------------------ */
  /* Filters                                                                  */
  /* ------------------------------------------------------------------------ */

  const [typeFilter, setTypeFilter] =
    useState<TypeFilter>('all');

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>('all');

  const [typeOpen, setTypeOpen] =
    useState(false);

  const [
    statusOpen,
    setStatusOpen,
  ] = useState(false);

  const [search, setSearch] =
    useState('');

  const [receiptTx, setReceiptTx] =
    useState<Transaction | null>(
      null,
    );

  /* ------------------------------------------------------------------------ */
  /* Map + filter transactions                                                */
  /* ------------------------------------------------------------------------ */

  const txs = useMemo(() => {
    const mapped =
      filterHistoryForUi(
        (apiTxs || []).map(
          apiTxToUi,
        ),
      );

    const query =
      search
        .trim()
        .toLowerCase();

    return mapped.filter(
      (tx) => {
        if (
          typeFilter !== 'all' &&
          tx.type !== typeFilter
        ) {
          return false;
        }

        if (
          statusFilter !== 'all' &&
          tx.status !==
            statusFilter
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
            !haystack.includes(
              query,
            )
          ) {
            return false;
          }
        }

        return true;
      },
    );
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

  /* ------------------------------------------------------------------------ */
  /* Labels                                                                   */
  /* ------------------------------------------------------------------------ */

  const typeLabel =
    TYPE_OPTIONS.find(
      (option) =>
        option.id ===
        typeFilter,
    )?.label ||
    'All activity';

  const statusLabel =
    STATUS_OPTIONS.find(
      (option) =>
        option.id ===
        statusFilter,
    )?.label ||
    'Any status';

  const dateLabel =
    range === '30d'
      ? '30 days'
      : range === 'all'
        ? 'All time'
        : customFrom &&
            customTo
          ? `${customFrom} – ${customTo}`
          : 'Custom range';

  /* ------------------------------------------------------------------------ */
  /* Active filters                                                           */
  /* ------------------------------------------------------------------------ */

  const hasActiveFilters =
    typeFilter !== 'all' ||
    statusFilter !== 'all' ||
    search.trim().length > 0 ||
    range !== '30d';

  const clearFilters = () => {
    setTypeFilter('all');
    setStatusFilter('all');
    setSearch('');

    /*
     * Reset date to the default.
     */
    setRange('30d');
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

      {/* ------------------------------------------------------------------ */}
      {/* Header                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="px-5 pt-1 pb-4">
        <div className="flex items-center gap-3">
          <BackButton
            onClick={goBack}
          />

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

            {/* Transaction count intentionally retained */}
            <div className="flex items-center gap-1.5 mt-0.5">
              <span
                style={{
                  color:
                    'var(--muted-foreground)',
                  fontSize: 11.5,
                }}
              >
                {loading &&
                !txs.length
                  ? 'Loading activity…'
                  : isFetching
                    ? 'Updating activity…'
                    : `${txs.length} ${
                        txs.length ===
                        1
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

      {/* ------------------------------------------------------------------ */}
      {/* Search                                                             */}
      {/* ------------------------------------------------------------------ */}

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
            onChange={(event) =>
              setSearch(
                event.target
                  .value,
              )
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

      {/* ------------------------------------------------------------------ */}
      {/* Filters                                                            */}
      {/* ------------------------------------------------------------------ */}

      <div className="px-5 pb-4 relative z-30">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {/* Type */}
          <FilterChip
            open={typeOpen}
            label={typeLabel}
            onToggle={() => {
              setTypeOpen(
                (open) =>
                  !open,
              );

              setStatusOpen(
                false,
              );
            }}
          >
            {TYPE_OPTIONS.map(
              (option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setTypeFilter(
                      option.id,
                    );

                    setTypeOpen(
                      false,
                    );
                  }}
                  className="flex items-center justify-between w-full px-3.5 py-2.5 text-left"
                  style={{
                    background:
                      typeFilter ===
                      option.id
                        ? 'color-mix(in oklab, var(--primary) 11%, transparent)'
                        : 'transparent',
                    color:
                      'var(--foreground)',
                    fontSize: 12.5,
                    fontWeight:
                      typeFilter ===
                      option.id
                        ? 700
                        : 500,
                  }}
                >
                  {option.label}

                  {typeFilter ===
                    option.id && (
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
                (open) =>
                  !open,
              );

              setTypeOpen(false);
            }}
          >
            {STATUS_OPTIONS.map(
              (option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    setStatusFilter(
                      option.id,
                    );

                    setStatusOpen(
                      false,
                    );
                  }}
                  className="flex items-center justify-between w-full px-3.5 py-2.5 text-left"
                  style={{
                    background:
                      statusFilter ===
                      option.id
                        ? 'color-mix(in oklab, var(--primary) 11%, transparent)'
                        : 'transparent',
                    color:
                      'var(--foreground)',
                    fontSize: 12.5,
                    fontWeight:
                      statusFilter ===
                      option.id
                        ? 700
                        : 500,
                  }}
                >
                  {option.label}

                  {statusFilter ===
                    option.id && (
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
            <CalendarDays
              size={14}
              style={{
                opacity: 0.75,
              }}
            />

            <span className="max-w-[120px] truncate">
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
              onClick={
                clearFilters
              }
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

      {/* ------------------------------------------------------------------ */}
      {/* Transaction list                                                   */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex-1 min-h-0 overflow-y-auto px-5 pb-10">
        {/* Loading */}
        {loading &&
          !txs.length && (
            <div
              className="overflow-hidden rounded-2xl"
              style={{
                background:
                  'var(--card)',
                border:
                  '1px solid var(--border)',
              }}
            >
              {[
                1, 2, 3, 4, 5, 6,
              ].map((item) => (
                <div
                  key={item}
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
              ))}
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

        {/* Transaction groups */}
        {!loading &&
          groups.map(
            (group) => (
              <section
                key={group.label}
                className="mb-6"
              >
                {/* Date header + transaction count */}
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

                  {/* Count intentionally retained */}
                  <span
                    style={{
                      color:
                        'var(--muted-foreground)',
                      fontSize: 10,
                      fontWeight: 550,
                    }}
                  >
                    {group.items.length}{' '}
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
                      index,
                    ) => (
                      <TransactionRow
                        key={tx.id}
                        tx={tx}
                        format={
                          format
                        }
                        isLast={
                          index ===
                          group.items
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

      {/* ------------------------------------------------------------------ */}
      {/* Date filter                                                         */}
      {/* ------------------------------------------------------------------ */}

      <DateFilterSheet
        open={dateOpen}
        range={range}
        customFrom={
          customFrom
        }
        customTo={customTo}
        onClose={() =>
          setDateOpen(false)
        }
        onApply={(
          nextRange,
          from,
          to,
        ) => {
          setRange(
            nextRange,
          );
          setCustomFrom(from);
          setCustomTo(to);
          setDateOpen(false);
        }}
      />

      {/* ------------------------------------------------------------------ */}
      {/* Receipt                                                             */}
      {/* ------------------------------------------------------------------ */}

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