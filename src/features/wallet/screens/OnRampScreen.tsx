
import { motion, AnimatePresence } from 'motion/react';
import { Loader, CheckCircle2, Copy, Check, Clock, AlertTriangle } from 'lucide-react';
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

/* ---------- Tokens ---------- */

const WARN = 'var(--warning, #f59e0b)';
const DANGER = 'var(--destructive, #ef4444)';
const PAGE = 'var(--background, #0e0e10)';
const MONO = 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace';

const LABEL: React.CSSProperties = {
  color: 'var(--muted-foreground)',
  fontSize: 10,
  fontWeight: 600,
  letterSpacing: '0.05em',
  textTransform: 'uppercase',
};

/* ---------- Helpers ---------- */

const truncateMiddle = (s: string, head = 8, tail = 6) =>
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

/** Live countdown to expiresAt */
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

/* ---------- Small Components ---------- */

/** Compact Icon-only copy button placed right next to text */
function CompactCopyIcon({ value, label }: { value: string; label: string }) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(value)}
      aria-label={`Copy ${label}`}
      className="inline-flex items-center justify-center rounded-md flex-shrink-0 transition-colors"
      style={{
        width: 22,
        height: 22,
        color: copied ? 'var(--primary)' : 'var(--muted-foreground)',
        background: copied ? 'color-mix(in oklab, var(--primary) 12%, transparent)' : 'transparent',
      }}
    >
      {copied ? <Check size={12} strokeWidth={2.5} /> : <Copy size={12} />}
    </button>
  );
}

function DetailRow({
  label,
  value,
  display,
  mono,
  copyable = false, // Copy disabled by default for details like Name
}: {
  label: string;
  value?: string;
  display?: string;
  mono?: boolean;
  copyable?: boolean;
}) {
  const has = Boolean(value) && value !== '—';
  return (
    <div className="flex items-center justify-between gap-2 py-2" style={{ minHeight: 36 }}>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 11.5, flexShrink: 0 }}>{label}</p>
      <div className="flex items-center gap-1 min-w-0">
        <p
          title={value}
          className="truncate text-right"
          style={{
            color: has ? 'var(--foreground)' : 'var(--muted-foreground)',
            fontSize: mono ? 11.5 : 12.5,
            fontWeight: 600,
            fontFamily: mono ? MONO : undefined,
          }}
        >
          {has ? display ?? value : '—'}
        </p>
        {has && copyable && <CompactCopyIcon value={value as string} label={label} />}
      </div>
    </div>
  );
}

function ExpiryLive({ expiresAt }: { expiresAt?: string | null }) {
  const cd = useCountdown(expiresAt);
  if (!expiresAt) return null;
  if (!cd) {
    return <span style={{ color: 'var(--muted-foreground)', fontSize: 10.5 }}>Expires {String(expiresAt)}</span>;
  }
  const tone = cd.expired ? DANGER : cd.urgent ? WARN : 'var(--muted-foreground)';
  return (
    <span className="flex items-center gap-1.5 tabular-nums" style={{ color: tone, fontSize: 10.5, fontWeight: 600 }}>
      <span
        className={cd.expired ? '' : 'animate-pulse'}
        style={{ width: 5, height: 5, borderRadius: 999, background: tone, display: 'inline-block' }}
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

function Progress({ active }: { active: 0 | 1 | 2 }) {
  const items = ['Transfer', 'Confirm', 'Receive'];
  return (
    <div className="grid grid-cols-3 gap-1.5 mb-4" aria-label={`Step ${active + 1} of 3: ${items[active]}`}>
      {items.map((t, i) => (
        <div key={t}>
          <div
            style={{
              height: 2.5,
              borderRadius: 2,
              background: i <= active ? 'var(--primary)' : 'var(--border)',
              opacity: i < active ? 0.5 : 1,
            }}
          />
          <p
            style={{
              marginTop: 4,
              fontSize: 10,
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

/* ---------- Main Screen Export ---------- */

export function OnRampScreen(props: OnRampProcessingStepProps) {
  return <OnRampProcessingStep {...props} />;
}

/* ---------- Step 1: Bank Transfer ---------- */

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

  if (!hasVa) {
    return (
      <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-8">
        <Progress active={0} />
        <div className="flex items-center gap-2 mb-3">
          <Loader size={14} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Creating account…</p>
        </div>
        <div
          className="animate-pulse rounded-[18px]"
          style={{ height: 260, background: 'var(--card)', border: '1px solid var(--border)' }}
        />
      </motion.div>
    );
  }

  const amountNumber = Number(amount);
  const amtNum = amountNumber.toLocaleString(undefined, { maximumFractionDigits: 2 });
  const amtRaw = Number.isFinite(amountNumber) ? String(amountNumber) : amount;
  const receive = `${youGet.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${symbol}`;
  const expired = Boolean(countdown?.expired);

  return (
    <motion.div key="va" initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="pb-4 relative">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            className="fixed left-4 right-4 z-50 mx-auto"
            style={{ bottom: 'max(80px, env(safe-area-inset-bottom))', maxWidth: 420 }}
          >
            <div
              className="rounded-xl px-3 py-2.5 flex items-start gap-2"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: '0 12px 30px rgba(0,0,0,0.3)',
              }}
            >
              <Clock size={15} className="mt-0.5 flex-shrink-0" style={{ color: WARN }} />
              <div className="min-w-0 flex-1">
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 12 }}>Not confirmed yet</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 1, lineHeight: 1.35 }}>
                  {toast}
                </p>
              </div>
              <button
                type="button"
                onClick={onDismissToast}
                style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}
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
          className="flex items-start gap-2 rounded-lg px-3 py-2 mb-3"
          role="alert"
          style={{
            background: `color-mix(in oklab, ${DANGER} 10%, var(--card))`,
            border: `1px solid color-mix(in oklab, ${DANGER} 28%, var(--border))`,
          }}
        >
          <AlertTriangle size={13} className="mt-0.5 flex-shrink-0" style={{ color: DANGER }} />
          <p style={{ color: 'var(--foreground)', fontSize: 11.5, lineHeight: 1.4 }}>
            <strong>This account has expired.</strong> Start a new purchase.
          </p>
        </div>
      )}

      {/* Ticket Card */}
      <div
        className="relative overflow-hidden rounded-[18px]"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {/* Top: Amount */}
        <div
          className="px-3.5 pt-3.5 pb-3"
          style={{
            background: 'linear-gradient(180deg, color-mix(in oklab, var(--primary) 8%, var(--card)) 0%, var(--card) 100%)',
          }}
        >
          <div className="flex items-center justify-between gap-2">
            <p style={LABEL}>Send exactly</p>
            <ExpiryLive expiresAt={expiresAt} />
          </div>

          <div className="flex items-center gap-1.5 mt-1">
            <p className="tabular-nums" style={{ color: 'var(--foreground)', lineHeight: 1 }}>
              <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: -0.4 }}>{amtNum}</span>
              <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--muted-foreground)', marginLeft: 4 }}>
                {currency.code}
              </span>
            </p>
            <CompactCopyIcon value={amtRaw} label="amount" />
          </div>

          <p style={{ color: 'var(--muted-foreground)', fontSize: 11.5, marginTop: 6 }}>
            You receive about{' '}
            <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 600 }}>
              {receive}
            </span>
          </p>
        </div>

        {/* Perforation Line */}
        <div className="relative" style={{ height: 1 }}>
          <div style={{ borderTop: '1px dashed var(--border)', margin: '0 12px' }} />
          {(['left', 'right'] as const).map((side) => (
            <span
              key={side}
              aria-hidden
              style={{
                position: 'absolute',
                top: -6,
                [side]: -6,
                width: 12,
                height: 12,
                borderRadius: 999,
                background: PAGE,
                border: '1px solid var(--border)',
              }}
            />
          ))}
        </div>

        {/* Bottom: Account Details */}
        <div className="px-3.5 pt-3 pb-2">
          <p style={LABEL}>{bankName || 'Bank'}</p>
          <div className="flex items-center gap-2 mt-1 mb-1">
            <p
              className="tabular-nums"
              style={{ color: 'var(--foreground)', fontSize: 18, fontWeight: 700, letterSpacing: 0.5, lineHeight: 1 }}
            >
              {accountNumber}
            </p>
            <CompactCopyIcon value={accountNumber as string} label="account number" />
          </div>

          <div className="mt-2" style={{ borderTop: '1px solid var(--border)' }}>
            {/* Account Name without Copy option */}
            <DetailRow label="Account name" value={accountName || '—'} copyable={false} />
            <div style={{ borderTop: '1px solid var(--border)' }} />
            {/* Reference with compact copy option */}
            <DetailRow
              label="Reference"
              value={reference || '—'}
              display={reference ? truncateMiddle(reference) : undefined}
              mono
              copyable
            />
          </div>
        </div>
      </div>

      {/* Sticky Bottom Action */}
      <div
        className="sticky bottom-0 pt-5 pb-2"
        style={{ background: `linear-gradient(to top, ${PAGE} 70%, transparent)` }}
      >
        <button
          type="button"
          disabled={!!checking}
          onClick={onConfirmPaid}
          className="w-full rounded-full font-semibold flex items-center justify-center gap-1.5 transition-opacity"
          style={{
            height: 44,
            fontSize: 13.5,
            background: 'var(--primary)',
            color: 'var(--primary-foreground, #fff)',
            opacity: checking ? 0.8 : 1,
          }}
        >
          {checking ? (
            <>
              <Loader size={14} className="animate-spin" />
              Checking payment…
            </>
          ) : (
            "I've paid"
          )}
        </button>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 11, textAlign: 'center', marginTop: 8, lineHeight: 1.35 }}>
          Pay from your bank app, then tap once completed.
        </p>
      </div>
    </motion.div>
  );
}

/* ---------- Step 2: Done ---------- */

export function OnRampDoneStep({ youGet, symbol, onDone }: { youGet: number; symbol: string; onDone: () => void }) {
  return (
    <motion.div
      key="done"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center pt-6 px-1 text-center"
    >
      <div className="w-full">
        <Progress active={2} />
      </div>
      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="w-12 h-12 rounded-full flex items-center justify-center mt-6 mb-4"
        style={{
          background: 'color-mix(in oklab, var(--primary) 14%, var(--card))',
          border: '1px solid color-mix(in oklab, var(--primary) 30%, var(--border))',
        }}
      >
        <CheckCircle2 size={22} style={{ color: 'var(--primary)' }} />
      </motion.div>
      <p style={LABEL}>Payment confirmed</p>
      <p
        className="tabular-nums"
        style={{ color: 'var(--foreground)', fontSize: 22, fontWeight: 700, letterSpacing: -0.4, marginTop: 6 }}
      >
        +{youGet.toLocaleString(undefined, { maximumFractionDigits: 6 })} {symbol}
      </p>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 11.5, marginTop: 4, marginBottom: 24 }}>
        Credited to your wallet.
      </p>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onDone}
        className="w-full rounded-full"
        style={{
          height: 44,
          background: 'var(--primary)',
          color: 'var(--primary-foreground, #fff)',
          fontWeight: 600,
          fontSize: 13.5,
        }}
      >
        Done
      </motion.button>
    </motion.div>
  );
}
