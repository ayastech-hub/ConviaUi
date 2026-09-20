import { motion } from 'motion/react';
import { ArrowRight, Loader2, CheckCircle2, Building2, Shield } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import type { Currency } from '../../../../shared/context/CurrencyContext';
import { AssetIcon } from '../../../../shared/components/AssetIcon';

type BankLike = {
  bankName?: string;
  accountNumber?: string;
  account_number?: string;
  accountName?: string;
  bankCode?: string;
};

interface OffRampReviewStepProps {
  currency: Currency;
  amount: string;
  selectedAsset: Asset;
  youGet: number;
  selectedAccount?: BankLike | null;
  rateLabel?: string;
  countryFlag?: string;
  onConfirm: () => void;
  onBack?: () => void;
}

function maskAcct(n?: string) {
  const s = String(n || '').replace(/\s/g, '');
  if (s.length < 5) return s || '—';
  return `••••${s.slice(-4)}`;
}

/** Step 2 — clean enterprise review before PIN. */
export function OffRampReviewStep({
  currency,
  amount,
  selectedAsset,
  youGet,
  selectedAccount,
  rateLabel,
  countryFlag,
  onConfirm,
  onBack,
}: OffRampReviewStepProps) {
  const acctNo = selectedAccount?.accountNumber || selectedAccount?.account_number;

  return (
    <motion.div
      key="review"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      className="flex flex-col h-full"
    >
      <div className="flex-1 overflow-y-auto px-5 pb-4">
        <p
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            marginBottom: 12,
          }}
        >
          Review sell
        </p>

        {/* From → To */}
        <div
          className="rounded-[22px] overflow-hidden mb-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid var(--border)' }}>
            <AssetIcon symbol={selectedAsset.symbol} size={40} />
            <div className="flex-1 min-w-0">
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>You sell</p>
              <p className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, letterSpacing: -0.4 }}>
                {amount} {selectedAsset.symbol}
              </p>
            </div>
          </div>
          <div className="flex justify-center -my-2.5 relative z-[1]">
            <div
              className="w-9 h-9 rounded-full flex items-center justify-center"
              style={{ background: 'var(--background)', border: '1px solid var(--border)' }}
            >
              <ArrowRight size={16} style={{ color: 'var(--muted-foreground)' }} />
            </div>
          </div>
          <div className="flex items-center gap-3 px-4 py-4">
            <div
              className="w-11 h-11 rounded-full flex items-center justify-center shrink-0 text-[22px] leading-none"
              style={{
                background: 'var(--muted)',
                border: '1px solid var(--border)',
              }}
              aria-hidden
            >
              {countryFlag || currency.flag || '🏳️'}
            </div>
            <div className="flex-1 min-w-0">
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>You receive</p>
              <p className="tabular-nums" style={{ color: 'var(--positive)', fontWeight: 800, fontSize: 20, letterSpacing: -0.4 }}>
                {currency.symbol}
                {youGet.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 0 })}
              </p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                {currency.code} · {currency.name}
              </p>
            </div>
          </div>
        </div>

        {/* Payout + details */}
        <div
          className="rounded-[22px] overflow-hidden mb-3"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-start gap-3 px-4 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <Building2 size={18} style={{ color: 'var(--foreground)' }} />
            </div>
            <div className="min-w-0 flex-1">
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
                Payout to
              </p>
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14, marginTop: 2 }}>
                {selectedAccount?.bankName || 'Bank account'}
              </p>
              <p className="tabular-nums" style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 2 }}>
                {maskAcct(acctNo)}
                {selectedAccount?.accountName ? ` · ${selectedAccount.accountName}` : ''}
              </p>
            </div>
          </div>
          {rateLabel && (
            <div className="flex justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Rate</span>
              <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
                {rateLabel}
              </span>
            </div>
          )}
          <div className="flex justify-between px-4 py-3">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Settlement</span>
            <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>Usually within minutes</span>
          </div>
        </div>

        <div className="flex items-start gap-2.5 px-1 mt-2">
          <Shield size={14} className="mt-0.5 shrink-0" style={{ color: 'var(--muted-foreground)' }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.45 }}>
            Next you’ll confirm with your transaction PIN. Funds leave your balance when the sell is submitted.
          </p>
        </div>
      </div>

      <div
        className="shrink-0 px-5 pt-3 pb-[max(1rem,env(safe-area-inset-bottom))] space-y-2"
        style={{ background: 'var(--background)', borderTop: '1px solid var(--border)' }}
      >
        <button
          type="button"
          onClick={onConfirm}
          className="w-full h-12 rounded-full font-bold text-[15px]"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground, #fff)' }}
        >
          Continue
        </button>
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-full h-11 rounded-full font-semibold text-[14px]"
            style={{ color: 'var(--muted-foreground)' }}
          >
            Back
          </button>
        )}
      </div>
    </motion.div>
  );
}

interface OffRampProcessingStepProps {
  amount: string;
  symbol: string;
  currency: Currency;
  youGet: number;
}

export function OffRampProcessingStep({ amount, symbol, currency, youGet }: OffRampProcessingStepProps) {
  return (
    <motion.div
      key="processing"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center flex-1 px-6 text-center min-h-[60vh]"
    >
      <div
        className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
        style={{
          background: 'color-mix(in oklab, var(--primary) 12%, var(--card))',
          border: '1px solid color-mix(in oklab, var(--primary) 28%, var(--border))',
        }}
      >
        <Loader2 size={28} className="animate-spin" style={{ color: 'var(--primary)' }} />
      </div>
      <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, letterSpacing: -0.3 }}>
        Submitting sell
      </p>
      <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginTop: 8, lineHeight: 1.45, maxWidth: 280 }}>
        Selling {amount} {symbol} for {currency.symbol}
        {youGet.toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
  countryFlag?: string;
  onDone: () => void;
}

export function OffRampDoneStep({ currency, youGet, bankName, amount, symbol, countryFlag, onDone }: OffRampDoneStepProps) {
  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 flex flex-col items-center justify-center px-5 text-center pb-4">
        <motion.div
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 260, damping: 18 }}
          className="w-16 h-16 rounded-full flex items-center justify-center mb-5"
          style={{
            background: 'color-mix(in oklab, var(--positive) 14%, var(--card))',
            border: '1px solid color-mix(in oklab, var(--positive) 32%, var(--border))',
          }}
        >
          <CheckCircle2 size={30} style={{ color: 'var(--positive)' }} />
        </motion.div>
        <p
          style={{
            color: 'var(--muted-foreground)',
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
          }}
        >
          Sell submitted {countryFlag ? <span className="normal-case tracking-normal">{countryFlag}</span> : null}
        </p>
        <p
          className="tabular-nums mt-2"
          style={{ color: 'var(--foreground)', fontSize: 28, fontWeight: 800, letterSpacing: -0.6 }}
        >
          {currency.symbol}
          {youGet.toLocaleString(undefined, { maximumFractionDigits: 2, minimumFractionDigits: 0 })}
        </p>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13.5, marginTop: 8, maxWidth: 280, lineHeight: 1.4 }}>
          {bankName ? `Payout on the way to ${bankName}` : 'Payout is being processed to your bank'}
        </p>

        <div
          className="w-full max-w-sm mt-7 rounded-[22px] overflow-hidden text-left"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {amount && symbol && (
            <div className="flex justify-between px-4 py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Sold</span>
              <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>
                {amount} {symbol}
              </span>
            </div>
          )}
          <div className="flex justify-between px-4 py-3.5">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>You receive</span>
            <span className="tabular-nums" style={{ color: 'var(--positive)', fontWeight: 800, fontSize: 14 }}>
              {currency.symbol}
              {youGet.toLocaleString(undefined, { maximumFractionDigits: 2 })}
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
      <div
        className="shrink-0 px-5 pt-3 pb-[max(1.25rem,env(safe-area-inset-bottom))]"
        style={{ background: 'var(--background)', borderTop: '1px solid var(--border)' }}
      >
        <button
          type="button"
          onClick={onDone}
          className="w-full h-12 rounded-full font-semibold text-[15px]"
          style={{ background: 'var(--primary)', color: 'var(--primary-foreground, #fff)' }}
        >
          Done
        </button>
      </div>
    </div>
  );
}
