import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Loader } from 'lucide-react';
import type { Screen, Transaction } from '../../../shared/data/mockData';
import { TransactionReceipt } from '../../../shared/components/TransactionReceipt';
import { SERVICE_GROUPS, isBillService, type ServiceItem } from '../components/serviceData';
import { ServiceHub } from '../components/ServiceHub';
import { ProviderSelector } from '../components/ProviderSelector';
import { ServiceAmountInput } from '../components/ServiceAmountInput';
import { PaymentSummaryCard } from '../components/PaymentSummaryCard';
import { ServicePaymentSuccess, type ServiceSuccessInfo } from '../components/ServicePaymentSuccess';
import { useAuth } from '../../../shared/context/AuthContext';
import { useSupportedCountries } from '../../../shared/hooks/useSupportedCountries';
import * as billsApi from '../../../shared/api/bills';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { WalletFeatureBanner } from '../../../shared/components/WalletFeatureBanner';
import { useCurrency } from '../../../shared/context/CurrencyContext';

interface ServicesScreenProps {
  navigate: (s: Screen) => void;
  goBack: () => void;
  switchTab: (s: Screen) => void;
}

/** Map UI service ids → backend CATEGORY (airtime|data|electricity|cable|betting). */
function toCategory(serviceId: string): string {
  if (serviceId === 'bills') return 'cable';
  return serviceId;
}

export function ServicesScreen({ navigate, switchTab }: ServicesScreenProps) {
  const { userId, status } = useAuth();
  const { currency } = useCurrency();
  const [activeService, setActiveService] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedBillerCode, setSelectedBillerCode] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [meterNumber, setMeterNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'hub' | 'detail' | 'success'>('hub');
  const [successInfo, setSuccessInfo] = useState<ServiceSuccessInfo | null>(null);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [billers, setBillers] = useState<Biller[]>([]);
  const [billerCurrency, setBillerCurrency] = useState('NGN');
  const [loadingBillers, setLoadingBillers] = useState(false);
  const [paying, setPaying] = useState(false);
  const [apiError, setApiError] = useState<{ code?: string; message?: string } | null>(null);
  const { countries: marketCountries } = useSupportedCountries();
  const [country, setCountry] = useState('');
  useEffect(() => {
    if (marketCountries.length && !country) setCountry(marketCountries[0].code);
  }, [marketCountries, country]);

  const activeItem = SERVICE_GROUPS.flatMap((g) => g.items).find((i) => i.id === activeService);

  const handleServiceClick = (item: ServiceItem) => {
    if (isBillService(item.id)) {
      setActiveService(item.id);
      setSelectedProvider(null);
      setSelectedBillerCode(null);
      setSelectedAmount(null);
      setCustomAmount('');
      setMeterNumber('');
      setPhoneNumber('');
      setApiError(null);
      setStep('detail');
    } else {
      navigate(item.id as Screen);
    }
  };

  useEffect(() => {
    if (step !== 'detail' || !activeService) return;
    const category = toCategory(activeService);
    let cancelled = false;
    setLoadingBillers(true);
    setBillers([]);
    billsApi
      .listBillers(country, category)
      .then((res) => {
        if (cancelled) return;
        setBillers(res.billers || []);
        if (res.currency) setBillerCurrency(res.currency);
      })
      .catch((err) => {
        if (cancelled) return;
        if (err instanceof ApiError) setApiError({ code: err.code, message: err.message });
        setBillers([]);
      })
      .finally(() => {
        if (!cancelled) setLoadingBillers(false);
      });
    return () => {
      cancelled = true;
    };
  }, [step, activeService, country]);

  const customerRef = useMemo(() => {
    if (activeService === 'electricity' || activeService === 'bills') return meterNumber.trim();
    return phoneNumber.trim();
  }, [activeService, meterNumber, phoneNumber]);

  const handlePay = async () => {
    const amount = selectedAmount ?? parseFloat(customAmount);
    if (!amount || !selectedProvider) return;
    if (!userId) {
      setApiError({ message: 'Sign in required' });
      return;
    }
    if (!selectedBillerCode) {
      setApiError({ message: 'Select a biller from the live list' });
      return;
    }
    if (!customerRef) {
      setApiError({ message: 'Enter phone / meter / account reference' });
      return;
    }

    setPaying(true);
    setApiError(null);
    try {
      const category = toCategory(activeService!);
      const localAmount = String(amount);
      // Crypto debit amount: use local amount as string; FX is caller responsibility per API docs
      await billsApi.payBill({
        userId,
        country,
        category,
        billerCode: selectedBillerCode,
        customerRef,
        amount: localAmount,
        asset: 'USDT',
        localAmount,
        localCurrency: billerCurrency || currency.code || 'NGN',
      });
      setSuccessInfo({ label: activeItem?.label ?? '', amount, provider: selectedProvider });
      setReceiptTx({
        id: 'svc_' + Date.now(),
        type: 'send',
        asset: 'USDT',
        amount,
        valueUSD: amount,
        status: 'confirmed',
        time: 'Just now',
        username: selectedProvider,
      });
      setStep('success');
    } catch (err) {
      if (err instanceof ApiError) setApiError({ code: err.code, message: err.body.message || err.message });
      else setApiError({ message: 'Payment failed' });
    } finally {
      setPaying(false);
    }
  };

  const canPay = () => {
    const amount = selectedAmount ?? parseFloat(customAmount);
    return !!(amount > 0 && selectedProvider && selectedBillerCode && customerRef && !paying);
  };

  const reset = () => {
    setStep('hub');
    setActiveService(null);
    setSelectedProvider(null);
    setSelectedBillerCode(null);
    setSuccessInfo(null);
    setApiError(null);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center gap-3 px-5 mb-4">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (step === 'hub') switchTab('home');
            else if (step === 'success') reset();
            else if (selectedProvider) {
              setSelectedProvider(null);
              setSelectedBillerCode(null);
            } else setStep('hub');
          }}
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--muted)' }}
        >
          <ArrowLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22 }}>
            {step === 'hub' ? 'Services' : step === 'success' ? 'Done' : activeItem?.label || 'Service'}
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
            {step === 'hub'
              ? 'Bills paid from crypto balance (Taka)'
              : step === 'success'
                ? 'Payment complete'
                : 'Choose provider & amount'}
          </p>
        </div>
      </div>

      {step === 'hub' && <ServiceHub onSelectService={handleServiceClick} />}

      {step === 'detail' && activeItem && (
        <div className="px-5 pb-5">
          <WalletFeatureBanner feature="deposit" />
          {status === 'anonymous' && (
            <FeatureAlert reason="generic" message="Sign in to pay bills from your crypto ledger." />
          )}
          {apiError && (
            <FeatureAlert reason={mapApiCodeToReason(apiError.code)} message={apiError.message} detail={apiError.code} />
          )}

          <div className="mb-4">
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>Country</p>
            <select
              value={country}
              onChange={(e) => setCountry(e.target.value)}
              className="w-full rounded-[12px] px-3 py-2.5"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)' }}
            >
              {(marketCountries.length ? marketCountries.map((c) => c.code) : []).map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div
            className="flex items-center gap-3 mb-5 p-4 rounded-[16px]"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'var(--muted)' }}
            >
              <activeItem.icon size={20} style={{ color: 'var(--foreground)' }} />
            </div>
            <div>
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{activeItem.label}</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{activeItem.description}</p>
            </div>
          </div>

          {!selectedProvider && (
            <>
              {loadingBillers ? (
                <div className="flex justify-center py-8">
                  <Loader className="animate-spin" style={{ color: 'var(--muted-foreground)' }} />
                </div>
              ) : billers.length > 0 ? (
                <div className="flex flex-col gap-2 mb-4">
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>Live billers</p>
                  {billers.map((b, i) => {
                    const code = String(b.billerCode || b.code || b.id || '');
                    const name = String(b.name || code || `Biller ${i + 1}`);
                    return (
                      <motion.button
                        key={code + i}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          setSelectedProvider(name);
                          setSelectedBillerCode(code);
                        }}
                        className="text-left px-4 py-3.5 rounded-[14px]"
                        style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                      >
                        <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{name}</p>
                        <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{code}</p>
                      </motion.button>
                    );
                  })}
                </div>
              ) : (
                <ProviderSelector
                  serviceId={activeService!}
                  onSelect={(name) => {
                    setSelectedProvider(name);
                    setSelectedBillerCode(name);
                  }}
                />
              )}
            </>
          )}

          {selectedProvider && activeService && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
              <ServiceAmountInput
                serviceId={activeService}
                phoneNumber={phoneNumber}
                setPhoneNumber={setPhoneNumber}
                meterNumber={meterNumber}
                setMeterNumber={setMeterNumber}
                selectedAmount={selectedAmount}
                setSelectedAmount={setSelectedAmount}
                customAmount={customAmount}
                setCustomAmount={setCustomAmount}
              />
              <PaymentSummaryCard
                provider={selectedProvider}
                serviceLabel={activeItem.label}
                displayAmount={String(selectedAmount ?? (customAmount || '0'))}
                canPay={canPay()}
                onPay={() => void handlePay()}
              />
              {paying && (
                <p className="text-center" style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                  Submitting bill payment…
                </p>
              )}
            </motion.div>
          )}
        </div>
      )}

      {step === 'success' && successInfo && (
        <ServicePaymentSuccess
          info={successInfo}
          onNewPayment={reset}
          onViewReceipt={() => setReceiptTx(receiptTx)}
          onBackToHome={() => switchTab('home')}
        />
      )}

      <TransactionReceipt tx={receiptTx} open={!!receiptTx} onClose={() => setReceiptTx(null)} />

      <div style={{ height: 100 }} />
    </div>
  );
}
