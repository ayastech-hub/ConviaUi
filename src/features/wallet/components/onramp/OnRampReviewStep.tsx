import { motion } from 'motion/react';
import { Building2, CreditCard, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import type { Asset } from '../../../../shared/data/mockData';
import type { Currency } from '../../../../shared/context/CurrencyContext';
import type { PaymentMethod, NewCardDraft } from './PaymentMethodSelector';

interface OnRampReviewStepProps {
  currency: Currency;
  format: (n: number) => string;
  amount: string;
  selectedAsset: Asset;
  youGet: number;
  paymentMethod: PaymentMethod;
  fee: number;
  newCard: NewCardDraft;
  setNewCard: (c: NewCardDraft) => void;
  /** Preview bank transfer destination (mock/API). */
  bankPreview?: {
    bankName?: string;
    accountName?: string;
    accountNumber?: string;
    reference?: string;
  };
  onConfirm: () => void;
  confirming?: boolean;
}

/** Review + collect payment details by method. */
export function OnRampReviewStep({
  currency,
  format,
  amount,
  selectedAsset,
  youGet,
  paymentMethod,
  fee,
  newCard,
  setNewCard,
  bankPreview,
  onConfirm,
  confirming,
}: OnRampReviewStepProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = async (key: string, value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    } catch {
      /* ignore */
    }
  };

  const bank = bankPreview || {
    bankName: 'Provider bank',
    accountName: 'Convia Payments',
    accountNumber: '—',
    reference: 'Shown after confirm',
  };

  const cardOk =
    paymentMethod !== 'card' ||
    (newCard.number.replace(/\s/g, '').length >= 12 &&
      newCard.expiry.length >= 4 &&
      newCard.cvc.length >= 3);

  const canConfirm = cardOk && !confirming;

  return (
    <motion.div
      key="review"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="pb-28"
    >
      {/* Summary */}
      <div
        className="rounded-[24px] p-5 mb-4"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 6 }}>
          You pay
        </p>
        <p className="tabular-nums" style={{ color: 'var(--foreground)', fontSize: 28, fontWeight: 800 }}>
          {currency.symbol}
          {Number(amount).toLocaleString()}
        </p>
        <div className="flex justify-between mt-4 pt-3" style={{ borderTop: '1px solid var(--border)' }}>
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>You receive</span>
          <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>
            {youGet.toLocaleString(undefined, { maximumFractionDigits: 6 })} {selectedAsset.symbol}
          </span>
        </div>
        <div className="flex justify-between mt-2">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Fee</span>
          <span className="tabular-nums" style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>
            {fee > 0 ? format(fee) : '—'}
          </span>
        </div>
      </div>

      {/* Bank details */}
      {paymentMethod === 'bank' && (
        <div
          className="rounded-[24px] p-4 mb-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Building2 size={16} style={{ color: 'var(--foreground)' }} />
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Bank transfer</p>
          </div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12, lineHeight: 1.4 }}>
            Transfer exactly this amount. Final account details appear after you confirm.
          </p>
          {(
            [
              ['Bank', bank.bankName],
              ['Account name', bank.accountName],
              ['Account number', bank.accountNumber],
              ['Reference', bank.reference],
              ['Amount', `${currency.symbol}${Number(amount).toLocaleString()}`],
            ] as const
          ).map(([label, value]) => (
            <div
              key={label}
              className="flex items-center justify-between py-2.5"
              style={{ borderTop: '1px solid var(--border)' }}
            >
              <div className="min-w-0">
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{label}</p>
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{value || '—'}</p>
              </div>
              {value && value !== '—' && value !== 'Shown after confirm' && (
                <button
                  type="button"
                  onClick={() => copy(label, value)}
                  className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0"
                  style={{ background: 'var(--muted)' }}
                >
                  {copied === label ? (
                    <Check size={14} style={{ color: 'var(--primary)' }} />
                  ) : (
                    <Copy size={14} style={{ color: 'var(--muted-foreground)' }} />
                  )}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Card input */}
      {paymentMethod === 'card' && (
        <div
          className="rounded-[24px] p-4 mb-4"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div className="flex items-center gap-2 mb-3">
            <CreditCard size={16} style={{ color: 'var(--foreground)' }} />
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Card details</p>
          </div>
          <label style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>
            Cardholder name
          </label>
          <input
            value={newCard.name || ''}
            onChange={(e) => setNewCard({ ...newCard, name: e.target.value })}
            placeholder="Name on card"
            className="w-full px-3.5 h-12 rounded-xl mb-3 mt-1 outline-none"
            style={{
              background: 'var(--muted)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              fontSize: 14,
            }}
          />
          <label style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>
            Card number
          </label>
          <input
            inputMode="numeric"
            value={newCard.number}
            onChange={(e) =>
              setNewCard({
                ...newCard,
                number: e.target.value.replace(/[^\d\s]/g, '').slice(0, 19),
              })
            }
            placeholder="1234 5678 9012 3456"
            className="w-full px-3.5 h-12 rounded-xl mb-3 mt-1 outline-none tabular-nums"
            style={{
              background: 'var(--muted)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              fontSize: 15,
              fontWeight: 600,
            }}
          />
          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>
                Expiry
              </label>
              <input
                inputMode="numeric"
                value={newCard.expiry}
                onChange={(e) => {
                  let v = e.target.value.replace(/[^\d]/g, '').slice(0, 4);
                  if (v.length >= 3) v = `${v.slice(0, 2)}/${v.slice(2)}`;
                  setNewCard({ ...newCard, expiry: v });
                }}
                placeholder="MM/YY"
                className="w-full px-3.5 h-12 rounded-xl mt-1 outline-none tabular-nums"
                style={{
                  background: 'var(--muted)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  fontSize: 14,
                }}
              />
            </div>
            <div>
              <label style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>CVC</label>
              <input
                inputMode="numeric"
                value={newCard.cvc}
                onChange={(e) => setNewCard({ ...newCard, cvc: e.target.value.replace(/\D/g, '').slice(0, 4) })}
                placeholder="123"
                className="w-full px-3.5 h-12 rounded-xl mt-1 outline-none tabular-nums"
                style={{
                  background: 'var(--muted)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  fontSize: 14,
                }}
              />
            </div>
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
          whileTap={{ scale: canConfirm ? 0.98 : 1 }}
          disabled={!canConfirm}
          onClick={onConfirm}
          className="w-full py-4 rounded-full mx-auto block"
          style={{
            maxWidth: 480,
            background: canConfirm ? 'var(--primary)' : 'var(--muted)',
            color: canConfirm ? 'var(--primary-foreground, #fff)' : 'var(--muted-foreground)',
            fontWeight: 700,
            fontSize: 16,
          }}
        >
          {confirming ? 'Creating order…' : paymentMethod === 'card' ? 'Pay with card' : 'Confirm transfer'}
        </motion.button>
      </div>
    </motion.div>
  );
}
