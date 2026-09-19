import { motion, AnimatePresence } from 'motion/react';
import { Loader, CheckCircle2, Copy, Check, Clock, Landmark, AlertTriangle } from 'lucide-react';
import { useEffect, useState } from 'react';
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

/* ---------- helpers ---------- */

const WARN = 'var(--warning, #f59e0b)';
const DANGER = 'var(--destructive, #ef4444)';

const truncateMiddle = (s: string, head = 12, tail = 8) =>
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

function CopyPill({ value, label, big }: { value: string; label: string; big?: boolean }) {
  const { copied, copy } = useCopy();
  return (
    <button
      type="button"
      onClick={() => copy(value)}
      aria-label={`Copy ${label}`}
      className="flex items-center gap-1.5 rounded-full flex-shrink-0"
      style={{
        height: big ? 40 : 32,
        padding: big ? '0 16px' : '0 12px',
        fontSize: 13,
        fontWeight: 650,
        color: copied ? 'var(--primary)' : 'var(--foreground)',
        background: copied
          ? 'color-mix(in oklab, var(--primary) 14%, var(--card))'
          : 'var(--liquid-chip-off-bg, var(--muted))',
        border: `1px solid ${copied ? 'color-mix(in oklab, var(--primary) 35%, var(--border))' : 'var(--border)'}`,
        transition: 'background .15s, color .15s, border-color .15s',
      }}
    >
      {copied ? <Check size={14} /> : <Copy size={14} />}
      <span aria-live="polite">{copied ? 'Copied' : 'Copy'}</span>
    </button>
  );
}

function DetailRow({
  label,
  value,
  display,
  mono,
}: {
  label: string;
  value?: string;
  display?: string;
  mono?: boolean;
}) {
  const has = Boolean(value) && value !== '—';
  return (
    <div
      className="flex items-center justify-between gap-3 py-3.5"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <div className="min-w-0">
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>{label}</p>
        <p
          title={value}
          className="truncate"
          style={{
            color: has ? 'var(--foreground)' : 'var(--muted-foreground)',
            fontSize: mono ? 13.5 : 15,
            fontWeight: 650,
            marginTop: 2,
            fontFamily: mono ? 'ui-monospace, SFMono-Regular, Menlo, monospace' : undefined,
          }}
        >
          {has ? display ?? value : '—'}
        </p>
      </div>
      {has && <CopyPill value={value as string} label={label} />}
    </div>
  );
}

function TimerPill({ expiresAt }: { expiresAt?: string | null }) {
  const cd = useCountdown(expiresAt);
  if (!expiresAt) return null;

  // Unparseable date: show whatever the server sent
  if (!cd) {
    return (
      <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
        Expires {String(expiresAt)}
      </span>
    );
  }

  const tone = cd.expired ? DANGER : cd.urgent ? WARN : 'var(--muted-foreground)';
  return (
    <span
      className="flex items-center gap-1.5 rounded-full tabular-nums"
      style={{
        height: 30,
        padding: '0 12px',
        fontSize: 12.5,
        fontWeight: 650,
        color: tone,
        background: `color-mix(in oklab, ${tone} 10%, var(--card))`,
        border: `1px solid color-mix(in oklab, ${tone} 28%, var(--border))`,
      }}
    >
      <Clock size={13} />
      {cd.expired ? 'Expired' : (
        <>
          Expires in <strong style={{ color: cd.urgent ? tone : 'var(--foreground)' }}>{cd.label}</strong>
        </>
      )}
    </span>
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

  const expiryText = (() => {
    if (!expiresAt) return null;
    const d = new Date(expiresAt);
    if (Number.isNaN(d.getTime())) return String(expiresAt);
    return d.toLocaleString(undefined, { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  })();

  /* creating account: skeleton of the real layout */
  if (!hasVa) {
    return (
      <motion.div key="wait" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="pb-10">
        <div className="flex items-center gap-3 mb-6">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            <Loader size={18} className="animate-spin" style={{ color: 'var(--foreground)' }} />
          </div>
          <div>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>Creating your account…</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Usually a few seconds</p>
          </div>
        </div>
        {[112, 208].map((h) => (
          <div
            key={h}
            className="animate-pulse rounded-[24px] mb-3"
            style={{ height: h, background: 'var(--card)', border: '1px solid var(--border)' }}
          />
        ))}
      </motion.div>
    );
  }

  const amountNumber = Number(amount);
  const amt = `${amountNumber.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency.code}`;
  // Copy the plain number so it pastes cleanly into a bank app
  const amtRaw = Number.isFinite(amountNumber) ? String(amountNumber) : amount;
  const receive = `${youGet.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${symbol}`;
  const expired = Boolean(countdown?.expired);

  const steps = [
    'Open your bank app',
    `Send exactly ${amt} to the account below`,
    "Come back here and tap I've paid",
  ];

  return (
    <motion.div key="va" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pb-6 relative">
      {/* Bottom toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed left-4 right-4 z-50 mx-auto"
            style={{ bottom: 'max(96px, env(safe-area-inset-bottom))', maxWidth: 420 }}
          >
            <div
              className="rounded-2xl px-4 py-3.5 flex items-start gap-3"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
              }}
            >
              <Clock size={18} className="mt-0.5 flex-shrink-0" style={{ color: WARN }} />
              <div className="min-w-0 flex-1">
                <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>Not confirmed yet</p>
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

      {/* Status row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}>Bank transfer</p>
        <TimerPill expiresAt={expiresAt} />
      </div>

      {expired && (
        <div
          className="flex items-start gap-2.5 rounded-2xl px-3.5 py-3 mb-4"
          role="alert"
          style={{
            background: `color-mix(in oklab, ${DANGER} 10%, var(--card))`,
            border: `1px solid color-mix(in oklab, ${DANGER} 30%, var(--border))`,
          }}
        >
          <AlertTriangle size={16} className="mt-0.5 flex-shrink-0" style={{ color: DANGER }} />
          <p style={{ color: 'var(--foreground)', fontSize: 13, lineHeight: 1.45 }}>
            <strong>This account has expired.</strong> Don&apos;t send money to it. Go back and start a new
            purchase. If you already paid, tap I&apos;ve paid.
          </p>
        </div>
      )}

      {/* Amount hero */}
      <div
        className="rounded-[24px] px-5 py-5 mb-3"
        style={{
          background: 'color-mix(in oklab, var(--primary) 9%, var(--card))',
          border: '1px solid color-mix(in oklab, var(--primary) 24%, var(--border))',
        }}
      >
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}>Send exactly</p>
        <div className="flex items-center justify-between gap-3 mt-1.5">
          <p
            className="tabular-nums"
            style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 34, letterSpacing: -0.8, lineHeight: 1.1 }}
          >
            {amt}
          </p>
          <CopyPill value={amtRaw} label="amount" big />
        </div>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13.5, marginTop: 10 }}>
          You&apos;ll receive about{' '}
          <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 700 }}>
            {receive}
          </span>
        </p>
      </div>

      {/* Account details */}
      <div
        className="rounded-[24px] px-5 pt-5 mb-4"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            <Landmark size={18} style={{ color: 'var(--muted-foreground)' }} />
          </div>
          <div className="min-w-0">
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>Transfer to</p>
            <p className="truncate" style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>
              {bankName || '—'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 pt-4 pb-5">
          <div className="min-w-0">
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>Account number</p>
            <p
              className="tabular-nums"
              style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 30, letterSpacing: 1, marginTop: 2 }}
            >
              {accountNumber}
            </p>
          </div>
          <CopyPill value={accountNumber as string} label="account number" big />
        </div>

        <DetailRow label="Account name" value={accountName || '—'} />
        <DetailRow
          label="Reference"
          value={reference || '—'}
          display={reference ? truncateMiddle(reference) : undefined}
          mono
        />
      </div>

      {/* How it works */}
      <ol className="flex flex-col gap-2.5 px-1 mb-2">
        {steps.map((text, i) => (
          <li key={text} className="flex items-start gap-3">
            <span
              className="flex items-center justify-center flex-shrink-0 rounded-full tabular-nums"
              style={{
                width: 22,
                height: 22,
                fontSize: 12,
                fontWeight: 700,
                color: 'var(--foreground)',
                background: 'var(--muted)',
                border: '1px solid var(--border)',
              }}
            >
              {i + 1}
            </span>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13.5, lineHeight: 1.45, paddingTop: 1 }}>
              {text}
            </span>
          </li>
        ))}
      </ol>

      {/* Sticky action */}
      <div
        className="sticky bottom-0 pt-8 pb-4"
        style={{ background: 'linear-gradient(to top, var(--background, transparent) 65%, transparent)' }}
      >
        <button
          type="button"
          disabled={!!checking}
          onClick={onConfirmPaid}
          className="w-full py-4 rounded-full font-bold text-[15px] flex items-center justify-center gap-2"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground, #fff)',
            opacity: checking ? 0.8 : 1,
          }}
        >
          {checking ? (
            <>
              <Loader size={16} className="animate-spin" />
              Checking payment…
            </>
          ) : (
            "I've paid"
          )}
        </button>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, textAlign: 'center', marginTop: 10, lineHeight: 1.4 }}>
          Tap once your transfer has gone through. We credit your {symbol} when the payment is confirmed.
          {!countdown && expiryText ? ` Account expires ${expiryText}.` : ''}
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
      className="flex flex-col items-center py-16 px-1 text-center"
    >
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 16 }}
        className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
        style={{
          background: 'color-mix(in oklab, var(--primary) 14%, var(--card))',
          border: '1px solid color-mix(in oklab, var(--primary) 30%, var(--border))',
          boxShadow: '0 0 0 10px color-mix(in oklab, var(--primary) 6%, transparent)',
        }}
      >
        <CheckCircle2 size={38} style={{ color: 'var(--primary)' }} />
      </motion.div>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
        Payment confirmed
      </p>
      <p
        className="tabular-nums"
        style={{ color: 'var(--foreground)', fontSize: 32, fontWeight: 800, letterSpacing: -0.8 }}
      >
        +{youGet.toLocaleString(undefined, { maximumFractionDigits: 6 })} {symbol}
      </p>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 13.5, marginTop: 8, marginBottom: 32 }}>
        It&apos;s in your wallet now.
      </p>
      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        onClick={onDone}
        className="w-full py-4 rounded-full"
        style={{
          background: 'var(--primary)',
          color: 'var(--primary-foreground, #fff)',
          fontWeight: 700,
          fontSize: 16,
        }}
      >
        Done
      </motion.button>
    </motion.div>
  );
}
