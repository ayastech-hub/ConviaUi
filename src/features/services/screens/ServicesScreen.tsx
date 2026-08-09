import { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import type { Screen, Transaction } from '../../../shared/data/mockData';
import { TransactionReceipt } from '../../../shared/components/TransactionReceipt';
import { SERVICE_GROUPS, isBillService, type ServiceItem } from '../components/serviceData';
import { ServiceHub } from '../components/ServiceHub';
import { ProviderSelector } from '../components/ProviderSelector';
import { ServiceAmountInput } from '../components/ServiceAmountInput';
import { PaymentSummaryCard } from '../components/PaymentSummaryCard';
import { ServicePaymentSuccess, type ServiceSuccessInfo } from '../components/ServicePaymentSuccess';

interface ServicesScreenProps {
  navigate: (s: Screen) => void;
  goBack: () => void;
  switchTab: (s: Screen) => void;
}

export function ServicesScreen({ navigate, switchTab }: ServicesScreenProps) {
  const [activeService, setActiveService] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState('');
  const [meterNumber, setMeterNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [step, setStep] = useState<'hub' | 'detail' | 'success'>('hub');
  const [successInfo, setSuccessInfo] = useState<ServiceSuccessInfo | null>(null);
  const [receiptTx, setReceiptTx] = useState<Transaction | null>(null);

  const activeItem = SERVICE_GROUPS.flatMap((g) => g.items).find((i) => i.id === activeService);

  const handleServiceClick = (item: ServiceItem) => {
    if (isBillService(item.id)) {
      setActiveService(item.id);
      setSelectedProvider(null);
      setSelectedAmount(null);
      setCustomAmount('');
      setMeterNumber('');
      setPhoneNumber('');
      setStep('detail');
    } else {
      navigate(item.id as Screen);
    }
  };

  const handlePay = () => {
    const amount = selectedAmount ?? parseFloat(customAmount);
    if (!amount || !selectedProvider) return;
    setSuccessInfo({ label: activeItem?.label ?? '', amount, provider: selectedProvider });
    setReceiptTx({
      id: 'svc_' + Date.now(),
      type: 'send',
      asset: 'USD',
      amount,
      valueUSD: amount,
      status: 'confirmed',
      time: 'Just now',
      username: selectedProvider,
    });
    setStep('success');
  };

  const canPay = () => {
    const amount = selectedAmount ?? parseFloat(customAmount);
    if (!amount || amount <= 0 || !selectedProvider) return false;
    if (activeService === 'electricity' && meterNumber.length < 8) return false;
    if ((activeService === 'data' || activeService === 'airtime') && phoneNumber.length < 9) return false;
    return true;
  };

  const reset = () => {
    setActiveService(null);
    setSelectedProvider(null);
    setSelectedAmount(null);
    setCustomAmount('');
    setMeterNumber('');
    setPhoneNumber('');
    setStep('hub');
    setSuccessInfo(null);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center gap-3 px-5 mb-6">
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={() => { if (step === 'hub') switchTab('home'); else reset(); }}
          aria-label="Back"
          className="w-10 h-10 rounded-2xl flex items-center justify-center"
          style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
        >
          <ArrowLeft size={18} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div>
          <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 24, letterSpacing: -0.5, lineHeight: 1.1 }}>
            {step === 'hub' ? 'Service Hub' : activeItem?.label ?? ''}
          </h1>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginTop: 2 }}>
            {step === 'hub' ? 'Everything you need in one place' : step === 'success' ? 'Payment complete' : 'Choose provider & amount'}
          </p>
        </div>
      </div>

      {step === 'hub' && <ServiceHub onSelectService={handleServiceClick} />}

      {step === 'detail' && activeItem && (
        <div className="px-5 pb-5">
          <div className="flex items-center gap-3 mb-5 p-4 rounded-[16px]" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center glass-card glass-refraction" style={{ background: 'var(--muted)' }}>
              <activeItem.icon size={20} style={{ color: 'var(--foreground)' }} />
            </div>
            <div>
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>{activeItem.label}</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{activeItem.description}</p>
            </div>
          </div>

          {!selectedProvider && activeService && (
            <ProviderSelector serviceId={activeService} onSelect={setSelectedProvider} />
          )}

          {selectedProvider && activeService && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
              <ServiceAmountInput
                serviceId={activeService}
                phoneNumber={phoneNumber} setPhoneNumber={setPhoneNumber}
                meterNumber={meterNumber} setMeterNumber={setMeterNumber}
                selectedAmount={selectedAmount} setSelectedAmount={setSelectedAmount}
                customAmount={customAmount} setCustomAmount={setCustomAmount}
              />
              <PaymentSummaryCard
                provider={selectedProvider}
                serviceLabel={activeItem.label}
                displayAmount={String(selectedAmount ?? (customAmount || '0'))}
                canPay={canPay()}
                onPay={handlePay}
              />
            </motion.div>
          )}
        </div>
      )}

      {step === 'success' && successInfo && (
        <ServicePaymentSuccess
          info={successInfo}
          onNewPayment={reset}
          onViewReceipt={() => setReceiptTx(receiptTx)}
          onBackToHome={() => switchTab('home')}
        />
      )}

      <TransactionReceipt tx={receiptTx} open={!!receiptTx} onClose={() => setReceiptTx(null)} />

      <div style={{ height: 100 }} />
    </div>
  );
}
