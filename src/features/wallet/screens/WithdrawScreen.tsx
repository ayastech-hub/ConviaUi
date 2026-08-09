import { useState } from 'react';
import { motion } from 'motion/react';
import {
  ChevronLeft, ChevronDown, AlertCircle, CheckCircle2, Loader, Lock, X,
  Receipt, ChevronRight,
} from 'lucide-react';
import { cryptoAssets, type Screen, type Asset, type Transaction } from '../../../shared/data/mockData';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { TransactionReceipt } from '../../../shared/components/TransactionReceipt';

interface WithdrawScreenProps {
  goBack: () => void;
}

export function WithdrawScreen({ goBack }: WithdrawScreenProps) {
  const { format } = useCurrency();
  const [step, setStep] = useState<'select' | 'form' | 'pin' | 'processing' | 'success'>('select');
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [selectedChain, setSelectedChain] = useState<string>('');
  const [address, setAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [pin, setPin] = useState(['', '', '', '']);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const fee = selectedAsset ? (selectedAsset.symbol === 'BTC' ? 0.00005 : selectedAsset.symbol === 'ETH' ? 0.002 : 1.0) : 0;
  const feeUSD = selectedAsset ? fee * selectedAsset.price : 0;

  const handleSelectAsset = (asset: Asset) => {
    setSelectedAsset(asset);
    setSelectedChain(asset.chains[0]);
    setStep('form');
  };

  const validateAddress = (addr: string) => {
    setAddress(addr);
    if (!addr) { setError(''); return; }
    const isEth = addr.startsWith('0x') && addr.length === 42;
    const isSol = addr.length >= 32 && addr.length <= 44 && /^[A-Za-z0-9]+$/.test(addr);
    if (!isEth && !isSol) setError('Invalid address format. Check the address and try again.');
    else setError('');
  };

  const validateAmount = (val: string) => {
    setAmount(val);
    const num = Number(val);
    if (selectedAsset && num > selectedAsset.balance) {
      setError(`Insufficient balance. Max: ${selectedAsset.balance.toFixed(4)} ${selectedAsset.symbol}`);
    } else setError('');
  };

  const handlePinChange = (index: number, val: string) => {
    if (!/^\d?$/.test(val)) return;
    const newPin = [...pin];
    newPin[index] = val;
    setPin(newPin);
    if (val && index < 3) document.getElementById(`pin-${index + 1}`)?.focus();
    if (newPin.every(d => d !== '') && newPin.join('') === '1234') {
      setStep('processing');
      setTimeout(() => {
        if (selectedAsset) {
          setReceiptTx({
            id: 'w_' + Date.now(),
            type: 'withdraw',
            asset: selectedAsset.symbol,
            amount: parseFloat(amount),
            valueUSD: parseFloat(amount) * selectedAsset.price,
            status: 'confirmed',
            time: 'Just now',
            address,
          });
        }
        setStep('success');
      }, 2500);
    } else if (newPin.every(d => d !== '') && newPin.join('') !== '1234') {
      setError('Incorrect PIN. Try again.');
      setPin(['', '', '', '']);
    }
  };

  // Token selection screen
  if (step === 'select') {
    return (
      <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
        <div style={{ height: 50 }} />
        <div className="flex items-center gap-3 px-5 mb-6">
          <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} aria-label="Back" className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
          </motion.button>
          <div>
            <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, lineHeight: 1.1 }}>Withdraw</h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 2 }}>Select a token to withdraw</p>
          </div>
        </div>

        <div className="px-5 pb-5">
          {cryptoAssets.map((asset, i) => (
            <motion.button
              key={asset.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => handleSelectAsset(asset)}
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
        </div>
        <div style={{ height: 60 }} />
      </div>
    );
  }

  // Success screen
  if (step === 'success' && selectedAsset) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-5" style={{ background: 'var(--background)' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center w-full">
          <div className="w-24 h-24 rounded-full mx-auto mb-6 flex items-center justify-center" style={{ background: 'var(--muted)' }}>
            <CheckCircle2 size={52} style={{ color: 'var(--positive)' }} />
          </div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 8, fontSize: 22 }}>Withdrawal Submitted!</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 14, marginBottom: 4 }}>{amount} {selectedAsset.symbol} sent to</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontFamily: 'monospace', marginBottom: 4 }}>{address.slice(0, 16)}...{address.slice(-8)}</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 32 }}>Network: {selectedChain} · Estimated arrival: 5-30 min</p>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowReceipt(true)}
            className="w-full py-3.5 rounded-[16px] flex items-center justify-center gap-2 mb-3"
            style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}
          >
            <Receipt size={18} style={{ color: 'var(--foreground)' }} />
            View Receipt
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={goBack} className="w-full py-3.5 rounded-[16px] text-white" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15, boxShadow: 'none' }}>
            Done
          </motion.button>
        </motion.div>
        <TransactionReceipt tx={receiptTx} open={showReceipt} onClose={() => setShowReceipt(false)} />
      </div>
    );
  }

  if (step === 'processing') {
    return (
      <div className="flex flex-col h-full items-center justify-center px-5" style={{ background: 'var(--background)' }}>
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center mb-6" style={{ background: 'var(--muted)' }}>
          <Loader size={36} className="animate-spin" style={{ color: 'var(--foreground)' }} />
        </div>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 4 }}>Processing Withdrawal...</h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>Sending {amount} {selectedAsset?.symbol} on {selectedChain}</p>
      </div>
    );
  }

  if (step === 'pin') {
    return (
      <div className="flex flex-col h-full items-center justify-center px-5" style={{ background: 'var(--background)' }}>
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center w-full">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mx-auto mb-6" style={{ background: 'var(--muted)' }}>
            <Lock size={28} style={{ color: 'var(--foreground)' }} />
          </div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 4 }}>Enter PIN</h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 32 }}>Enter your 4-digit PIN to confirm withdrawal</p>
          <div className="flex gap-3 justify-center mb-6">
            {pin.map((d, i) => (
              <input
                key={i}
                id={`pin-${i}`}
                type="password"
                inputMode="numeric"
                maxLength={1}
                value={d}
                onChange={e => handlePinChange(i, e.target.value)}
                className="w-14 h-14 rounded-2xl text-center"
                style={{ background: 'var(--card)', border: `2px solid ${d ? 'var(--primary)' : 'var(--border)'}`, color: 'var(--foreground)', fontSize: 24, fontWeight: 800, outline: 'none' }}
                autoFocus={i === 0}
              />
            ))}
          </div>
          {error && <p style={{ color: 'var(--destructive)', fontSize: 13, marginBottom: 16 }}>{error}</p>}
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginBottom: 24 }}>Demo PIN: 1234</p>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => { setStep('form'); setError(''); setPin(['', '', '', '']); }} className="w-full py-3.5 rounded-[16px]" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 600, fontSize: 15 }}>
            Cancel
          </motion.button>
        </motion.div>
      </div>
    );
  }

  // Form step
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <div className="flex items-center gap-3 px-5 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={() => setStep('select')} aria-label="Back" className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20 }}>Withdraw {selectedAsset?.symbol}</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        {/* Asset display */}
        <div className="flex items-center gap-3 px-4 py-3.5 rounded-[14px] mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <AssetIcon symbol={selectedAsset!.symbol} size={32} />
          <div className="flex-1 text-left">
            <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{selectedAsset!.symbol}</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Balance: {selectedAsset!.balance.toFixed(4)} · {format(selectedAsset!.valueUSD)}</p>
          </div>
          <button onClick={() => setStep('select')} className="px-3 py-1.5 rounded-lg" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 12, fontWeight: 600 }}>Change</button>
        </div>

        {/* Network */}
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>Network</p>
        <div className="flex gap-2 flex-wrap mb-4">
          {selectedAsset!.chains.map(chain => (
            <motion.button
              key={chain}
              whileTap={{ scale: 0.93 }}
              onClick={() => setSelectedChain(chain)}
              className="px-3 py-2 rounded-[12px]"
              style={{ background: selectedChain === chain ? 'var(--primary)' : 'var(--card)', color: selectedChain === chain ? '#FFF' : 'var(--foreground)', fontSize: 13, fontWeight: 600, border: `1px solid ${selectedChain === chain ? 'transparent' : 'var(--border)'}` }}
            >
              {chain}
            </motion.button>
          ))}
        </div>

        {/* Address */}
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>Destination Address</p>
        <div className="px-4 py-3 rounded-[14px] mb-4" style={{ background: 'var(--card)', border: `1px solid ${error && address ? 'var(--muted)' : 'var(--border)'}` }}>
          <input
            placeholder={`Paste ${selectedChain} address...`}
            value={address}
            onChange={e => validateAddress(e.target.value)}
            className="w-full bg-transparent outline-none"
            style={{ color: 'var(--foreground)', fontSize: 13 }}
          />
        </div>

        {/* Amount */}
        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 6 }}>Amount</p>
        <div className="rounded-[14px] p-4 mb-2" style={{ background: 'var(--card)', border: `1px solid ${error && amount ? 'var(--muted)' : 'var(--border)'}` }}>
          <div className="flex items-center gap-3">
            <AssetIcon symbol={selectedAsset!.symbol} size={28} />
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={e => validateAmount(e.target.value)}
              className="flex-1 bg-transparent outline-none"
              style={{ color: 'var(--foreground)', fontSize: 24, fontWeight: 800 }}
            />
            <button onClick={() => validateAmount(selectedAsset!.balance.toFixed(4))} className="px-3 py-1 rounded-lg" style={{ background: 'var(--secondary)', color: 'var(--foreground)', fontSize: 12, fontWeight: 700 }}>MAX</button>
          </div>
          {amount && <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginTop: 4 }}>≈ {format(Number(amount) * selectedAsset!.price)}</p>}
        </div>

        {error && (
          <div className="flex items-center gap-2 mb-4">
            <AlertCircle size={14} style={{ color: 'var(--destructive)', flexShrink: 0 }} />
            <p style={{ color: 'var(--destructive)', fontSize: 12 }}>{error}</p>
          </div>
        )}

        {amount && address && !error && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-[14px] mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            {[
              { label: 'Amount', value: `${amount} ${selectedAsset!.symbol}` },
              { label: 'Network fee', value: `${fee} ${selectedAsset!.symbol} (~${format(feeUSD)})` },
              { label: 'Total', value: `${(Number(amount) + fee).toFixed(6)} ${selectedAsset!.symbol}`, bold: true },
            ].map(row => (
              <div key={row.label} className="flex justify-between py-1.5">
                <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{row.label}</span>
                <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: row.bold ? 700 : 500 }}>{row.value}</span>
              </div>
            ))}
          </motion.div>
        )}

        <div className="flex items-start gap-2 p-3 rounded-[12px] mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}>
          <AlertCircle size={14} style={{ color: 'var(--destructive)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.5 }}>Double-check the address. Withdrawals cannot be reversed once submitted.</p>
        </div>

        <motion.button
          whileTap={{ scale: 0.97 }}
          onClick={() => { setStep('pin'); setError(''); setPin(['', '', '', '']); }}
          disabled={!amount || !address || !!error}
          className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2"
          style={{ background: amount && address && !error ? 'var(--primary)' : 'var(--muted)', fontWeight: 700, fontSize: 15, boxShadow: amount && address && !error ? 'none' : 'none' }}
        >
          Continue
        </motion.button>
        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}
