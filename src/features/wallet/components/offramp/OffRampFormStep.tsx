import { motion } from 'motion/react';
import { Clock } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import type { Currency } from '../../../../shared/context/CurrencyContext';
import type { BankAccount } from '../../../../shared/context/PaymentMethodsContext';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { ConvertTokenSelector } from './ConvertTokenSelector';
import { PayoutAccountSelector } from './PayoutAccountSelector';

const QUICK_AMOUNTS = ['50', '100', '500', 'Max'];

interface OffRampFormStepProps {
  currency: Currency;
  format: (n: number) => string;
  stablecoins: Asset[];
  selectedAsset: Asset;
  setSelectedAsset: (a: Asset) => void;
  showTokenDropdown: boolean;
  setShowTokenDropdown: (v: boolean) => void;
  amount: string;
  setAmount: (v: string) => void;
  compatibleAccounts: BankAccount[];
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string) => void;
  selectedAccount?: BankAccount;
  showAccountDropdown: boolean;
  setShowAccountDropdown: (v: boolean) => void;
  onAddAccount: () => void;
  fee: number;
  youGet: number;
  onPreview: () => void;
}

/** Off-Ramp step 1: which token to convert, how much, and which payout account to send to. */
export function OffRampFormStep({
  currency, format, stablecoins, selectedAsset, setSelectedAsset, showTokenDropdown, setShowTokenDropdown,
  amount, setAmount, compatibleAccounts, selectedAccountId, setSelectedAccountId, selectedAccount,
  showAccountDropdown, setShowAccountDropdown, onAddAccount, fee, youGet, onPreview,
}: OffRampFormStepProps) {
  return (
    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <ConvertTokenSelector
        assets={stablecoins} selected={selectedAsset} open={showTokenDropdown}
        onToggle={() => setShowTokenDropdown(!showTokenDropdown)}
        onSelect={(a) => { setSelectedAsset(a); setShowTokenDropdown(false); }}
        onClose={() => setShowTokenDropdown(false)}
      />

      <div className="rounded-[20px] p-4 mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
        <div className="flex justify-between mb-2">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Amount ({selectedAsset.symbol})</span>
          <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Bal: {selectedAsset.balance.toFixed(2)} {selectedAsset.symbol}</span>
        </div>
        <div className="flex items-center gap-3 mb-2">
          <AssetIcon symbol={selectedAsset.symbol} size={32} />
          <input type="number" placeholder="0.00" value={amount} onChange={(e) => setAmount(e.target.value)} className="flex-1 bg-transparent outline-none" style={{ color: 'var(--foreground)', fontSize: 28, fontWeight: 800 }} autoFocus />
        </div>
        {amount && <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>≈ {format(Number(amount) * selectedAsset.price)}</p>}
        <div className="flex gap-2 mt-2 flex-wrap">
          {QUICK_AMOUNTS.map((v) => (
            <button key={v} onClick={() => setAmount(v === 'Max' ? selectedAsset.balance.toFixed(2) : v)} className="px-3 py-1.5 rounded-xl" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500, whiteSpace: 'nowrap' }}>
              {v === 'Max' ? 'Max' : `${v} ${selectedAsset.symbol}`}
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[16px] p-4 mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
        <div className="flex justify-between items-center">
          <div>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Payout Currency</p>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{currency.code} · {currency.name}</p>
          </div>
          <span style={{ color: 'var(--foreground)', fontSize: 24, fontWeight: 800 }}>{currency.symbol}</span>
        </div>
      </div>

      <PayoutAccountSelector
        currencyCode={currency.code}
        compatibleAccounts={compatibleAccounts}
        selectedAccount={selectedAccount}
        open={showAccountDropdown}
        onToggle={() => setShowAccountDropdown(!showAccountDropdown)}
        onClose={() => setShowAccountDropdown(false)}
        onSelect={(id) => { setSelectedAccountId(id); setShowAccountDropdown(false); }}
        onAddAccount={onAddAccount}
      />

      {amount && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-[16px] mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
          <div className="flex justify-between mb-2">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Live Rate</span>
            <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>1 {selectedAsset.symbol} = {currency.symbol}{(selectedAsset.price * currency.rate).toLocaleString('en', { maximumFractionDigits: 2 })}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Fee (1.5%)</span>
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>-{format(fee)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Settlement</span>
            <div className="flex items-center gap-1"><Clock size={11} style={{ color: 'var(--foreground)' }} /><span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>~ 5 minutes</span></div>
          </div>
          <div className="h-px mb-2" style={{ background: 'var(--border)' }} />
          <div className="flex justify-between">
            <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>You Receive</span>
            <span style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>{currency.symbol}{youGet.toLocaleString('en', { maximumFractionDigits: 0 })}</span>
          </div>
        </motion.div>
      )}

      <motion.button
        whileTap={{ scale: 0.97 }}
        onClick={onPreview}
        className="w-full py-3.5 rounded-[16px] text-white"
        style={{ background: Number(amount) > 0 && selectedAccountId ? 'var(--primary)' : 'var(--muted)', fontWeight: 700, fontSize: 15 }}
      >
        Preview Off-Ramp
      </motion.button>
    </motion.div>
  );
}
