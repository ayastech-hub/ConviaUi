import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'motion/react';
import { ArrowLeft, Loader, Lock } from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';
import { SERVICE_GROUPS, isBillService, type ServiceItem } from '../components/serviceData';
import { ServiceHub } from '../components/ServiceHub';
import { ProviderSelector } from '../components/ProviderSelector';
import { ServiceAmountInput } from '../components/ServiceAmountInput';
import { PaymentSummaryCard } from '../components/PaymentSummaryCard';
import { ServicePaymentSuccess, type ServiceSuccessInfo } from '../components/ServicePaymentSuccess';
import { useAuth } from '../../../shared/context/AuthContext';
import { useSupportedCountries } from '../../../shared/hooks/useSupportedCountries';
import * as billsApi from '../../../shared/api/bills';
import type { Biller } from '../../../shared/api/bills';
import { cacheProviderLogos, getCachedLogo } from '../../../shared/utils/logoCache';
import { queryKeys } from '../../../shared/query/queryClient';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { WalletFeatureBanner } from '../../../shared/components/WalletFeatureBanner';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { useLanguage } from '../../../shared/context/LanguageContext';
import { PageTop } from '../../../shared/components/PageTop';
import { PinBoxes } from '../../../shared/components/PinBoxes';

interface ServicesScreenProps {
  navigate: (s: Screen) => void;
  goBack: () => void;
  switchTab: (s: Screen) => void;
}

function toCategory(serviceId: string): string {
  if (serviceId === 'bills') return 'cable';
  return serviceId;
}

export function ServicesScreen({ navigate, switchTab }: ServicesScreenProps) {
  const { t } = useLanguage();
  const { userId } = useAuth();
  const { currency } = useCurrency();
  const [activeService, setActiveService] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [providerImage, setProviderImage] = useState<string | null>(null);
  const [selectedBillerCode, setSelectedBillerCode] = useState<string | null>(null);
  const [productCode, setProductCode] = useState<string | null>(null);
  const [meterType, setMeterType] = useState<'prepaid' | 'postpaid'>('prepaid');
  const [contactPhone, setContactPhone] = useState('');
  const [minLocalAmount, setMinLocalAmount] = useState<number | null>(null);
  const [liveVariations, setLiveVariations] = useState<Array<{ code: string; name: string; amount?: string }>>([]);
  const [loadingVariations, setLoadingVariations] = useState(false);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [meterNumber, setMeterNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'hub' | 'detail' | 'confirm' | 'success'>('hub');
  const [successInfo, setSuccessInfo] = useState<ServiceSuccessInfo | null>(null);
  const [billers, setBillers] = useState<Biller[]>([]);
  const [billerCurrency, setBillerCurrency] = useState('NGN');
  const [loadingBillers, setLoadingBillers] = useState(false);
  const [paying, setPaying] = useState(false);
  const [pin, setPin] = useState<string[]>(Array(6).fill(''));
  const [pinError, setPinError] = useState('');
  const [apiError, setApiError] = useState<{ code?: string; message?: string } | null>(null);
  const { countries: marketCountries } = useSupportedCountries();
  const [country, setCountry] = useState('');

  useEffect(() => {
    if (marketCountries.length && !country) setCountry(marketCountries[0].code);
  }, [marketCountries, country]);

  const activeItem = SERVICE_GROUPS.flatMap((g) => g.items).find((i) => i.id === activeService);
  const localCurrency = (billerCurrency || currency.code || 'NGN').toUpperCase();
  const localAmountNum = (selectedAmount ?? parseFloat(customAmount)) || 0;
  const localAmountStr = String(localAmountNum);

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
      setPin(Array(6).fill(''));
      setPinError('');
      setStep('detail');
    } else {
      navigate(item.id as Screen);
    }
  };

  const category = activeService ? toCategory(activeService) : '';
  const billersQuery = useQuery({
    queryKey: queryKeys.billers(country || 'NG', category || 'airtime'),
    queryFn: async () => {
      const res = await billsApi.listBillers(country || 'NG', category);
      const list = res.billers || [];
      cacheProviderLogos(
        list.map((b) => ({
          code: String(b.code || b.billerCode || ''),
          image: (b as { image?: string }).image || getCachedLogo(String(b.code || '')),
        })),
      );
      return res;
    },
    enabled: step === 'detail' && !!activeService && !!category,
    staleTime: 10 * 60_000,
  });
  useEffect(() => {
    if (billersQuery.data) {
      setBillers(billersQuery.data.billers || []);
      if (billersQuery.data.currency) setBillerCurrency(billersQuery.data.currency);
    }
    if (billersQuery.isError && billersQuery.error instanceof ApiError) {
      setApiError({ code: billersQuery.error.code, message: billersQuery.error.message });
    }
    setLoadingBillers(billersQuery.isLoading && !billersQuery.data);
  }, [billersQuery.data, billersQuery.isLoading, billersQuery.isError, billersQuery.error]);


  const variationsQuery = useQuery({
    queryKey: queryKeys.variations(selectedBillerCode || '', country || 'NG'),
    queryFn: () => billsApi.listVariations(selectedBillerCode!, country || 'NG'),
    enabled:
      step === 'detail' &&
      !!selectedBillerCode &&
      (activeService === 'data' || activeService === 'bills'),
    staleTime: 10 * 60_000,
  });
  useEffect(() => {
    if (variationsQuery.data) setLiveVariations(variationsQuery.data.variations || []);
    else if (!selectedBillerCode) setLiveVariations([]);
    setLoadingVariations(variationsQuery.isLoading && !variationsQuery.data);
  }, [variationsQuery.data, variationsQuery.isLoading, selectedBillerCode]);

  const customerRef = useMemo(() => {
    if (activeService === 'electricity' || activeService === 'bills') return meterNumber.trim();
    return phoneNumber.trim();
  }, [activeService, meterNumber, phoneNumber]);

  useEffect(() => {
    if (step !== 'detail' || !selectedBillerCode || !customerRef) return;
    if (activeService !== 'electricity' && activeService !== 'bills') return;
    let cancelled = false;
    const tmr = setTimeout(() => {
      billsApi
        .validateCustomer({
          country: country || 'NG',
          category: toCategory(activeService || ''),
          billerCode: selectedBillerCode,
          customerRef,
        })
        .then((res) => {
          if (cancelled) return;
          const m = res.minAmount != null ? Number(res.minAmount) : NaN;
          if (Number.isFinite(m) && m > 0) setMinLocalAmount(m);
        })
        .catch(() => undefined);
    }, 600);
    return () => {
      cancelled = true;
      clearTimeout(tmr);
    };
  }, [step, activeService, selectedBillerCode, customerRef, country]);

  const canPay = () => {
    if (!(localAmountNum > 0 && selectedProvider && selectedBillerCode && customerRef && !paying)) return false;
    if ((activeService === 'data' || activeService === 'bills') && !productCode) return false;
    if (activeService === 'electricity' && contactPhone.replace(/\D/g, '').length < 10) return false;
    if (minLocalAmount != null && localAmountNum < minLocalAmount) return false;
    return true;
  };

  const goConfirm = () => {
    if (!canPay()) return;
    if (!userId) {
      setApiError({ message: 'Sign in required' });
      return;
    }
    setApiError(null);
    setPin(Array(6).fill(''));
    setPinError('');
    setStep('confirm');
  };

  const submitPay = async () => {
    const pinStr = pin.join('');
    if (pinStr.length < 6) {
      setPinError('Enter your 6-digit PIN');
      return;
    }
    if (!userId || !selectedBillerCode || !activeService) return;

    setPaying(true);
    setPinError('');
    setApiError(null);
    try {
      // Backend recomputes crypto debit from localAmount via token→USDT→FX
      const res = await billsApi.payBill({
        userId,
        pin: pinStr,
        country: country || 'NG',
        category: toCategory(activeService),
        billerCode: selectedBillerCode,
        customerRef,
        amount: '0',
        asset: 'USDT',
        localAmount: localAmountStr,
        localCurrency,
        productCode:
          activeService === 'electricity'
            ? meterType
            : productCode || undefined,
        contactPhone:
          activeService === 'electricity' || activeService === 'bills'
            ? contactPhone || phoneNumber || undefined
            : undefined,
      });

      const st = String(res.status || '').toLowerCase();
      const status: ServiceSuccessInfo['status'] =
        st === 'completed' || st === 'success' ? 'completed' : st === 'processing' || st === 'pending' ? 'processing' : 'failed';

      setSuccessInfo({
        label: activeItem?.label ?? activeService,
        provider: selectedProvider || res.billerCode || '',
        localAmount: res.localAmount || localAmountStr,
        localCurrency: res.localCurrency || localCurrency,
        cryptoAmount: res.amount,
        cryptoAsset: res.asset || 'USDT',
        status,
        externalRef: res.externalRef || undefined,
        failureReason: res.failureReason || undefined,
        customerRef,
      });
      setStep('success');
    } catch (err) {
      if (err instanceof ApiError) {
        if (err.code?.includes('pin') || /pin/i.test(err.message)) {
          setPinError(err.message || 'Incorrect PIN');
        } else {
          setApiError({ code: err.code, message: err.message });
          setStep('detail');
        }
      } else {
        setApiError({ message: 'Payment failed. Try again.' });
        setStep('detail');
      }
    } finally {
      setPaying(false);
    }
  };

  const reset = () => {
    setStep('hub');
    setActiveService(null);
    setSelectedProvider(null);
    setProviderImage(null);
    setSelectedBillerCode(null);
    setProductCode(null);
    setMinLocalAmount(null);
    setMeterType('prepaid');
    setContactPhone('');
    setLiveVariations([]);
    setSuccessInfo(null);
    setApiError(null);
    setPin(Array(6).fill(''));
    setPinError('');
    setSelectedAmount(null);
    setCustomAmount('');
    setMeterNumber('');
    setPhoneNumber('');
  };

  return (
    <div className="flex flex-col h-full min-h-0 overflow-hidden" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="px-4 pt-2 pb-3 flex items-center gap-3 shrink-0">
        {step !== 'hub' && (
          <button
            type="button"
            onClick={() => {
              if (step === 'success') reset();
              else if (step === 'confirm') setStep('detail');
              else reset();
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            aria-label="Back"
          >
            <ArrowLeft size={18} style={{ color: 'var(--foreground)' }} />
          </button>
        )}
        <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20 }}>
          {step === 'hub' ? t('services.title') || 'Services' : step === 'success' ? 'Done' : step === 'confirm' ? 'Confirm' : activeItem?.label || 'Service'}
        </h1>
      </div>

      {apiError && (
        <div className="px-4 mb-2">
          <FeatureAlert
            reason={mapApiCodeToReason(apiError.code)}
            message={apiError.message}
            onDismiss={() => setApiError(null)}
          />
        </div>
      )}

      <div className="px-4 flex-1 min-h-0 overflow-y-auto overscroll-contain pb-6">
        {step === 'hub' && (
          <>
            <WalletFeatureBanner feature="bills" />
            <ServiceHub onSelectService={handleServiceClick} />
          </>
        )}

        {step === 'detail' && activeItem && (
          <div className="flex flex-col gap-4">
            {loadingBillers ? (
              <div className="flex justify-center py-10">
                <Loader className="animate-spin" size={22} style={{ color: 'var(--muted-foreground)' }} />
              </div>
            ) : (
              <>
                {!selectedProvider && (
                  <ProviderSelector
                    serviceId={activeService || ''}
                    billers={billers}
                    onSelect={(name, code, meta) => {
                      setSelectedBillerCode(code);
                      setSelectedProvider(name);
                      setProviderImage(meta?.image || getCachedLogo(code) || null);
                      const m = meta?.minAmount != null ? Number(meta.minAmount) : NaN;
                      setMinLocalAmount(Number.isFinite(m) && m > 0 ? m : null);
                    }}
                  />
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
                      amountCurrency={localCurrency}
                      provider={selectedProvider}
                      providerImage={providerImage}
                      minLocalAmount={minLocalAmount}
                      liveVariations={liveVariations}
                      productCode={productCode}
                      onProductCode={setProductCode}
                      meterType={meterType}
                      onMeterType={setMeterType}
                      contactPhone={contactPhone}
                      setContactPhone={setContactPhone}
                      loadingVariations={loadingVariations}
                      onChangeProvider={() => {
                        setSelectedProvider(null);
                        setSelectedBillerCode(null);
                        setSelectedAmount(null);
                        setCustomAmount('');
                        setProductCode(null);
                        setLiveVariations([]);
                      }}
                    />
                    {minLocalAmount != null && localAmountNum > 0 && localAmountNum < minLocalAmount && (
                      <p className="text-center" style={{ color: 'var(--destructive)', fontSize: 12 }}>
                        Minimum amount is {localCurrency} {minLocalAmount.toLocaleString()}
                      </p>
                    )}
                    <PaymentSummaryCard
                      provider={selectedProvider}
                      serviceLabel={activeItem.label}
                      localAmount={localAmountStr}
                      localCurrency={localCurrency}
                      canPay={canPay()}
                      onPay={goConfirm}
                      paying={paying}
                    />
                  </motion.div>
                )}
              </>
            )}
          </div>
        )}

        {step === 'confirm' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center pt-6 pb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <Lock size={22} style={{ color: 'var(--foreground)' }} />
            </div>
            <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, marginBottom: 6 }}>Confirm payment</h2>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 14, textAlign: 'center', marginBottom: 8 }}>
              {activeItem?.label} · {selectedProvider}
            </p>
            <p style={{ color: 'var(--primary)', fontWeight: 800, fontSize: 28, marginBottom: 6 }}>
              {(() => {
                try {
                  return new Intl.NumberFormat(undefined, {
                    style: 'currency',
                    currency: localCurrency,
                    maximumFractionDigits: 2,
                  }).format(localAmountNum);
                } catch {
                  return `${localCurrency} ${localAmountStr}`;
                }
              })()}
            </p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 24 }}>
              To {customerRef} · debited from USDT balance
            </p>
            <PinBoxes value={pin} onChange={setPin} error={pinError} length={6} />
            <motion.button
              type="button"
              whileTap={{ scale: paying ? 1 : 0.98 }}
              disabled={paying || pin.join('').length < 6}
              onClick={() => void submitPay()}
              className="w-full max-w-sm mt-8 py-4 rounded-full"
              style={{
                background: paying || pin.join('').length < 6 ? 'var(--muted)' : 'var(--primary)',
                color: paying || pin.join('').length < 6 ? 'var(--muted-foreground)' : 'var(--primary-foreground, #fff)',
                fontWeight: 700,
                fontSize: 16,
              }}
            >
              {paying ? 'Paying…' : 'Confirm & pay'}
            </motion.button>
          </motion.div>
        )}

        {step === 'success' && successInfo && (
          <ServicePaymentSuccess
            info={successInfo}
            onNewPayment={reset}
            onBackToHome={() => switchTab('home')}
          />
        )}
      </div>

    </div>
  );
}
