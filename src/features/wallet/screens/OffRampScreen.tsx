import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { cryptoAssets, type Screen } from '../../../shared/data/mockData';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { usePaymentMethods } from '../../../shared/context/PaymentMethodsContext';
import { OffRampFormStep } from '../components/offramp/OffRampFormStep';
import { OffRampReviewStep, OffRampProcessingStep, OffRampDoneStep } from '../components/offramp/OffRampStatusSteps';
import { WalletFeatureBanner } from '../../../shared/components/WalletFeatureBanner';
import { useAuth } from '../../../shared/context/AuthContext';
import * as fiatApi from '../../../shared/api/fiat';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';

interface OffRampScreenProps {
  goBack: () => void;
  navigate: (s: Screen) => void;
}

export function OffRampScreen({ goBack, navigate }: OffRampScreenProps) {
  const { currency, format } = useCurrency();
  const { bankAccounts } = usePaymentMethods();
  const { userId } = useAuth();
  const [apiError, setApiError] = useState<{ code?: string; message?: string } | null>(null);
  const [eligibility, setEligibility] = useState<{ canOfframp?: boolean; kycStatus?: string; action?: string } | null>(null);
  useEffect(() => {
    if (!userId) return;
    fiatApi.offrampEligibility(userId).then(setEligibility).catch(() => setEligibility(null));
  }, [userId]);
  const [selectedAsset, setSelectedAsset] = useState(cryptoAssets.find((a) => a.id === 'usdt')!);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(bankAccounts[0]?.id ?? null);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'form' | 'review' | 'processing' | 'done'>('form');
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const stablecoins = cryptoAssets.filter((a) => ['usdt', 'usdc', 'eth', 'btc', 'sol', 'bnb'].includes(a.id));
  const fee = Number(amount) * selectedAsset.price * 0.015;
  const youGet = (Number(amount) * selectedAsset.price - fee) * currency.rate;

  const compatibleAccounts = bankAccounts.filter((a) => a.currency === currency.code);
  const selectedAccount = bankAccounts.find((a) => a.id === selectedAccountId);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <div className="px-5 pt-2">
        <WalletFeatureBanner feature="offramp" onGoKyc={() => navigate('kyc')} />
        {apiError && (
          <FeatureAlert reason={mapApiCodeToReason(apiError.code)} message={apiError.message} detail={apiError.code} />
        )}
        {eligibility && eligibility.action === 'complete_kyc' && (
          <FeatureAlert reason="kyc_required" message="Off-ramp requires approved KYC and a bank account in your legal name." onAction={() => navigate('kyc')} actionLabel="Start KYC" />
        )}
        {eligibility && eligibility.action === 'add_payment_details' && (
          <FeatureAlert reason="generic" message="Add a bank account before selling crypto to fiat." onAction={() => navigate('payment-methods')} actionLabel="Add bank" />
        )}
      </div>

      <div className="flex items-center gap-3 px-5 mb-5">
        <motion.button whileTap={{ scale: 0.9 }} onClick={step === 'form' ? goBack : () => setStep('form')} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Off-Ramp to Cash</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <OffRampFormStep
              currency={currency} format={format}
              stablecoins={stablecoins} selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset}
              showTokenDropdown={showTokenDropdown} setShowTokenDropdown={setShowTokenDropdown}
              amount={amount} setAmount={setAmount}
              compatibleAccounts={compatibleAccounts} selectedAccountId={selectedAccountId} setSelectedAccountId={setSelectedAccountId}
              selectedAccount={selectedAccount}
              showAccountDropdown={showAccountDropdown} setShowAccountDropdown={setShowAccountDropdown}
              onAddAccount={() => navigate('payment-methods')}
              fee={fee} youGet={youGet}
              onPreview={() => { if (Number(amount) > 0 && selectedAccountId) setStep('review'); }}
            />
          )}

          {step === 'review' && (
            <OffRampReviewStep
              currency={currency} format={format} amount={amount} selectedAsset={selectedAsset}
              youGet={youGet} selectedAccount={selectedAccount} fee={fee}
              onConfirm={async () => {
                if (!userId) return;
                setStep('processing');
                try {
                  await fiatApi.offrampInitiate({
                    userId,
                    fromAsset: selectedAsset.symbol,
                    cryptoAmount: String(amount),
                    bankAccountId: selectedAccountId,
                  });
                  setStep('done');
                } catch (err) {
                  if (err instanceof ApiError) {
                    setApiError({ code: err.code, message: err.body.message || err.message });
                  }
                  setStep('review');
                }
              }}
            />
          )}

          {step === 'processing' && (
            <OffRampProcessingStep amount={amount} symbol={selectedAsset.symbol} currency={currency} youGet={youGet} />
          )}

          {step === 'done' && (
            <OffRampDoneStep currency={currency} youGet={youGet} bankName={selectedAccount?.bankName} onDone={goBack} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
