import { motion } from 'motion/react';
import { Loader, CheckCircle2, Copy, Check, Building2 } from 'lucide-react';
import { useState } from 'react';
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
  onConfirmPaid?: () => void;
}

/**
 * After order create: show real transfer details + expiry + "I've paid".
 * Never a bare infinite spinner when we have a VA.
 */
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
  onConfirmPaid,
}: OnRampProcessingStepProps) {
  const [copied, setCopied] = useState<string | null>(null);
  const hasVa = Boolean(accountNumber);

  const copy = async (key: string, value: string) => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

  const expiryLabel = (() => {
    if (!expiresAt) return null;
    const d = new Date(expiresAt);
    if (Number.isNaN(d.getTime())) return String(expiresAt);
    return d.toLocaleString(undefined, {
      dateStyle: 'medium',
      timeStyle: 'short',
    });
  })();

  // Creating order / waiting for provider — short spinner only until VA arrives
  if (!hasVa) {
    return (
      <motion.div
        key="processing-wait"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center py-20 px-5"
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <Loader size={24} className="animate-spin" style={{ color: 'var(--foreground)' }} />
        </div>
        <p style={{ color: 'var(--foreground)', fontWeight: 700, marginTop: 16, fontSize: 16 }}>
          Creating payment account…
        </p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 6, textAlign: 'center' }}>
          This only takes a moment
        </p>
      </motion.div>
    );
  }

  const rows: Array<{ key: string; label: string; value: string; large?: boolean }> = [
    { key: 'bank', label: 'Bank', value: bankName || '—' },
    { key: 'acct', label: 'Account number', value: accountNumber || '—', large: true },
    { key: 'name', label: 'Account name', value: accountName || '—' },
    { key: 'ref', label: 'Reference', value: reference || '—' },
    {
      key: 'amt',
      label: 'Amount to transfer',
      value: `${Number(amount).toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency.code}`,
      large: true,
    },
  ];

  return (
    <motion.div
      key="processing-va"
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col pb-8"
    >
      <div className="flex items-center gap-2 mb-2">
        <Building2 size={18} style={{ color: 'var(--foreground)' }} />
        <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Transfer details</h3>
      </div>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 14, lineHeight: 1.45 }}>
        Send exactly this amount. You receive about{' '}
        <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 600 }}>
          {youGet.toLocaleString(undefined, { maximumFractionDigits: 6 })} {symbol}
        </span>{' '}
        when payment confirms.
      </p>

      {expiryLabel && (
        <div
          className="rounded-xl px-3 py-2.5 mb-3"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>Expires</p>
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{expiryLabel}</p>
        </div>
      )}

      <div
        className="rounded-[20px] p-4 mb-4"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        {rows.map((r) => (
          <div
            key={r.key}
            className="flex items-center justify-between py-2.5 gap-3"
            style={{ borderTop: r.key === 'bank' ? undefined : '1px solid var(--border)' }}
          >
            <div className="min-w-0">
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{r.label}</p>
              <p
                className="tabular-nums break-all"
                style={{
                  color: 'var(--foreground)',
                  fontWeight: r.large ? 800 : 600,
                  fontSize: r.large ? 18 : 14,
                }}
              >
                {r.value}
              </p>
            </div>
            {r.value && r.value !== '—' && (
              <button
                type="button"
                onClick={() => void copy(r.key, r.value)}
                className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: 'var(--muted)' }}
                aria-label={`Copy ${r.label}`}
              >
                {copied === r.key ? (
                  <Check size={14} style={{ color: 'var(--primary)' }} />
                ) : (
                  <Copy size={14} style={{ color: 'var(--muted-foreground)' }} />
                )}
              </button>
            )}
          </div>
        ))}
      </div>

      {onConfirmPaid && (
        <button
          type="button"
          disabled={!!checking}
          onClick={onConfirmPaid}
          className="w-full py-4 rounded-full font-bold text-[15px]"
          style={{
            background: 'var(--primary)',
            color: 'var(--primary-foreground, #fff)',
            opacity: checking ? 0.75 : 1,
          }}
        >
          {checking ? (
            <span className="inline-flex items-center justify-center gap-2">
              <Loader size={16} className="animate-spin" />
              Checking payment…
            </span>
          ) : (
            "I've paid"
          )}
        </button>
      )}
      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, textAlign: 'center', marginTop: 12 }}>
        After you transfer, tap I&apos;ve paid. Credit appears when the bank confirms.
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
      className="flex flex-col items-center py-16 px-5 text-center"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        <CheckCircle2 size={32} style={{ color: 'var(--primary)' }} />
      </div>
      <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, marginBottom: 8 }}>
        Deposit received
      </h2>
      <p className="tabular-nums" style={{ color: 'var(--foreground)', fontSize: 24, fontWeight: 700 }}>
        {youGet.toLocaleString(undefined, { maximumFractionDigits: 6 })} {symbol}
      </p>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 6, marginBottom: 28 }}>
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
