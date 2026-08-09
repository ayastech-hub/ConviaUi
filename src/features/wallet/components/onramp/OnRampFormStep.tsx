import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import type { Currency } from '../../../../shared/context/CurrencyContext';
import type { SavedCard } from '../../../../shared/context/PaymentMethodsContext';
import { TokenReceiveSelector } from './TokenReceiveSelector';
import { PaymentMethodSelector, type PaymentMethod, type NewCardDraft } from './PaymentMethodSelector';

interface OnRampFormStepProps {
  currency: Currency;
  format: (n: number) => string;
  amount: string;
  setAmount: (v: string) => void;
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
  onPreview: () => void;
}

const QUICK_AMOUNTS = [1000, 5000, 10000, 50000];

/** On-Ramp step 1: how much to pay, which token to receive, and how to pay. */
export function OnRampFormStep({
  currency, format, amount, setAmount, usdAmount, rampAssets, selectedAsset, setSelectedAsset,
  showTokenDropdown, setShowTokenDropdown, paymentMethod, setPaymentMethod,
  cards, selectedCardId, setSelectedCardId, showNewCard, setShowNewCard, newCard, setNewCard, onAddCard,
  fee, youGet, onPreview,
}: OnRampFormStepProps) {
  return (
    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="rounded-[20px] p-4 mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
        <div className="flex justify-between mb-2">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Pay With</span>
          <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>{currency.name}</span>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 28, fontWeight: 800 }}>{currency.symbol}</span>
          <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ color: 'var(--foreground)', fontSize: 28, fontWeight: 800 }} autoFocus />
        </div>
        {amount && <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>≈ {format(usdAmount)}</p>}
        <div className="flex gap-2 mt-2 flex-wrap">
          {QUICK_AMOUNTS.map((v) => (
            <button key={v} onClick={() => setAmount(String(v))} className="px-3 py-1.5 rounded-xl" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>
              {currency.symbol}{v.toLocaleString()}
            </button>
          ))}
        </div>
      </div>

      <TokenReceiveSelector
        assets={rampAssets} selected={selectedAsset} open={showTokenDropdown}
        onToggle={() => setShowTokenDropdown(!showTokenDropdown)}
        onSelect={(a) => { setSelectedAsset(a); setShowTokenDropdown(false); }}
      />

      <PaymentMethodSelector
        method={paymentMethod} setMethod={setPaymentMethod}
        cards={cards} selectedCardId={selectedCardId} setSelectedCardId={setSelectedCardId}
        showNewCard={showNewCard} setShowNewCard={setShowNewCard}
        newCard={newCard} setNewCard={setNewCard} onAddCard={onAddCard}
      />

      {amount && Number(amount) > 0 && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-[16px] mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
          <div className="flex justify-between mb-2">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Live Rate</span>
            <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>1 {selectedAsset.symbol} = {currency.symbol}{(selectedAsset.price * currency.rate).toLocaleString('en', { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Fee (1.5%)</span>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{format(fee)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Settlement</span>
            <div className="flex items-center gap-1"><Clock size={11} style={{ color: 'var(--foreground)' }} /><span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>~ 5 minutes</span></div>
          </div>
          <div className="h-px mb-2" style={{ background: 'var(--border)' }} />
          <div className="flex justify-between">
            <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>You Receive</span>
            <span style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>{youGet.toFixed(6)} {selectedAsset.symbol}</span>
          </div>
        </motion.div>
      )}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onPreview}
        className="w-full py-3.5 rounded-[16px] text-white"
        style={{ background: Number(amount) > 0 ? 'var(--primary)' : 'var(--muted)', fontWeight: 700, fontSize: 15 }}
      >
        Preview On-Ramp
      </motion.button>
    </motion.div>
  );
}
