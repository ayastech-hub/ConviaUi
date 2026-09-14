import { motion, AnimatePresence } from 'motion/react';
import { Loader, CheckCircle2, Copy, Check, Clock } from 'lucide-react';
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

function CopyRow({
  label,
  value,
  emphasize,
}: {
  label: string;
  value: string;
  emphasize?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  if (!value || value === '—') {
    return (
      <div className="py-3" style={{ borderTop: '1px solid var(--border)' }}>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>{label}</p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>—</p>
      </div>
    );
  }
  return (
    <div
      className="flex items-center justify-between gap-3 py-3"
      style={{ borderTop: '1px solid var(--border)' }}
    >
      <div className="min-w-0">
        <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>{label}</p>
        <p
          className="tabular-nums break-all"
          style={{
            color: 'var(--foreground)',
            fontWeight: emphasize ? 800 : 650,
            fontSize: emphasize ? 20 : 15,
            letterSpacing: emphasize ? -0.3 : 0,
          }}
        >
          {value}
        </p>
      </div>
      <button
        type="button"
        onClick={async () => {
          try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            setTimeout(() => setCopied(false), 1400);
          } catch {
            /* ignore */
          }
        }}
        className="w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0"
        style={{
          background: 'var(--liquid-chip-off-bg, var(--muted))',
          border: '1px solid var(--border)',
        }}
        aria-label={`Copy ${label}`}
      >
        {copied ? (
          <Check size={15} style={{ color: 'var(--primary)' }} />
        ) : (
          <Copy size={15} style={{ color: 'var(--muted-foreground)' }} />
        )}
      </button>
    </div>
  );
}

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

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => onDismissToast?.(), 4000);
    return () => clearTimeout(t);
  }, [toast, onDismissToast]);

  const expiryLabel = (() => {
    if (!expiresAt) return null;
    const d = new Date(expiresAt);
    if (Number.isNaN(d.getTime())) return String(expiresAt);
    return d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  })();

  if (!hasVa) {
    return (
      <motion.div
        key="wait"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-24"
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <Loader size={22} className="animate-spin" style={{ color: 'var(--foreground)' }} />
        </div>
        <p style={{ color: 'var(--foreground)', fontWeight: 700, marginTop: 16 }}>Creating account…</p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 6 }}>Usually a few seconds</p>
      </motion.div>
    );
  }

  const amt = `${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency.code}`;

  return (
    <motion.div key="va" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="pb-10 relative">
      {/* Bottom toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="fixed left-4 right-4 z-50 mx-auto"
            style={{ bottom: 'max(24px, env(safe-area-inset-bottom))', maxWidth: 420 }}
          >
            <div
              className="rounded-2xl px-4 py-3.5 flex items-start gap-3"
              style={{
                background: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: '0 12px 40px rgba(0,0,0,0.35)',
              }}
            >
              <Clock size={18} className="mt-0.5 flex-shrink-0" style={{ color: 'var(--warning, #f59e0b)' }} />
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

      <p style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 600, marginBottom: 6 }}>
        Bank transfer
      </p>
      <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, letterSpacing: -0.4, marginBottom: 6 }}>
        Pay {amt}
      </h2>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 18, lineHeight: 1.45 }}>
        Transfer the exact amount. You receive about{' '}
        <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 700 }}>
          {youGet.toLocaleString(undefined, { maximumFractionDigits: 6 })} {symbol}
        </span>
        .
      </p>

      {expiryLabel && (
        <div
          className="flex items-center gap-2.5 rounded-2xl px-3.5 py-3 mb-4"
          style={{
            background: 'color-mix(in oklab, var(--warning, #f59e0b) 10%, var(--card))',
            border: '1px solid color-mix(in oklab, var(--warning, #f59e0b) 28%, var(--border))',
          }}
        >
          <Clock size={16} style={{ color: 'var(--warning, #f59e0b)' }} />
          <div>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>Account expires</p>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>{expiryLabel}</p>
          </div>
        </div>
      )}

      <div
        className="rounded-[22px] px-4 mb-5"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <CopyRow label="Bank" value={bankName || '—'} />
        <CopyRow label="Account number" value={accountNumber || '—'} emphasize />
        <CopyRow label="Account name" value={accountName || '—'} />
        <CopyRow label="Reference" value={reference || '—'} />
        <CopyRow label="Amount" value={amt} emphasize />
      </div>

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
      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, textAlign: 'center', marginTop: 12, lineHeight: 1.4 }}>
        After your bank transfer, tap I&apos;ve paid. We credit when the payment is confirmed.
      </p>
    </motion.div>
  );
}

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
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
        style={{
          background: 'color-mix(in oklab, var(--primary) 14%, var(--card))',
          border: '1px solid color-mix(in oklab, var(--primary) 30%, var(--border))',
        }}
      >
        <CheckCircle2 size={32} style={{ color: 'var(--primary)' }} />
      </div>
      <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>
        Payment confirmed
      </h2>
      <p className="tabular-nums" style={{ color: 'var(--foreground)', fontSize: 26, fontWeight: 800, letterSpacing: -0.5 }}>
        +{youGet.toLocaleString(undefined, { maximumFractionDigits: 6 })} {symbol}
      </p>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 8, marginBottom: 28 }}>
        Your balance has been updated
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
