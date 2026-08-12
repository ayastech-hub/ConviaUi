import { motion } from 'motion/react';
import { ChevronLeft, AlertCircle } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { useCurrency } from '../../../../shared/context/CurrencyContext';

interface WithdrawFormProps {
  asset: Asset;
  selectedChain: string;
  /** Product chain keys: sepolia, ethereum, base, … */
  availableChains?: string[];
  chainLabels?: Record<string, string>;
  setSelectedChain: (c: string) => void;
  address: string;
  onAddressChange: (v: string) => void;
  amount: string;
  onAmountChange: (v: string) => void;
  error: string;
  fee: number;
  feeUSD: number;
  onChangeAsset: () => void;
  onBack: () => void;
  onContinue: () => void;
}

/** Withdraw form: network selector, destination address, amount, fee breakdown, and continue button. */
export function WithdrawForm({
  asset, selectedChain, availableChains, chainLabels, setSelectedChain, address, onAddressChange, amount, onAmountChange,
  error, fee, feeUSD, onChangeAsset, onBack, onContinue,
}: WithdrawFormProps) {
  const { format } = useCurrency();
  const canContinue = !!amount && !!address && !error;

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <div className="flex items-center gap-3 px-5 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} aria-label="Back" className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20 }}>Withdraw {asset.symbol}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-[14px] mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <AssetIcon symbol={asset.symbol} size={32} />
          <div className="flex-1 text-left">
            <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{asset.symbol}</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Balance: {asset.balance.toFixed(4)} · {format(asset.valueUSD)}</p>
          </div>
          <button onClick={onChangeAsset} className="px-3 py-1.5 rounded-lg" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>Change</button>
        </div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>Network</p>
        <div className="flex gap-2 flex-wrap mb-4">
          {(availableChains?.length ? availableChains : asset.chains).map((chain) => (
            <motion.button
              key={chain}
              whileTap={{ scale: 0.93 }}
              onClick={() => setSelectedChain(chain)}
              className="px-3 py-2 rounded-[12px]"
              style={{ background: selectedChain === chain ? 'var(--primary)' : 'var(--card)', color: selectedChain === chain ? '#FFF' : 'var(--foreground)', fontSize: 13, fontWeight: 600, border: `1px solid ${selectedChain === chain ? 'transparent' : 'var(--border)'}` }}
            >
              {(chainLabels && chainLabels[chain]) || chain}
            </motion.button>
          ))}
        </div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>Destination Address</p>
        <div className="px-4 py-3 rounded-[14px] mb-4" style={{ background: 'var(--card)', border: `1px solid ${error && address ? 'var(--muted)' : 'var(--border)'}` }}>
          <input
            placeholder={`Paste ${selectedChain} address...`}
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            className="w-full bg-transparent outline-none"
            style={{ color: 'var(--foreground)', fontSize: 13 }}
          />
        </div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>Amount</p>
        <div className="rounded-[14px] p-4 mb-2" style={{ background: 'var(--card)', border: `1px solid ${error && amount ? 'var(--muted)' : 'var(--border)'}` }}>
          <div className="flex items-center gap-3">
            <AssetIcon symbol={asset.symbol} size={28} />
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value)}
              className="flex-1 bg-transparent outline-none"
              style={{ color: 'var(--foreground)', fontSize: 24, fontWeight: 800 }}
            />
            <button onClick={() => onAmountChange(asset.balance.toFixed(4))} className="px-3 py-1 rounded-lg" style={{ background: 'var(--secondary)', color: 'var(--foreground)', fontSize: 12, fontWeight: 700 }}>MAX</button>
          </div>
          {amount && <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 4 }}>≈ {format(Number(amount) * asset.price)}</p>}
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={14} style={{ color: 'var(--destructive)', flexShrink: 0 }} />
            <p style={{ color: 'var(--destructive)', fontSize: 12 }}>{error}</p>
          </div>
        )}

        {amount && address && !error && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-[14px] mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            {[
              { label: 'Amount', value: `${amount} ${asset.symbol}` },
              { label: 'Network fee', value: `${fee} ${asset.symbol} (~${format(feeUSD)})` },
              { label: 'Total', value: `${(Number(amount) + fee).toFixed(6)} ${asset.symbol}`, bold: true },
            ].map((row) => (
              <div key={row.label} className="flex justify-between py-1.5">
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{row.label}</span>
                <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: row.bold ? 700 : 500 }}>{row.value}</span>
              </div>
            ))}
          </motion.div>
        )}

        <div className="flex items-start gap-2 p-3 rounded-[12px] mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}>
          <AlertCircle size={14} style={{ color: 'var(--destructive)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.5 }}>Double-check the address. Withdrawals cannot be reversed once submitted.</p>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={onContinue}
          disabled={!canContinue}
          className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2"
          style={{ background: canContinue ? 'var(--primary)' : 'var(--muted)', fontWeight: 700, fontSize: 15 }}
        >
          Continue
        </motion.button>
        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}
