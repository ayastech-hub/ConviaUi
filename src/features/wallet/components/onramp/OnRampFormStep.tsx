import { motion } from 'motion/react';
import { ChevronDown, Loader2 } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import type { Currency } from '../../../../shared/context/CurrencyContext';
import type { SavedCard } from '../../../../shared/context/PaymentMethodsContext';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { PaymentMethodSelector, type PaymentMethod, type NewCardDraft } from './PaymentMethodSelector';
import type { LocalOnrampQuote } from '../../../../shared/api/fiat';

interface OnRampFormStepProps {
  currency: Currency;
  format: (n: number) => string;
  amount: string;
  setAmount: (v: string) => void;
  /** Local-currency minimum buy */
  minFiat?: number;
  amountMode: 'fiat' | 'usd';
  setAmountMode: (m: 'fiat' | 'usd') => void;
  usdAmount: number;
  rampAssets: Asset[];
  selectedAsset: Asset;
  setSelectedAsset: (a: Asset) => void;
  showTokenDropdown: boolean;
  setShowTokenDropdown: (v: boolean) => void;
  paymentMethod: PaymentMethod;
  setPaymentMethod: (m: PaymentMethod) => void;
  cards: SavedCard[];
  selectedCardId: string | null;
  setSelectedCardId: (id: string | null) => void;
  showNewCard: boolean;
  setShowNewCard: (v: boolean) => void;
  newCard: NewCardDraft;
  setNewCard: (c: NewCardDraft) => void;
  onAddCard: () => void;
  fee: number;
  youGet: number;
  quote: LocalOnrampQuote | null;
  quoting: boolean;
  onPreview: () => void;
  submitting?: boolean;
}

const QUICK_USD = [10, 25, 50, 100];

/** Suggested buy amounts in local currency (≈ $5–$50 band where sensible). */
function quickAmountsForCurrency(code: string, minFiat = 0): number[] {
  let base: number[];
  switch (code.toUpperCase()) {
    case 'USD':
      base = QUICK_USD;
      break;
    case 'NGN':
      base = [500, 2000, 5000, 10000, 25000];
      break;
    case 'GHS':
      base = [20, 50, 100, 250];
      break;
    case 'KES':
      base = [100, 500, 1000, 2500];
      break;
    case 'ZAR':
      base = [50, 150, 300, 750];
      break;
    case 'UGX':
      base = [5000, 20000, 50000, 100000];
      break;
    default:
      base = [500, 2000, 5000, 10000];
  }
  const filtered = base.filter((n) => n >= minFiat);
  return filtered.length ? filtered : base;
}

/** Buy form — amount, asset, quote, payment. No marketing copy. */
export function OnRampFormStep({
  currency,
  format,
  amount,
  setAmount,
  minFiat = 0,
  amountMode,
  setAmountMode,
  rampAssets,
  selectedAsset,
  setSelectedAsset,
  showTokenDropdown,
  setShowTokenDropdown,
  paymentMethod,
  setPaymentMethod,
  cards,
  selectedCardId,
  setSelectedCardId,
  showNewCard,
  setShowNewCard,
  newCard,
  setNewCard,
  onAddCard,
  fee,
  youGet,
  quote,
  quoting,
  onPreview,
  submitting,
}: OnRampFormStepProps) {
  const paySymbol = amountMode === 'usd' ? '$' : currency.symbol;
  const quick = amountMode === 'usd' ? QUICK_USD : quickAmountsForCurrency(currency.code, minFiat);
  const amtNum = Number(amount) || 0;
  const belowMin = amountMode === 'fiat' && minFiat > 0 && amtNum > 0 && amtNum < minFiat;
  const canContinue = amtNum > 0 && !belowMin && !quoting && !!quote && !submitting;

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="pb-28"
    >
      {/* Amount */}
      <div
        className="rounded-[24px] p-5 mb-3"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}>You pay</span>
          <div
            className="px-3 py-1 rounded-full"
            style={{
              fontSize: 12,
              fontWeight: 700,
              background: 'var(--liquid-chip-on-bg)',
              color: 'var(--liquid-chip-on-text)',
              border: '1px solid var(--liquid-chip-on-border)',
            }}
          >
            {currency.code}
          </div>
        </div>

        <div className="flex items-baseline gap-2">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 28, fontWeight: 600 }}>{paySymbol}</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            className="flex-1 bg-transparent outline-none min-w-0 tabular-nums"
            style={{
              color: amount ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: -1,
            }}
          />
        </div>

        <div className="flex gap-2 mt-4">
          {quick.map((n) => (
            <button
              key={n}
              type="button"
              onClick={() => setAmount(String(n))}
              className="flex-1 py-2 rounded-full tabular-nums"
              style={{
                background: amount === String(n) ? 'var(--liquid-chip-on-bg)' : 'var(--muted)',
                color: amount === String(n) ? 'var(--liquid-chip-on-text)' : 'var(--foreground)',
                border: amount === String(n) ? '1px solid var(--liquid-pill-border)' : '1px solid var(--border)',
                boxShadow: amount === String(n) ? 'var(--liquid-chip-on-shadow)' : undefined,
                backdropFilter: amount === String(n) ? 'blur(12px)' : undefined,
                WebkitBackdropFilter: amount === String(n) ? 'blur(12px)' : undefined,
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {amountMode === 'usd' ? `$${n}` : `${currency.symbol}${n >= 1000 ? `${n / 1000}k` : n}`}
            </button>
          ))}
        </div>
        {minFiat > 0 && amountMode === 'fiat' && amtNum > 0 && (
          <p style={{ color: belowMin ? 'var(--destructive)' : 'var(--muted-foreground)', fontSize: 12, marginTop: 8 }}>
            {belowMin
              ? `Minimum ${currency.symbol}${minFiat.toLocaleString()}`
              : `Min ${currency.symbol}${minFiat.toLocaleString()}`}
          </p>
        )}
      </div>

      {/* Asset */}
      <button
        type="button"
        onClick={() => setShowTokenDropdown(!showTokenDropdown)}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[20px] mb-3 text-left"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <AssetIcon symbol={selectedAsset.symbol} size={36} />
        <div className="flex-1 min-w-0">
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>You receive</p>
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{selectedAsset.symbol}</p>
        </div>
        <ChevronDown size={16} style={{ color: 'var(--muted-foreground)' }} />
      </button>

      {showTokenDropdown && (
        <div
          className="fixed inset-0 z-40 flex items-end"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowTokenDropdown(false)}
        >
          <div
            className="w-full max-h-[50vh] overflow-y-auto rounded-t-[20px] px-4 pt-3 pb-8"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-9 h-1 rounded-full mx-auto mb-3" style={{ background: 'var(--border)' }} />
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Receive</p>
            {rampAssets.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setSelectedAsset(a);
                  setShowTokenDropdown(false);
                }}
                className="w-full flex items-center gap-3 px-2 py-3 text-left rounded-xl"
                style={{ background: a.id === selectedAsset.id ? 'var(--muted)' : 'transparent' }}
              >
                <AssetIcon symbol={a.symbol} size={32} />
                <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{a.symbol}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quote */}
      <div
        className="rounded-[20px] px-4 py-3.5 mb-4 space-y-2.5"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        {quoting && (
          <div className="flex items-center gap-2 py-1">
            <Loader2 size={14} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Getting quote…</span>
          </div>
        )}
        {!quoting && (
          <>
            {quote?.fiatAmount != null && (
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>You pay</span>
                <span className="tabular-nums" style={{ color: 'var(--foreground)', fontSize: 15, fontWeight: 800 }}>
                  {Number(quote.fiatAmount).toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                  {quote.fiatCurrency || currency.code}
                </span>
              </div>
            )}
            {quote?.rate != null && (
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Rate</span>
                <span className="tabular-nums" style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
                  1 {selectedAsset.symbol} ≈ {Number(quote.rate).toLocaleString(undefined, { maximumFractionDigits: 2 })}{' '}
                  {quote.fiatCurrency || currency.code}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 700 }}>You receive</span>
              <span className="tabular-nums" style={{ color: 'var(--primary)', fontSize: 15, fontWeight: 800 }}>
                {youGet > 0
                  ? `${youGet.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${selectedAsset.symbol}`
                  : '—'}
              </span>
            </div>
          </>
        )}
      </div>

      <PaymentMethodSelector method={paymentMethod} setMethod={setPaymentMethod} />

      <div
        className="fixed bottom-0 left-0 right-0 z-30 px-5 pt-3"
        style={{
          paddingBottom: 'max(16px, env(safe-area-inset-bottom))',
          background: 'linear-gradient(to top, var(--background) 70%, transparent)',
        }}
      >
        <motion.button
          type="button"
          whileTap={{ scale: canContinue ? 0.98 : 1 }}
          disabled={!canContinue || !!submitting}
          onClick={onPreview}
          className="w-full py-4 rounded-full mx-auto block"
          style={{
            maxWidth: 480,
            background: 'var(--primary)',
            color: 'var(--primary-foreground, #fff)',
            opacity: canContinue && !submitting ? 1 : 0.45,
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {submitting ? 'Creating payment…' : !Number(amount) ? 'Enter amount' : quoting ? 'Getting quote…' : !quote ? 'Quote unavailable' : 'Continue'}
        </motion.button>
      </div>
    </motion.div>
  );
}
