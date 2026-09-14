import { useEffect, useState } from 'react';
import { type Asset } from '../../../shared/data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { OnRampFormStep } from '../components/onramp/OnRampFormStep';
import { OnRampReviewStep } from '../components/onramp/OnRampReviewStep';
import { OnRampProcessingStep, OnRampDoneStep } from '../components/onramp/OnRampStatusSteps';
import { WalletFeatureBanner } from '../../../shared/components/WalletFeatureBanner';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { GateHint } from '../../../shared/components/AccountStatusBanners';
import { useAuth } from '../../../shared/context/AuthContext';
import { useAccountGates } from '../../../shared/hooks/useAccountGates';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import * as fiatApi from '../../../shared/api/fiat';
import { createCardPayment, refreshPayment } from '../../../shared/api/fiat';
import type { LocalOnrampOrder, LocalOnrampQuote } from '../../../shared/api/fiat';
import { ApiError } from '../../../shared/api/types';
import { queryClient, queryKeys } from '../../../shared/query/queryClient';
import { useLanguage } from '../../../shared/context/LanguageContext';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { localFiatForCountry } from '../../../shared/lib/countryFiat';
import { useMyProfile } from '../../../shared/hooks/useMyProfile';
import { getRate } from '../../../shared/rates/fx';

interface OnRampScreenProps {
  goBack: () => void;
  presetSymbol?: string;
}

/**
 * On-ramp: bank transfer (VA in-app) or card via PaymentIntent (provider-hosted — no PAN on Convia).
 */
export function OnRampScreen({ goBack, presetSymbol }: OnRampScreenProps) {
  const { t } = useLanguage();
  const { assets: cryptoAssets } = useWalletAssets();
  const { userId, email: authEmail } = useAuth();
  const gates = useAccountGates();
  const { profile } = useMyProfile();
  const { currency, format } = useCurrency();

  const [selectedAsset, setSelectedAsset] = useState<Asset>(
    cryptoAssets.find((a) => a.symbol === 'USDT') ||
      cryptoAssets[0] || {
        id: 'usdt',
        symbol: 'USDT',
        name: 'Tether',
        price: 1,
        change24h: 0,
        balance: 0,
        valueUSD: 0,
        color: '#26A17B',
        bgColor: 'rgba(38,161,123,0.15)',
        chains: [],
        sparkline: [],
      },
  );
  const [paymentMethod, setPaymentMethod] = useState<'bank' | 'card'>('bank');
  const [cardPaymentId, setCardPaymentId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [amountMode] = useState<'fiat' | 'usd'>('fiat'); // local fiat only for payment rails
  const [step, setStep] = useState<'form' | 'review' | 'processing' | 'done'>(
    'form',
  );
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [apiError, setApiError] = useState<{ code?: string; message?: string } | null>(null);
  const [quote, setQuote] = useState<LocalOnrampQuote | null>(null);
  const [order, setOrder] = useState<LocalOnrampOrder | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [checkingPaid, setCheckingPaid] = useState(false);

  useEffect(() => {
    if (!presetSymbol || !cryptoAssets.length) return;
    const hit = cryptoAssets.find((a) => a.symbol.toUpperCase() === presetSymbol.toUpperCase());
    if (hit && selectedAsset.symbol !== hit.symbol) setSelectedAsset(hit);
  }, [presetSymbol, cryptoAssets]);

  // Always charge in country local currency (NGN/GHS/…), never display USD as the pay rail
  const payCurrency = localFiatForCountry(profile?.country || gates.country, 'NGN');
  const fiatCurrency = payCurrency;
  const localPerUsd = getRate(payCurrency);
  const effectiveFiatAmount = (() => {
    const n = Number(amount);
    if (!(n > 0)) return '';
    if (amountMode === 'usd') {
      if (!(localPerUsd > 0)) return '';
      return String(Number((n * localPerUsd).toFixed(2)));
    }
    return amount.trim();
  })();
  const fiatAmount = effectiveFiatAmount;
  const FIAT_META: Record<string, { symbol: string; name: string }> = {
    NGN: { symbol: '₦', name: 'Nigerian Naira' },
    GHS: { symbol: 'GH₵', name: 'Ghanaian Cedi' },
    KES: { symbol: 'KSh', name: 'Kenyan Shilling' },
    ZAR: { symbol: 'R', name: 'South African Rand' },
    UGX: { symbol: 'USh', name: 'Ugandan Shilling' },
  };
  const payCurrencyDisplay = {
    code: payCurrency,
    name: FIAT_META[payCurrency]?.name || payCurrency,
    symbol: FIAT_META[payCurrency]?.symbol || payCurrency,
    rate: localPerUsd || 1,
    flag: (profile?.country || gates.country || 'NG').toString().slice(0, 2),
  };

  // Live quote when amount changes
  useEffect(() => {
    if (!fiatAmount || Number(fiatAmount) <= 0 || !gates.canOnramp) {
      setQuote(null);
      return;
    }
    let cancelled = false;
    setQuoting(true);
    const t = setTimeout(() => {
      void fiatApi
        .localOnrampQuote({
          fiatCurrency,
          fiatAmount,
          toAsset: selectedAsset.symbol,
        })
        .then((q) => {
          if (!cancelled) {
            setQuote(q);
            setApiError(null);
          }
        })
        .catch((err) => {
          if (cancelled) return;
          if (err instanceof ApiError) {
            setApiError({ code: err.code, message: err.body.message || err.message });
            setQuote(null);
          }
        })
        .finally(() => {
          if (!cancelled) setQuoting(false);
        });
    }, 400);
    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [fiatAmount, fiatCurrency, selectedAsset.symbol, gates.canOnramp, amountMode]);

  const youGet = quote ? Number(quote.netCrypto) : 0;
  const usdAmount =
    amountMode === 'usd'
      ? Number(amount) || 0
      : Number(currency.rate) > 0
        ? (Number(amount) || 0) / Number(currency.rate)
        : 0;
  const feeDisplay = quote ? Number(quote.feeAmount) : 0;


  const placeOrder = async () => {
    if (!userId || !gates.canOnramp) return;
    setSubmitting(true);
    setApiError(null);
    try {
      if (paymentMethod === 'card') {
        // PaymentIntent domain — no PAN; provider-hosted action
        const payment = await createCardPayment({
          amount: fiatAmount,
          currency: fiatCurrency,
          asset: selectedAsset.symbol,
          callbackUrl: typeof window !== 'undefined' ? `${window.location.origin}/payments/return` : undefined,
        });
        setCardPaymentId(payment.id);
        const action = payment.customerAction;
        if (action?.type === 'REDIRECT' && action.url) {
          window.open(action.url, '_blank', 'noopener,noreferrer');
        }
        setStep('processing');
        // Poll status until SUCCESS / FAILED (max ~2 min)
        const started = Date.now();
        while (Date.now() - started < 120_000) {
          await new Promise((r) => setTimeout(r, 3000));
          const latest = await refreshPayment(payment.id);
          if (latest.status === 'SUCCESS') {
            if (userId) {
              void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(userId) });
              void queryClient.invalidateQueries({ queryKey: queryKeys.transactions(userId, 50) });
            }
            setStep('done');
            return;
          }
          if (['FAILED', 'CANCELLED', 'EXPIRED'].includes(latest.status)) {
            setApiError({ code: latest.failureCode || 'payment_failed', message: latest.failureReason || 'Payment failed' });
            setStep('form');
            return;
          }
          if (latest.status === 'RECONCILIATION_REQUIRED') {
            setApiError({ message: 'Payment is being verified. Balance will update shortly.' });
            setStep('done');
            return;
          }
        }
        setApiError({ message: 'Payment still processing. Check history shortly.' });
        setStep('done');
        return;
      }

      const res = await fiatApi.localOnrampOrder({
        userId,
        email: authEmail || `${userId}@users.convia.app`,
        fiatCurrency,
        fiatAmount,
        toAsset: selectedAsset.symbol,
        method: 'bank_transfer',
      });
      setOrder(res);
      setStep('processing');
      // Stay on processing with VA details until user confirms payment / webhook credits
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError({ code: err.code, message: err.body.message || err.message });
      } else {
        setApiError({ message: 'Could not create on-ramp order' });
      }
    } finally {
      setSubmitting(false);
    }
  };



  const checkPaid = async () => {
    if (!userId || checkingPaid) return;
    setCheckingPaid(true);
    setApiError(null);
    try {
      // Prefer live history — webhook credits as fiat_onramp when Monnify confirms
      const hist = await fetchTransactions(userId, { limit: 20 });
      const items = hist.transactions || [];
      const expected = Number(order?.quote?.netCrypto || youGet) || 0;
      const hit = items.find((it) => {
        const type = String(it.type || '').toLowerCase();
        const okType = type.includes('onramp') || type.includes('deposit') || type.includes('fiat');
        const amt = Number(it.amount) || 0;
        const assetOk = !it.asset || it.asset.toUpperCase() === selectedAsset.symbol.toUpperCase();
        return okType && assetOk && (expected <= 0 || Math.abs(amt - expected) < expected * 0.05 + 0.001);
      });
      if (hit && String(hit.status || '').toLowerCase() !== 'failed') {
        void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(userId) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.transactions(userId, 50) });
        setStep('done');
        return;
      }
      setApiError({
        message: 'Payment not confirmed yet. Transfer the exact amount, wait a minute, then try again.',
      });
    } catch {
      setApiError({ message: 'Could not verify payment yet. Try again shortly.' });
    } finally {
      setCheckingPaid(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />
      <div className="px-5 pt-2">
        <GateHint mode="onramp" />
        {apiError && (
          <FeatureAlert
            reason={mapApiCodeToReason(apiError.code)}
            message={apiError.message}
            detail={apiError.code}
          />
        )}
      </div>

      <div className="flex items-center gap-3 px-5 mb-5">
        <BackButton
          onClick={step === 'form' ? goBack : step === 'review' ? () => setStep('form') : goBack}
        />
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Buy crypto</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <OnRampFormStep
              currency={payCurrencyDisplay}
              format={format}
              amount={amount}
              setAmount={setAmount}
              amountMode={amountMode}
              setAmountMode={() => {}}
              usdAmount={usdAmount}
              rampAssets={cryptoAssets}
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
              showTokenDropdown={showTokenDropdown}
              setShowTokenDropdown={setShowTokenDropdown}
              paymentMethod={paymentMethod === 'card' ? 'card' : 'bank'}
              setPaymentMethod={(m) => setPaymentMethod(m === 'card' ? 'card' : 'bank')}
              cards={[]}
              selectedCardId={null}
              setSelectedCardId={() => {}}
              showNewCard={false}
              setShowNewCard={() => {}}
              newCard={{ number: '', expiry: '', cvc: '', name: '' }}
              setNewCard={() => {}}
              onAddCard={() => {}}
              fee={feeDisplay}
              youGet={youGet}
              quote={quote}
              quoting={quoting}
              onPreview={() => {
                if (!gates.canOnramp || submitting) return;
                if (!quote || Number(fiatAmount) <= 0) return;
                void placeOrder();
              }}
            />
          )}

          {step === 'review' && (
            <OnRampReviewStep
              currency={payCurrencyDisplay}
              format={format}
              amount={amount}
              selectedAsset={selectedAsset}
              youGet={youGet}
              fee={feeDisplay}
              paymentMethod={paymentMethod === 'card' ? 'card' : 'bank'}
              newCard={{ number: '', expiry: '', cvc: '', name: '' }}
              setNewCard={() => {}}
              confirming={submitting}
              onConfirm={() => {
                if (!gates.canOnramp || submitting) return;
                void placeOrder();
              }}
            />
          )}

          {step === 'processing' && (
            <OnRampProcessingStep
              currency={payCurrencyDisplay}
              amount={fiatAmount || amount}
              youGet={youGet}
              symbol={selectedAsset.symbol}
              bankName={order?.payment?.bankName}
              accountNumber={order?.payment?.accountNumber}
              accountName={order?.payment?.accountName}
              checking={checkingPaid}
              onConfirmPaid={() => void checkPaid()}
            />
          )}

          {step === 'done' && (
            <OnRampDoneStep youGet={youGet} symbol={selectedAsset.symbol} onDone={goBack} />
          )}
        </AnimatePresence>
        {quoting && step === 'form' && (
          <p className="text-center text-xs mt-2" style={{ color: 'var(--muted-foreground)' }}>
            Fetching live quote…
          </p>
        )}
      </div>
    </div>
  );
}
