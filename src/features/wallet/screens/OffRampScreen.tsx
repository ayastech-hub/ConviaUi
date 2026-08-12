import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { type Screen, type Asset } from '../../../shared/data/mockData';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import * as banksApi from '../../../shared/api/banks';
import type { BankAccount } from '../../../shared/api/banks';
import { OffRampFormStep } from '../components/offramp/OffRampFormStep';
import { OffRampReviewStep, OffRampProcessingStep, OffRampDoneStep } from '../components/offramp/OffRampStatusSteps';
import { WalletFeatureBanner } from '../../../shared/components/WalletFeatureBanner';
import { useAuth } from '../../../shared/context/AuthContext';
import { useAccountGates } from '../../../shared/hooks/useAccountGates';
import { GateHint } from '../../../shared/components/AccountStatusBanners';
import { queryClient, queryKeys } from '../../../shared/query/queryClient';
import { useKycStatus } from '../../../shared/hooks/useKycStatus';
import * as fiatApi from '../../../shared/api/fiat';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';

interface OffRampScreenProps {
  goBack: () => void;
  navigate: (s: Screen) => void;
}

export function OffRampScreen({ goBack, navigate }: OffRampScreenProps) {
  const { assets: cryptoAssets, loading: registryLoading } = useWalletAssets();
  useEffect(() => {
    if (!cryptoAssets.length) return;
  }, [cryptoAssets]);
  const { currency, format } = useCurrency();
  const { userId } = useAuth();
  const gates = useAccountGates();
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  useEffect(() => {
    if (!userId) {
      setBankAccounts([]);
      return;
    }
    banksApi
      .listBankAccounts(userId)
      .then((list) => setBankAccounts(Array.isArray(list) ? list : []))
      .catch(() => setBankAccounts([]));
  }, [userId]);
  const { isApproved } = useKycStatus();
  const [apiError, setApiError] = useState<{ code?: string; message?: string } | null>(null);
  const [eligibility, setEligibility] = useState<{ canOfframp?: boolean; kycStatus?: string; action?: string } | null>(null);
  useEffect(() => {
    if (!userId) return;
    fiatApi.offrampEligibility(userId).then(setEligibility).catch(() => setEligibility(null));
  }, [userId]);
  const [selectedAsset, setSelectedAsset] = useState(cryptoAssets.find((a) => a.symbol === 'USDT') || cryptoAssets[0] || {
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
} as Asset);
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null);
  useEffect(() => {
    if (bankAccounts.length && !selectedAccountId) setSelectedAccountId(bankAccounts[0].id);
  }, [bankAccounts, selectedAccountId]);
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'form' | 'review' | 'processing' | 'done'>('form');
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [showAccountDropdown, setShowAccountDropdown] = useState(false);

  const stablecoins = cryptoAssets;
  const fee = Number(amount) * selectedAsset.price * 0.015;
  const youGet = (Number(amount) * selectedAsset.price - fee) * currency.rate;

  const compatibleAccounts = bankAccounts;
  const selectedAccount = bankAccounts.find((a) => a.id === selectedAccountId);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <div className="px-5 pt-2">
        <GateHint mode="offramp" />
        <WalletFeatureBanner feature="offramp" onGoKyc={() => navigate('kyc')} />
        {apiError && (
          <FeatureAlert reason={mapApiCodeToReason(apiError.code)} message={apiError.message} detail={apiError.code} />
        )}
        {eligibility && eligibility.action === 'complete_kyc' && !isApproved && (
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
              onPreview={() => { if (!gates.canOfframp) return; if (Number(amount) > 0 && selectedAccountId) setStep('review'); }}
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
                  const acct = selectedAccount as {
                    bankCode?: string;
                    bank_code?: string;
                    accountNumber?: string;
                    account_number?: string;
                    accountName?: string;
                    bankName?: string;
                  } | undefined;
                  await fiatApi.localOfframp({
                    userId,
                    asset: selectedAsset.symbol,
                    amount: String(amount),
                    fiatCurrency: currency.code || 'NGN',
                    bankCode: acct?.bankCode || acct?.bank_code || '000',
                    accountNumber: acct?.accountNumber || acct?.account_number || selectedAccountId || '',
                    accountName: acct?.accountName || acct?.bankName,
                  });
                  if (userId) {
                    void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(userId) });
                    void queryClient.invalidateQueries({ queryKey: queryKeys.transactions(userId, 50) });
                  }
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
