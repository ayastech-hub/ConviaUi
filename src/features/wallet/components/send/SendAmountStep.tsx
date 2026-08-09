import { motion, AnimatePresence } from 'motion/react';
import { Pencil, ChevronDown, AlertCircle, Zap, ArrowUpRight } from 'lucide-react';
import type { Asset, ChatContact } from '../../../../shared/data/mockData';
import type { Currency } from '../../../../shared/context/CurrencyContext';
import { AssetIcon } from '../../../../shared/components/AssetIcon';

const PERCENT_BUTTONS = [
  { label: '25%', pct: 25 },
  { label: '50%', pct: 50 },
  { label: '75%', pct: 75 },
  { label: 'Max', pct: 100 },
];

interface SendAmountStepProps {
  currency: Currency;
  format: (n: number) => string;
  selectedContact: ChatContact | null;
  recipient: string;
  onEditRecipient: () => void;
  selectedAsset: Asset;
  onOpenAssetPicker: () => void;
  amount: string;
  onAmountChange: (v: string) => void;
  cryptoAmount: number;
  error: string;
  onSetPercentage: (pct: number) => void;
  fee: number;
  canContinue: boolean;
  onContinue: () => void;
}

/** Send step 2: how much to send, with quick-percentage buttons and the fee preview. */
export function SendAmountStep({
  currency, format, selectedContact, recipient, onEditRecipient, selectedAsset, onOpenAssetPicker,
  amount, onAmountChange, cryptoAmount, error, onSetPercentage, fee, canContinue, onContinue,
}: SendAmountStepProps) {
  return (
    <motion.div key="amount" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.25 }}>
      <div className="flex items-center gap-3 p-3 rounded-[16px] mb-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: selectedContact?.color ?? 'var(--primary)', fontSize: 12, fontWeight: 700 }}>
          {selectedContact?.initials ?? recipient.charAt(0).toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }} className="truncate">{selectedContact?.name ?? recipient}</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }} className="truncate">{selectedContact ? `@${recipient}` : recipient}</p>
        </div>
        <button onClick={onEditRecipient} className="flex items-center justify-center w-8 h-8 rounded-full" style={{ background: 'var(--muted)' }}>
          <Pencil size={14} style={{ color: 'var(--foreground)' }} />
        </button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>Sending</span>
        <motion.button whileTap={{ scale: 0.95 }} onClick={onOpenAssetPicker} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--muted)' }}>
          <AssetIcon symbol={selectedAsset.symbol} size={20} />
          <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{selectedAsset.symbol}</span>
          <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
        </motion.button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Available balance</span>
        <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{selectedAsset.balance.toFixed(4)} {selectedAsset.symbol} · {format(selectedAsset.valueUSD)}</span>
      </div>

      <div className="text-center py-6 rounded-[20px] mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-center gap-1 mb-2">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 32, fontWeight: 700 }}>{currency.symbol}</span>
          <input
            type="number" inputMode="decimal" placeholder="0" value={amount}
            onChange={(e) => onAmountChange(e.target.value)}
            className="bg-transparent outline-none text-center"
            style={{ color: 'var(--foreground)', fontSize: 44, fontWeight: 800, width: '60%', letterSpacing: -2 }}
            autoFocus
          />
        </div>
        {amount && Number(amount) > 0 && (
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>≈ {cryptoAmount.toFixed(6)} {selectedAsset.symbol}</p>
        )}
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="flex items-center gap-2 mb-3 px-3">
            <AlertCircle size={14} style={{ color: 'var(--destructive)' }} />
            <p style={{ color: 'var(--destructive)', fontSize: 12 }}>{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-2 mb-5">
        {PERCENT_BUTTONS.map((b) => (
          <motion.button key={b.label} whileTap={{ scale: 0.95 }} onClick={() => onSetPercentage(b.pct)} className="flex-1 py-2 rounded-xl" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
            {b.label}
          </motion.button>
        ))}
      </div>

      <div className="flex items-center justify-between py-3 px-4 rounded-[14px] mb-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <Zap size={14} style={{ color: 'var(--warning)' }} />
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Network fee</span>
        </div>
        <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>{format(fee)} · {selectedAsset.chains[0]}</span>
      </div>

      <motion.button
        whileTap={{ scale: 0.97 }}
        disabled={!canContinue}
        onClick={onContinue}
        className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2"
        style={{ background: canContinue ? 'var(--primary)' : 'var(--muted)', color: canContinue ? '#fff' : 'var(--muted-foreground)', fontWeight: 700, fontSize: 15 }}
      >
        Review Transaction <ArrowUpRight size={18} />
      </motion.button>
    </motion.div>
  );
}
