import { useState, useRef, useMemo, useEffect, useCallback } from 'react';
import { type Asset, type Transaction } from '../../../shared/data/mockData';
import { WithdrawTokenList } from '../components/withdraw/WithdrawTokenList';
import { WithdrawMethodSheet } from '../components/withdraw/WithdrawMethodSheet';
import { WithdrawChainPicker, type ChainFeeRow } from '../components/withdraw/WithdrawChainPicker';
import { WithdrawOnChainForm } from '../components/withdraw/WithdrawOnChainForm';
import { WithdrawInternalForm } from '../components/withdraw/WithdrawInternalForm';
import { WithdrawProcessingStep } from '../components/withdraw/WithdrawProcessingStep';
import { WithdrawSuccessView } from '../components/withdraw/WithdrawSuccessView';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { useAuth } from '../../../shared/context/AuthContext';
import {
  withdrawCrypto,
  quoteWithdrawCrypto,
  fetchDepositInfo,
  type WithdrawQuote,
} from '../../../shared/api/wallet';
import { sendToUsername } from '../../../shared/api/payments';
import { newIdempotencyKey } from '../../../shared/api/client';
import { useAccountGates } from '../../../shared/hooks/useAccountGates';
import { queryClient, queryKeys } from '../../../shared/query/queryClient';
import { resolveChain, chainFamilyForKey } from '../../../shared/utils/chains';
import { ApiError } from '../../../shared/api/types';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { useTokenRegistry } from '../../../shared/hooks/useTokenRegistry';
import { ensureTransactionPin } from '../../../shared/security/ensureTransactionPin';
import { SetTransactionPinSheet } from '../../../shared/components/SetTransactionPinSheet';
import { EnterPinFullScreen } from '../../../shared/components/PinFullScreen';

type Step =
  | 'select'
  | 'onchain'
  | 'internal'
  | 'pin'
  | 'processing'
  | 'success';

interface WithdrawScreenProps {
  goBack: () => void;
  navigate?: (s: import('../../../shared/data/mockData').Screen) => void;
  presetSymbol?: string;
}

function friendlyWithdrawError(code: string, raw: string): string {
  const c = (code || '').toLowerCase();
  const m = (raw || '').toLowerCase();
  if (c.includes('pin') || m.includes('pin')) return 'Incorrect PIN. Try again.';
  if (c.includes('insufficient') || m.includes('insufficient')) {
    return 'Insufficient balance for this withdrawal (including network fee). Try a smaller amount.';
  }
  if (c.includes('below') || m.includes('minimum') || m.includes('below')) {
    return 'Amount is below the minimum withdrawal.';
  }
  if (c.includes('whitelist') || m.includes('whitelist')) {
    return 'This address is not on your withdrawal whitelist.';
  }
  if (c.includes('kyc') || m.includes('kyc')) return 'Complete identity verification to withdraw.';
  if (raw && raw.length < 120 && !m.includes('idempotency')) return raw;
  return 'Withdrawal failed. Please try again.';
}

export function WithdrawScreen({ goBack, navigate, presetSymbol }: WithdrawScreenProps) {
  const { userId } = useAuth();
  const gates = useAccountGates();
  const { assets: walletAssets } = useWalletAssets();
  const { chainKeysForSymbol } = useTokenRegistry();

  const assets = useMemo(() => walletAssets || [], [walletAssets]);

  const [step, setStep] = useState<Step>('select');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [methodOpen, setMethodOpen] = useState(false);
  const [chainOpen, setChainOpen] = useState(false);
  const [selectedChain, setSelectedChain] = useState('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [recipient, setRecipient] = useState('');
  const [error, setError] = useState('');
  const [apiError, setApiError] = useState<{ code?: string; message?: string } | null>(null);
  const [feeQuote, setFeeQuote] = useState<WithdrawQuote | null>(null);
  const [quoting, setQuoting] = useState(false);
  const [minWithdraw, setMinWithdraw] = useState(0);
  const [chainFees, setChainFees] = useState<ChainFeeRow[]>([]);
  const [mode, setMode] = useState<'onchain' | 'internal'>('onchain');
  const [showSetPin, setShowSetPin] = useState(false);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);
  const idempotencyRef = useRef<string | null>(null);
  const submittingRef = useRef(false);

  const withdrawChainKeys = useMemo(() => {
    if (!selectedAsset) return [] as string[];
    try {
      const keys = chainKeysForSymbol?.(selectedAsset.symbol, 'withdraw') || [];
      if (keys.length) return keys;
    } catch {
      /* fall */
    }
    return (selectedAsset.chains || []).map((c) => resolveChain(c).chainKey);
  }, [selectedAsset, chainKeysForSymbol]);

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setAddress('');
    setAmount('');
    setRecipient('');
    setSelectedChain('');
    setFeeQuote(null);
    setError('');
    setApiError(null);
    setMethodOpen(true);
  };

  useEffect(() => {
    if (!presetSymbol || !assets.length) return;
    const hit = assets.find((a) => a.symbol.toUpperCase() === presetSymbol.toUpperCase());
    if (hit && selectedAsset?.symbol !== hit.symbol) handleSelectAsset(hit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [presetSymbol, assets]);

  // Build chain fee rows (fee estimated when amount present)
  useEffect(() => {
    if (!selectedAsset) {
      setChainFees([]);
      return;
    }
    setChainFees(
      withdrawChainKeys.map((k) => ({
        chainKey: k,
        feeAsset: selectedAsset.symbol,
        feeAmount: null,
        feeUsd: null,
      })),
    );
  }, [selectedAsset, withdrawChainKeys]);

  // Live min for selected chain
  useEffect(() => {
    if (!userId || !selectedAsset || !selectedChain) {
      setMinWithdraw(0);
      return;
    }
    let cancelled = false;
    void fetchDepositInfo(userId, selectedAsset.symbol, selectedChain)
      .then((info) => {
        if (!cancelled) setMinWithdraw(Number(info.minWithdrawal) || 0);
      })
      .catch(() => {
        if (cancelled) return;
        const sym = selectedAsset.symbol.toUpperCase();
        if (sym === 'TON') setMinWithdraw(0.2);
        else if (['USDT', 'USDC', 'USD'].includes(sym)) setMinWithdraw(3);
        else if (sym === 'TRX') setMinWithdraw(50);
        else setMinWithdraw(0);
      });
    return () => {
      cancelled = true;
    };
  }, [userId, selectedAsset, selectedChain]);

  // Quote when amount + chain set (on-chain only)
  useEffect(() => {
    if (mode !== 'onchain' || !userId || !selectedAsset || !selectedChain || !amount || Number(amount) <= 0) {
      setFeeQuote(null);
      setQuoting(false);
      return;
    }
    let cancelled = false;
    setQuoting(true);
    const t = window.setTimeout(() => {
      void quoteWithdrawCrypto({
        userId,
        asset: selectedAsset.symbol,
        amount: String(amount),
        chainKey: selectedChain,
      })
        .then((q) => {
          if (cancelled) return;
          setFeeQuote(q);
          setChainFees((prev) =>
            prev.map((r) =>
              r.chainKey === selectedChain
                ? {
                    ...r,
                    feeAmount: Number(q.totalFeeAmountInAsset) || 0,
                    feeUsd: Number(q.totalFeeUsd) || 0,
                  }
                : r,
            ),
          );
        })
        .catch(() => {
          if (!cancelled) setFeeQuote(null);
        })
        .finally(() => {
          if (!cancelled) setQuoting(false);
        });
    }, 400);
    return () => {
      cancelled = true;
      window.clearTimeout(t);
    };
  }, [mode, userId, selectedAsset, selectedChain, amount]);

  const pasteAddress = useCallback(async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setAddress(text.trim());
    } catch {
      /* ignore */
    }
  }, []);

  const goPin = async () => {
    setError('');
    if (!userId) {
      setApiError({ message: 'Sign in required' });
      return;
    }
    if (!gates.canWithdraw && mode === 'onchain') {
      setApiError({ message: 'Withdrawals are not available for your account right now.' });
      return;
    }
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
    setStep('pin');
  };

  const submitOnChain = async (pinStr: string) => {
    if (!userId || !selectedAsset || submittingRef.current) return;
    submittingRef.current = true;
    setStep('processing');
    setApiError(null);
    try {
      const resolved = resolveChain(selectedChain);
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
      };

      const hash = res.txHash || '';
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
        valueUSD: Number(res.netAmount || amount) * (selectedAsset.price || 0),
        status,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hash: hash || undefined,
        address,
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(userId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.transactions(userId, 50) });
      setStep('success');
    } catch (err) {
      submittingRef.current = false;
      idempotencyRef.current = null;
      if (err instanceof ApiError) {
        const raw = String(err.body?.message || err.message || err.code || '');
        const code = String(err.code || err.body?.code || '');
        const msg = friendlyWithdrawError(code, raw);
        setApiError({ code: code || 'withdraw_failed', message: msg });
        setError(msg);
        setStep(/pin/i.test(code + raw) ? 'pin' : 'onchain');
      } else {
        setApiError({ message: 'Withdrawal failed. Please try again.' });
        setError('Withdrawal failed. Please try again.');
        setStep('onchain');
      }
    }
  };

  const submitInternal = async (pinStr: string) => {
    if (!userId || !selectedAsset || submittingRef.current) return;
    submittingRef.current = true;
    setStep('processing');
    setApiError(null);
    try {
      const res = await sendToUsername({
        senderId: userId,
        recipientUsername: recipient.trim().replace(/^@/, ''),
        asset: selectedAsset.symbol,
        amount: String(amount),
      });
      setReceiptTx({
        id: String(res.ledgerTransactionId || 'send-' + Date.now()),
        type: 'send',
        asset: selectedAsset.symbol,
        amount: Number(res.amount || amount),
        valueUSD: Number(res.amount || amount) * (selectedAsset.price || 0),
        status: 'confirmed',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        address: recipient.trim(),
      });
      void queryClient.invalidateQueries({ queryKey: queryKeys.portfolio(userId) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.transactions(userId, 50) });
      setStep('success');
    } catch (err) {
      submittingRef.current = false;
      if (err instanceof ApiError) {
        const msg = err.body?.message || err.message || 'Transfer failed';
        setApiError({ code: err.code, message: msg });
        setError(msg);
        setStep('internal');
      } else {
        setError('Transfer failed. Please try again.');
        setStep('internal');
      }
    }
  };

  if (step === 'success' && selectedAsset) {
    return (
      <WithdrawSuccessView
        amount={amount}
        symbol={selectedAsset.symbol}
        address={mode === 'onchain' ? address : recipient}
        chain={mode === 'onchain' ? selectedChain : 'Internal'}
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
      <WithdrawProcessingStep
        amount={amount}
        symbol={selectedAsset?.symbol ?? ''}
        chain={mode === 'onchain' ? selectedChain : 'Internal'}
      />
    );
  }

  if (step === 'pin') {
    return (
      <>
        <EnterPinFullScreen
          open={!showSetPin}
          title="Confirm withdrawal"
          subtitle={
            mode === 'onchain'
              ? `Enter your 6-digit PIN to withdraw ${amount} ${selectedAsset?.symbol || ''}`
              : `Enter your 6-digit PIN to send ${amount} ${selectedAsset?.symbol || ''}`
          }
          error={error || null}
          onCancel={() => setStep(mode === 'onchain' ? 'onchain' : 'internal')}
          onSubmit={(pin) => {
            if (mode === 'onchain') void submitOnChain(pin);
            else void submitInternal(pin);
          }}
        />
        {userId && (
          <SetTransactionPinSheet
            open={showSetPin}
            userId={userId}
            onClose={() => setShowSetPin(false)}
            onComplete={() => {
              setShowSetPin(false);
            }}
          />
        )}
      </>
    );
  }

  if (step === 'onchain' && selectedAsset) {
    return (
      <div className="relative h-full">
        {apiError && (
          <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-2">
            <FeatureAlert reason={mapApiCodeToReason(apiError.code)} message={apiError.message} />
          </div>
        )}
        <WithdrawOnChainForm
          asset={selectedAsset}
          selectedChain={selectedChain}
          address={address}
          amount={amount}
          minWithdraw={minWithdraw}
          feeQuote={feeQuote}
          quoting={quoting}
          error={error}
          onAddressChange={(v) => {
            setAddress(v);
            setError('');
          }}
          onAmountChange={(v) => {
            setAmount(v);
            setError('');
          }}
          onOpenChain={() => setChainOpen(true)}
          onBack={() => {
            setStep('select');
            setMethodOpen(true);
          }}
          onContinue={() => void goPin()}
          onPaste={() => void pasteAddress()}
        />
        <WithdrawChainPicker
          open={chainOpen}
          symbol={selectedAsset.symbol}
          chains={chainFees}
          selected={selectedChain}
          onSelect={(k) => {
            setSelectedChain(k);
            setFeeQuote(null);
          }}
          onClose={() => setChainOpen(false)}
        />
      </div>
    );
  }

  if (step === 'internal' && selectedAsset) {
    return (
      <div className="relative h-full">
        {apiError && (
          <div className="absolute top-0 left-0 right-0 z-20 px-4 pt-2">
            <FeatureAlert reason={mapApiCodeToReason(apiError.code)} message={apiError.message} />
          </div>
        )}
        <WithdrawInternalForm
          asset={selectedAsset}
          recipient={recipient}
          amount={amount}
          error={error}
          onRecipientChange={(v) => {
            setRecipient(v);
            setError('');
          }}
          onAmountChange={(v) => {
            setAmount(v);
            setError('');
          }}
          onBack={() => {
            setStep('select');
            setMethodOpen(true);
          }}
          onContinue={() => void goPin()}
        />
      </div>
    );
  }

  return (
    <>
      <WithdrawTokenList
        assets={assets}
        goBack={goBack}
        onSelect={handleSelectAsset}
      />
      <WithdrawMethodSheet
        open={methodOpen}
        asset={selectedAsset}
        onClose={() => setMethodOpen(false)}
        onOnChain={() => {
          setMode('onchain');
          setMethodOpen(false);
          setStep('onchain');
        }}
        onInternal={() => {
          setMode('internal');
          setMethodOpen(false);
          setStep('internal');
        }}
      />
    </>
  );
}
