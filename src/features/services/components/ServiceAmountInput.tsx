import { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronDown, Phone, UserRound } from 'lucide-react';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { localAirtimeAmounts, localQuickAmounts } from '../../../shared/rates/fx';
import { ProviderIcon } from '../../../shared/icons/ProviderIcon';
import { EnterprisePlanGrid } from './EnterprisePlanGrid';
import { ContactsSheet } from './ContactsSheet';
import { normalizeNgMobile, formatNgMobileDisplay } from '../../../shared/utils/ngPhone';

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
  providerImage?: string | null;
  onChangeProvider?: () => void;
  amountCurrency?: string;
  liveVariations?: Array<{ code: string; name: string; amount?: string }>;
  productCode?: string | null;
  onProductCode?: (code: string | null) => void;
  meterType?: 'prepaid' | 'postpaid';
  onMeterType?: (t: 'prepaid' | 'postpaid') => void;
  contactPhone?: string;
  setContactPhone?: (v: string) => void;
  loadingVariations?: boolean;
  minLocalAmount?: number | null;
}

/**
 * Enterprise bill form — structure aligned with top NG fintech UIs.
 * Separate screens per service (no data/airtime tab switch). Live provider plans.
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
  providerImage,
  onChangeProvider,
  amountCurrency,
  liveVariations,
  productCode,
  onProductCode,
  meterType = 'prepaid',
  onMeterType,
  contactPhone,
  setContactPhone,
  loadingVariations,
  minLocalAmount,
}: ServiceAmountInputProps) {
  const { currency } = useCurrency();
  const code = (amountCurrency || currency.code || 'NGN').toUpperCase();
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

  const [contactsOpen, setContactsOpen] = useState(false);
  const needsPhone = serviceId === 'data' || serviceId === 'airtime';
  const needsMeter = serviceId === 'electricity';
  const needsAccount = serviceId === 'bills' || serviceId === 'betting';
  const needsPlans = serviceId === 'data' || serviceId === 'bills';

  const airtimeAmts = localAirtimeAmounts(code);
  const powerAmts = localQuickAmounts(code).filter((n) => !minLocalAmount || n >= minLocalAmount);

  const fmtChip = (n: number) => {
    if (n >= 1000) return `${symbol}${(n / 1000).toLocaleString(undefined, { maximumFractionDigits: 1 })}k`;
    return `${symbol}${n.toLocaleString()}`;
  };

  const applyPhone = (raw: string) => {
    setPhoneNumber(normalizeNgMobile(raw));
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Provider header card */}
      <button
        type="button"
        onClick={onChangeProvider}
        className="w-full flex items-center gap-3 px-4 py-3.5 rounded-[20px] text-left"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <ProviderIcon name={provider || 'Network'} logo={providerImage || undefined} size={44} rounded="full" />
        <div className="flex-1 min-w-0">
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>
            {provider || 'Select network'}
          </p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Tap to change</p>
        </div>
        <ChevronDown size={18} style={{ color: 'var(--muted-foreground)' }} />
      </button>

      {/* Electricity meter type */}
      {needsMeter && (
        <div
          className="grid grid-cols-2 gap-1.5 p-1 rounded-2xl"
          style={{ background: 'var(--muted)' }}
        >
          {(['prepaid', 'postpaid'] as const).map((mt) => (
            <button
              key={mt}
              type="button"
              onClick={() => onMeterType?.(mt)}
              className="py-2.5 rounded-[14px] capitalize text-[14px] font-semibold"
              style={{
                background: meterType === mt ? 'var(--primary)' : 'transparent',
                color: meterType === mt ? 'var(--primary-foreground, #fff)' : 'var(--muted-foreground)',
                border: 'none',
              }}
            >
              {mt}
            </button>
          ))}
        </div>
      )}

      {/* Phone / meter / smartcard field */}
      <div
        className="rounded-[22px] px-4 pt-3.5 pb-3"
        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
      >
        <div className="flex items-center justify-between mb-2">
          <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>
            {needsPhone ? 'Mobile number' : needsMeter ? 'Meter / account number' : needsAccount ? 'Smartcard / account' : 'Reference'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {needsPhone && (
            <Phone size={18} style={{ color: 'var(--muted-foreground)', flexShrink: 0 }} />
          )}
          <input
            type={needsPhone ? 'tel' : 'text'}
            inputMode={needsPhone || needsMeter ? 'numeric' : 'text'}
            value={
              needsPhone
                ? formatNgMobileDisplay(phoneNumber)
                : needsMeter || needsAccount
                  ? meterNumber
                  : phoneNumber
            }
            onChange={(e) => {
              if (needsPhone) applyPhone(e.target.value);
              else if (needsMeter || needsAccount) setMeterNumber(e.target.value.replace(/\s/g, '').slice(0, 20));
              else setPhoneNumber(e.target.value);
            }}
            placeholder={
              needsPhone
                ? '0801 234 5678'
                : needsMeter
                  ? 'Enter meter number'
                  : 'Enter smartcard / ID'
            }
            className="flex-1 bg-transparent outline-none min-w-0"
            style={{
              color: 'var(--foreground)',
              fontSize: 20,
              fontWeight: 700,
              letterSpacing: '0.02em',
              fontVariantNumeric: 'tabular-nums',
            }}
          />
          {(needsPhone || needsMeter) && (
            <button
              type="button"
              onClick={() => setContactsOpen(true)}
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: 'var(--muted)', color: 'var(--primary)' }}
              aria-label="Choose from contacts"
            >
              <UserRound size={18} />
            </button>
          )}
        </div>
        {minLocalAmount != null && needsMeter && (
          <p className="mt-2" style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            Minimum {symbol}
            {minLocalAmount.toLocaleString()}
          </p>
        )}
      </div>

      {/* Contact phone for electricity / cable */}
      {(needsMeter || serviceId === 'bills') && setContactPhone && (
        <div
          className="rounded-[20px] px-4 py-3 flex items-center gap-3"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <Phone size={16} style={{ color: 'var(--muted-foreground)' }} />
          <input
            type="tel"
            inputMode="numeric"
            value={formatNgMobileDisplay(contactPhone || '')}
            onChange={(e) => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 11))}
            placeholder="Contact phone"
            className="flex-1 bg-transparent outline-none"
            style={{ color: 'var(--foreground)', fontSize: 15, fontWeight: 600 }}
          />
        </div>
      )}

      {/* Data / TV plans — enterprise grid */}
      {needsPlans && (
        <EnterprisePlanGrid
          plans={liveVariations || []}
          selectedCode={productCode}
          currency={code}
          loading={loadingVariations}
          onSelect={(plan) => {
            onProductCode?.(plan.code);
            const amt = Number(plan.amount) || 0;
            if (amt > 0) {
              setSelectedAmount(amt);
              setCustomAmount('');
            }
          }}
        />
      )}

      {/* Airtime / electricity amount chips */}
      {(serviceId === 'airtime' || needsMeter) && (
        <div>
          <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
            Select amount
          </p>
          <div className="grid grid-cols-3 gap-2">
            {(serviceId === 'airtime' ? airtimeAmts : powerAmts).map((amt) => {
              const active = selectedAmount === amt;
              return (
                <motion.button
                  key={amt}
                  type="button"
                  whileTap={{ scale: 0.97 }}
                  onClick={() => {
                    setSelectedAmount(amt);
                    setCustomAmount('');
                  }}
                  className="py-4 rounded-[16px] text-center"
                  style={{
                    background: 'var(--card)',
                    border: active ? '1.5px solid var(--primary)' : '1.5px solid var(--border)',
                  }}
                >
                  <span
                    className="block tabular-nums"
                    style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 16 }}
                  >
                    {fmtChip(amt)}
                  </span>
                  {needsMeter && (
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>
                      Pay {fmtChip(amt)}
                    </span>
                  )}
                </motion.button>
              );
            })}
          </div>

          <div
            className="mt-3 flex items-center gap-2 h-14 px-4 rounded-2xl"
            style={{ background: 'var(--card)', border: '1.5px solid var(--border)' }}
          >
            <span style={{ color: 'var(--muted-foreground)', fontWeight: 700, fontSize: 18 }}>{symbol}</span>
            <input
              inputMode="decimal"
              placeholder="Enter amount"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value.replace(/[^\d.]/g, ''));
                setSelectedAmount(null);
              }}
              className="flex-1 bg-transparent outline-none"
              style={{ color: 'var(--foreground)', fontSize: 17, fontWeight: 700 }}
            />
          </div>
        </div>
      )}

      <ContactsSheet
        open={contactsOpen}
        onClose={() => setContactsOpen(false)}
        onPick={(phone) => {
          if (needsPhone) setPhoneNumber(phone);
          else if (needsMeter) setMeterNumber(phone);
        }}
      />
    </div>
  );
}
