import { motion } from 'motion/react';
import { Clock, ChevronDown, Shield } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import type { Currency } from '../../../../shared/context/CurrencyContext';
import type { BankAccount } from '../../../../shared/context/PaymentMethodsContext';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { PayoutAccountSelector } from './PayoutAccountSelector';

const QUICK_AMOUNTS = ['25', '50', '100', '250'];

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

/** Enterprise Sell form — crypto out, fiat in, bank payout. */
export function OffRampFormStep({
  currency,
  format,
  stablecoins,
  selectedAsset,
  setSelectedAsset,
  showTokenDropdown,
  setShowTokenDropdown,
  amount,
  setAmount,
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
  const canContinue = Number(amount) > 0 && Number(amount) <= selectedAsset.balance && !!selectedAccountId;

  return (
    <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="pb-28">
      <div
        className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-5"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        <Shield size={14} style={{ color: 'var(--primary)' }} />
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
          Payout to your verified bank account · KYC required
        </p>
      </div>

      {/* Sell amount */}
      <div
        className="rounded-[20px] p-5 mb-4"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }}>You sell</span>
          <button
            type="button"
            onClick={() => setAmount(String(selectedAsset.balance))}
            style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 700 }}
          >
            MAX · {selectedAsset.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}{' '}
            {selectedAsset.symbol}
          </button>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowTokenDropdown(!showTokenDropdown)}
            className="flex items-center gap-2 shrink-0"
          >
            <AssetIcon symbol={selectedAsset.symbol} size={36} />
            <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>
              {selectedAsset.symbol}
            </span>
            <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
          </button>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0"
            value={amount}
            onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))}
            className="flex-1 bg-transparent outline-none text-right min-w-0"
            style={{
              color: amount ? 'var(--foreground)' : 'var(--muted-foreground)',
              fontSize: 36,
              fontWeight: 700,
              letterSpacing: -0.5,
            }}
          />
        </div>

        {Number(amount) > selectedAsset.balance && (
          <p className="mt-2" style={{ color: 'var(--destructive)', fontSize: 12 }}>
            Amount exceeds available balance
          </p>
        )}

        <div className="flex flex-wrap gap-2 mt-4">
          {QUICK_AMOUNTS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => setAmount(q)}
              className="px-3.5 py-1.5 rounded-full"
              style={{
                background: amount === q ? 'var(--primary)' : 'var(--muted)',
                color: amount === q ? 'var(--primary-foreground, #fff)' : 'var(--foreground)',
                fontSize: 12,
                fontWeight: 600,
              }}
            >
              {q}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setAmount(String(selectedAsset.balance))}
            className="px-3.5 py-1.5 rounded-full"
            style={{
              background: 'var(--muted)',
              color: 'var(--foreground)',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Max
          </button>
        </div>
      </div>

      {showTokenDropdown && (
        <div
          className="mb-4 rounded-[16px] overflow-hidden max-h-48 overflow-y-auto"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          {stablecoins.map((a) => (
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
              <div className="flex-1">
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{a.symbol}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
                  Bal {a.balance.toLocaleString(undefined, { maximumFractionDigits: 4 })}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* You receive fiat */}
      <div
        className="rounded-[16px] p-4 mb-4 space-y-2.5"
        style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
      >
        <div className="flex justify-between">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Est. fee (~1.5%)</span>
          <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>
            {fee > 0 ? format(fee) : '—'}
          </span>
        </div>
        <div className="flex justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>You receive</span>
          <span style={{ color: 'var(--primary)', fontSize: 15, fontWeight: 700 }}>
            {youGet > 0
              ? `${currency.symbol}${youGet.toLocaleString(undefined, { maximumFractionDigits: 2 })}`
              : `${currency.symbol}0`}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock size={12} style={{ color: 'var(--muted-foreground)' }} />
          <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>
            Bank transfer usually 1–2 business days
          </span>
        </div>
      </div>

      <p style={{ color: 'var(--muted-foreground)', fontSize: 13, fontWeight: 500 }} className="mb-2 px-0.5">
        Payout account
      </p>
      <PayoutAccountSelector
        currencyCode={currency.code}
        compatibleAccounts={compatibleAccounts}
        selectedAccount={selectedAccount}
        open={showAccountDropdown}
        onToggle={() => setShowAccountDropdown(!showAccountDropdown)}
        onSelect={(id) => {
          setSelectedAccountId(id);
          setShowAccountDropdown(false);
        }}
        onAddAccount={onAddAccount}
        onClose={() => setShowAccountDropdown(false)}
      />

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
            : Number(amount) > selectedAsset.balance
              ? 'Insufficient balance'
              : !selectedAccountId
                ? 'Add a bank account'
                : 'Continue'}
        </motion.button>
      </div>
    </motion.div>
  );
}
