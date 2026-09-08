import { motion } from 'motion/react';
import { Phone, Zap, User } from 'lucide-react';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import {
  localAirtimeAmounts,
  localDataBundles,
  localQuickAmounts,
} from '../../../shared/rates/fx';

interface ServiceAmountInputProps {
  serviceId: string;
  phoneNumber: string;
  setPhoneNumber: (v: string) => void;
  meterNumber: string;
  setMeterNumber: (v: string) => void;
  selectedAmount: number | null;
  setSelectedAmount: (v: number | null) => void;
  customAmount: string;
  setCustomAmount: (v: string) => void;
  provider?: string | null;
  onChangeProvider?: () => void;
  /** Override currency code (e.g. biller market). Defaults to app currency. */
  amountCurrency?: string;
}

/**
 * Bill form — amounts in local currency (not USD-only).
 */
export function ServiceAmountInput({
  serviceId,
  phoneNumber,
  setPhoneNumber,
  meterNumber,
  setMeterNumber,
  selectedAmount,
  setSelectedAmount,
  customAmount,
  setCustomAmount,
  provider,
  onChangeProvider,
  amountCurrency,
}: ServiceAmountInputProps) {
  const { currency } = useCurrency();
  const code = (amountCurrency || currency.code || 'USD').toUpperCase();
  const symbol =
    code === currency.code
      ? currency.symbol
      : code === 'NGN'
        ? '₦'
        : code === 'GHS'
          ? 'GH₵'
          : code === 'KES'
            ? 'KSh'
            : code;

  const needsPhone = serviceId === 'data' || serviceId === 'airtime';
  const needsMeter = serviceId === 'electricity';
  const needsAccount = serviceId === 'bills' || serviceId === 'betting';

  const airtimeAmts = localAirtimeAmounts(code);
  const dataBundles = localDataBundles(code);
  const quickAmts = localQuickAmounts(code);

  const fmtChip = (n: number) => {
    if (n >= 1000) return `${symbol}${(n / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`;
    return `${symbol}${n.toLocaleString()}`;
  };

  return (
    <div className="flex flex-col gap-5">
      {provider && (
        <div
          className="flex items-center justify-between px-4 py-3 rounded-2xl"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <div>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Provider</p>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{provider}</p>
          </div>
          {onChangeProvider && (
            <button
              type="button"
              onClick={onChangeProvider}
              style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}
            >
              Change
            </button>
          )}
        </div>
      )}

      {needsPhone && (
        <div>
          <label style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 8, display: 'block' }}>
            Phone number
          </label>
          <div
            className="flex items-center gap-3 px-4 h-14 rounded-2xl"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <Phone size={18} style={{ color: 'var(--muted-foreground)' }} />
            <input
              type="tel"
              inputMode="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/[^\d+]/g, '').slice(0, 15))}
              placeholder="0801 234 5678"
              className="flex-1 bg-transparent outline-none"
              style={{ color: 'var(--foreground)', fontSize: 16, fontWeight: 500 }}
            />
          </div>
        </div>
      )}

      {needsMeter && (
        <div>
          <label style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 8, display: 'block' }}>
            Meter number
          </label>
          <div
            className="flex items-center gap-3 px-4 h-14 rounded-2xl"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <Zap size={18} style={{ color: 'var(--muted-foreground)' }} />
            <input
              type="text"
              inputMode="numeric"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value.slice(0, 20))}
              placeholder="Enter meter number"
              className="flex-1 bg-transparent outline-none"
              style={{ color: 'var(--foreground)', fontSize: 16, fontWeight: 500 }}
            />
          </div>
        </div>
      )}

      {needsAccount && (
        <div>
          <label style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 8, display: 'block' }}>
            {serviceId === 'betting' ? 'User ID' : 'Smartcard / account'}
          </label>
          <div
            className="flex items-center gap-3 px-4 h-14 rounded-2xl"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <User size={18} style={{ color: 'var(--muted-foreground)' }} />
            <input
              type="text"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value.slice(0, 20))}
              placeholder={serviceId === 'betting' ? 'Enter user ID' : 'Enter smartcard number'}
              className="flex-1 bg-transparent outline-none"
              style={{ color: 'var(--foreground)', fontSize: 16, fontWeight: 500 }}
            />
          </div>
        </div>
      )}

      {serviceId === 'data' && (
        <div>
          <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 10 }}>
            Choose a plan · {code}
          </p>
          <div className="grid grid-cols-2 gap-2.5">
            {dataBundles.map((b) => {
              const active = selectedAmount === b.value;
              return (
                <motion.button
                  key={b.label}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSelectedAmount(b.value);
                    setCustomAmount('');
                  }}
                  className="relative text-left px-3.5 py-3.5 rounded-2xl"
                  style={{
                    background: active ? 'var(--muted)' : 'var(--card)',
                    border: active ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                  }}
                >
                  {b.popular && (
                    <span
                      className="absolute top-2 right-2 px-1.5 py-0.5 rounded-full"
                      style={{ background: 'var(--primary)', color: '#fff', fontSize: 9, fontWeight: 700 }}
                    >
                      POPULAR
                    </span>
                  )}
                  <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>{b.label}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 4 }}>
                    {fmtChip(b.value)}
                  </p>
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      {serviceId === 'airtime' && (
        <div>
          <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 10 }}>
            Amount · {code}
          </p>
          <div className="grid grid-cols-3 gap-2.5">
            {airtimeAmts.map((amt) => {
              const active = selectedAmount === amt;
              return (
                <motion.button
                  key={amt}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount('');
                  }}
                  className="py-3.5 rounded-2xl text-center tabular-nums"
                  style={{
                    background: active ? 'var(--muted)' : 'var(--card)',
                    border: active ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                    color: 'var(--foreground)',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {fmtChip(amt)}
                </motion.button>
              );
            })}
          </div>
          <div
            className="mt-3 flex items-center gap-2 px-4 h-14 rounded-2xl"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <span style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>{symbol}</span>
            <input
              type="text"
              inputMode="decimal"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value.replace(/[^0-9.]/g, ''));
                setSelectedAmount(null);
              }}
              placeholder="Other amount"
              className="flex-1 bg-transparent outline-none tabular-nums"
              style={{ color: 'var(--foreground)', fontSize: 16, fontWeight: 600 }}
            />
          </div>
        </div>
      )}

      {(serviceId === 'electricity' || serviceId === 'bills' || serviceId === 'betting') && (
        <div>
          <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13, marginBottom: 10 }}>
            Amount · {code}
          </p>
          <div className="grid grid-cols-3 gap-2.5 mb-3">
            {quickAmts.map((amt) => {
              const active = selectedAmount === amt;
              return (
                <motion.button
                  key={amt}
                  type="button"
                  whileTap={{ scale: 0.96 }}
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount('');
                  }}
                  className="py-3.5 rounded-2xl text-center tabular-nums"
                  style={{
                    background: active ? 'var(--muted)' : 'var(--card)',
                    border: active ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                    color: 'var(--foreground)',
                    fontWeight: 700,
                    fontSize: 14,
                  }}
                >
                  {fmtChip(amt)}
                </motion.button>
              );
            })}
          </div>
          <div
            className="flex items-center gap-2 px-4 h-14 rounded-2xl"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <span style={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>{symbol}</span>
            <input
              type="text"
              inputMode="decimal"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value.replace(/[^0-9.]/g, ''));
                setSelectedAmount(null);
              }}
              placeholder="Enter amount"
              className="flex-1 bg-transparent outline-none tabular-nums"
              style={{ color: 'var(--foreground)', fontSize: 18, fontWeight: 600 }}
            />
          </div>
        </div>
      )}
    </div>
  );
}
