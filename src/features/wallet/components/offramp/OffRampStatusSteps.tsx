import { motion } from 'motion/react';
import { ArrowUpRight, Loader, CheckCircle2, Clock } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import type { Currency } from '../../../../shared/context/CurrencyContext';
import type { BankAccount } from '../../../../shared/context/PaymentMethodsContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';

interface OffRampReviewStepProps {
  currency: Currency;
  format: (n: number) => string;
  amount: string;
  selectedAsset: Asset;
  youGet: number;
  selectedAccount?: BankAccount;
  fee?: number;
  onConfirm: () => void;
}

/** Off-Ramp step 2: review the conversion and payout account before confirming. */
export function OffRampReviewStep({ currency, format, amount, selectedAsset, youGet, selectedAccount, onConfirm }: OffRampReviewStepProps) {
  const { t } = useLanguage();
  const rows = [
    { l: 'Account', v: selectedAccount ? `${selectedAccount.bankName} · ${selectedAccount.accountNumber}` : '' },
    { l: 'Account Holder', v: selectedAccount?.accountName ?? '' },
    { l: 'Settlement', v: '~ 5 minutes' },
  ];

  return (
    <motion.div key="review" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }}>
      <div className="rounded-[20px] p-5 mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
        <div className="text-center mb-6">
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Converting</p>
          <p style={{ color: 'var(--foreground)', fontSize: 32, fontWeight: 800, letterSpacing: -1 }}>{amount} {selectedAsset.symbol}</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>≈ {format(Number(amount) * selectedAsset.price)}</p>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div style={{ height: 1, width: 40, background: 'var(--border)' }} />
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>to</span>
            <div style={{ height: 1, width: 40, background: 'var(--border)' }} />
          </div>
          <p style={{ color: 'var(--foreground)', fontSize: 32, fontWeight: 800, letterSpacing: -1, marginTop: 8 }}>{currency.symbol}{youGet.toLocaleString('en', { maximumFractionDigits: 0 })}</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{currency.name}</p>
        </div>
        {rows.map((row) => (
          <div key={row.l} className="flex justify-between py-2.5" style={{ borderBottom: '1px solid var(--border)' }}>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{row.l}</span>
            <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{row.v}</span>
          </div>
        ))}
      </div>
      <motion.button whileTap={{ scale: 0.97 }} onClick={onConfirm} className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
        Confirm Off-Ramp <ArrowUpRight size={18} />
      </motion.button>
    </motion.div>
  );
}

interface OffRampProcessingStepProps {
  amount: string;
  symbol: string;
  currency: Currency;
  youGet: number;
}

/** Off-Ramp step 3: brief "converting" spinner. */

export function OffRampProcessingStep({ amount, symbol, currency, youGet }: OffRampProcessingStepProps) {
  return (
    <motion.div
      key="processing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] px-5 text-center"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
        style={{
          background: 'color-mix(in oklab, var(--primary) 14%, var(--card))',
          border: '1px solid color-mix(in oklab, var(--primary) 28%, var(--border))',
        }}
      >
        <Loader size={26} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
      <p
        style={{
          color: 'var(--muted-foreground)',
          fontSize: 11,
          fontWeight: 650,
          letterSpacing: '0.07em',
          textTransform: 'uppercase',
        }}
      >
        Processing
      </p>
      <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, marginTop: 8 }}>
        Selling {amount} {symbol}
      </p>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 6 }}>
        Preparing {currency.symbol}
        {youGet.toLocaleString(undefined, { maximumFractionDigits: 2 })} {currency.code}
      </p>
    </motion.div>
  );
}

interface OffRampDoneStepProps {
  currency: Currency;
  youGet: number;
  bankName?: string;
  amount?: string;
  symbol?: string;
  onDone: () => void;
}

/** Success — aligned with swap complete layout. */
export function OffRampDoneStep({ currency, youGet, bankName, amount, symbol, onDone }: OffRampDoneStepProps) {
  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden" style={{ background: 'var(--background)' }}>
      <div className="flex-1 min-h-0 overflow-y-auto px-5 pt-6 pb-4">
        <div className="flex flex-col items-center text-center max-w-sm mx-auto">
          <motion.div
            initial={{ scale: 0.85, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 280, damping: 20 }}
            className="w-14 h-14 rounded-full mb-4 flex items-center justify-center"
            style={{
              background: 'color-mix(in oklab, var(--positive) 16%, var(--card))',
              border: '1px solid color-mix(in oklab, var(--positive) 35%, var(--border))',
            }}
          >
            <CheckCircle2 size={26} strokeWidth={2.5} style={{ color: 'var(--positive)' }} />
          </motion.div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Sale complete
          </p>
          <p className="tabular-nums mt-2" style={{ color: 'var(--foreground)', fontSize: 24, fontWeight: 800, letterSpacing: -0.5 }}>
            {currency.symbol}{youGet.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 0 })}
          </p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 6 }}>
            {bankName ? `On the way to ${bankName}` : 'Payout submitted'}
          </p>
          <div className="w-full mt-6 rounded-[22px] overflow-hidden text-left" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            {amount && symbol && (
              <div className="flex justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>You sold</span>
                <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{amount} {symbol}</span>
              </div>
            )}
            <div className="flex justify-between px-4 py-3.5">
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>You receive</span>
              <span className="tabular-nums" style={{ color: 'var(--positive)', fontWeight: 800, fontSize: 14 }}>
                {currency.symbol}{youGet.toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </span>
            </div>
            {bankName && (
              <div className="flex justify-between px-4 py-3.5" style={{ borderTop: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Bank</span>
                <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{bankName}</span>
              </div>
            )}
          </div>
        </div>
      </div>
      <div className="shrink-0 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]" style={{ background: 'var(--background)', borderTop: '1px solid var(--border)' }}>
        <button type="button" onClick={onDone} className="w-full h-12 rounded-full font-semibold text-[15px]" style={{ background: 'var(--primary)', color: 'var(--primary-foreground, #fff)' }}>
          Done
        </button>
      </div>
    </div>
  );
}
