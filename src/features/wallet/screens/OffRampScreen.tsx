import { fetchFiatLimits, limitFor } from '../../../shared/api/fiatLimits';
import { useState, useEffect } from 'react';
import { AnimatePresence } from 'motion/react';
import { type Screen, type Asset } from '../../../shared/data/mockData';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import * as banksApi from '../../../shared/api/banks';
import type { BankAccount } from '../../../shared/api/banks';
import { OffRampFormStep } from '../components/offramp/OffRampFormStep';
import {
  OffRampReviewStep,
  OffRampProcessingStep,
  OffRampDoneStep,
} from '../components/offramp/OffRampStatusSteps';
import { useAuth } from '../../../shared/context/AuthContext';
import { useAccountGates } from '../../../shared/hooks/useAccountGates';
import { GateHint } from '../../../shared/components/AccountStatusBanners';
import { queryClient, queryKeys } from '../../../shared/query/queryClient';
import { useKycStatus } from '../../../shared/hooks/useKycStatus';
import * as fiatApi from '../../../shared/api/fiat';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { PageTop } from '../../../shared/components/PageTop';
import { BackButton } from '../../../shared/components/BackButton';
import { ensureTransactionPin } from '../../../shared/security/ensureTransactionPin';
import { SetTransactionPinSheet } from '../../../shared/components/SetTransactionPinSheet';
import { EnterPinFullScreen } from '../../../shared/components/PinFullScreen';
import { ApiError } from '../../../shared/api/types';
import { useMyProfile } from '../../../shared/hooks/useMyProfile';
import { localFiatForCountry } from '../../../shared/lib/countryFiat';
import { getRate } from '../../../shared/rates/fx';

interface OffRampScreenProps {
  goBack: () => void;
  navigate?: (s: Screen) => void;
  presetSymbol?: string;
}

type Step = 'form' | 'review' | 'pin' | 'processing' | 'done';

function friendlyOfframpError(code: string, raw: string): string {
  const c = (code || '').toLowerCase();
  const m = (raw || '').toLowerCase();
  if (c.includes('pin') || m.includes('pin')) return 'Incorrect PIN. Please try again.';
  if (c.includes('insufficient') || m.includes('insufficient')) {
    return 'Insufficient balance for this sell.';
  }
  if (c.includes('kyc')) return 'Complete identity verification to sell.';
  if (c.includes('bank') || m.includes('account')) return 'Check your payout bank account and try again.';
  if (raw && raw.length < 100 && !raw.includes('{')) return raw;
  return 'Could not complete sell. Please try again.';
}

export function OffRampScreen({ goBack, navigate, presetSymbol }: OffRampScreenProps) {
  const { assets: cryptoAssets } = useWalletAssets();
  const { currency, format } = useCurrency();
  const { userId } = useAuth();
  const gates = useAccountGates();
  const { isApproved } = useKycStatus();
  const { profile } = useMyProfile();

  const [showSetPin, setShowSetPin] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [apiError, setApiError] = useState<{ code?: string; message?: string } | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [eligibility, setEligibility] = useState<{
    canOfframp?: boolean;
    kycStatus?: string;
    action?: string;
  } | null>(null);

  const [selectedAsset, setSelectedAsset] = useState<Asset>(
    () =>
      cryptoAssets.find((a) => a.symbol === 'USDT') ||
      cryptoAssets[0] ||
      ({
        id: 'loading',
        symbol: '…',
        name: 'Loading',
        price: 0,
        change24h: 0,
        balance: 0,
        valueUSD: 0,
        color: 'var(--muted-foreground)',
        bgColor: 'var(--muted)',
        chains: [],
        sparkline: [],
      } as Asset),
  );
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  const [amount, setAmount] = useState('');
  const [limits, setLimits] = useState<Awaited<ReturnType<typeof fetchFiatLimits>> | null>(null);
  useEffect(() => {
    void fetchFiatLimits().then(setLimits).catch(() => undefined);
  }, []);
  const [step, setStep] = useState<Step>('form');
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  useEffect(() => {
    if (!userId) {
      setBankAccounts([]);
      return;
    }
    banksApi
      .listBankAccounts(userId)
      .then((list) => setBankAccounts(Array.isArray(list) ? list : []))
      .catch(() => setBankAccounts([]));
    fiatApi.offrampEligibility(userId).then(setEligibility).catch(() => setEligibility(null));
  }, [userId]);

  useEffect(() => {
    if (bankAccounts.length && !selectedAccountId) setSelectedAccountId(bankAccounts[0].id);
  }, [bankAccounts, selectedAccountId]);

  useEffect(() => {
    if (!presetSymbol || !cryptoAssets.length) return;
    const hit = cryptoAssets.find((a) => a.symbol.toUpperCase() === presetSymbol.toUpperCase());
    if (hit) setSelectedAsset(hit);
  }, [presetSymbol, cryptoAssets]);

  useEffect(() => {
    if (!cryptoAssets.length) return;
    const still = cryptoAssets.find((a) => a.symbol === selectedAsset.symbol);
    if (still) setSelectedAsset(still);
    else setSelectedAsset(cryptoAssets.find((a) => a.symbol === 'USDT') || cryptoAssets[0]);
  }, [cryptoAssets]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sell always settles in the user's *country* fiat — never the display/picker currency (e.g. USD).
  const countryCode = (profile?.country || gates.country || 'NG').toString().toUpperCase().slice(0, 2);
  const payCode = localFiatForCountry(countryCode, 'NGN');
  const payRate = getRate(payCode) || 1;
  const FIAT_META: Record<string, { symbol: string; name: string; flag: string }> = {
    NGN: { symbol: '₦', name: 'Nigerian Naira', flag: '🇳🇬' },
    GHS: { symbol: 'GH₵', name: 'Ghanaian Cedi', flag: '🇬🇭' },
    KES: { symbol: 'KSh', name: 'Kenyan Shilling', flag: '🇰🇪' },
    ZAR: { symbol: 'R', name: 'South African Rand', flag: '🇿🇦' },
    UGX: { symbol: 'USh', name: 'Ugandan Shilling', flag: '🇺🇬' },
  };
  const meta = FIAT_META[payCode] || { symbol: payCode, name: payCode, flag: '🏳️' };
  const FLAG_BY_COUNTRY: Record<string, string> = {
    NG: '🇳🇬', GH: '🇬🇭', KE: '🇰🇪', ZA: '🇿🇦', UG: '🇺🇬', TZ: '🇹🇿', EG: '🇪🇬',
  };
  const countryFlag = FLAG_BY_COUNTRY[countryCode] || meta.flag;
  const payoutCurrency = {
    code: payCode,
    name: meta.name,
    symbol: meta.symbol,
    rate: payRate,
    flag: countryFlag,
  };

  const fee = Number(amount) * selectedAsset.price * 0.015;
  const youGet = Math.max(0, (Number(amount) * selectedAsset.price - fee) * payRate);
  const offrampMin = limitFor(limits, payCode).offrampMin;
  const belowOfframpMin = offrampMin > 0 && youGet > 0 && youGet < offrampMin;
  const selectedAccount = bankAccounts.find((a) => a.id === selectedAccountId);
  const rateLabel =
    selectedAsset.price > 0 && payRate > 0
      ? `1 ${selectedAsset.symbol} ≈ ${meta.symbol}${(selectedAsset.price * payRate).toLocaleString(undefined, { maximumFractionDigits: 2 })}`
      : undefined;

  const goBackStep = () => {
    if (step === 'form') goBack();
    else if (step === 'review') setStep('form');
    else if (step === 'pin') setStep('review');
    else if (step === 'done') goBack();
  };

  const openPinStep = async () => {
    setApiError(null);
    setPinError(null);
    if (!userId) {
      setApiError({ message: 'Sign in to sell' });
      return;
    }
    if (!gates.canOfframp) return;
    if (belowOfframpMin) {
      setApiError({
        message: `Minimum sell payout is ${offrampMin.toLocaleString()} ${payCode}`,
      });
      return;
    }
    const pinGate = await ensureTransactionPin(userId);
    if (!pinGate.ok) {
      if (pinGate.hasPin === false) {
        setShowSetPin(true);
        return;
      }
      setApiError({ code: 'pin_not_set', message: pinGate.message });
      return;
    }
    setStep('pin');
  };

  const submitOfframp = async (pin: string) => {
    if (!userId || !selectedAccountId || submitting) return;
    setSubmitting(true);
    setPinError(null);
    setApiError(null);
    setStep('processing');
    try {
      await fiatApi.localOfframp({
        userId,
        asset: selectedAsset.symbol,
        amount: String(amount),
        fiatCurrency: payCode,
        bankAccountId: selectedAccountId,
        pin,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(userId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.transactions(userId, 50) });
      setStep('done');
    } catch (err: unknown) {
      let code = 'unknown_error';
      let raw = 'Transaction failed';
      if (err instanceof ApiError) {
        code = String(err.code || err.body?.code || 'error');
        raw = String(err.body?.message || err.message || raw);
      } else if (err && typeof err === 'object') {
        const e = err as { code?: string; message?: string; body?: { message?: string } };
        code = String(e.code || 'error');
        raw = String(e.body?.message || e.message || raw);
      }
      const msg = friendlyOfframpError(code, raw);
      if (/pin/i.test(code + raw)) {
        setPinError(msg);
        setStep('pin');
      } else {
        setApiError({ code, message: msg });
        setStep('review');
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (step === 'pin') {
    return (
      <>
        <EnterPinFullScreen
          open
          title="Confirm sell"
          subtitle={`Enter your 6-digit PIN to sell ${amount} ${selectedAsset.symbol}`}
          error={pinError}
          busy={submitting}
          onSubmit={(digits) => void submitOfframp(digits)}
          onCancel={() => {
            setStep('review');
            setPinError(null);
          }}
        />
        {userId && (
          <SetTransactionPinSheet
            open={showSetPin}
            userId={userId}
            onClose={() => setShowSetPin(false)}
            onComplete={() => {
              setShowSetPin(false);
              setStep('pin');
            }}
          />
        )}
      </>
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <PageTop />
      {step !== 'processing' && step !== 'done' && (
        <div className="px-5 pt-2">
          <GateHint mode="offramp" />
          {apiError && (
            <FeatureAlert
              reason={mapApiCodeToReason(apiError.code)}
              message={apiError.message}
              detail={apiError.code}
            />
          )}
          {eligibility?.action === 'complete_kyc' && !isApproved && (
            <FeatureAlert
              reason="kyc_required"
              message="Sell requires approved KYC and a bank account in your legal name."
              onAction={() => navigate?.('kyc')}
              actionLabel="Start KYC"
            />
          )}
          {eligibility?.action === 'add_payment_details' && (
            <FeatureAlert
              reason="generic"
              message="Add a bank account before selling crypto to fiat."
              onAction={() => navigate?.('payment-methods')}
              actionLabel="Add bank"
            />
          )}
        </div>
      )}

      {step !== 'processing' && step !== 'done' && (
        <div className="flex items-center gap-3 px-5 mb-4">
          <BackButton onClick={goBackStep} />
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>
            {step === 'review' ? 'Review' : 'Sell crypto'}
          </h2>
        </div>
      )}

      <div className={`flex-1 ${step === 'form' ? 'overflow-y-auto px-5' : 'flex flex-col min-h-0'}`}>
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <OffRampFormStep
              currency={payoutCurrency}
              format={format}
              stablecoins={cryptoAssets}
              selectedAsset={selectedAsset}
              setSelectedAsset={setSelectedAsset}
              showTokenDropdown={showTokenDropdown}
              setShowTokenDropdown={setShowTokenDropdown}
              amount={amount}
              setAmount={setAmount}
              compatibleAccounts={bankAccounts}
              selectedAccountId={selectedAccountId}
              setSelectedAccountId={setSelectedAccountId}
              selectedAccount={selectedAccount}
              showAccountDropdown={showAccountDropdown}
              setShowAccountDropdown={setShowAccountDropdown}
              onAddAccount={() => navigate?.('payment-methods')}
              fee={fee}
              youGet={youGet}
              onPreview={() => {
                if (!gates.canOfframp) return;
    if (belowOfframpMin) {
      setApiError({
        message: `Minimum sell payout is ${offrampMin.toLocaleString()} ${payCode}`,
      });
      return;
    }
                if (Number(amount) > 0 && selectedAccountId && !belowOfframpMin) {
                  setApiError(null);
                  setStep('review');
                }
              }}
            />
          )}

          {step === 'review' && (
            <OffRampReviewStep
              currency={payoutCurrency}
              amount={amount}
              selectedAsset={selectedAsset}
              youGet={youGet}
              selectedAccount={selectedAccount}
              rateLabel={rateLabel}
              countryFlag={countryFlag}
              onConfirm={() => void openPinStep()}
              onBack={() => setStep('form')}
            />
          )}

          {step === 'processing' && (
            <OffRampProcessingStep
              amount={amount}
              symbol={selectedAsset.symbol}
              currency={payoutCurrency}
              youGet={youGet}
            />
          )}

          {step === 'done' && (
            <OffRampDoneStep
              currency={payoutCurrency}
              youGet={youGet}
              bankName={selectedAccount?.bankName}
              amount={amount}
              symbol={selectedAsset.symbol}
              countryFlag={countryFlag}
              onDone={goBack}
            />
          )}
        </AnimatePresence>
      </div>

      {userId && (
        <SetTransactionPinSheet
          open={showSetPin}
          userId={userId}
          onClose={() => setShowSetPin(false)}
          onComplete={() => {
            setShowSetPin(false);
            if (step === 'review' || step === 'form') setStep('pin');
          }}
        />
      )}
    </div>
  );
}
