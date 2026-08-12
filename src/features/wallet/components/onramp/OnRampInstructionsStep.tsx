import { motion } from 'motion/react';
import { Clock, Copy, Check } from 'lucide-react';
import type { Currency } from '../../../../shared/context/CurrencyContext';

interface OnRampInstructionsStepProps {
  currency: Currency;
  amount: string;
  rows: { label: string; value: string }[];
  copied: boolean;
  onCopy: (text: string) => void;
  onPaid: () => void;
}

/** Real provider payment instructions (bank transfer / checkout) — no mock account numbers. */
export function OnRampInstructionsStep({
  currency,
  amount,
  rows,
  copied,
  onCopy,
  onPaid,
}: OnRampInstructionsStepProps) {
  return (
    <motion.div
      key="instructions"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -30 }}
    >
      <div className="rounded-[20px] p-5 mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
        <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17, marginBottom: 4 }}>
          Payment instructions
        </h3>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 16 }}>
          Pay exactly{' '}
          <span style={{ color: 'var(--foreground)', fontWeight: 700 }}>
            {currency.symbol}
            {Number(amount).toLocaleString()}
          </span>{' '}
          using the details from your payment provider. Crypto is credited after the webhook confirms payment.
        </p>

        <div
          className="rounded-[14px] p-4 mb-4"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          {rows.length === 0 ? (
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
              No transfer details returned. If you opened a checkout page, complete payment there.
            </p>
          ) : (
            rows.map((row, i) => (
              <div
                key={row.label + i}
                className="flex items-center justify-between py-2.5 gap-2"
                style={{ borderBottom: i < rows.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <span style={{ color: 'var(--muted-foreground)', fontSize: 12, flexShrink: 0 }}>{row.label}</span>
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="truncate text-right"
                    style={{
                      color: 'var(--foreground)',
                      fontSize: 13,
                      fontWeight: 600,
                      fontFamily: 'monospace',
                    }}
                  >
                    {row.value}
                  </span>
                  <button
                    type="button"
                    onClick={() => onCopy(row.value)}
                    className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ background: 'var(--card)' }}
                  >
                    {copied ? (
                      <Check size={12} style={{ color: 'var(--positive)' }} />
                    ) : (
                      <Copy size={12} style={{ color: 'var(--muted-foreground)' }} />
                    )}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        <div
          className="flex items-start gap-2 p-3 rounded-[12px] mb-4"
          style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}
        >
          <Clock size={14} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, lineHeight: 1.5 }}>
            Balance updates when the provider confirms payment. You can leave this screen and check History later.
          </p>
        </div>
      </div>
      <motion.button
        whileTap={{ scale: 0.97 }}
        type="button"
        onClick={onPaid}
        className="w-full py-3.5 rounded-[16px] text-white"
        style={{ background: 'var(--positive)', fontWeight: 700, fontSize: 15 }}
      >
        I&apos;ve paid / continue
      </motion.button>
    </motion.div>
  );
}
