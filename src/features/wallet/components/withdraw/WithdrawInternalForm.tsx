import { useState } from 'react';
import type { Asset } from '../../../../shared/data/mockData';
import { PageTop } from '../../../../shared/components/PageTop';
import { BackButton } from '../../../../shared/components/BackButton';

type Tab = 'username' | 'email';

interface Props {
  asset: Asset;
  recipient: string;
  amount: string;
  error: string;
  onRecipientChange: (v: string) => void;
  onAmountChange: (v: string) => void;
  onBack: () => void;
  onContinue: () => void;
}

export function WithdrawInternalForm({
  asset,
  recipient,
  amount,
  error,
  onRecipientChange,
  onAmountChange,
  onBack,
  onContinue,
}: Props) {
  const [tab, setTab] = useState<Tab>('username');
  const bal = asset.balance || 0;
  const amt = Number(amount) || 0;
  const over = amt > bal && amt > 0;
  const canGo = amt > 0 && recipient.trim().length >= 2 && !over;

  return (
    <div className="flex flex-col h-full relative" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="flex items-center gap-3 px-5 mb-4">
        <BackButton onClick={onBack} />
        <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 17, flex: 1, textAlign: 'center', marginRight: 40 }}>
          {asset.symbol}-Internal Transfer
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto px-5 pb-36">
        <div
          className="flex gap-1 p-1 rounded-full mb-4"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          {(['username', 'email'] as Tab[]).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTab(t)}
              className="flex-1 py-2 rounded-full capitalize"
              style={{
                background: tab === t ? 'var(--card)' : 'transparent',
                color: tab === t ? 'var(--foreground)' : 'var(--muted-foreground)',
                fontWeight: 600,
                fontSize: 13,
                boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.12)' : undefined,
              }}
            >
              {t === 'username' ? 'Username' : 'Email'}
            </button>
          ))}
        </div>

        <div
          className="flex items-center px-3.5 py-3 rounded-2xl mb-5"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <input
            value={recipient}
            onChange={(e) => onRecipientChange(e.target.value)}
            placeholder={tab === 'email' ? 'Recipient email' : 'Convia username'}
            className="flex-1 bg-transparent outline-none"
            style={{ color: 'var(--foreground)', fontSize: 14 }}
            autoCapitalize="off"
            autoCorrect="off"
          />
        </div>

        <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 8 }}>Amount</p>
        <div
          className="flex items-center gap-2 px-3.5 py-3 rounded-2xl mb-2"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <input
            value={amount}
            onChange={(e) => onAmountChange(e.target.value.replace(/[^0-9.]/g, ''))}
            placeholder="Enter amount"
            inputMode="decimal"
            className="flex-1 bg-transparent outline-none tabular-nums"
            style={{ color: 'var(--foreground)', fontSize: 15, fontWeight: 600 }}
          />
          <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{asset.symbol}</span>
          <button
            type="button"
            onClick={() => onAmountChange(String(bal))}
            style={{ color: 'var(--primary)', fontWeight: 700, fontSize: 13 }}
          >
            Max
          </button>
        </div>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
          Available{' '}
          <span className="tabular-nums" style={{ color: 'var(--foreground)' }}>
            {bal.toLocaleString(undefined, { maximumFractionDigits: 8 })} {asset.symbol}
          </span>
        </p>
        {over && <p style={{ color: 'var(--destructive)', fontSize: 12, marginTop: 6 }}>Insufficient balance</p>}
        {error && <p style={{ color: 'var(--destructive)', fontSize: 12, marginTop: 6 }}>{error}</p>}

        <div className="mt-8 flex justify-between">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Withdrawal Fees</span>
          <span
            className="px-2.5 py-0.5 rounded-full"
            style={{ background: 'var(--muted)', color: 'var(--primary)', fontSize: 12, fontWeight: 700 }}
          >
            Zero Fees
          </span>
        </div>
        <div className="mt-3 flex justify-between">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Amount Received</span>
          <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 13 }}>
            {amt > 0 ? amt.toLocaleString(undefined, { maximumFractionDigits: 6 }) : '0'} {asset.symbol}
          </span>
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
