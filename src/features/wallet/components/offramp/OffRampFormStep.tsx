import { motion } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import type { Currency } from '../../../../shared/context/CurrencyContext';
import type { BankAccount } from '../../../../shared/api/banks';
import { AssetIcon } from '../../../../shared/components/AssetIcon';

interface OffRampFormStepProps {
  currency: Currency;
  format: (n: number) => string;
  amount: string;
  setAmount: (v: string) => void;
  stablecoins: Asset[];
  selectedAsset: Asset;
  setSelectedAsset: (a: Asset) => void;
  showTokenDropdown: boolean;
  setShowTokenDropdown: (v: boolean) => void;
  compatibleAccounts: BankAccount[];
  selectedAccountId: string | null;
  setSelectedAccountId: (id: string | null) => void;
  selectedAccount: BankAccount | undefined;
  showAccountDropdown: boolean;
  setShowAccountDropdown: (v: boolean) => void;
  onAddAccount: () => void;
  fee: number;
  youGet: number;
  onPreview: () => void;
}

const QUICK_PCT = [0.25, 0.5, 0.75, 1];

/** Sell form — amount, asset, bank, quote. No marketing copy. */
export function OffRampFormStep({
  currency,
  format,
  amount,
  setAmount,
  stablecoins,
  selectedAsset,
  setSelectedAsset,
  showTokenDropdown,
  setShowTokenDropdown,
  compatibleAccounts,
  selectedAccountId,
  setSelectedAccountId,
  selectedAccount,
  showAccountDropdown,
  setShowAccountDropdown,
  onAddAccount,
  fee,
  youGet,
  onPreview,
}: OffRampFormStepProps) {
  const bal = selectedAsset.balance || 0;
  const over = Number(amount) > bal && Number(amount) > 0;
  const canContinue = Number(amount) > 0 && !over && !!selectedAccountId;

  const bankLine = selectedAccount
    ? `${selectedAccount.bankName || 'Bank'} · ${(selectedAccount.accountNumber || selectedAccount.last4 || '').toString().slice(-4)}`
    : 'Select bank account';

  return (
    <motion.div
      key="form"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="pb-28"
    >
      <div
        className="rounded-[24px] p-5 mb-3"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-4">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 600 }}>You sell</span>
          <button
            type="button"
            onClick={() => setAmount(String(bal))}
            style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 700 }}
          >
            Max · {bal.toLocaleString(undefined, { maximumFractionDigits: 4 })}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowTokenDropdown(!showTokenDropdown)}
            className="flex items-center gap-2 flex-shrink-0"
          >
            <AssetIcon symbol={selectedAsset.symbol} size={36} />
            <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>{selectedAsset.symbol}</span>
            <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
          </button>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            className="flex-1 bg-transparent outline-none text-right min-w-0 tabular-nums"
            style={{
              color: amount ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: -1,
            }}
          />
        </div>

        {over && (
          <p className="mt-2" style={{ color: 'var(--destructive)', fontSize: 12, fontWeight: 600 }}>
            Exceeds available balance
          </p>
        )}

        <div className="flex gap-2 mt-4">
          {QUICK_PCT.map((p) => {
            const v = bal * p;
            const label = p === 1 ? 'Max' : `${p * 100}%`;
            const active =
              (p === 1 && amount === String(bal)) ||
              (p !== 1 && amount === String(Number(v.toFixed(6))));
            return (
              <button
                key={p}
                type="button"
                onClick={() => setAmount(p === 1 ? String(bal) : String(Number(v.toFixed(6))))}
                className="flex-1 py-2 rounded-full"
                style={{
                  background: active ? 'var(--liquid-chip-on-bg)' : 'var(--muted)',
                color: active ? 'var(--liquid-chip-on-text)' : 'var(--foreground)',
                border: active ? '1px solid var(--liquid-pill-border)' : '1px solid var(--border)',
                boxShadow: active ? 'var(--liquid-chip-on-shadow)' : undefined,
                backdropFilter: active ? 'blur(12px)' : undefined,
                WebkitBackdropFilter: active ? 'blur(12px)' : undefined,
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
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>Sell</p>
            {stablecoins.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setSelectedAsset(a);
                  setShowTokenDropdown(false);
                  setAmount('');
                }}
                className="w-full flex items-center gap-3 px-2 py-3 text-left rounded-xl"
                style={{ background: a.id === selectedAsset.id ? 'var(--muted)' : 'transparent' }}
              >
                <AssetIcon symbol={a.symbol} size={32} />
                <div className="flex-1">
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{a.symbol}</p>
                  <p className="tabular-nums" style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                    {a.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

            {/* Bank */}
      <button
        type="button"
        onClick={() => {
          if (!compatibleAccounts.length) {
            onAddAccount();
            return;
          }
          setShowAccountDropdown(!showAccountDropdown);
        }}
        className="w-full flex items-center justify-between px-4 py-3.5 rounded-[20px] mb-3 text-left"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>Payout to</p>
          <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14, marginTop: 2 }}>{bankLine}</p>
        </div>
        <ChevronDown size={16} style={{ color: 'var(--muted-foreground)' }} />
      </button>

      {showAccountDropdown && (
        <div
          className="fixed inset-0 z-40 flex items-end"
          style={{ background: 'rgba(0,0,0,0.5)' }}
          onClick={() => setShowAccountDropdown(false)}
        >
          <div
            className="w-full max-h-[50vh] overflow-y-auto rounded-t-[20px] px-4 pt-3 pb-8"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-9 h-1 rounded-full mx-auto mb-3" style={{ background: 'var(--border)' }} />
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, marginBottom: 8 }}>
              Payout account
            </p>
            {compatibleAccounts.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => {
                  setSelectedAccountId(a.id);
                  setShowAccountDropdown(false);
                }}
                className="w-full px-2 py-3 text-left rounded-xl"
                style={{ background: a.id === selectedAccountId ? 'var(--muted)' : 'transparent' }}
              >
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
                  {a.bankName || 'Bank'}
                </p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                  •••• {(a.accountNumber || a.last4 || '').toString().slice(-4)}
                </p>
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setShowAccountDropdown(false);
                onAddAccount();
              }}
              className="w-full px-2 py-3 text-left"
              style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 13 }}
            >
              Add bank account
            </button>
          </div>
        </div>
      )}

      <div
        className="rounded-[20px] px-4 py-3.5 mb-4 space-y-2.5"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        <div className="flex justify-between">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Fee</span>
          <span className="tabular-nums" style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
            {fee > 0 ? format(fee) : '—'}
          </span>
        </div>
        <div className="flex justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 700 }}>You receive</span>
          <span className="tabular-nums" style={{ color: 'var(--primary)', fontSize: 15, fontWeight: 800 }}>
            {youGet > 0
              ? `${currency.symbol}${youGet.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
              : `${currency.symbol}0`}
          </span>
        </div>
      </div>

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
            ? 'Enter amount'
            : over
              ? 'Insufficient balance'
              : !selectedAccountId
                ? 'Select bank account'
                : 'Continue'}
        </motion.button>
      </div>
    </motion.div>
  );
}
