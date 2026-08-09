import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { chatContacts, type Screen, type Asset, type ChatContact, type Transaction } from '../../../shared/data/mockData';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { AssetPicker } from '../../../shared/components/AssetPicker';
import { QRScanner } from '../../../shared/components/QRScanner';
import { parseQRPayload, consumeSendPrefill, type QRPayload } from '../../../shared/utils/qrPayload';
import { TransactionReceipt } from '../../../shared/components/TransactionReceipt';
import { SendStepIndicator } from '../components/send/SendStepIndicator';
import { SendTokenSelectStep } from '../components/send/SendTokenSelectStep';
import { SendRecipientStep } from '../components/send/SendRecipientStep';
import { SendAmountStep } from '../components/send/SendAmountStep';
import { SendConfirmStep } from '../components/send/SendConfirmStep';
import { SendSendingStep } from '../components/send/SendSendingStep';
import { SendSuccessStep } from '../components/send/SendSuccessStep';
import { WalletFeatureBanner } from '../../../shared/components/WalletFeatureBanner';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { useAuth } from '../../../shared/context/AuthContext';
import { withdrawCrypto } from '../../../shared/api/wallet';
import { sendToUsername } from '../../../shared/api/payments';
import { resolveChain } from '../../../shared/utils/chains';
import { ApiError } from '../../../shared/api/types';
import { usePortfolio } from '../../../shared/hooks/usePortfolio';
import { holdingToAsset } from '../../../shared/utils/mapApiToUi';
import { useTokenRegistry } from '../../../shared/hooks/useTokenRegistry';

interface SendScreenProps {
  navigate: (s: Screen) => void;
  goBack: () => void;
}

type Step = 'select' | 'recipient' | 'amount' | 'confirm' | 'sending' | 'success';

const genHash = () => '0x' + Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
const shortenHash = (h: string) => `${h.slice(0, 10)}…${h.slice(-8)}`;

export function SendScreen({ navigate, goBack }: SendScreenProps) {
  const { assets: registryAssets, loading: registryLoading } = useTokenRegistry();
  const cryptoAssets = registryAssets.length ? registryAssets : [];
  useEffect(() => {
    if (!registryAssets.length) return;
    // Prefer stable default once catalog loads
  }, [registryAssets]);
  const { userId } = useAuth();
  const { data: portfolioData } = usePortfolio();
  const [apiError, setApiError] = useState<{ code?: string; message?: string } | null>(null);
  const liveAssets = (portfolioData?.holdings || []).map(holdingToAsset);
  const assetOptions = liveAssets.length ? liveAssets : cryptoAssets;
  const { format, currency } = useCurrency();

  const [step, setStep] = useState<Step>('select');
  const [recipient, setRecipient] = useState('');
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset>(cryptoAssets.find((a) => a.symbol === 'USDT') || cryptoAssets[0] || {
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
  const [amount, setAmount] = useState('');
  const [search, setSearch] = useState('');
  const [showPicker, setShowPicker] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState('');
  const [txHash, setTxHash] = useState('');
  const [confirmProgress, setConfirmProgress] = useState(0);
  const [holding, setHolding] = useState(false);
  const [copied, setCopied] = useState(false);
  const [sendingStage, setSendingStage] = useState(0);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const applyScanResult = useCallback((payload: QRPayload) => {
    if (payload.address) { setRecipient(payload.address); setSelectedContact(null); }
    if (payload.asset) {
      const matched = cryptoAssets.find((a) => a.symbol.toUpperCase() === payload.asset!.toUpperCase());
      if (matched) setSelectedAsset(matched);
    }
    if (payload.amount && Number(payload.amount) > 0) setAmount(payload.amount);
    setStep('amount');
  }, []);

  useEffect(() => {
    const prefill = consumeSendPrefill();
    if (prefill) {
      setSelectedAsset(cryptoAssets.find((a) => a.symbol.toUpperCase() === (prefill.asset ?? 'USDT').toUpperCase()) ?? (cryptoAssets.find((a) => a.symbol === 'USDT') || cryptoAssets[0] || selectedAsset));
      applyScanResult(prefill);
    }
  }, [applyScanResult]);

  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStart = useRef<number>(0);
  const addressInputRef = useRef<HTMLInputElement>(null);

  const fee = useMemo(() => (Number(amount) || 0) * 0.001, [amount]);
  const total = useMemo(() => (Number(amount) || 0) + fee, [amount, fee]);
  const cryptoAmount = useMemo(() => {
    const n = Number(amount) || 0;
    return n > 0 && selectedAsset.price > 0 ? n / selectedAsset.price : 0;
  }, [amount, selectedAsset]);

  // Live broadcast: payments/send (username) or crypto/withdraw (address)
  useEffect(() => {
    if (step !== 'sending') return;
    let cancelled = false;
    setSendingStage(0);
    setApiError(null);

    const run = async () => {
      const stageTimers = [
        setTimeout(() => { if (!cancelled) setSendingStage(1); }, 400),
        setTimeout(() => { if (!cancelled) setSendingStage(2); }, 900),
      ];
      try {
        if (!userId) throw new ApiError(401, { code: 'unauthorized', message: 'Sign in required' });

        const chain = resolveChain(selectedAsset.chains[0] || 'Ethereum');
        const amountAsset = cryptoAmount > 0 ? cryptoAmount.toFixed(8) : String(amount);
        let hash: string | undefined;

        const looksLikeAddress =
          /^(0x[a-fA-F0-9]{40}|[1-9A-HJ-NP-Za-km-z]{32,44}|bc1[a-z0-9]{25,90}|T[a-zA-Z0-9]{33})$/.test(
            recipient.trim(),
          );

        if (selectedContact || (!looksLikeAddress && recipient.trim().length >= 3)) {
          const username = (selectedContact?.username || recipient).replace(/^@/, '');
          const res = (await sendToUsername({
            senderId: userId,
            recipientUsername: username,
            asset: selectedAsset.symbol,
            amount: amountAsset,
            chainKey: chain.chainKey,
            chainFamily: chain.chainFamily,
          })) as { txHash?: string; [k: string]: unknown };
          hash = res.txHash || (res as { hash?: string }).hash;
        } else {
          const res = (await withdrawCrypto({
            userId,
            destinationAddress: recipient.trim(),
            asset: selectedAsset.symbol,
            amount: amountAsset,
            chainKey: chain.chainKey,
            chainFamily: chain.chainFamily,
          })) as { txHash?: string; [k: string]: unknown };
          hash = res.txHash;
        }

        if (cancelled) return;
        stageTimers.forEach(clearTimeout);
        setSendingStage(3);
        const finalHash = hash || genHash();
        setTxHash(finalHash);
        setReceiptTx({
          id: 'tx-' + Date.now(),
          type: 'send',
          asset: selectedAsset.symbol,
          amount: Number(amountAsset),
          valueUSD: Number(amount) || Number(amountAsset) * selectedAsset.price,
          status: 'confirmed',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          hash: finalHash,
          address: recipient,
          username: selectedContact?.username ?? undefined,
        });
        setTimeout(() => { if (!cancelled) setStep('success'); }, 600);
      } catch (err) {
        stageTimers.forEach(clearTimeout);
        if (cancelled) return;
        if (err instanceof ApiError) {
          setApiError({ code: err.code, message: err.body.message || err.message });
        } else {
          setApiError({ message: 'Send failed — check API / network' });
        }
        setStep('confirm');
        setConfirmProgress(0);
        setHolding(false);
      }
    };

    void run();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return chatContacts;
    const q = search.toLowerCase();
    return chatContacts.filter((c) => c.name.toLowerCase().includes(q) || c.username.toLowerCase().includes(q));
  }, [search]);

  const validateAmount = useCallback((val: string) => {
    setAmount(val);
    const n = Number(val);
    if (val === '') { setError(''); return; }
    if (Number.isNaN(n) || n < 0) { setError('Enter a valid amount'); return; }
    const maxUsd = selectedAsset.valueUSD || 0;
    if (maxUsd > 0 && n > maxUsd) { setError(`Insufficient balance. Max: ${format(maxUsd)}`); return; }
    setError('');
  }, [selectedAsset, format]);

  const setPct = (pct: number) => validateAmount(((selectedAsset.valueUSD * pct) / 100).toFixed(2));

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) { setRecipient(text.trim()); setSelectedContact(null); addressInputRef.current?.focus(); }
    } catch { /* clipboard not available — no-op */ }
  };

  const selectContact = (c: ChatContact) => {
    setSelectedContact(c);
    setRecipient(c.username);
    setSearch('');
    setStep('amount');
  };

  const startHold = () => {
    if (Number(amount) <= 0 || error) return;
    setHolding(true);
    holdStart.current = Date.now();
    holdTimer.current = setInterval(() => {
      const elapsed = Date.now() - holdStart.current;
      const pct = Math.min(elapsed / 1500, 1);
      setConfirmProgress(pct);
      if (pct >= 1) {
        if (holdTimer.current) clearInterval(holdTimer.current);
        holdTimer.current = null;
        setStep('sending');
      }
    }, 30);
  };

  const cancelHold = () => {
    setHolding(false);
    setConfirmProgress(0);
    if (holdTimer.current) { clearInterval(holdTimer.current); holdTimer.current = null; }
  };

  const reset = () => {
    setStep('select');
    setRecipient('');
    setSelectedContact(null);
    setSelectedAsset(cryptoAssets.find((a) => a.symbol === 'USDT') || cryptoAssets[0] || selectedAsset);
    setAmount('');
    setSearch('');
    setError('');
    setTxHash('');
    setConfirmProgress(0);
    setHolding(false);
    setSendingStage(0);
    setReceiptTx(null);
    setShowReceipt(false);
  };

  const copyHash = async () => {
    try { await navigator.clipboard.writeText(txHash); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };

  const canContinueAmount = Number(amount) > 0 && !error;

  return (
    <div className="flex flex-col h-full relative overflow-hidden" style={{ background: 'var(--background)' }}>
      <div className="px-5 pt-12">
        <WalletFeatureBanner feature="transfer" />
        {apiError && (
          <FeatureAlert reason={mapApiCodeToReason(apiError.code)} message={apiError.message} detail={apiError.code} />
        )}
      </div>
      <div className="flex items-center gap-3 px-5 pt-3 pb-2" style={{ height: 56 }}>
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            if (step === 'select' || step === 'recipient') goBack();
            else if (step === 'amount') { setStep('recipient'); setAmount(''); setError(''); }
            else if (step === 'confirm') setStep('amount');
            else if (step === 'success') reset();
            else goBack();
          }}
          aria-label="Go back"
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--muted)' }}
        >
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>
          {step === 'select' ? 'Send' : step === 'success' ? 'Sent' : step === 'sending' ? 'Sending' : 'Send'}
        </h2>
      </div>

      <SendStepIndicator activeKey={step} />

      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <AnimatePresence mode="wait">
          {step === 'select' && (
            <SendTokenSelectStep assets={cryptoAssets} format={format} onSelect={(asset) => { setSelectedAsset(asset); setStep('recipient'); }} />
          )}

          {step === 'recipient' && (
            <SendRecipientStep
              search={search} setSearch={setSearch} filteredContacts={filteredContacts} onSelectContact={selectContact}
              recipient={recipient} setRecipient={setRecipient} setSelectedContact={setSelectedContact}
              addressInputRef={addressInputRef} onPaste={handlePaste} onScan={() => setScanning(true)}
              selectedAsset={selectedAsset} onOpenAssetPicker={() => setShowPicker(true)}
              onContinue={() => setStep('amount')}
            />
          )}

          {step === 'amount' && (
            <SendAmountStep
              currency={currency} format={format} selectedContact={selectedContact} recipient={recipient}
              onEditRecipient={() => setStep('recipient')} selectedAsset={selectedAsset} onOpenAssetPicker={() => setShowPicker(true)}
              amount={amount} onAmountChange={validateAmount} cryptoAmount={cryptoAmount} error={error}
              onSetPercentage={setPct} fee={fee} canContinue={canContinueAmount} onContinue={() => setStep('confirm')}
            />
          )}

          {step === 'confirm' && (
            <SendConfirmStep
              format={format} selectedContact={selectedContact} recipient={recipient} amount={amount}
              cryptoAmount={cryptoAmount} selectedAsset={selectedAsset} fee={fee} total={total}
              onEdit={() => setStep('amount')} canConfirm={canContinueAmount}
              holding={holding} confirmProgress={confirmProgress} onHoldStart={startHold} onHoldEnd={cancelHold}
            />
          )}

          {step === 'sending' && (
            <SendSendingStep format={format} amount={amount} selectedContact={selectedContact} recipient={recipient} sendingStage={sendingStage} />
          )}

          {step === 'success' && (
            <SendSuccessStep
              format={format} amount={amount} selectedContact={selectedContact} recipient={recipient}
              cryptoAmount={cryptoAmount} selectedAsset={selectedAsset} txHash={txHash} shortenHash={shortenHash}
              copied={copied} onCopyHash={copyHash} onShowReceipt={() => setShowReceipt(true)}
              onSendAnother={reset} onDone={() => navigate('home')}
            />
          )}
        </AnimatePresence>
      </div>

      <AssetPicker open={showPicker} onClose={() => setShowPicker(false)} onSelect={(a: Asset) => setSelectedAsset(a)} title="Select token to send" />

      <AnimatePresence>
        {scanning && (
          <QRScanner
            onScan={(raw) => {
              setScanning(false);
              const parsed = parseQRPayload(raw);
              if (parsed) {
                applyScanResult(parsed);
              } else {
                setRecipient(raw.trim());
                setSelectedContact(null);
                setStep('amount');
              }
            }}
            onClose={() => setScanning(false)}
          />
        )}
      </AnimatePresence>

      <TransactionReceipt tx={receiptTx} open={showReceipt} onClose={() => setShowReceipt(false)} />
    </div>
  );
}
