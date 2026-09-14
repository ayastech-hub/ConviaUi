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
import { createCardPayment, refreshPayment, getLocalOnrampOrder, listDepositRequests } from '../../../shared/api/fiat';
import type { LocalOnrampOrder, LocalOnrampQuote } from '../../../shared/api/fiat';
import { ApiError } from '../../../shared/api/types';
import { queryClient, queryKeys } from '../../../shared/query/queryClient';
import { useLanguage } from '../../../shared/context/LanguageContext';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { localFiatForCountry } from '../../../shared/lib/countryFiat';
import { useMyProfile } from '../../../shared/hooks/useMyProfile';
import { getRate } from '../../../shared/rates/fx';
import { fetchTransactions } from '../../../shared/api/transactions';

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
  const [paidToast, setPaidToast] = useState<string | null>(null);

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
      // Normalize provider payload → payment.* the UI expects
      const payRaw = (res as { payment?: Record<string, unknown>; bank?: Record<string, unknown> }).payment
        || (res as { bank?: Record<string, unknown> }).bank
        || {};
      const normalized: LocalOnrampOrder = {
        ...res,
        payment: {
          provider: String(payRaw.provider ?? res.provider ?? ''),
          externalId: String(payRaw.externalId ?? payRaw.transactionReference ?? ''),
          reference: String(payRaw.reference ?? res.reference ?? ''),
          amount: String(payRaw.amount ?? res.quote?.fiatAmount ?? fiatAmount),
          currency: String(payRaw.currency ?? res.quote?.fiatCurrency ?? fiatCurrency),
          bankName: String(payRaw.bankName ?? payRaw.bank_name ?? payRaw.destinationBankName ?? '') || undefined,
          accountNumber: String(payRaw.accountNumber ?? payRaw.account_number ?? payRaw.accountNumber ?? '') || undefined,
          accountName: String(payRaw.accountName ?? payRaw.account_name ?? payRaw.accountName ?? '') || undefined,
          checkoutUrl: payRaw.checkoutUrl ? String(payRaw.checkoutUrl) : undefined,
          accessCode: payRaw.accessCode ? String(payRaw.accessCode) : undefined,
          status: String(payRaw.status ?? res.status ?? 'pending'),
          expiresAt: (payRaw.expiresAt || payRaw.expiryDate || payRaw.expiredTime) as string | undefined,
        },
        expiresAt: (res as { expiresAt?: string }).expiresAt
          || (payRaw.expiresAt as string | undefined)
          || (payRaw.expiryDate as string | undefined),
      };
      setOrder(normalized);
      setStep('processing');
      if (!normalized.payment?.accountNumber) {
        setApiError({
          message: res.note || 'Could not get a bank account for this payment. Try again or use card.',
        });
      }
      // Stay on processing with VA until user taps I've paid / webhook credits
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
    setPaidToast(null);
    setApiError(null);

    const isCreditedStatus = (s: string) =>
      ['completed', 'credited', 'success', 'confirmed', 'paid', 'settled'].includes(
        String(s || '').toLowerCase(),
      );

    try {
      // 1) Authoritative: depositRequest list (works on production today)
      try {
        const rows = await listDepositRequests(userId);
        const list = Array.isArray(rows) ? rows : [];
        const match =
          list.find((r) => order?.orderId && r.id === order.orderId) ||
          list.find(
            (r) =>
              order?.reference &&
              String(r.externalPaymentRef || '') === String(order.reference),
          ) ||
          list.find((r) => {
            if (!order?.quote?.fiatAmount && !order?.payment?.amount) return false;
            const want = Number(order?.payment?.amount || order?.quote?.fiatAmount || 0);
            const got = Number(r.fiatAmount) || 0;
            const sameAsset =
              !r.asset || r.asset.toUpperCase() === selectedAsset.symbol.toUpperCase();
            // same order window: created after this screen session roughly — prefer exact id/ref first
            return sameAsset && want > 0 && Math.abs(got - want) < 0.01;
          });

        if (match && isCreditedStatus(match.status)) {
          void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(userId) });
          void queryClient.invalidateQueries({ queryKey: queryKeys.transactions(userId, 50) });
          setStep('done');
          return;
        }

        // Exact order still pending
        if (match && !isCreditedStatus(match.status)) {
          setPaidToast(
            'Transfer not confirmed by the bank yet. If you already paid, wait 1–2 minutes and try again.',
          );
          return;
        }
      } catch {
        /* fall through */
      }

      // 2) Optional status route (when Railway has deployed it)
      if (order?.orderId) {
        try {
          const st = await getLocalOnrampOrder(order.orderId);
          if (st.credited || isCreditedStatus(st.status)) {
            void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(userId) });
            void queryClient.invalidateQueries({ queryKey: queryKeys.transactions(userId, 50) });
            setStep('done');
            return;
          }
        } catch {
          /* ignore — route may 404 until backend deploy */
        }
      }

      // 3) Ledger history fallback
      try {
        const hist = await fetchTransactions(userId, { limit: 30 });
        const items = hist.transactions || [];
        const expected = Number(order?.quote?.netCrypto || youGet) || 0;
        const hit = items.find((it) => {
          const type = String((it as { type?: string; kind?: string }).type || (it as { kind?: string }).kind || '').toLowerCase();
          const okType =
            type.includes('onramp') ||
            type.includes('deposit') ||
            type.includes('fiat') ||
            type.includes('credit');
          const amt = Math.abs(Number((it as { amount?: string }).amount) || 0);
          const assetOk =
            !(it as { asset?: string }).asset ||
            String((it as { asset?: string }).asset).toUpperCase() === selectedAsset.symbol.toUpperCase();
          const status = String((it as { status?: string }).status || 'confirmed').toLowerCase();
          return (
            okType &&
            assetOk &&
            status !== 'failed' &&
            status !== 'pending' &&
            (expected <= 0 || Math.abs(amt - expected) < expected * 0.08 + 0.001)
          );
        });
        if (hit) {
          void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(userId) });
          void queryClient.invalidateQueries({ queryKey: queryKeys.transactions(userId, 50) });
          setStep('done');
          return;
        }
      } catch {
        /* ignore */
      }

      setPaidToast(
        'Payment not confirmed yet. Transfer the exact amount, wait for the bank, then try again.',
      );
    } catch {
      setPaidToast('Could not verify payment right now. Try again in a moment.');
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
              submitting={submitting}
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
              amount={String(order?.payment?.amount || order?.quote?.fiatAmount || fiatAmount || amount)}
              youGet={youGet}
              symbol={selectedAsset.symbol}
              bankName={order?.payment?.bankName}
              accountNumber={order?.payment?.accountNumber}
              accountName={order?.payment?.accountName}
              reference={order?.payment?.reference || order?.reference}
              expiresAt={(order?.payment as { expiresAt?: string } | undefined)?.expiresAt
                || (order as { expiresAt?: string } | null)?.expiresAt
                || null}
              checking={checkingPaid}
              toast={paidToast}
              onDismissToast={() => setPaidToast(null)}
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
