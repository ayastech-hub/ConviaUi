import { useState, useRef, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { Wallet, CircleDollarSign, Send } from 'lucide-react';
import { MethodOptionRow, MethodOrDivider } from '../components/MethodOptionRow';
import { PageTop } from '../../../shared/components/PageTop';
import { type Asset, type Transaction } from '../../../shared/data/mockData';
import { WithdrawTokenList } from '../components/withdraw/WithdrawTokenList';
import { WithdrawForm } from '../components/withdraw/WithdrawForm';
import { WithdrawPinStep } from '../components/withdraw/WithdrawPinStep';
import { WithdrawProcessingStep } from '../components/withdraw/WithdrawProcessingStep';
import { WithdrawSuccessView } from '../components/withdraw/WithdrawSuccessView';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { useAuth } from '../../../shared/context/AuthContext';
import { withdrawCrypto, quoteWithdrawCrypto, type WithdrawQuote } from '../../../shared/api/wallet';
import { newIdempotencyKey } from '../../../shared/api/client';
import { useAccountGates } from '../../../shared/hooks/useAccountGates';
import { queryClient, queryKeys } from '../../../shared/query/queryClient';
import { resolveChain, chainFamilyForKey } from '../../../shared/utils/chains';
import { ApiError } from '../../../shared/api/types';
import { usePortfolio } from '../../../shared/hooks/usePortfolio';
import { holdingToAsset } from '../../../shared/utils/mapApiToUi';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { useTokenRegistry } from '../../../shared/hooks/useTokenRegistry';
import { BackButton } from '../../../shared/components/BackButton';
import { ensureTransactionPin } from '../../../shared/security/ensureTransactionPin';
import { SetTransactionPinSheet } from '../../../shared/components/SetTransactionPinSheet';
import { EnterPinFullScreen } from '../../../shared/components/PinFullScreen';

interface WithdrawScreenProps {
  goBack: () => void;
  navigate?: (s: import('../../../shared/data/mockData').Screen) => void;
  presetSymbol?: string;
}

function friendlyWithdrawError(code: string, raw: string): string {
  const c = (code || '').toLowerCase();
  const m = (raw || '').toLowerCase();
  if (c.includes('idempoten') || m.includes('idempotency')) {
    return 'Something went wrong with this request. Please try again.';
  }
  if (c.includes('pin_invalid') || c.includes('pin_incorrect') || m.includes('invalid pin') || m.includes('wrong pin')) {
    return 'Incorrect PIN. Please try again.';
  }
  if (c.includes('pin_required') || c.includes('pin_not_set')) {
    return 'Set your transaction PIN to continue.';
  }
  if (c.includes('insufficient') || m.includes('insufficient')) {
    return 'Insufficient balance for this withdrawal (including network fee). Try a smaller amount.';
  }
  if (m.includes('execution reverted') || m.includes('estimate gas') || m.includes('viem@')) {
    return 'Network could not complete this transfer right now. Please try again shortly.';
  }
  if (m.includes('account user:') || m.includes('has insufficient')) {
    return 'Insufficient balance for this withdrawal (including network fee). Try a smaller amount.';
  }
  if (c.includes('below_minimum') || m.includes('minimum')) {
    return 'Amount is below the minimum withdrawal.';
  }
  if (c.includes('whitelist') || m.includes('whitelist')) {
    return 'This address is not on your withdrawal whitelist.';
  }
  if (c.includes('kyc') || m.includes('kyc')) {
    return 'Complete identity verification to withdraw.';
  }
  if (c.includes('frozen')) {
    return 'Your account is restricted. Contact support.';
  }
  if (c.includes('network') || c.includes('chain')) {
    return 'This network is not available right now. Try another or retry later.';
  }
  // Never surface raw infra / header messages
  if (m.includes('idempotency-key') || m.includes('request body') || m.includes('payload')) {
    return 'Something went wrong. Please try again.';
  }
  if (raw && raw.length < 120 && !/[{}\[\]]/.test(raw) && !raw.includes('Idempotency')) {
    return raw;
  }
  return 'Withdrawal failed. Please try again.';
}

export function WithdrawScreen({ goBack, navigate, presetSymbol }: WithdrawScreenProps) {
  const { assets: cryptoAssets, loading: registryLoading } = useWalletAssets();
  const { chains, chainKeysForSymbol } = useTokenRegistry();
  const { userId } = useAuth();
  const gates = useAccountGates();
  const { data: portfolioData } = usePortfolio();
  const liveAssets = (portfolioData?.holdings || []).map(holdingToAsset);
  const assets = cryptoAssets.length ? cryptoAssets : liveAssets;

  const [step, setStep] = useState<'hub' | 'select' | 'form' | 'pin' | 'processing' | 'success'>('hub');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedChain, setSelectedChain] = useState<string>('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [feeQuote, setFeeQuote] = useState<WithdrawQuote | null>(null);
  const [minWithdraw, setMinWithdraw] = useState(0);
  const [apiError, setApiError] = useState<{ code?: string; message?: string } | null>(null);
  const [pin, setPin] = useState<string[]>(Array(6).fill(''));
  const idempotencyRef = useRef<string | null>(null);
  const submittingRef = useRef(false);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [showSetPin, setShowSetPin] = useState(false);

  // Fee is taken from amount on the backend quote — do not invent large native fees on FE
  const fee = 0;
  const feeUSD = 0;

  const withdrawChainKeys = useMemo(() => {
    if (!selectedAsset) return [] as string[];
    try {
      const keys =
        typeof chainKeysForSymbol === 'function'
          ? chainKeysForSymbol(selectedAsset.symbol, 'withdraw') || []
          : [];
      if (keys.length) return keys;
    } catch {
      /* fall through */
    }
    return (selectedAsset.chains || []).map((c) => resolveChain(c).chainKey);
  }, [selectedAsset, chainKeysForSymbol]);

  const chainLabel = (key: string) => {
    const hit = chains.find((c) => (c.key || c.chainKey) === key);
    return hit?.name || hit?.chainName || key;
  };

  const handleSelectAsset = (asset: Asset) => {
    try {
      setSelectedAsset(asset);
      let keys: string[] = [];
      try {
        keys =
          typeof chainKeysForSymbol === 'function'
            ? chainKeysForSymbol(asset.symbol, 'withdraw') || []
            : [];
      } catch {
        keys = [];
      }
      const first =
        keys[0] ||
        (asset.chains?.[0] ? resolveChain(asset.chains[0]).chainKey : 'ethereum');
      setSelectedChain(first || 'ethereum');
      setAddress('');
      setAmount('');
      idempotencyRef.current = null;
      submittingRef.current = false;
      setError('');
      setApiError(null);
      setStep('form');
    } catch (e) {
      setError('Could not open withdraw form for this token');
      setStep('select');
    }
  };

  useEffect(() => {
    if (!presetSymbol || !assets.length) return;
    const hit = assets.find((a) => a.symbol.toUpperCase() === presetSymbol.toUpperCase());
    if (hit && selectedAsset?.symbol !== hit.symbol) {
      handleSelectAsset(hit);
    }
  }, [presetSymbol, assets]);

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
    if (minWithdraw > 0 && n < minWithdraw) {
      setError(`Minimum withdrawal is ${minWithdraw} ${selectedAsset?.symbol || ''}`);
      return;
    }
    setError('');
  };

  const submitWithdraw = async (pinOverride?: string) => {
    if (userId) {
      const pinGate = await ensureTransactionPin(userId);
      if (!pinGate.ok) {
        if (pinGate.hasPin === false) {
          setShowSetPin(true);
          setStep('pin');
          return;
        }
        setError(pinGate.message);
        setApiError({ code: 'pin_not_set', message: pinGate.message });
        return;
      }
    }
    const pinStr = (pinOverride ?? pin.join('')).replace(/\D/g, '');
    if (!/^\d{6}$/.test(pinStr)) {
      setError('Enter your 6-digit PIN');
      setStep('pin');
      return;
    }
    if (!userId || !selectedAsset) {
      setApiError({ message: 'Sign in required' });
      setStep('form');
      return;
    }
    if (submittingRef.current) return;
    submittingRef.current = true;
    setError('');
    setStep('processing');
    setApiError(null);
    try {
      const resolved = resolveChain(selectedChain || withdrawChainKeys[0] || 'ethereum');
      // One key per attempt. Never reuse after a failed body (amount/pin change).
      idempotencyRef.current = newIdempotencyKey();
      const res = (await withdrawCrypto({
        userId,
        destinationAddress: address.trim(),
        asset: selectedAsset.symbol,
        amount: String(amount),
        chainKey: resolved.chainKey,
        chainFamily: resolved.chainFamily || chainFamilyForKey(resolved.chainKey),
        pin: pinStr,
        feeQuoteId: feeQuote?.feeQuoteId,
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
      submittingRef.current = false;
      idempotencyRef.current = null; // next try must use a fresh key
      if (err instanceof ApiError) {
        const raw = String(err.body?.message || err.message || err.code || '');
        const code = String(err.code || err.body?.code || '');
        const msg = friendlyWithdrawError(code, raw);
        setApiError({ code: code || 'withdraw_failed', message: msg });
        setError(msg);
        const pinRelated = /pin/i.test(code + raw);
        setStep(pinRelated ? 'pin' : 'form');
      } else {
        setApiError({ message: 'Withdrawal failed. Please try again.' });
        setError('Withdrawal failed. Please try again.');
        setStep('form');
      }
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

    if (newPin.every((d) => d !== '') && newPin.join('').length >= 6) {
      void submitWithdraw();
    }
  };


  if (step === 'hub') {
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
        <PageTop />
        <div className="flex items-center gap-3 px-5 mb-2">
          <BackButton onClick={goBack} />
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22 }}>Withdraw</h2>
        </div>
                <div className="flex-1 overflow-y-auto px-5 pb-8">
          <MethodOptionRow
            title="Send to external wallet"
            subtitle="Withdraw crypto to any address on a supported network"
            Icon={Wallet}
            onClick={() => setStep('select')}
          />
          <MethodOrDivider />
          <MethodOptionRow
            title="Withdraw to bank"
            subtitle="Sell crypto and receive money in your local bank account"
            Icon={CircleDollarSign}
            onClick={() => navigate?.('offramp') ?? setStep('select')}
          />
          <MethodOptionRow
            title="Send to a Convia user"
            subtitle="Username or QR"
            Icon={Send}
            onClick={() => navigate?.('send') ?? setStep('select')}
          />
        </div>
      </div>
    );
  }

  if (step === 'select') {
    return <WithdrawTokenList assets={assets} goBack={() => setStep('hub')} onSelect={handleSelectAsset} />;
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
      <>
        <EnterPinFullScreen
          open
          title="Confirm withdrawal"
          subtitle="Enter your 6-digit transaction PIN to authorize this transfer"
          error={error || null}
          busy={submittingRef.current}
          onSubmit={(digits) => {
            setPin(digits.split(''));
            setError('');
            void submitWithdraw(digits);
          }}
          onCancel={() => {
            setStep('form');
            setError('');
            setPin(Array(6).fill(''));
            submittingRef.current = false;
          }}
        />
        {userId && (
          <SetTransactionPinSheet
            open={showSetPin}
            userId={userId}
            onClose={() => setShowSetPin(false)}
            onComplete={() => {
              setShowSetPin(false);
              setError('');
              setApiError(null);
              setPin(Array(6).fill(''));
            }}
          />
        )}
      </>
    );
  }

  if (!selectedAsset) {
    return (
      <WithdrawTokenList
        assets={assets}
        goBack={() => setStep('hub')}
        onSelect={handleSelectAsset}
      />
    );
  }

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div className="px-5 pt-0">
        {apiError && (
          <FeatureAlert
            reason={mapApiCodeToReason(apiError.code)}
            message={apiError.message}
            detail={apiError.code}
            onAction={apiError.code === 'pin_not_set' ? () => setShowSetPin(true) : undefined}
            actionLabel={apiError.code === 'pin_not_set' ? 'Set PIN' : 'Continue'}
          />
        )}
      </div>
      {userId && (
        <SetTransactionPinSheet
          open={showSetPin}
          userId={userId}
          onClose={() => setShowSetPin(false)}
          onComplete={() => {
            setShowSetPin(false);
            setError('');
            setApiError(null);
            setStep('pin');
            setPin(Array(6).fill(''));
          }}
        />
      )}
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
        fee={feeQuote ? Number(feeQuote.totalFeeAmountInAsset) || 0 : 0}
        feeUSD={feeQuote ? Number(feeQuote.totalFeeUsd) || 0 : 0}
        onChangeAsset={() => { if (!presetSymbol) setStep('select'); }}
        onBack={() => (presetSymbol ? goBack() : setStep('select'))}
        onContinue={async () => {
          if (!gates.canWithdraw) {
            setError(gates.isFrozen ? 'Account frozen' : 'Complete KYC to withdraw');
            return;
          }
          if (userId) {
            const pinGate = await ensureTransactionPin(userId);
            if (!pinGate.ok && pinGate.hasPin === false) {
              setShowSetPin(true);
              return;
            }
          }
          setStep('pin');
          setError('');
          setPin(Array(6).fill(''));
        }}
      />
    </div>
  );
}
