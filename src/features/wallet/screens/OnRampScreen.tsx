import { useState, useEffect } from 'react';
import { type Asset } from '../../../shared/data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { usePaymentMethods, type SavedCard } from '../../../shared/context/PaymentMethodsContext';
import type { PaymentMethod, NewCardDraft } from '../components/onramp/PaymentMethodSelector';
import { OnRampFormStep } from '../components/onramp/OnRampFormStep';
import { OnRampReviewStep } from '../components/onramp/OnRampReviewStep';
import { OnRampInstructionsStep } from '../components/onramp/OnRampInstructionsStep';
import { OnRampProcessingStep, OnRampDoneStep } from '../components/onramp/OnRampStatusSteps';
import { WalletFeatureBanner } from '../../../shared/components/WalletFeatureBanner';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { useAuth } from '../../../shared/context/AuthContext';
import * as fiatApi from '../../../shared/api/fiat';
import { ApiError } from '../../../shared/api/types';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';

interface OnRampScreenProps {
  goBack: () => void;
}

export function OnRampScreen({ goBack }: OnRampScreenProps) {
  const { assets: cryptoAssets, loading: registryLoading } = useWalletAssets();
  useEffect(() => {
    if (!cryptoAssets.length) return;
  }, [cryptoAssets]);
  const { userId, email: authEmail } = useAuth();
  const [apiError, setApiError] = useState<{ code?: string; message?: string } | null>(null);

  const { currency, format } = useCurrency();
  const { cards, addCard } = usePaymentMethods();
  const [selectedAsset, setSelectedAsset] = useState<Asset>(
    cryptoAssets.find((a) => a.symbol === 'USDT') ||
      cryptoAssets[0] || {
        id: 'usdt',
        symbol: 'USDT',
        name: 'Tether',
        price: 1,
        change24h: 0,
        balance: 0,
        valueUSD: 0,
        color: '#26A17B',
        bgColor: 'rgba(38,161,123,0.15)',
        chains: [],
        sparkline: [],
      }
  );
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('bank');
  const [selectedCardId, setSelectedCardId] = useState<string | null>(cards[0]?.id ?? null);
  const [showNewCard, setShowNewCard] = useState(false);
  const [newCard, setNewCard] = useState<NewCardDraft>({ number: '', expiry: '', cvc: '' });
  const [amount, setAmount] = useState('');
  const [step, setStep] = useState<'form' | 'review' | 'payment-instructions' | 'processing' | 'done'>('form');
  const [showTokenDropdown, setShowTokenDropdown] = useState(false);
  const [copied, setCopied] = useState(false);

  const rampAssets = cryptoAssets;

  const usdAmount = Number(amount) / currency.rate;
  const fee = usdAmount * 0.015;
  const youGet = (usdAmount - fee) / selectedAsset.price;

  const handleAddCard = () => {
    if (!newCard.number || !newCard.expiry || !newCard.cvc) return;
    const last4 = newCard.number.replace(/\s/g, '').slice(-4);
    const card: Omit<SavedCard, 'id'> = { brand: 'Visa', last4, expiry: newCard.expiry, color: 'var(--card)' };
    addCard(card);
    setNewCard({ number: '', expiry: '', cvc: '' });
    setShowNewCard(false);
  };

  const copyAccount = (text: string) => {
    try { navigator.clipboard.writeText(text); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* ignore */ }
  };

  const selectedCard = cards.find((c) => c.id === selectedCardId);

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <div className="px-5 pt-2">
        <WalletFeatureBanner feature="onramp" />
        {apiError && <FeatureAlert reason={mapApiCodeToReason(apiError.code)} message={apiError.message} detail={apiError.code} />}
      </div>

      <div className="flex items-center gap-3 px-5 mb-5">
        <motion.button whileTap={{ scale: 0.9 }} onClick={step === 'form' ? goBack : () => setStep('form')} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>On-Ramp from Cash</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        <AnimatePresence mode="wait">
          {step === 'form' && (
            <OnRampFormStep
              currency={currency} format={format}
              amount={amount} setAmount={setAmount} usdAmount={usdAmount}
              rampAssets={rampAssets} selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset}
              showTokenDropdown={showTokenDropdown} setShowTokenDropdown={setShowTokenDropdown}
              paymentMethod={paymentMethod} setPaymentMethod={setPaymentMethod}
              cards={cards} selectedCardId={selectedCardId} setSelectedCardId={setSelectedCardId}
              showNewCard={showNewCard} setShowNewCard={setShowNewCard}
              newCard={newCard} setNewCard={setNewCard} onAddCard={handleAddCard}
              fee={fee} youGet={youGet}
              onPreview={() => { if (Number(amount) > 0) setStep('review'); }}
            />
          )}

          {step === 'review' && (
            <OnRampReviewStep
              currency={currency} format={format} amount={amount} selectedAsset={selectedAsset}
              youGet={youGet} paymentMethod={paymentMethod} selectedCard={selectedCard} fee={fee}
              onConfirm={() => setStep('payment-instructions')}
            />
          )}

          {step === 'payment-instructions' && (
            <OnRampInstructionsStep
              currency={currency} amount={amount} paymentMethod={paymentMethod}
              copied={copied} onCopy={copyAccount}
              onPaid={async () => {
                if (!userId) { setApiError({ message: 'Sign in required' }); return; }
                setStep('processing');
                setApiError(null);
                try {
                  const order = await fiatApi.localOnrampOrder({
                    userId,
                    email: authEmail || `${userId}@users.convia.local`,
                    fiatCurrency: currency.code || 'NGN',
                    fiatAmount: String(amount),
                    toAsset: selectedAsset.symbol,
                    method:
                      paymentMethod === 'card'
                        ? 'card'
                        : paymentMethod === 'bank'
                          ? 'bank_transfer'
                          : 'dedicated_account',
                  });
                  // Persist payment instructions for instructions step if returned
                  if (order.payment?.checkoutUrl) {
                    window.open(order.payment.checkoutUrl, '_blank', 'noopener');
                  }
                  setStep('done');
                } catch (err) {
                  if (err instanceof ApiError) setApiError({ code: err.code, message: err.body.message || err.message });
                  else setApiError({ message: 'On-ramp order failed' });
                  setStep('payment-instructions');
                }
              }}
            />
          )}

          {step === 'processing' && (
            <OnRampProcessingStep currency={currency} amount={amount} youGet={youGet} symbol={selectedAsset.symbol} />
          )}

          {step === 'done' && (
            <OnRampDoneStep youGet={youGet} symbol={selectedAsset.symbol} onDone={goBack} />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
