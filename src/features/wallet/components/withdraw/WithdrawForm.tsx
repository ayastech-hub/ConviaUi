import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { useCurrency } from '../../../../shared/context/CurrencyContext';
import { PageTop } from '../../../../shared/components/PageTop';
import { useState } from 'react';

interface WithdrawFormProps {
  asset: Asset;
  selectedChain: string;
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

function shortChain(key: string, labels?: Record<string, string>) {
  if (labels?.[key]) return labels[key];
  const map: Record<string, string> = {
    ethereum: 'Ethereum',
    sepolia: 'Sepolia',
    base: 'Base',
    bsc: 'BSC',
    polygon: 'Polygon',
    solana: 'Solana',
    tron: 'Tron',
    arbitrum: 'Arbitrum',
  };
  return map[key.toLowerCase()] || key;
}

/** Enterprise withdraw form — amount-first, compact network, sticky CTA. */
export function WithdrawForm({
  asset,
  selectedChain,
  availableChains = [],
  chainLabels,
  setSelectedChain,
  address,
  onAddressChange,
  amount,
  onAmountChange,
  error,
  fee,
  feeUSD,
  onChangeAsset,
  onBack,
  onContinue,
}: WithdrawFormProps) {
  const { format, currency } = useCurrency();
  const [netOpen, setNetOpen] = useState(false);
  const chains = availableChains.length ? availableChains : [selectedChain].filter(Boolean);
  const bal = asset.balance || 0;
  const over = Number(amount) > bal && Number(amount) > 0;
  const canContinue = Number(amount) > 0 && !!address.trim() && !error && !over;
  const fiatApprox = Number(amount) * (asset.price || 0);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-4">
        <BackButton onClick={onBack} />
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22 }}>Withdraw</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-28">
        {/* Asset */}
        <button
          type="button"
          onClick={onChangeAsset}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[20px] mb-3 text-left"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <AssetIcon symbol={asset.symbol} size={40} />
          <div className="flex-1 min-w-0">
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{asset.symbol}</p>
            <p className="tabular-nums" style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
              {bal.toLocaleString(undefined, { maximumFractionDigits: 6 })} available
            </p>
          </div>
          <span style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>Change</span>
        </button>

        {/* Network — single row + sheet */}
        <button
          type="button"
          onClick={() => setNetOpen(true)}
          className="w-full flex items-center justify-between px-4 py-3.5 rounded-[20px] mb-3 text-left"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>Network</p>
            <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14, marginTop: 2 }}>
              {shortChain(selectedChain, chainLabels)}
            </p>
          </div>
          <ChevronDown size={16} style={{ color: 'var(--muted-foreground)' }} />
        </button>

        {/* Amount hero */}
        <div
          className="rounded-[24px] p-5 mb-3"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}>Amount</span>
            <button
              type="button"
              onClick={() => onAmountChange(String(bal))}
              style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 700 }}
            >
              Max
            </button>
          </div>
          <div className="flex items-center gap-3">
            <AssetIcon symbol={asset.symbol} size={28} />
            <input
              type="text"
              inputMode="decimal"
              placeholder="0"
              value={amount}
              onChange={(e) => onAmountChange(e.target.value.replace(/[^0-9.]/g, ''))}
              className="flex-1 bg-transparent outline-none text-right tabular-nums min-w-0"
              style={{
                color: amount ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontSize: 36,
                fontWeight: 700,
                letterSpacing: -1,
              }}
            />
          </div>
          <p className="text-right mt-2 tabular-nums" style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            ≈ {currency.symbol}
            {fiatApprox.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </p>
          <div className="flex gap-2 mt-4">
            {[0.25, 0.5, 0.75, 1].map((p) => {
              const v = p === 1 ? bal : Number((bal * p).toFixed(6));
              const label = p === 1 ? 'Max' : `${p * 100}%`;
              const active = amount === String(v) || (p === 1 && amount === String(bal));
              return (
                <button
                  key={p}
                  type="button"
                  onClick={() => onAmountChange(p === 1 ? String(bal) : String(v))}
                  className="flex-1 py-2 rounded-full"
                  style={{
                    background: active ? 'var(--foreground)' : 'var(--muted)',
                    color: active ? 'var(--background)' : 'var(--foreground)',
                    fontSize: 12,
                    fontWeight: 600,
                    border: active ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Address */}
        <div className="mb-3">
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>
            Destination
          </p>
          <input
            type="text"
            value={address}
            onChange={(e) => onAddressChange(e.target.value.trim())}
            placeholder={`Paste ${shortChain(selectedChain, chainLabels)} address`}
            className="w-full px-4 h-14 rounded-[20px] outline-none"
            style={{
              background: 'var(--card)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              fontSize: 14,
              fontFamily: 'ui-monospace, monospace',
            }}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>

        {(error || over) && (
          <p className="mb-3" style={{ color: 'var(--destructive)', fontSize: 13, fontWeight: 600 }}>
            {error || 'Amount exceeds available balance'}
          </p>
        )}

        {/* Fee */}
        {Number(amount) > 0 && (
          <div
            className="rounded-[20px] px-4 py-3.5 space-y-2"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
          >
            <div className="flex justify-between">
              <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Network fee</span>
              <span className="tabular-nums" style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
                {fee} {asset.symbol}
                {feeUSD > 0 ? ` · ${format(feeUSD)}` : ''}
              </span>
            </div>
            <div className="flex justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
              <span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 700 }}>Total</span>
              <span className="tabular-nums" style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 700 }}>
                {(Number(amount) + (fee || 0)).toLocaleString(undefined, { maximumFractionDigits: 6 })} {asset.symbol}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Network sheet */}
      {netOpen && (
        <div
          className="fixed inset-0 z-40 flex items-end"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setNetOpen(false)}
        >
          <div
            className="w-full max-h-[45vh] overflow-y-auto rounded-t-[20px] px-4 pt-3 pb-8"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-9 h-1 rounded-full mx-auto mb-3" style={{ background: 'var(--border)' }} />
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Network</p>
            {chains.map((c) => {
              const active = c === selectedChain;
              return (
                <button
                  key={c}
                  type="button"
                  onClick={() => {
                    setSelectedChain(c);
                    setNetOpen(false);
                  }}
                  className="w-full flex items-center justify-between px-3 py-3.5 rounded-xl text-left"
                  style={{ background: active ? 'var(--muted)' : 'transparent' }}
                >
                  <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
                    {shortChain(c, chainLabels)}
                  </span>
                  {active && (
                    <span style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 700 }}>Selected</span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

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
          onClick={onContinue}
          className="w-full py-4 rounded-full mx-auto block"
          style={{
            maxWidth: 480,
            background: canContinue ? 'var(--primary)' : 'var(--muted)',
            color: canContinue ? 'var(--primary-foreground, #fff)' : 'var(--muted-foreground)',
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {!address.trim() ? 'Enter address' : !Number(amount) ? 'Enter amount' : over ? 'Insufficient balance' : 'Continue'}
        </motion.button>
      </div>
    </div>
  );
}
