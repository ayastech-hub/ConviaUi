import { useState } from 'react';
import { cryptoAssets, type Asset, type Transaction } from '../../../shared/data/mockData';
import { WithdrawTokenList } from '../components/withdraw/WithdrawTokenList';
import { WithdrawForm } from '../components/withdraw/WithdrawForm';
import { WithdrawPinStep } from '../components/withdraw/WithdrawPinStep';
import { WithdrawProcessingStep } from '../components/withdraw/WithdrawProcessingStep';
import { WithdrawSuccessView } from '../components/withdraw/WithdrawSuccessView';
import { WalletFeatureBanner } from '../../../shared/components/WalletFeatureBanner';

interface WithdrawScreenProps {
  goBack: () => void;
}

export function WithdrawScreen({ goBack }: WithdrawScreenProps) {
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
    if (newPin.every((d) => d !== '') && newPin.join('') === '1234') {
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
    } else if (newPin.every((d) => d !== '') && newPin.join('') !== '1234') {
      setError('Incorrect PIN. Try again.');
      setPin(['', '', '', '']);
    }
  };

  if (step === 'select') {
    return <WithdrawTokenList assets={cryptoAssets} goBack={goBack} onSelect={handleSelectAsset} />;
  }

  if (step === 'success' && selectedAsset) {
    return (
      <WithdrawSuccessView
        amount={amount} symbol={selectedAsset.symbol} address={address} chain={selectedChain}
        receiptTx={receiptTx} showReceipt={showReceipt}
        onShowReceipt={() => setShowReceipt(true)} onCloseReceipt={() => setShowReceipt(false)}
        onDone={goBack}
      />
    );
  }

  if (step === 'processing') {
    return <WithdrawProcessingStep amount={amount} symbol={selectedAsset?.symbol ?? ''} chain={selectedChain} />;
  }

  if (step === 'pin') {
    return (
      <WithdrawPinStep
        pin={pin} onPinChange={handlePinChange} error={error}
        onCancel={() => { setStep('form'); setError(''); setPin(['', '', '', '']); }}
      />
    );
  }

  if (!selectedAsset) return null;

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div className="px-5 pt-12">
        <WalletFeatureBanner feature="withdraw" />
      </div>
      <WithdrawForm
        asset={selectedAsset}
        selectedChain={selectedChain} setSelectedChain={setSelectedChain}
        address={address} onAddressChange={validateAddress}
        amount={amount} onAmountChange={validateAmount}
        error={error} fee={fee} feeUSD={feeUSD}
        onChangeAsset={() => setStep('select')}
        onBack={() => setStep('select')}
        onContinue={() => { setStep('pin'); setError(''); setPin(['', '', '', '']); }}
      />
    </div>
  );
}
