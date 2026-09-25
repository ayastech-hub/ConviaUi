import { useState } from 'react';
import { ChevronDown, Clipboard, ScanLine } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { networkInfoForKey } from '../deposit/types';
import { PageTop } from '../../../../shared/components/PageTop';
import { BackButton } from '../../../../shared/components/BackButton';
import type { WithdrawQuote } from '../../../../shared/api/wallet';

interface Props {
  asset: Asset;
  selectedChain: string;
  address: string;
  amount: string;
  minWithdraw: number;
  feeQuote: WithdrawQuote | null;
  quoting?: boolean;
  error: string;
  onAddressChange: (v: string) => void;
  onAmountChange: (v: string) => void;
  onOpenChain: () => void;
  onBack: () => void;
  onContinue: () => void;
  onPaste?: () => void;
  onScan?: () => void;
}

export function WithdrawOnChainForm({
  asset,
  selectedChain,
  address,
  amount,
  minWithdraw,
  feeQuote,
  quoting,
  error,
  onAddressChange,
  onAmountChange,
  onOpenChain,
  onBack,
  onContinue,
  onPaste,
  onScan,
}: Props) {
  const net = selectedChain ? networkInfoForKey(selectedChain) : null;
  const bal = asset.balance || 0;
  const amt = Number(amount) || 0;
  const feeNative = feeQuote ? Number(feeQuote.totalFeeAmountInAsset) || 0 : 0;
  const feeUsd = feeQuote ? Number(feeQuote.totalFeeUsd) || 0 : 0;
  const received = Math.max(0, amt - feeNative);
  const belowMin = minWithdraw > 0 && amt > 0 && amt < minWithdraw;
  const over = amt > bal && amt > 0;
  const canGo = amt > 0 && !!address.trim() && !!selectedChain && !belowMin && !over && !error;

  const setMax = () => {
    const max = Math.max(0, bal);
    // don't over-round so user isn't blocked on "insufficient"
    onAmountChange(String(max));
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-4">
        <BackButton onClick={onBack} />
        <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17, flex: 1, textAlign: 'center', marginRight: 40 }}>
          {asset.symbol}-On-Chain
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-36">
        <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Address</p>
        <div
          className="flex items-center gap-2 px-3 py-3 rounded-2xl mb-5"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <input
            value={address}
            onChange={(e) => onAddressChange(e.target.value)}
            placeholder="Input or paste the withdrawal address"
            className="flex-1 bg-transparent outline-none min-w-0"
            style={{ color: 'var(--foreground)', fontSize: 14 }}
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
          />
          <button type="button" onClick={onPaste} className="p-1.5" aria-label="Paste">
            <Clipboard size={18} style={{ color: 'var(--muted-foreground)' }} />
          </button>
          {onScan && (
            <button type="button" onClick={onScan} className="p-1.5" aria-label="Scan">
              <ScanLine size={18} style={{ color: 'var(--muted-foreground)' }} />
            </button>
          )}
        </div>

        <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Network</p>
        <button
          type="button"
          onClick={onOpenChain}
          className="w-full flex items-center justify-between px-3.5 py-3.5 rounded-2xl mb-5 text-left"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <span style={{ color: net ? 'var(--foreground)' : 'var(--muted-foreground)', fontSize: 14, fontWeight: net ? 600 : 400 }}>
            {net ? `${net.name}${net.label ? ` (${net.label})` : ''}` : 'Please choose a chain type'}
          </span>
          <ChevronDown size={18} style={{ color: 'var(--muted-foreground)' }} />
        </button>

        <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Amount</p>
        <div
          className="flex items-center gap-2 px-3.5 py-3 rounded-2xl mb-2"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <input
            value={amount}
            onChange={(e) => onAmountChange(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder={minWithdraw > 0 ? `Min. ${minWithdraw}` : 'Amount'}
            inputMode="decimal"
            className="flex-1 bg-transparent outline-none tabular-nums"
            style={{ color: 'var(--foreground)', fontSize: 15, fontWeight: 600 }}
          />
          <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{asset.symbol}</span>
          <button type="button" onClick={setMax} style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 13 }}>
            Max
          </button>
        </div>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 4 }}>
          Available{' '}
          <span className="tabular-nums" style={{ color: 'var(--foreground)' }}>
            {bal.toLocaleString(undefined, { maximumFractionDigits: 8 })} {asset.symbol}
          </span>
        </p>
        {amt > 0 && belowMin && (
          <p style={{ color: 'var(--destructive)', fontSize: 12, marginBottom: 8 }}>
            Minimum withdrawal is {minWithdraw} {asset.symbol}
          </p>
        )}
        {over && (
          <p style={{ color: 'var(--destructive)', fontSize: 12, marginBottom: 8 }}>Insufficient balance</p>
        )}
        {error && <p style={{ color: 'var(--destructive)', fontSize: 12, marginBottom: 8 }}>{error}</p>}

        <div className="mt-6 space-y-3">
          <div className="flex justify-between">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Withdrawal Fees</span>
            <span className="tabular-nums" style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
              {quoting
                ? '…'
                : feeQuote
                  ? `${feeNative.toLocaleString(undefined, { maximumFractionDigits: 6 })} ${asset.symbol}${
                      feeUsd ? ` (≈$${feeUsd.toFixed(2)})` : ''
                    }`
                  : amt > 0
                    ? '—'
                    : '0'}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Amount Received</span>
            <span className="tabular-nums" style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 700 }}>
              {received.toLocaleString(undefined, { maximumFractionDigits: 6 })} {asset.symbol}
            </span>
          </div>
        </div>
      </div>

      <div
        className="absolute bottom-0 left-0 right-0 px-5 pt-3 pb-8"
        style={{ background: 'var(--background)', borderTop: '1px solid var(--border)' }}
      >
        <button
          type="button"
          disabled={!canGo}
          onClick={onContinue}
          className="w-full rounded-full"
          style={{
            height: 52,
            background: 'var(--primary)',
            color: 'var(--primary-foreground, #fff)',
            fontWeight: 700,
            fontSize: 15,
            opacity: canGo ? 1 : 0.4,
          }}
        >
          Withdraw
        </button>
      </div>
    </div>
  );
}
