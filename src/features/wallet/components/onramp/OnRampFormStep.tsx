import { motion } from 'motion/react';
import { Clock, Loader2 } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import type { Currency } from '../../../../shared/context/CurrencyContext';
import type { SavedCard } from '../../../../shared/context/PaymentMethodsContext';
import { TokenReceiveSelector } from './TokenReceiveSelector';
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

  const rateLine =
    quote && Number(quote.rate) > 0
      ? `1 ${selectedAsset.symbol} ≈ ${(1 / Number(quote.rate)).toLocaleString(undefined, {
          maximumFractionDigits: 2,
        })} ${quote.fiatCurrency}`
      : null;

  return (
    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="rounded-[20px] p-4 mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
        <div className="flex justify-between items-center mb-3">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>You pay</span>
          <div className="flex gap-1 p-0.5 rounded-full" style={{ background: 'var(--muted)' }}>
            <button
              type="button"
              onClick={() => setAmountMode('fiat')}
              className="px-3 py-1 rounded-full"
              style={{
                background: amountMode === 'fiat' ? 'var(--primary)' : 'transparent',
                color: amountMode === 'fiat' ? '#fff' : 'var(--foreground)',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              {currency.code}
            </button>
            <button
              type="button"
              onClick={() => setAmountMode('usd')}
              className="px-3 py-1 rounded-full"
              style={{
                background: amountMode === 'usd' ? 'var(--primary)' : 'transparent',
                color: amountMode === 'usd' ? '#fff' : 'var(--foreground)',
                fontSize: 11,
                fontWeight: 700,
              }}
            >
              USD
            </button>
          </div>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 28, fontWeight: 800 }}>{paySymbol}</span>
          <input
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="flex-1 bg-transparent outline-none"
            style={{ color: 'var(--foreground)', fontSize: 28, fontWeight: 800 }}
          />
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}>{payLabel}</span>
        </div>
        {amountMode === 'usd' && Number(amount) > 0 && currency.rate > 0 && (
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            ≈ {format(Number(amount) * currency.rate)} charged in {currency.code}
          </p>
        )}
        {amountMode === 'fiat' && Number(amount) > 0 && (
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            ≈ ${usdAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} USD
          </p>
        )}
        <div className="flex flex-wrap gap-2 mt-3">
          {quick.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(String(q))}
              className="px-3 py-1.5 rounded-full"
              style={{
                background: amount === String(q) ? 'var(--primary)' : 'var(--muted)',
                color: amount === String(q) ? '#fff' : 'var(--foreground)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {amountMode === 'usd' ? `$${q}` : `${currency.symbol}${q.toLocaleString()}`}
            </button>
          ))}
        </div>
      </div>

      <TokenReceiveSelector
        assets={rampAssets}
        selected={selectedAsset}
        open={showTokenDropdown}
        onToggle={() => setShowTokenDropdown(!showTokenDropdown)}
        onSelect={(a) => {
          setSelectedAsset(a);
          setShowTokenDropdown(false);
        }}
      />

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

      {Number(amount) > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-[16px] mb-4"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          {quoting && (
            <div className="flex items-center gap-2 mb-2">
              <Loader2 size={14} className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Fetching live quote…</span>
            </div>
          )}
          {!quoting && !quote && (
            <p style={{ color: 'var(--destructive)', fontSize: 13 }}>Quote unavailable — try again in a moment</p>
          )}
          {quote && (
            <>
              <div className="flex justify-between mb-2">
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Live rate</span>
                <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
                  {rateLine || `Rate ${quote.rate}`}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                  Fee ({(quote.feeBps / 100).toFixed(2)}%)
                </span>
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                  {fee > 0 ? `${fee.toFixed(6)} ${selectedAsset.symbol}` : '—'}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Settlement</span>
                <div className="flex items-center gap-1">
                  <Clock size={11} style={{ color: 'var(--foreground)' }} />
                  <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>~5 min after payment</span>
                </div>
              </div>
              <div className="h-px mb-2" style={{ background: 'var(--border)' }} />
              <div className="flex justify-between items-end">
                <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>You receive</span>
                <span style={{ color: 'var(--positive)', fontWeight: 800, fontSize: 20 }}>
                  {youGet > 0 ? youGet.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '—'}{' '}
                  {selectedAsset.symbol}
                </span>
              </div>
            </>
          )}
        </motion.div>
      )}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onPreview}
        disabled={!quote || youGet <= 0 || quoting}
        className="w-full py-3.5 rounded-[16px] text-white"
        style={{
          background: quote && youGet > 0 ? 'var(--primary)' : 'var(--muted)',
          fontWeight: 700,
          fontSize: 15,
          opacity: quote && youGet > 0 ? 1 : 0.6,
        }}
      >
        {quoting ? 'Getting quote…' : 'Continue'}
      </motion.button>
    </motion.div>
  );
}
