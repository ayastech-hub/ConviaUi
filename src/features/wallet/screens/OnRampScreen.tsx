import { useEffect, useState } from 'react';
import { type Asset } from '../../../shared/data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { OnRampFormStep } from '../components/onramp/OnRampFormStep';
import { OnRampReviewStep } from '../components/onramp/OnRampReviewStep';
import { OnRampInstructionsStep } from '../components/onramp/OnRampInstructionsStep';
import { OnRampProcessingStep, OnRampDoneStep } from '../components/onramp/OnRampStatusSteps';
import { WalletFeatureBanner } from '../../../shared/components/WalletFeatureBanner';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { GateHint } from '../../../shared/components/AccountStatusBanners';
import { useAuth } from '../../../shared/context/AuthContext';
import { useAccountGates } from '../../../shared/hooks/useAccountGates';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import * as fiatApi from '../../../shared/api/fiat';
import type { LocalOnrampOrder, LocalOnrampQuote } from '../../../shared/api/fiat';
import { ApiError } from '../../../shared/api/types';
import { queryClient, queryKeys } from '../../../shared/query/queryClient';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface OnRampScreenProps {
  goBack: () => void;
}

/**
 * Live local on-ramp: quote → order (Paystack/Flutterwave by country) → bank details or checkout URL.
 * No mock bank accounts.
 */
export function OnRampScreen({ goBack }: OnRampScreenProps) {
  const { t } = useLanguage();
  const { assets: cryptoAssets } = useWalletAssets();
  const { userId, email: authEmail } = useAuth();
  const gates = useAccountGates();
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
  const [amount, setAmount] = useState('');
  const [amountMode, setAmountMode] = useState<'fiat' | 'usd'>('fiat');
  const [step, setStep] = useState<'form' | 'review' | 'payment-instructions' | 'processing' | 'done'>(
    'form',
  );
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [copied, setCopied] = useState(false);
  const [apiError, setApiError] = useState<{ code?: string; message?: string } | null>(null);
  const [quote, setQuote] = useState<LocalOnrampQuote | null>(null);
  const [order, setOrder] = useState<LocalOnrampOrder | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fiatCurrency = (currency.code || 'NGN').toUpperCase();
  // Quote/order always in local fiat; USD mode converts via currency.rate (local per 1 USD)
  const effectiveFiatAmount = (() => {
    const n = Number(amount);
    if (!(n > 0)) return '';
    if (amountMode === 'usd') {
      const rate = Number(currency.rate) || 0;
      if (rate <= 0) return '';
      return String(Number((n * rate).toFixed(2)));
    }
    return amount.trim();
  })();
  const fiatAmount = effectiveFiatAmount;

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

  const copyAccount = (text: string) => {
    try {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* ignore */
    }
  };

  const placeOrder = async () => {
    if (!userId || !gates.canOnramp) return;
    setSubmitting(true);
    setApiError(null);
    try {
      const res = await fiatApi.localOnrampOrder({
        userId,
        email: authEmail || `${userId}@users.convia.app`,
        fiatCurrency,
        fiatAmount,
        toAsset: selectedAsset.symbol,
        method: paymentMethod === 'card' ? 'card' : 'bank_transfer',
      });
      setOrder(res);
      if (res.payment?.checkoutUrl && paymentMethod === 'card') {
        window.open(res.payment.checkoutUrl, '_blank', 'noopener,noreferrer');
      }
      setStep('payment-instructions');
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

  const instructionRows = () => {
    const p = order?.payment;
    if (!p) return [];
    const rows: { label: string; value: string }[] = [];
    if (p.bankName) rows.push({ label: 'Bank', value: p.bankName });
    if (p.accountName) rows.push({ label: 'Account name', value: p.accountName });
    if (p.accountNumber) rows.push({ label: 'Account number', value: p.accountNumber });
    if (p.reference) rows.push({ label: 'Reference', value: p.reference });
    if (p.amount) rows.push({ label: 'Amount', value: `${p.currency || fiatCurrency} ${p.amount}` });
    if (p.checkoutUrl) rows.push({ label: 'Checkout', value: p.checkoutUrl });
    if (!rows.length && p.externalId) rows.push({ label: 'Payment id', value: p.externalId });
    return rows;
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <div className="px-5 pt-2">
        <WalletFeatureBanner feature="onramp" />
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
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={step === 'form' ? goBack : () => setStep('form')}
          className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card"
          style={{ border: '1px solid var(--border)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>{t('onramp.title')}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <OnRampFormStep
              currency={currency}
              format={format}
              amount={amount}
              setAmount={setAmount}
              amountMode={amountMode}
              setAmountMode={setAmountMode}
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
              newCard={{ number: '', expiry: '', cvc: '' }}
              setNewCard={() => {}}
              onAddCard={() => {}}
              fee={feeDisplay}
              youGet={youGet}
              quote={quote}
              quoting={quoting}
              onPreview={() => {
                if (!gates.canOnramp) return;
                if (!quote || Number(amount) <= 0) return;
                setStep('review');
              }}
            />
          )}

          {step === 'review' && (
            <OnRampReviewStep
              currency={currency}
              format={format}
              amount={amount}
              selectedAsset={selectedAsset}
              youGet={youGet}
              fee={feeDisplay}
              paymentMethod={paymentMethod === 'card' ? 'card' : 'bank'}
              selectedCard={undefined}
              onConfirm={() => {
                if (!gates.canOnramp || submitting) return;
                void placeOrder();
              }}
            />
          )}

          {step === 'payment-instructions' && (
            <OnRampInstructionsStep
              currency={currency}
              amount={order?.payment?.amount || amount}
              rows={instructionRows()}
              copied={copied}
              onCopy={copyAccount}
              onPaid={() => {
                setStep('processing');
                // Webhook credits ledger; refresh portfolio shortly then show done
                setTimeout(() => {
                  if (userId) {
                    void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(userId) });
                    void queryClient.invalidateQueries({ queryKey: queryKeys.transactions(userId, 50) });
                  }
                  setStep('done');
                }, 1500);
              }}
            />
          )}

          {step === 'processing' && (
            <OnRampProcessingStep
              currency={currency}
              amount={amount}
              youGet={youGet}
              symbol={selectedAsset.symbol}
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
