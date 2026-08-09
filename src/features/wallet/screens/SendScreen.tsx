import { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { cryptoAssets, chatContacts, type Screen, type Asset, type ChatContact, type Transaction } from '../../../shared/data/mockData';
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

interface SendScreenProps {
  navigate: (s: Screen) => void;
  goBack: () => void;
}

type Step = 'select' | 'recipient' | 'amount' | 'confirm' | 'sending' | 'success';

const genHash = () => '0x' + Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');
const shortenHash = (h: string) => `${h.slice(0, 10)}…${h.slice(-8)}`;

export function SendScreen({ navigate, goBack }: SendScreenProps) {
  const { format, currency } = useCurrency();

  const [step, setStep] = useState<Step>('select');
  const [recipient, setRecipient] = useState('');
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset>(cryptoAssets.find((a) => a.id === 'usdt')!);
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
      setSelectedAsset(cryptoAssets.find((a) => a.symbol.toUpperCase() === (prefill.asset ?? 'USDT').toUpperCase()) ?? cryptoAssets.find((a) => a.id === 'usdt')!);
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

  // Sending animation stages: 0=submit, 1=queued, 2=confirming, 3=finalized
  useEffect(() => {
    if (step !== 'sending') return;
    setSendingStage(0);
    const t1 = setTimeout(() => setSendingStage(1), 600);
    const t2 = setTimeout(() => setSendingStage(2), 1400);
    const t3 = setTimeout(() => {
      setSendingStage(3);
      const hash = genHash();
      setTxHash(hash);
      setReceiptTx({
        id: 'tx-' + Date.now(),
        type: 'send',
        asset: selectedAsset.symbol,
        amount: cryptoAmount.toFixed(6),
        valueUSD: Number(amount),
        status: 'confirmed',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        hash,
        address: recipient,
        username: selectedContact?.username ?? undefined,
      });
    }, 2400);
    const t4 = setTimeout(() => setStep('success'), 3200);
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3); clearTimeout(t4); };
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
    if (n > selectedAsset.valueUSD) { setError(`Insufficient balance. Max: ${format(selectedAsset.valueUSD)}`); return; }
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
    setSelectedAsset(cryptoAssets.find((a) => a.id === 'usdt')!);
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
