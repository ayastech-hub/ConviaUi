import React, { useState, useRef, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, Search, ScanLine, ClipboardPaste, ChevronDown, CheckCircle2,
  ArrowUpRight, X, AlertCircle, RefreshCw, Pencil, FileText,
  Loader, Copy, Zap, ChevronRight,
} from 'lucide-react';
import { cryptoAssets, chatContacts, type Screen, type Asset, type ChatContact, type Transaction } from '../../../shared/data/mockData';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { AssetPicker } from '../../../shared/components/AssetPicker';
import { QRScanner } from '../../../shared/components/QRScanner';
import { parseQRPayload, consumeSendPrefill, type QRPayload } from '../../../shared/utils/qrPayload';
import { TransactionReceipt } from '../../../shared/components/TransactionReceipt';

interface SendScreenProps {
  navigate: (s: Screen) => void;
  goBack: () => void;
}

type Step = 'select' | 'recipient' | 'amount' | 'confirm' | 'sending' | 'success';

const STEPS: { key: Step; label: string }[] = [
  { key: 'recipient', label: 'Recipient' },
  { key: 'amount', label: 'Amount' },
  { key: 'confirm', label: 'Confirm' },
];;

const genHash = () =>
  '0x' + Array.from({ length: 64 }, () => '0123456789abcdef'[Math.floor(Math.random() * 16)]).join('');

const shortenHash = (h: string) => `${h.slice(0, 10)}…${h.slice(-8)}`;

export function SendScreen({ navigate, goBack }: SendScreenProps) {
  const { format, currency } = useCurrency();

  const [step, setStep] = useState<Step>('select');
  const [recipient, setRecipient] = useState('');
  const [selectedContact, setSelectedContact] = useState<ChatContact | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset>(cryptoAssets.find(a => a.id === 'usdt')!);
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
      const matched = cryptoAssets.find(a => a.symbol.toUpperCase() === payload.asset!.toUpperCase());
      if (matched) setSelectedAsset(matched);
    }
    if (payload.amount && Number(payload.amount) > 0) {
      setAmount(payload.amount);
    }
    setStep('amount');
  }, []);

  // Consume any prefill from Home scanner
  useEffect(() => {
    const prefill = consumeSendPrefill();
    if (prefill) {
      setSelectedAsset(cryptoAssets.find(a => a.symbol.toUpperCase() === (prefill.asset ?? 'USDT').toUpperCase()) ?? cryptoAssets.find(a => a.id === 'usdt')!);
      applyScanResult(prefill);
    }
  }, [applyScanResult]);

  const holdTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const holdStart = useRef<number>(0);
  const addressInputRef = useRef<HTMLInputElement>(null);

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
  }, [step]);

  const fee = useMemo(() => {
    const n = Number(amount) || 0;
    return n * 0.001;
  }, [amount]);
  const total = useMemo(() => (Number(amount) || 0) + fee, [amount, fee]);
  const cryptoAmount = useMemo(() => {
    const n = Number(amount) || 0;
    return n > 0 && selectedAsset.price > 0 ? n / selectedAsset.price : 0;
  }, [amount, selectedAsset]);

  const filteredContacts = useMemo(() => {
    if (!search.trim()) return chatContacts;
    const q = search.toLowerCase();
    return chatContacts.filter(
      c => c.name.toLowerCase().includes(q) || c.username.toLowerCase().includes(q),
    );
  }, [search]);

  const validateAmount = useCallback(
    (val: string) => {
      setAmount(val);
      const n = Number(val);
      if (val === '') { setError(''); return; }
      if (Number.isNaN(n) || n < 0) { setError('Enter a valid amount'); return; }
      if (n > selectedAsset.valueUSD) {
        setError(`Insufficient balance. Max: ${format(selectedAsset.valueUSD)}`);
        return;
      }
      setError('');
    },
    [selectedAsset, format],
  );

  const setPct = (pct: number) => {
    const val = (selectedAsset.valueUSD * pct) / 100;
    validateAmount(val.toFixed(2));
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setRecipient(text.trim());
        setSelectedContact(null);
        addressInputRef.current?.focus();
      }
    } catch {
      // clipboard not available — no-op
    }
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
    setSelectedAsset(cryptoAssets.find(a => a.id === 'usdt')!);
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
    try { await navigator.clipboard.writeText(txHash); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch {}
  };

  const stepIndex = STEPS.findIndex(s => s.key === step);
  const showStepper = step === 'recipient' || step === 'amount' || step === 'confirm';
  const canContinueAmount = Number(amount) > 0 && !error;

  return (
    <div className="flex flex-col h-full relative overflow-hidden" style={{ background: 'var(--background)' }}>
      {/* Header */}
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

      {/* Step indicator */}
      <AnimatePresence>
        {showStepper && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center gap-1.5 px-5 mb-4"
          >
            {STEPS.map((s, i) => {
              const active = i === stepIndex;
              const done = i < stepIndex;
              return (
                <React.Fragment key={s.key}>
                  <div className="flex items-center gap-1.5">
                    <motion.div
                      animate={{ scale: active ? 1.1 : 1 }}
                      className="w-7 h-7 rounded-full flex items-center justify-center"
                      style={{
                        background: done || active ? 'var(--primary)' : 'var(--muted)',
                      }}
                    >
                      {done ? (
                        <CheckCircle2 size={14} style={{ color: '#fff' }} />
                      ) : (
                        <span style={{ color: '#fff', fontSize: 11, fontWeight: 700 }}>{i + 1}</span>
                      )}
                    </motion.div>
                    <span
                      style={{
                        fontSize: 11,
                        fontWeight: active ? 700 : 500,
                        color: done || active ? 'var(--primary)' : 'var(--muted-foreground)',
                      }}
                    >
                      {s.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 rounded-full" style={{ background: done ? 'var(--primary)' : 'var(--border)' }} />
                  )}
                </React.Fragment>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Body */}
      <div className="flex-1 overflow-y-auto px-5 pb-6">
        <AnimatePresence mode="wait">
          {/* ─────────────── STEP 0: TOKEN SELECT ─────────────── */}
          {step === 'select' && (
            <motion.div
              key="select"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 16 }}>Select a token to send</p>
              {cryptoAssets.map((asset, i) => (
                <motion.button
                  key={asset.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => { setSelectedAsset(asset); setStep('recipient'); }}
                  className="flex items-center gap-3 p-4 rounded-[16px] mb-3 w-full text-left"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <AssetIcon symbol={asset.symbol} size={40} />
                  <div className="flex-1">
                    <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{asset.symbol}</p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{asset.name}</p>
                  </div>
                  <div className="text-right">
                    <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{asset.balance.toFixed(4)}</p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{format(asset.valueUSD)}</p>
                  </div>
                  <ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />
                </motion.button>
              ))}
            </motion.div>
          )}

          {/* ─────────────── STEP 1: RECIPIENT ─────────────── */}
          {step === 'recipient' && (
            <motion.div
              key="recipient"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {/* Search bar */}
              <div className="flex items-center gap-2 px-4 py-3 rounded-[14px] mb-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <Search size={16} style={{ color: 'var(--muted-foreground)' }} />
                <input
                  placeholder="Search contacts…"
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="flex-1 bg-transparent outline-none"
                  style={{ color: 'var(--foreground)', fontSize: 14 }}
                  autoFocus
                />
                {search && (
                  <button onClick={() => setSearch('')} className="flex items-center justify-center w-5 h-5">
                    <X size={14} style={{ color: 'var(--muted-foreground)' }} />
                  </button>
                )}
              </div>

              {/* Recent contacts */}
              <div className="flex items-center justify-between mb-3">
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>Recent contacts</p>
                <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{filteredContacts.length}</span>
              </div>
              <div className="flex flex-col gap-2 mb-5">
                {filteredContacts.map((contact, i) => (
                  <motion.button
                    key={contact.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => selectContact(contact)}
                    className="flex items-center gap-3 p-3 rounded-[16px]"
                    style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                  >
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white relative" style={{ background: contact.color, fontSize: 13, fontWeight: 700 }}>
                      {contact.initials}
                      {contact.online && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 rounded-full" style={{ background: 'var(--positive)', border: '2px solid var(--background)' }} />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{contact.name}</p>
                      <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>@{contact.username}</p>
                    </div>
                    {contact.online && <div className="w-2 h-2 rounded-full" style={{ background: 'var(--foreground)' }} />}
                  </motion.button>
                ))}
                {filteredContacts.length === 0 && (
                  <div className="flex flex-col items-center justify-center py-8">
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>No contacts found</p>
                  </div>
                )}
              </div>

              {/* Manual address input */}
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600, marginBottom: 8 }}>Or enter address</p>
              <div className="flex items-center gap-2 px-4 py-3 rounded-[14px] mb-3" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <input
                  ref={addressInputRef}
                  placeholder="0x… or @username"
                  value={recipient}
                  onChange={e => { setRecipient(e.target.value); setSelectedContact(null); }}
                  className="flex-1 bg-transparent outline-none"
                  style={{ color: 'var(--foreground)', fontSize: 14, fontFamily: recipient.startsWith('0x') ? 'monospace' : 'inherit' }}
                />
                <button onClick={handlePaste} className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg" style={{ background: 'var(--muted)' }}>
                  <ClipboardPaste size={13} style={{ color: 'var(--foreground)' }} />
                  <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>Paste</span>
                </button>
              </div>

              {/* Scan QR + Asset selector */}
              <div className="flex gap-3 mb-5">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setScanning(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px]"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <ScanLine size={18} style={{ color: 'var(--foreground)' }} />
                  <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>Scan QR</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowPicker(true)}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px]"
                  style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
                >
                  <AssetIcon symbol={selectedAsset.symbol} size={22} />
                  <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{selectedAsset.symbol}</span>
                  <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
                </motion.button>
              </div>

              {/* Continue */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!recipient.trim()}
                onClick={() => setStep('amount')}
                className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2"
                style={{
                  background: recipient.trim() ? 'var(--primary)' : 'var(--muted)',
                  color: recipient.trim() ? '#fff' : 'var(--muted-foreground)',
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                Continue
                <ArrowUpRight size={18} />
              </motion.button>
            </motion.div>
          )}

          {/* ─────────────── STEP 2: AMOUNT ─────────────── */}
          {step === 'amount' && (
            <motion.div
              key="amount"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {/* Recipient preview */}
              <div className="flex items-center gap-3 p-3 rounded-[16px] mb-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-white" style={{ background: selectedContact?.color ?? 'var(--primary)', fontSize: 12, fontWeight: 700 }}>
                  {selectedContact?.initials ?? recipient.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }} className="truncate">
                    {selectedContact?.name ?? recipient}
                  </p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }} className="truncate">
                    {selectedContact ? `@${recipient}` : recipient}
                  </p>
                </div>
                <button onClick={() => setStep('recipient')} className="flex items-center justify-center w-8 h-8 rounded-full" style={{ background: 'var(--muted)' }}>
                  <Pencil size={14} style={{ color: 'var(--foreground)' }} />
                </button>
              </div>

              {/* Asset selector */}
              <div className="flex items-center justify-between mb-4">
                <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>Sending</span>
                <motion.button whileTap={{ scale: 0.95 }} onClick={() => setShowPicker(true)} className="flex items-center gap-2 px-3 py-2 rounded-xl" style={{ background: 'var(--muted)' }}>
                  <AssetIcon symbol={selectedAsset.symbol} size={20} />
                  <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{selectedAsset.symbol}</span>
                  <ChevronDown size={14} style={{ color: 'var(--muted-foreground)' }} />
                </motion.button>
              </div>

              {/* Balance */}
              <div className="flex items-center justify-between mb-4">
                <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Available balance</span>
                <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
                  {selectedAsset.balance.toFixed(4)} {selectedAsset.symbol} · {format(selectedAsset.valueUSD)}
                </span>
              </div>

              {/* Amount input */}
              <div className="text-center py-6 rounded-[20px] mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 32, fontWeight: 700 }}>{currency.symbol}</span>
                  <input
                    type="number"
                    inputMode="decimal"
                    placeholder="0"
                    value={amount}
                    onChange={e => validateAmount(e.target.value)}
                    className="bg-transparent outline-none text-center"
                    style={{ color: 'var(--foreground)', fontSize: 44, fontWeight: 800, width: '60%', letterSpacing: -2 }}
                    autoFocus
                  />
                </div>
                {amount && Number(amount) > 0 && (
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                    ≈ {cryptoAmount.toFixed(6)} {selectedAsset.symbol}
                  </p>
                )}
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="flex items-center gap-2 mb-3 px-3"
                  >
                    <AlertCircle size={14} style={{ color: 'var(--destructive)' }} />
                    <p style={{ color: 'var(--destructive)', fontSize: 12 }}>{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Quick percentage buttons */}
              <div className="flex gap-2 mb-5">
                {[
                  { label: '25%', pct: 25 },
                  { label: '50%', pct: 50 },
                  { label: '75%', pct: 75 },
                  { label: 'Max', pct: 100 },
                ].map(b => (
                  <motion.button
                    key={b.label}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPct(b.pct)}
                    className="flex-1 py-2 rounded-xl"
                    style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}
                  >
                    {b.label}
                  </motion.button>
                ))}
              </div>

              {/* Network fee */}
              <div className="flex items-center justify-between py-3 px-4 rounded-[14px] mb-5" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2">
                  <Zap size={14} style={{ color: 'var(--warning)' }} />
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Network fee</span>
                </div>
                <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
                  {format(fee)} · {selectedAsset.chains[0]}
                </span>
              </div>

              {/* Continue */}
              <motion.button
                whileTap={{ scale: 0.97 }}
                disabled={!canContinueAmount}
                onClick={() => setStep('confirm')}
                className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2"
                style={{
                  background: canContinueAmount ? 'var(--primary)' : 'var(--muted)',
                  color: canContinueAmount ? '#fff' : 'var(--muted-foreground)',
                  fontWeight: 700,
                  fontSize: 15,
                }}
              >
                Review Transaction
                <ArrowUpRight size={18} />
              </motion.button>
            </motion.div>
          )}

          {/* ─────────────── STEP 3: CONFIRM ─────────────── */}
          {step === 'confirm' && (
            <motion.div
              key="confirm"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -30 }}
              transition={{ duration: 0.25 }}
            >
              {/* Summary card */}
              <div className="rounded-[20px] p-5 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                {/* Recipient */}
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center text-white" style={{ background: selectedContact?.color ?? 'var(--primary)', fontSize: 20, fontWeight: 700 }}>
                    {selectedContact?.initials ?? recipient.charAt(0).toUpperCase()}
                  </div>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 2 }}>Sending to</p>
                  <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{selectedContact?.name ?? recipient}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontFamily: 'monospace', marginTop: 4, wordBreak: 'break-all' }}>
                    {selectedContact ? `@${recipient}` : recipient}
                  </p>
                </div>

                {/* Amount */}
                <div className="text-center mb-6">
                  <p style={{ color: 'var(--foreground)', fontSize: 40, fontWeight: 800, letterSpacing: -2 }}>
                    {format(Number(amount))}
                  </p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
                    ≈ {cryptoAmount.toFixed(6)} {selectedAsset.symbol}
                  </p>
                </div>

                {/* Details */}
                <div className="space-y-0">
                  {[
                    { label: 'From', value: 'My Wallet' },
                    { label: 'Asset', value: selectedAsset.name },
                    { label: 'Network', value: selectedAsset.chains[0] },
                    { label: 'Network fee', value: format(fee) },
                  ].map((row, i) => (
                    <div key={row.label} className="flex justify-between items-center py-3" style={{ borderBottom: i < 3 ? '1px solid var(--border)' : 'none' }}>
                      <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{row.label}</span>
                      <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 500 }}>{row.value}</span>
                    </div>
                  ))}
                  <div className="flex justify-between items-center pt-3">
                    <span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 700 }}>Total deducted</span>
                    <span style={{ color: 'var(--foreground)', fontSize: 16, fontWeight: 800 }}>{format(total)}</span>
                  </div>
                </div>
              </div>

              {/* Edit */}
              <div className="flex justify-center mb-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setStep('amount')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl"
                  style={{ background: 'var(--muted)' }}
                >
                  <Pencil size={13} style={{ color: 'var(--foreground)' }} />
                  <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>Edit details</span>
                </motion.button>
              </div>

              {/* Hold to Confirm */}
              <div className="relative">
                <motion.button
                  onPointerDown={startHold}
                  onPointerUp={cancelHold}
                  onPointerLeave={cancelHold}
                  className="relative w-full py-4 rounded-[16px] text-white flex items-center justify-center gap-2 overflow-hidden select-none"
                  style={{
                    background: canContinueAmount ? 'var(--primary)' : 'var(--muted)',
                    color: canContinueAmount ? '#fff' : 'var(--muted-foreground)',
                    fontWeight: 700,
                    fontSize: 15,
                    boxShadow: canContinueAmount ? 'none' : 'none',
                    touchAction: 'none',
                  }}
                >
                  {/* Progress fill */}
                  <motion.div
                    className="absolute inset-0"
                    style={{ background: 'var(--positive)' }}
                    animate={{ width: `${confirmProgress * 100}%` }}
                    transition={{ duration: 0.03 }}
                  />
                  <span className="relative z-10 flex items-center gap-2">
                    {holding ? (
                      <>
                        <Loader size={18} className="animate-spin" />
                        Hold to confirm… {Math.round(confirmProgress * 100)}%
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={18} />
                        Hold to Confirm
                      </>
                    )}
                  </span>
                </motion.button>
              </div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11, textAlign: 'center', marginTop: 8 }}>
                Press and hold for 1.5 seconds to authorize
              </p>
            </motion.div>
          )}

          {/* ─────────────── STEP 4: SENDING ─────────────── */}
          {step === 'sending' && (
            <motion.div
              key="sending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center text-center py-16"
            >
              {/* Blockchain visualization */}
              <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
                {/* Outer ring */}
                <motion.div
                  className="absolute inset-0 rounded-full"
                  style={{ border: '2px solid var(--border)' }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full" style={{ background: 'var(--foreground)' }} />
                </motion.div>
                {/* Middle ring */}
                <motion.div
                  className="absolute rounded-full"
                  style={{ inset: 16, border: '2px dashed var(--border)' }}
                  animate={{ rotate: -360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                >
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full" style={{ background: 'var(--positive)' }} />
                </motion.div>
                {/* Inner pulsing core */}
                <motion.div
                  className="absolute rounded-full flex items-center justify-center"
                  style={{ inset: 40, background: 'var(--primary)' }}
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                >
                  <ArrowUpRight size={28} style={{ color: '#fff' }} />
                </motion.div>
              </div>

              <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, marginBottom: 6 }}>
                Sending…
              </h2>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginBottom: 8 }}>
                {format(Number(amount))} to {selectedContact?.name ?? recipient}
              </p>

              {/* Stage indicators */}
              <div className="flex items-center gap-2 mt-4">
                {['Submitted', 'Queued', 'Confirming', 'Finalized'].map((label, i) => (
                  <div key={label} className="flex items-center gap-2">
                    <motion.div
                      className="w-2.5 h-2.5 rounded-full"
                      animate={{
                        background: sendingStage >= i ? 'var(--positive)' : 'var(--muted)',
                        scale: sendingStage === i ? [1, 1.4, 1] : 1,
                      }}
                      transition={{ duration: 0.6, repeat: sendingStage === i ? Infinity : 0 }}
                    />
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: sendingStage >= i ? 700 : 400,
                        color: sendingStage >= i ? 'var(--foreground)' : 'var(--muted-foreground)',
                      }}
                    >
                      {label}
                    </span>
                    {i < 3 && <div className="w-4 h-px" style={{ background: 'var(--border)' }} />}
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* ─────────────── STEP 5: SUCCESS ─────────────── */}
          {step === 'success' && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center text-center py-10"
            >
              {/* Green checkmark */}
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: 'spring', stiffness: 200, damping: 14, delay: 0.1 }}
                className="w-24 h-24 rounded-full flex items-center justify-center mb-6"
                style={{ background: 'var(--muted)' }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 240 }}
                >
                  <CheckCircle2 size={56} style={{ color: 'var(--positive)' }} />
                </motion.div>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, marginBottom: 6 }}
              >
                Sent Successfully
              </motion.h2>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                style={{ color: 'var(--muted-foreground)', fontSize: 14, marginBottom: 4 }}
              >
                {format(Number(amount))} sent to {selectedContact?.name ?? recipient}
              </motion.p>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.55 }}
                style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 24 }}
              >
                {cryptoAmount.toFixed(6)} {selectedAsset.symbol} · Confirmed on {selectedAsset.chains[0]}
              </motion.p>

              {/* Transaction hash */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex items-center gap-2 px-4 py-3 rounded-[14px] mb-3 w-full"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <span style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>TX HASH</span>
                <span className="flex-1 text-left" style={{ color: 'var(--foreground)', fontSize: 11, fontFamily: 'monospace' }}>
                  {shortenHash(txHash)}
                </span>
                <button onClick={copyHash} className="flex items-center justify-center w-7 h-7 rounded-lg" style={{ background: 'var(--muted)' }}>
                  {copied ? <CheckCircle2 size={13} style={{ color: 'var(--positive)' }} /> : <Copy size={13} style={{ color: 'var(--foreground)' }} />}
                </button>
              </motion.div>

              {/* View Receipt */}
              <motion.button
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.65 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowReceipt(true)}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-[16px] mb-3"
                style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
              >
                <FileText size={16} style={{ color: 'var(--foreground)' }} />
                <span style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>View Receipt</span>
              </motion.button>

              {/* Send Another + Done */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="flex gap-3 w-full"
              >
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={reset}
                  className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-[16px]"
                  style={{ background: 'var(--muted)' }}
                >
                  <RefreshCw size={16} style={{ color: 'var(--foreground)' }} />
                  <span style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>Send Another</span>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('home')}
                  className="flex-1 py-3.5 rounded-[16px] text-white"
                  style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}
                >
                  Done
                </motion.button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Asset Picker */}
      <AssetPicker
        open={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(a: Asset) => setSelectedAsset(a)}
        title="Select token to send"
      />

      {/* QR Scanner overlay */}
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
