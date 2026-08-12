import { useState, useRef, useMemo } from 'react';
import { type Asset, type Transaction } from '../../../shared/data/mockData';
import { WithdrawTokenList } from '../components/withdraw/WithdrawTokenList';
import { WithdrawForm } from '../components/withdraw/WithdrawForm';
import { WithdrawPinStep } from '../components/withdraw/WithdrawPinStep';
import { WithdrawProcessingStep } from '../components/withdraw/WithdrawProcessingStep';
import { WithdrawSuccessView } from '../components/withdraw/WithdrawSuccessView';
import { WalletFeatureBanner } from '../../../shared/components/WalletFeatureBanner';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { useAuth } from '../../../shared/context/AuthContext';
import { withdrawCrypto } from '../../../shared/api/wallet';
import { newIdempotencyKey } from '../../../shared/api/client';
import { useAccountGates } from '../../../shared/hooks/useAccountGates';
import { queryClient, queryKeys } from '../../../shared/query/queryClient';
import { GateHint } from '../../../shared/components/AccountStatusBanners';
import { resolveChain, chainFamilyForKey } from '../../../shared/utils/chains';
import { ApiError } from '../../../shared/api/types';
import { usePortfolio } from '../../../shared/hooks/usePortfolio';
import { holdingToAsset } from '../../../shared/utils/mapApiToUi';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { useTokenRegistry } from '../../../shared/hooks/useTokenRegistry';

interface WithdrawScreenProps {
  goBack: () => void;
}

export function WithdrawScreen({ goBack }: WithdrawScreenProps) {
  const { assets: cryptoAssets, loading: registryLoading, chainKeysForSymbol } = useWalletAssets();
  const { chains } = useTokenRegistry();
  const { userId } = useAuth();
  const gates = useAccountGates();
  const { data: portfolioData } = usePortfolio();
  const liveAssets = (portfolioData?.holdings || []).map(holdingToAsset);
  const assets = cryptoAssets.length ? cryptoAssets : liveAssets;

  const [step, setStep] = useState<'select' | 'form' | 'pin' | 'processing' | 'success'>('select');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedChain, setSelectedChain] = useState<string>('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState<{ code?: string; message?: string } | null>(null);
  const [pin, setPin] = useState(['', '', '', '']);
  const idempotencyRef = useRef<string | null>(null);
  const submittingRef = useRef(false);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [txHash, setTxHash] = useState('');

  const fee = selectedAsset
    ? selectedAsset.symbol === 'BTC'
      ? 0.00005
      : selectedAsset.symbol === 'ETH'
        ? 0.002
        : 1.0
    : 0;
  const feeUSD = selectedAsset ? fee * selectedAsset.price : 0;

  const withdrawChainKeys = useMemo(() => {
    if (!selectedAsset) return [] as string[];
    const keys = chainKeysForSymbol(selectedAsset.symbol, 'withdraw');
    if (keys.length) return keys;
    // fallback labels from asset.chains → resolve to keys
    return (selectedAsset.chains || []).map((c) => resolveChain(c).chainKey);
  }, [selectedAsset, chainKeysForSymbol]);

  const chainLabel = (key: string) => {
    const hit = chains.find((c) => (c.key || c.chainKey) === key);
    return hit?.name || hit?.chainName || key;
  };

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    const keys = chainKeysForSymbol(asset.symbol, 'withdraw');
    const first =
      keys[0] ||
      (asset.chains[0] ? resolveChain(asset.chains[0]).chainKey : 'ethereum');
    setSelectedChain(first);
    idempotencyRef.current = null;
    submittingRef.current = false;
    setStep('form');
    setError('');
    setApiError(null);
  };

  const validateAddress = (val: string) => {
    setAddress(val);
    setError('');
  };

  const validateAmount = (val: string) => {
    setAmount(val);
    const n = Number(val);
    if (val === '') {
      setError('');
      return;
    }
    if (Number.isNaN(n) || n <= 0) {
      setError('Enter a valid amount');
      return;
    }
    if (selectedAsset && n > selectedAsset.balance && selectedAsset.balance > 0) {
      setError(`Insufficient balance. Max: ${selectedAsset.balance}`);
      return;
    }
    setError('');
  };

  const submitWithdraw = async () => {
    if (!userId || !selectedAsset) {
      setApiError({ message: 'Sign in required' });
      setStep('form');
      return;
    }
    if (submittingRef.current) return;
    submittingRef.current = true;
    setStep('processing');
    setApiError(null);
    try {
      // selectedChain must be a product key (sepolia, ethereum, …) when set from form
      const resolved = resolveChain(selectedChain || withdrawChainKeys[0] || 'ethereum');
      if (!idempotencyRef.current) idempotencyRef.current = newIdempotencyKey();
      const res = (await withdrawCrypto({
        userId,
        destinationAddress: address.trim(),
        asset: selectedAsset.symbol,
        amount: String(amount),
        chainKey: resolved.chainKey,
        chainFamily: resolved.chainFamily || chainFamilyForKey(resolved.chainKey),
        idempotencyKey: idempotencyRef.current,
      })) as {
        txHash?: string;
        netAmount?: string;
        status?: string;
        withdrawalRequestId?: string;
        [k: string]: unknown;
      };

      const hash = res.txHash || '';
      setTxHash(hash);
      const status =
        res.status === 'completed' || hash
          ? 'confirmed'
          : res.status === 'pending_funding' || res.status === 'processing'
            ? 'pending'
            : 'pending';
      setReceiptTx({
        id: String(res.withdrawalRequestId || 'wd-' + Date.now()),
        type: 'withdraw',
        asset: selectedAsset.symbol,
        amount: Number(res.netAmount || amount),
        valueUSD: Number(res.netAmount || amount) * selectedAsset.price,
        status,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hash: hash || undefined,
        address,
      });
      if (userId) {
        void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(userId) });
        void queryClient.invalidateQueries({ queryKey: queryKeys.transactions(userId, 50) });
      }
      setStep('success');
    } catch (err) {
      if (err instanceof ApiError) {
        setApiError({ code: err.code, message: err.body.message || err.message });
        setError(err.body.message || err.code);
      } else {
        setApiError({ message: 'Withdrawal failed' });
        setError('Withdrawal failed');
      }
      setStep('form');
    }
  };

  const handlePinChange = (index: number, val: string) => {
    const digits = val.replace(/\D/g, '');
    const newPin = [...pin];
    if (digits === '') {
      newPin[index] = '';
      setPin(newPin);
      return;
    }
    newPin[index] = digits.slice(-1);
    setPin(newPin);
    setError('');

    if (newPin.every((d) => d !== '')) {
      // Client-side PIN gate UX; server enforces whitelist/limits/signing.
      // Full transaction-PIN verify endpoint can be added when PIN is set for the user.
      void submitWithdraw();
    }
  };

  if (step === 'select') {
    return <WithdrawTokenList assets={assets} goBack={goBack} onSelect={handleSelectAsset} />;
  }

  if (step === 'success' && selectedAsset) {
    return (
      <WithdrawSuccessView
        amount={amount}
        symbol={selectedAsset.symbol}
        address={address}
        chain={selectedChain}
        receiptTx={receiptTx}
        showReceipt={showReceipt}
        onShowReceipt={() => setShowReceipt(true)}
        onCloseReceipt={() => setShowReceipt(false)}
        onDone={goBack}
      />
    );
  }

  if (step === 'processing') {
    return (
      <WithdrawProcessingStep amount={amount} symbol={selectedAsset?.symbol ?? ''} chain={selectedChain} />
    );
  }

  if (step === 'pin') {
    return (
      <WithdrawPinStep
        pin={pin}
        onPinChange={handlePinChange}
        error={error}
        onCancel={() => {
          setStep('form');
          setError('');
          setPin(['', '', '', '']);
        }}
      />
    );
  }

  if (!selectedAsset) return null;

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div className="px-5 pt-12">
        <WalletFeatureBanner feature="withdraw" />
        <GateHint mode="withdraw" />

        {apiError && (
          <FeatureAlert reason={mapApiCodeToReason(apiError.code)} message={apiError.message} detail={apiError.code} />
        )}
      </div>
      <WithdrawForm
        asset={selectedAsset}
        selectedChain={selectedChain}
        availableChains={withdrawChainKeys}
        chainLabels={Object.fromEntries(withdrawChainKeys.map((k) => [k, chainLabel(k)]))}
        setSelectedChain={setSelectedChain}
        address={address}
        onAddressChange={validateAddress}
        amount={amount}
        onAmountChange={validateAmount}
        error={error}
        fee={fee}
        feeUSD={feeUSD}
        onChangeAsset={() => setStep('select')}
        onBack={() => setStep('select')}
        onContinue={() => {
          if (!gates.canWithdraw) {
            setError(gates.isFrozen ? 'Account frozen' : 'Complete KYC to withdraw');
            return;
          }
          setStep('pin');
          setError('');
          setPin(['', '', '', '']);
        }}
      />
    </div>
  );
}
