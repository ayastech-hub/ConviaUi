import { motion, AnimatePresence } from 'motion/react';
import { Loader, CheckCircle2, Copy, Check, Clock, AlertTriangle } from 'lucide-react';
import { useEffect, useState, type CSSProperties } from 'react';
import type { Currency } from '../../../../shared/context/CurrencyContext';

interface OnRampProcessingStepProps {
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

/* ---------- tokens ---------- */

const WARN = 'var(--warning, #f59e0b)';
const DANGER = 'var(--destructive, #ef4444)';
const PAGE = 'var(--background, #0e0e10)';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const LABEL: CSSProperties = {
  color: 'var(--muted-foreground)',
  fontSize: 11,
  fontWeight: 600,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
};

/* ---------- helpers ---------- */

const truncateMiddle = (s: string, head = 11, tail = 7) =>
  s.length <= head + tail + 1 ? s : `${s.slice(0, head)}…${s.slice(-tail)}`;

function useCopy() {
  const [copied, setCopied] = useState(false);
  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };
  return { copied, copy };
}

/** Live countdown to expiresAt. Returns null when there is no usable date. */
function useCountdown(expiresAt?: string | null) {
  const target = expiresAt ? new Date(expiresAt).getTime() : NaN;
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (Number.isNaN(target)) return;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [target]);

  if (Number.isNaN(target)) return null;

  const ms = Math.max(0, target - now);
  const s = Math.floor(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  const label = h > 0 ? `${h}h ${String(m).padStart(2, '0')}m` : `${m}:${String(sec).padStart(2, '0')}`;

  return { expired: ms === 0, urgent: ms < 10 * 60 * 1000, label };
}

/* ---------- small pieces ---------- */

/** Text pill (used once, for the account number) */
function CopyPill({ value, label }: { value: string; label: string }) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(value)}
      aria-label={`Copy ${label}`}
      className="flex items-center gap-1.5 rounded-full flex-shrink-0"
      style={{
        height: 30,
        padding: '0 12px',
        fontSize: 12.5,
        fontWeight: 650,
        color: copied ? 'var(--primary-foreground, #fff)' : 'var(--primary)',
        background: copied ? 'var(--primary)' : 'color-mix(in oklab, var(--primary) 12%, transparent)',
        transition: 'background .15s, color .15s',
      }}
    >
      {copied ? <Check size={13} strokeWidth={2.5} /> : <Copy size={13} />}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

/** Quiet icon-only copy button */
function CopyIcon({ value, label }: { value: string; label: string }) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(value)}
      aria-label={`Copy ${label}`}
      className="flex items-center justify-center rounded-lg flex-shrink-0"
      style={{
        width: 28,
        height: 28,
        color: copied ? 'var(--primary)' : 'var(--muted-foreground)',
        background: copied ? 'color-mix(in oklab, var(--primary) 12%, transparent)' : 'transparent',
        transition: 'background .15s, color .15s',
      }}
    >
      {copied ? <Check size={14} strokeWidth={2.5} /> : <Copy size={14} />}
    </button>
  );
}

function DetailRow({
  label,
  value,
  display,
  mono,
  copyable = true,
}: {
  label: string;
  value?: string;
  display?: string;
  mono?: boolean;
  copyable?: boolean;
}) {
  const has = Boolean(value) && value !== '—';
  return (
    <div className="flex items-center justify-between gap-3" style={{ minHeight: 44 }}>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 12.5, flexShrink: 0 }}>{label}</p>
      <div className="flex items-center gap-1 min-w-0">
        <p
          title={value}
          className="truncate text-right"
          style={{
            color: has ? 'var(--foreground)' : 'var(--muted-foreground)',
            fontSize: mono ? 12.5 : 13.5,
            fontWeight: 600,
            fontFamily: mono ? MONO : undefined,
          }}
        >
          {has ? display ?? value : '—'}
        </p>
        {has && copyable && <CopyIcon value={value as string} label={label} />}
      </div>
    </div>
  );
}

function ExpiryLive({ expiresAt }: { expiresAt?: string | null }) {
  const cd = useCountdown(expiresAt);
  if (!expiresAt) return null;
  if (!cd) {
    return <span style={{ color: 'var(--muted-foreground)', fontSize: 11.5 }}>Expires {String(expiresAt)}</span>;
  }
  const tone = cd.expired ? DANGER : cd.urgent ? WARN : 'var(--muted-foreground)';
  return (
    <span className="flex items-center gap-1.5 tabular-nums" style={{ color: tone, fontSize: 11.5, fontWeight: 600 }}>
      <span
        className={cd.expired ? '' : 'animate-pulse'}
        style={{ width: 6, height: 6, borderRadius: 999, background: tone, display: 'inline-block' }}
      />
      {cd.expired ? (
        'Expired'
      ) : (
        <>
          Expires in <span style={{ color: cd.urgent ? tone : 'var(--foreground)' }}>{cd.label}</span>
        </>
      )}
    </span>
  );
}

/** Thin 3-part progress: Transfer > Confirm > Receive */
function Progress({ active }: { active: 0 | 1 | 2 }) {
  const items = ['Transfer', 'Confirm', 'Receive'];
  return (
    <div className="grid grid-cols-3 gap-1.5 mb-5" aria-label={`Step ${active + 1} of 3: ${items[active]}`}>
      {items.map((t, i) => (
        <div key={t}>
          <div
            style={{
              height: 3,
              borderRadius: 2,
              background: i <= active ? 'var(--primary)' : 'var(--border)',
              opacity: i < active ? 0.5 : 1,
            }}
          />
          <p
            style={{
              marginTop: 6,
              fontSize: 11,
              fontWeight: 600,
              color: i === active ? 'var(--foreground)' : 'var(--muted-foreground)',
            }}
          >
            {t}
          </p>
        </div>
      ))}
    </div>
  );
}

/* ---------- step 1: bank transfer ---------- */

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
    const t = setTimeout(() => onDismissToast?.(), 4000);
    return () => clearTimeout(t);
  }, [toast, onDismissToast]);

  /* creating account: skeleton of the real layout */
  if (!hasVa) {
    return (
      <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
        <Progress active={0} />
        <div className="flex items-center gap-2.5 mb-4">
          <Loader size={16} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Creating your account, usually a few seconds</p>
        </div>
        <div
          className="animate-pulse rounded-[20px]"
          style={{ height: 300, background: 'var(--card)', border: '1px solid var(--border)' }}
        />
      </motion.div>
    );
  }

  const amountNumber = Number(amount);
  const amtNum = amountNumber.toLocaleString(undefined, { maximumFractionDigits: 2 });
  const amtFull = `${amtNum} ${currency.code}`;
  // Copy the plain number so it pastes cleanly into a bank app
  const amtRaw = Number.isFinite(amountNumber) ? String(amountNumber) : amount;
  const receive = `${youGet.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${symbol}`;
  const expired = Boolean(countdown?.expired);

  return (
    <motion.div key="va" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pb-4 relative">
      {/* Bottom toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed left-4 right-4 z-50 mx-auto"
            style={{ bottom: 'max(92px, env(safe-area-inset-bottom))', maxWidth: 420 }}
          >
            <div
              className="rounded-xl px-3.5 py-3 flex items-start gap-2.5"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
              }}
            >
              <Clock size={16} className="mt-0.5 flex-shrink-0" style={{ color: WARN }} />
              <div className="min-w-0 flex-1">
                <p style={{ color: 'var(--foreground)', fontWeight: 650, fontSize: 12.5 }}>Not confirmed yet</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 2, lineHeight: 1.4 }}>
                  {toast}
                </p>
              </div>
              <button
                type="button"
                onClick={onDismissToast}
                style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}
              >
                OK
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Progress active={0} />

      {expired && (
        <div
          className="flex items-start gap-2 rounded-xl px-3 py-2.5 mb-3"
          role="alert"
          style={{
            background: `color-mix(in oklab, ${DANGER} 10%, var(--card))`,
            border: `1px solid color-mix(in oklab, ${DANGER} 28%, var(--border))`,
          }}
        >
          <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" style={{ color: DANGER }} />
          <p style={{ color: 'var(--foreground)', fontSize: 12.5, lineHeight: 1.45 }}>
            <strong>This account has expired.</strong> Don&apos;t send money to it. Start a new purchase. If you
            already paid, tap I&apos;ve paid.
          </p>
        </div>
      )}

      {/* Ticket */}
      <div
        className="relative overflow-hidden rounded-[20px]"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* top: amount */}
        <div
          className="px-4 pt-4 pb-4"
          style={{
            background: 'linear-gradient(180deg, color-mix(in oklab, var(--primary) 9%, var(--card)) 0%, var(--card) 100%)',
          }}
        >
          <div className="flex items-center justify-between gap-3">
            <p style={LABEL}>Send exactly</p>
            <ExpiryLive expiresAt={expiresAt} />
          </div>

          <div className="flex items-center justify-between gap-3 mt-2">
            <p className="tabular-nums" style={{ color: 'var(--foreground)', lineHeight: 1 }}>
              <span style={{ fontSize: 28, fontWeight: 700, letterSpacing: -0.6 }}>{amtNum}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--muted-foreground)', marginLeft: 6 }}>
                {currency.code}
              </span>
            </p>
            <CopyIcon value={amtRaw} label="amount" />
          </div>

          <p style={{ color: 'var(--muted-foreground)', fontSize: 12.5, marginTop: 10 }}>
            You receive about{' '}
            <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 600 }}>
              {receive}
            </span>
          </p>
        </div>

        {/* perforation */}
        <div className="relative" style={{ height: 1 }}>
          <div style={{ borderTop: '1px dashed var(--border)', margin: '0 14px' }} />
          {(['left', 'right'] as const).map((side) => (
            <span
              key={side}
              aria-hidden
              style={{
                position: 'absolute',
                top: -8,
                [side]: -8,
                width: 16,
                height: 16,
                borderRadius: 999,
                background: PAGE,
                border: '1px solid var(--border)',
              }}
            />
          ))}
        </div>

        {/* bottom: account */}
        <div className="px-4 pt-4 pb-2">
          <p style={LABEL}>{bankName || 'Bank'}</p>
          <div className="flex items-center justify-between gap-3 mt-2 mb-2">
            <p
              className="tabular-nums"
              style={{ color: 'var(--foreground)', fontSize: 22, fontWeight: 700, letterSpacing: 0.8, lineHeight: 1 }}
            >
              {accountNumber}
            </p>
            <CopyPill value={accountNumber as string} label="account number" />
          </div>

          <div className="mt-2" style={{ borderTop: '1px solid var(--border)' }}>
            <DetailRow label="Account name" value={accountName || '—'} />
            <div style={{ borderTop: '1px solid var(--border)' }} />
            <DetailRow
              label="Reference"
              value={reference || '—'}
              display={reference ? truncateMiddle(reference) : undefined}
              mono
            />
          </div>
        </div>
      </div>

      {/* Sticky action */}
      <div
        className="sticky bottom-0 pt-7 pb-3"
        style={{ background: `linear-gradient(to top, ${PAGE} 65%, transparent)` }}
      >
        <button
          type="button"
          disabled={!!checking}
          onClick={onConfirmPaid}
          className="w-full rounded-full font-semibold flex items-center justify-center gap-2"
          style={{
            height: 48,
            fontSize: 14.5,
            background: 'var(--primary)',
            color: 'var(--primary-foreground, #fff)',
            opacity: checking ? 0.8 : 1,
          }}
        >
          {checking ? (
            <>
              <Loader size={15} className="animate-spin" />
              Checking payment…
            </>
          ) : (
            "I've paid"
          )}
        </button>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 11.5, textAlign: 'center', marginTop: 10, lineHeight: 1.45 }}>
          Pay from your bank app, then tap once the transfer goes through.
        </p>
      </div>
    </motion.div>
  );
}

/* ---------- step 2: done ---------- */

interface OnRampDoneStepProps {
  youGet: number;
  symbol: string;
  onDone: () => void;
}

export function OnRampDoneStep({ youGet, symbol, onDone }: OnRampDoneStepProps) {
  return (
    <motion.div
      key="done"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center pt-8 px-1 text-center"
    >
      <div className="w-full">
        <Progress active={2} />
      </div>
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="w-14 h-14 rounded-full flex items-center justify-center mt-8 mb-5"
        style={{
          background: 'color-mix(in oklab, var(--primary) 14%, var(--card))',
          border: '1px solid color-mix(in oklab, var(--primary) 30%, var(--border))',
        }}
      >
        <CheckCircle2 size={26} style={{ color: 'var(--primary)' }} />
      </motion.div>
      <p style={LABEL}>Payment confirmed</p>
      <p
        className="tabular-nums"
        style={{ color: 'var(--foreground)', fontSize: 26, fontWeight: 700, letterSpacing: -0.5, marginTop: 8 }}
      >
        +{youGet.toLocaleString(undefined, { maximumFractionDigits: 6 })} {symbol}
      </p>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 12.5, marginTop: 6, marginBottom: 28 }}>
        It&apos;s in your wallet now.
      </p>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onDone}
        className="w-full rounded-full"
        style={{
          height: 48,
          background: 'var(--primary)',
          color: 'var(--primary-foreground, #fff)',
          fontWeight: 600,
          fontSize: 14.5,
        }}
      >
        Done
      </motion.button>
    </motion.div>
  );
}
