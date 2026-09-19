import { motion, AnimatePresence } from 'motion/react';
import {
  Loader,
  CheckCircle2,
  Copy,
  Check,
  Clock,
  AlertTriangle,
  ShieldCheck,
  ArrowDown,
  Building2,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import type { Currency } from '../../../../shared/context/CurrencyContext';

export interface OnRampProcessingStepProps {
  currency: Currency;
  amount: string;
  youGet: number;
  symbol: string;
  bankName?: string;
  accountNumber?: string;
  accountName?: string;
  reference?: string;
  expiresAt?: string | null;
  checking?: boolean;
  toast?: string | null;
  onDismissToast?: () => void;
  onConfirmPaid?: () => void;
}

/* -------------------------------------------------------------------------- */
/* Tokens                                                                     */
/* -------------------------------------------------------------------------- */

const WARN = 'var(--warning, #f59e0b)';
const DANGER = 'var(--destructive, #ef4444)';
const PAGE = 'var(--background, #0e0e10)';
const CARD = 'var(--card, #1b1b1e)';
const BORDER = 'var(--border, #303034)';
const FG = 'var(--foreground, #f5f5f5)';
const MUTED = 'var(--muted-foreground, #99999f)';
const PRIMARY = 'var(--primary, #96d6cd)';
const PRIMARY_FG = 'var(--primary-foreground, #071312)';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const LABEL: React.CSSProperties = {
  color: MUTED,
  fontSize: 10,
  fontWeight: 700,
  letterSpacing: '0.075em',
  textTransform: 'uppercase',
};

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

const truncateMiddle = (s: string, head = 8, tail = 6) =>
  s.length <= head + tail + 1 ? s : `${s.slice(0, head)}…${s.slice(-tail)}`;

function useCopy() {
  const [copied, setCopied] = useState(false);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);

      window.setTimeout(() => {
        setCopied(false);
      }, 1400);
    } catch {
      /* ignore */
    }
  };

  return { copied, copy };
}

/* -------------------------------------------------------------------------- */
/* Countdown                                                                  */
/* -------------------------------------------------------------------------- */

function useCountdown(expiresAt?: string | null) {
  const target = expiresAt ? new Date(expiresAt).getTime() : NaN;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (Number.isNaN(target)) return;

    setNow(Date.now());

    const id = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => window.clearInterval(id);
  }, [target]);

  if (Number.isNaN(target)) return null;

  const ms = Math.max(0, target - now);
  const totalSeconds = Math.floor(ms / 1000);

  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return {
    expired: ms === 0,
    urgent: ms < 10 * 60 * 1000,
    label: `${minutes}:${String(seconds).padStart(2, '0')}`,
  };
}

/* -------------------------------------------------------------------------- */
/* Copy button                                                                */
/* -------------------------------------------------------------------------- */

function CopyButton({
  value,
  label,
  large = false,
}: {
  value: string;
  label: string;
  large?: boolean;
}) {
  const { copied, copy } = useCopy();

  return (
    <button
      type="button"
      onClick={() => copy(value)}
      aria-label={`Copy ${label}`}
      className="inline-flex items-center justify-center rounded-full transition-all active:scale-90"
      style={{
        width: large ? 34 : 26,
        height: large ? 34 : 26,
        flexShrink: 0,
        color: copied ? PRIMARY : MUTED,
        background: copied
          ? 'color-mix(in oklab, var(--primary) 12%, transparent)'
          : 'color-mix(in oklab, var(--foreground) 5%, transparent)',
        border: `1px solid ${
          copied
            ? 'color-mix(in oklab, var(--primary) 20%, transparent)'
            : 'color-mix(in oklab, var(--foreground) 8%, transparent)'
        }`,
      }}
    >
      {copied ? (
        <Check size={large ? 15 : 12} strokeWidth={2.5} />
      ) : (
        <Copy size={large ? 15 : 12} />
      )}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Detail row                                                                 */
/* -------------------------------------------------------------------------- */

function DetailRow({
  label,
  value,
  display,
  mono,
  copyable = false,
}: {
  label: string;
  value?: string;
  display?: string;
  mono?: boolean;
  copyable?: boolean;
}) {
  const has = Boolean(value) && value !== '—';

  return (
    <div
      className="flex items-center justify-between gap-4"
      style={{
        minHeight: 48,
        padding: '10px 0',
      }}
    >
      <p
        style={{
          color: MUTED,
          fontSize: 11.5,
          flexShrink: 0,
        }}
      >
        {label}
      </p>

      <div className="flex items-center gap-2 min-w-0">
        <p
          title={value}
          className="truncate text-right"
          style={{
            color: has ? FG : MUTED,
            fontSize: mono ? 11.5 : 12,
            fontWeight: 600,
            fontFamily: mono ? MONO : undefined,
            letterSpacing: mono ? '0.01em' : undefined,
          }}
        >
          {has ? display ?? value : '—'}
        </p>

        {has && copyable && (
          <CopyButton
            value={value as string}
            label={label}
          />
        )}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Expiry                                                                     */
/* -------------------------------------------------------------------------- */

function ExpiryLive({
  expiresAt,
}: {
  expiresAt?: string | null;
}) {
  const cd = useCountdown(expiresAt);

  if (!expiresAt) return null;

  if (!cd) {
    return (
      <span
        style={{
          color: MUTED,
          fontSize: 10.5,
        }}
      >
        Expiry unavailable
      </span>
    );
  }

  const tone = cd.expired
    ? DANGER
    : cd.urgent
      ? WARN
      : FG;

  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1"
      style={{
        color: tone,
        background: cd.expired
          ? `color-mix(in oklab, ${DANGER} 9%, transparent)`
          : cd.urgent
            ? `color-mix(in oklab, ${WARN} 9%, transparent)`
            : 'color-mix(in oklab, var(--foreground) 6%, transparent)',
        border: `1px solid ${
          cd.expired
            ? `color-mix(in oklab, ${DANGER} 20%, transparent)`
            : cd.urgent
              ? `color-mix(in oklab, ${WARN} 20%, transparent)`
              : 'color-mix(in oklab, var(--foreground) 8%, transparent)'
        }`,
        fontSize: 10,
        fontWeight: 700,
      }}
    >
      <span
        className={cd.expired ? '' : 'animate-pulse'}
        style={{
          width: 5,
          height: 5,
          borderRadius: 999,
          background: tone,
          display: 'inline-block',
        }}
      />

      {cd.expired ? (
        'Expired'
      ) : (
        <>
          <Clock size={11} />
          {cd.label}
        </>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Main screen export                                                         */
/* -------------------------------------------------------------------------- */

export function OnRampScreen(props: OnRampProcessingStepProps) {
  return <OnRampProcessingStep {...props} />;
}

/* -------------------------------------------------------------------------- */
/* Bank transfer step                                                         */
/* -------------------------------------------------------------------------- */

export function OnRampProcessingStep({
  currency,
  amount,
  youGet,
  symbol,
  bankName,
  accountNumber,
  accountName,
  reference,
  expiresAt,
  checking,
  toast,
  onDismissToast,
  onConfirmPaid,
}: OnRampProcessingStepProps) {
  const hasVa = Boolean(accountNumber);
  const countdown = useCountdown(expiresAt);

  useEffect(() => {
    if (!toast) return;

    const t = window.setTimeout(() => {
      onDismissToast?.();
    }, 4000);

    return () => window.clearTimeout(t);
  }, [toast, onDismissToast]);

  /* ---------------------------------------------------------------------- */
  /* Waiting for virtual account                                            */
  /* ---------------------------------------------------------------------- */

  if (!hasVa) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="min-h-[calc(100vh-80px)] flex flex-col"
      >
        <div className="flex items-center gap-3 pt-4">
          <div
            className="w-9 h-9 rounded-full flex items-center justify-center"
            style={{
              background:
                'color-mix(in oklab, var(--primary) 10%, var(--card))',
              border:
                '1px solid color-mix(in oklab, var(--primary) 20%, var(--border))',
            }}
          >
            <Loader
              size={15}
              className="animate-spin"
              style={{ color: PRIMARY }}
            />
          </div>

          <div>
            <p
              style={{
                color: FG,
                fontSize: 13,
                fontWeight: 650,
              }}
            >
              Preparing your payment
            </p>

            <p
              style={{
                color: MUTED,
                fontSize: 11,
                marginTop: 2,
              }}
            >
              Creating a secure bank account…
            </p>
          </div>
        </div>

        <div
          className="rounded-[22px] flex-1 my-5 animate-pulse"
          style={{
            background: CARD,
            border: `1px solid ${BORDER}`,
          }}
        />
      </motion.div>
    );
  }

  /* ---------------------------------------------------------------------- */
  /* Values                                                                  */
  /* ---------------------------------------------------------------------- */

  const amountNumber = Number(amount);

  const formattedAmount = amountNumber.toLocaleString(undefined, {
    maximumFractionDigits: 2,
  });

  const rawAmount = Number.isFinite(amountNumber)
    ? String(amountNumber)
    : amount;

  const receive = `${youGet.toLocaleString(undefined, {
    maximumFractionDigits: 6,
  })} ${symbol}`;

  const expired = Boolean(countdown?.expired);

  /* ---------------------------------------------------------------------- */
  /* UI                                                                      */
  /* ---------------------------------------------------------------------- */

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[calc(100vh-80px)] flex flex-col relative"
    >
      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 18, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.97 }}
            className="fixed left-4 right-4 z-50 mx-auto"
            style={{
              bottom: 'max(80px, env(safe-area-inset-bottom))',
              maxWidth: 420,
            }}
          >
            <div
              className="rounded-2xl px-3.5 py-3 flex items-start gap-3"
              style={{
                background: 'var(--popover, #202024)',
                border: `1px solid ${BORDER}`,
                boxShadow: '0 16px 40px rgba(0,0,0,.35)',
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: `color-mix(in oklab, ${WARN} 12%, transparent)`,
                }}
              >
                <Clock
                  size={14}
                  style={{ color: WARN }}
                />
              </div>

              <div className="min-w-0 flex-1">
                <p
                  style={{
                    color: FG,
                    fontWeight: 650,
                    fontSize: 12,
                  }}
                >
                  Payment not confirmed
                </p>

                <p
                  style={{
                    color: MUTED,
                    fontSize: 11,
                    marginTop: 2,
                    lineHeight: 1.4,
                  }}
                >
                  {toast}
                </p>
              </div>

              <button
                type="button"
                onClick={onDismissToast}
                style={{
                  color: MUTED,
                  fontSize: 11,
                  fontWeight: 700,
                }}
              >
                Dismiss
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------------ */}
      {/* Content                                                             */}
      {/* ------------------------------------------------------------------ */}

      <div className="flex-1 pt-3 pb-4">
        {/* Status header */}
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center"
              style={{
                background:
                  'color-mix(in oklab, var(--primary) 11%, var(--card))',
                border:
                  '1px solid color-mix(in oklab, var(--primary) 22%, var(--border))',
              }}
            >
              <Building2
                size={15}
                style={{ color: PRIMARY }}
              />
            </div>

            <div>
              <p
                style={{
                  color: FG,
                  fontSize: 12.5,
                  fontWeight: 700,
                }}
              >
                Bank transfer
              </p>

              <p
                style={{
                  color: MUTED,
                  fontSize: 10.5,
                  marginTop: 1,
                }}
              >
                Complete the payment below
              </p>
            </div>
          </div>

          <ExpiryLive expiresAt={expiresAt} />
        </div>

        {/* Expired warning */}
        {expired && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="flex items-start gap-2.5 rounded-xl px-3 py-2.5 mb-4"
            role="alert"
            style={{
              background: `color-mix(in oklab, ${DANGER} 8%, var(--card))`,
              border:
                `1px solid color-mix(in oklab, ${DANGER} 22%, var(--border))`,
            }}
          >
            <AlertTriangle
              size={14}
              className="mt-0.5 flex-shrink-0"
              style={{ color: DANGER }}
            />

            <p
              style={{
                color: FG,
                fontSize: 11.5,
                lineHeight: 1.4,
              }}
            >
              <strong>This payment account has expired.</strong>{' '}
              Start a new purchase to receive fresh bank details.
            </p>
          </motion.div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Payment ticket                                                    */}
        {/* ---------------------------------------------------------------- */}

        <motion.div
          initial={{ opacity: 0, scale: 0.985 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="relative overflow-hidden rounded-[22px]"
          style={{
            background: CARD,
            border: `1px solid ${BORDER}`,
            boxShadow: '0 18px 45px rgba(0,0,0,.16)',
          }}
        >
          {/* subtle top glow */}
          <div
            aria-hidden
            className="absolute inset-x-0 top-0 h-24 pointer-events-none"
            style={{
              background:
                'linear-gradient(180deg, color-mix(in oklab, var(--primary) 9%, transparent), transparent)',
            }}
          />

          {/* Amount section */}
          <div className="relative px-4 pt-4 pb-4">
            <div className="flex items-center justify-between">
              <p style={LABEL}>You send</p>

              <span
                className="rounded-full px-2 py-1"
                style={{
                  color: PRIMARY,
                  background:
                    'color-mix(in oklab, var(--primary) 9%, transparent)',
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: '.04em',
                }}
              >
                EXACT AMOUNT
              </span>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <p
                className="tabular-nums"
                style={{
                  color: FG,
                  fontSize: 30,
                  fontWeight: 750,
                  letterSpacing: -1,
                  lineHeight: 1,
                }}
              >
                {formattedAmount}
              </p>

              <span
                style={{
                  color: MUTED,
                  fontSize: 13,
                  fontWeight: 650,
                  alignSelf: 'flex-end',
                  marginBottom: 2,
                }}
              >
                {currency.code}
              </span>

              <CopyButton
                value={rawAmount}
                label="amount"
              />
            </div>

            <div
              className="flex items-center gap-2 mt-3"
              style={{
                color: MUTED,
                fontSize: 11.5,
              }}
            >
              <ArrowDown
                size={13}
                style={{ color: PRIMARY }}
              />

              <span>
                You receive about{' '}
                <strong style={{ color: FG }}>
                  {receive}
                </strong>
              </span>
            </div>
          </div>

          {/* Ticket perforation */}
          <div
            className="relative"
            style={{
              height: 1,
              borderTop: `1px dashed ${BORDER}`,
            }}
          >
            <span
              aria-hidden
              style={{
                position: 'absolute',
                left: -7,
                top: -7,
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: PAGE,
                borderRight: `1px solid ${BORDER}`,
              }}
            />

            <span
              aria-hidden
              style={{
                position: 'absolute',
                right: -7,
                top: -7,
                width: 14,
                height: 14,
                borderRadius: '50%',
                background: PAGE,
                borderLeft: `1px solid ${BORDER}`,
              }}
            />
          </div>

          {/* Bank section */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p style={LABEL}>Transfer to</p>

                <p
                  style={{
                    color: FG,
                    fontSize: 13,
                    fontWeight: 700,
                    marginTop: 3,
                  }}
                >
                  {bankName || 'Bank account'}
                </p>
              </div>

              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{
                  background:
                    'color-mix(in oklab, var(--foreground) 6%, transparent)',
                  border:
                    `1px solid color-mix(in oklab, var(--foreground) 8%, transparent)`,
                }}
              >
                <Building2
                  size={16}
                  style={{ color: MUTED }}
                />
              </div>
            </div>

            {/* Account number */}
            <div
              className="rounded-xl px-3 py-3 mb-2"
              style={{
                background:
                  'color-mix(in oklab, var(--foreground) 4%, transparent)',
                border:
                  '1px solid color-mix(in oklab, var(--foreground) 7%, transparent)',
              }}
            >
              <p style={LABEL}>Account number</p>

              <div className="flex items-center justify-between gap-2 mt-1.5">
                <p
                  className="tabular-nums"
                  style={{
                    color: FG,
                    fontSize: 20,
                    fontWeight: 750,
                    letterSpacing: 1,
                    lineHeight: 1,
                    fontFamily: MONO,
                  }}
                >
                  {accountNumber}
                </p>

                <CopyButton
                  value={accountNumber as string}
                  label="account number"
                  large
                />
              </div>
            </div>

            {/* Details */}
            <div
              className="mt-2"
              style={{
                borderTop: `1px solid ${BORDER}`,
              }}
            >
              <DetailRow
                label="Account name"
                value={accountName || '—'}
              />

              <div
                style={{
                  borderTop: `1px solid ${BORDER}`,
                }}
              />

              <DetailRow
                label="Reference"
                value={reference || '—'}
                display={
                  reference
                    ? truncateMiddle(reference, 9, 7)
                    : undefined
                }
                mono
                copyable
              />
            </div>
          </div>
        </motion.div>

        {/* Security reassurance */}
        <div
          className="flex items-center justify-center gap-1.5 mt-4"
          style={{
            color: MUTED,
            fontSize: 10.5,
          }}
        >
          <ShieldCheck
            size={13}
            style={{ color: PRIMARY }}
          />

          <span>
            Use the exact amount and reference shown above
          </span>
        </div>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Bottom action                                                       */}
      {/* ONLY CHANGE: keep the action visible on mobile                     */}
      {/* ------------------------------------------------------------------ */}

      <div
        className="sticky bottom-0 z-20 pt-3 pb-2"
        style={{
          background: PAGE,
        }}
      >
        <motion.button
          type="button"
          disabled={Boolean(checking) || expired}
          whileTap={
            !checking && !expired
              ? { scale: 0.985 }
              : undefined
          }
          onClick={onConfirmPaid}
          className="w-full rounded-full font-semibold flex items-center justify-center gap-2 transition-all"
          style={{
            height: 50,
            fontSize: 14,
            background: expired
              ? 'color-mix(in oklab, var(--foreground) 8%, transparent)'
              : PRIMARY,
            color: expired ? MUTED : PRIMARY_FG,
            opacity: checking ? 0.8 : 1,
            boxShadow: expired
              ? 'none'
              : '0 8px 25px color-mix(in oklab, var(--primary) 18%, transparent)',
          }}
        >
          {checking ? (
            <>
              <Loader
                size={15}
                className="animate-spin"
              />
              Checking payment…
            </>
          ) : expired ? (
            'Payment expired'
          ) : (
            "I've paid"
          )}
        </motion.button>

        <p
          style={{
            color: MUTED,
            fontSize: 10.5,
            textAlign: 'center',
            marginTop: 9,
            lineHeight: 1.4,
          }}
        >
          Pay from your bank app, then tap once the transfer is complete.
        </p>
      </div>
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Done step                                                                  */
/* -------------------------------------------------------------------------- */

export function OnRampDoneStep({
  youGet,
  symbol,
  onDone,
}: {
  youGet: number;
  symbol: string;
  onDone: () => void;
}) {
  return (
    <motion.div
      key="done"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="min-h-[calc(100vh-80px)] flex flex-col items-center justify-between pt-8 pb-4 px-1 text-center"
    >
      <div className="flex-1 flex flex-col items-center justify-center">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            type: 'spring',
            stiffness: 260,
            damping: 18,
          }}
          className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
          style={{
            background:
              'color-mix(in oklab, var(--primary) 13%, var(--card))',
            border:
              '1px solid color-mix(in oklab, var(--primary) 28%, var(--border))',
            boxShadow:
              '0 12px 35px color-mix(in oklab, var(--primary) 12%, transparent)',
          }}
        >
          <CheckCircle2
            size={28}
            strokeWidth={2.2}
            style={{ color: PRIMARY }}
          />
        </motion.div>

        <p style={LABEL}>
          Payment confirmed
        </p>

        <p
          className="tabular-nums"
          style={{
            color: FG,
            fontSize: 27,
            fontWeight: 750,
            letterSpacing: -0.7,
            marginTop: 7,
          }}
        >
          +{youGet.toLocaleString(undefined, {
            maximumFractionDigits: 6,
          })}{' '}
          {symbol}
        </p>

        <p
          style={{
            color: MUTED,
            fontSize: 12,
            marginTop: 5,
          }}
        >
          The funds have been credited to your wallet.
        </p>
      </div>

      <motion.button
        type="button"
        whileTap={{ scale: 0.985 }}
        onClick={onDone}
        className="w-full rounded-full"
        style={{
          height: 50,
          background: PRIMARY,
          color: PRIMARY_FG,
          fontWeight: 650,
          fontSize: 14,
          boxShadow:
            '0 8px 25px color-mix(in oklab, var(--primary) 18%, transparent)',
        }}
      >
        Done
      </motion.button>
    </motion.div>
  );
}