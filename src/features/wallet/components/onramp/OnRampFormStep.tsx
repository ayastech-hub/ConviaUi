import { motion } from 'motion/react';
import { Clock, Loader2, ChevronDown, Shield } from 'lucide-react';
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
}

const QUICK_LOCAL = [1000, 5000, 10000, 25000, 50000];
const QUICK_USD = [5, 10, 25, 50, 100];

/** Enterprise Buy form — large amount hero, quote card, payment rails. */
export function OnRampFormStep({
  currency,
  format,
  amount,
  setAmount,
  amountMode,
  setAmountMode,
  usdAmount,
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
}: OnRampFormStepProps) {
  const payLabel = amountMode === 'usd' ? 'USD' : currency.code;
  const paySymbol = amountMode === 'usd' ? '$' : currency.symbol;
  const quick = amountMode === 'usd' ? QUICK_USD : QUICK_LOCAL;
  const canContinue = Number(amount) > 0 && !quoting && !!quote;

  const rateLine =
    quote && Number(quote.rate || 0) > 0
      ? `1 ${selectedAsset.symbol} ≈ ${Number(quote.rate).toLocaleString(undefined, { maximumFractionDigits: 4 })} ${quote.fiatCurrency || currency.code}`
      : null;

  return (
    <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pb-28">
      {/* Trust strip */}
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-5"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        <Shield size={14} style={{ color: 'var(--primary)' }} />
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
          Bank-grade checkout · funds credited after payment confirms
        </p>
      </div>

      {/* Amount hero */}
      <div
        className="rounded-[20px] p-5 mb-4"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }}>You pay</span>
          <div className="flex rounded-full p-0.5" style={{ background: 'var(--muted)' }}>
            {(['fiat', 'usd'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setAmountMode(m)}
                className="px-3 py-1 rounded-full text-xs font-semibold"
                style={{
                  background: amountMode === m ? 'var(--card)' : 'transparent',
                  color: amountMode === m ? 'var(--foreground)' : 'var(--muted-foreground)',
                  boxShadow: amountMode === m ? '0 1px 4px rgba(0,0,0,0.15)' : undefined,
                }}
              >
                {m === 'usd' ? 'USD' : currency.code}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-baseline gap-2 mb-2">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 28, fontWeight: 600 }}>{paySymbol}</span>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            className="flex-1 bg-transparent outline-none min-w-0"
            style={{
              color: amount ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontSize: 40,
              fontWeight: 700,
              letterSpacing: -1,
            }}
          />
        </div>

        {amountMode === 'usd' && Number(amount) > 0 && (
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            ≈ {format(Number(amount) * currency.rate)} charged in {currency.code}
          </p>
        )}
        {amountMode === 'fiat' && Number(amount) > 0 && (
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            ≈ ${usdAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          {quick.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(String(q))}
              className="px-3.5 py-1.5 rounded-full"
              style={{
                background: amount === String(q) ? 'var(--primary)' : 'var(--muted)',
                color: amount === String(q) ? 'var(--primary-foreground, #fff)' : 'var(--foreground)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {amountMode === 'usd' ? `$${q}` : `${currency.symbol}${Number(q).toLocaleString()}`}
            </button>
          ))}
        </div>
      </div>

      {/* Receive token */}
      <div className="mb-4">
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }} className="mb-2 px-0.5">
          You receive
        </p>
        <button
          type="button"
          onClick={() => setShowTokenDropdown(!showTokenDropdown)}
          className="w-full flex items-center gap-3 p-4 rounded-[16px] text-left"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <AssetIcon symbol={selectedAsset.symbol} size={40} />
          <div className="flex-1 min-w-0">
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{selectedAsset.symbol}</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{selectedAsset.name}</p>
          </div>
          <div className="text-right mr-1">
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>
              {quoting ? '…' : youGet > 0 ? youGet.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0'}
            </p>
          </div>
          <ChevronDown size={16} style={{ color: 'var(--muted-foreground)' }} />
        </button>

        {showTokenDropdown && (
          <div
            className="mt-2 rounded-[16px] overflow-hidden max-h-48 overflow-y-auto"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            {rampAssets.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setSelectedAsset(a);
                  setShowTokenDropdown(false);
                }}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
                style={{
                  background: a.id === selectedAsset.id ? 'var(--muted)' : 'transparent',
                  borderBottom: '1px solid var(--border)',
                }}
              >
                <AssetIcon symbol={a.symbol} size={32} />
                <div>
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{a.symbol}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{a.name}</p>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quote breakdown */}
      {Number(amount) > 0 && (
        <div
          className="rounded-[16px] p-4 mb-4 space-y-2.5"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          {quoting && (
            <div className="flex items-center gap-2">
              <Loader2 size={14} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Fetching live quote…</span>
            </div>
          )}
          {!quoting && !quote && (
            <p style={{ color: 'var(--destructive)', fontSize: 13 }}>Quote unavailable — try again shortly</p>
          )}
          {quote && !quoting && (
            <>
              {rateLine && (
                <div className="flex justify-between">
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Rate</span>
                  <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>{rateLine}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Network / service fee</span>
                <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>
                  {fee > 0 ? format(fee) : 'Included'}
                </span>
              </div>
              <div
                className="flex justify-between pt-2"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>You receive</span>
                <span style={{ color: 'var(--primary)', fontSize: 14, fontWeight: 700 }}>
                  {youGet.toLocaleString(undefined, { maximumFractionDigits: 6 })} {selectedAsset.symbol}
                </span>
              </div>
            </>
          )}
          <div className="flex items-center gap-1.5 pt-1">
            <Clock size={12} style={{ color: 'var(--muted-foreground)' }} />
            <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Typical credit: a few minutes after payment</span>
          </div>
        </div>
      )}

      <PaymentMethodSelector
        method={paymentMethod}
        setMethod={setPaymentMethod}
        cards={cards}
        selectedCardId={selectedCardId}
        setSelectedCardId={setSelectedCardId}
        showNewCard={showNewCard}
        setShowNewCard={setShowNewCard}
        newCard={newCard}
        setNewCard={setNewCard}
        onAddCard={onAddCard}
      />

      {/* Sticky CTA */}
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
          disabled={!canContinue}
          onClick={onPreview}
          className="w-full py-4 rounded-full mx-auto block"
          style={{
            maxWidth: 480,
            background: canContinue ? 'var(--primary)' : 'var(--muted)',
            color: canContinue ? 'var(--primary-foreground, #fff)' : 'var(--muted-foreground)',
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {!Number(amount)
            ? 'Enter an amount'
            : quoting
              ? 'Getting quote…'
              : !quote
                ? 'Quote unavailable'
                : 'Continue'}
        </motion.button>
      </div>
    </motion.div>
  );
}
