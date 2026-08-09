import { useState, useRef, useEffect } from 'react';
import { assets, initialMessages, type ChatAsset } from '../components/chat/types';
import { ChatHeader } from '../components/chat/ChatHeader';
import { MessageList } from '../components/chat/MessageList';
import { ChatInputBar } from '../components/chat/ChatInputBar';
import { PaymentSheet } from '../components/chat/PaymentSheet';

interface ChatScreenProps {
  goBack: () => void;
}

export function ChatScreen({ goBack }: ChatScreenProps) {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState('');
  const [showPayment, setShowPayment] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<ChatAsset>(assets[0]);
  const [showAssetPicker, setShowAssetPicker] = useState(false);
  const [amount, setAmount] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, {
      id: Date.now().toString(),
      text: input.trim(),
      sender: 'me',
      time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
    }]);
    setInput('');
  };

  const sendPayment = () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setMessages((prev) => [...prev, {
        id: Date.now().toString(),
        text: '',
        sender: 'me',
        time: new Date().toLocaleTimeString('en', { hour: '2-digit', minute: '2-digit' }),
        type: 'payment',
        payment: { amount, asset: selectedAsset.symbol, status: 'confirmed' },
      }]);
      setAmount('');
      setShowPayment(false);
    }, 1800);
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <ChatHeader goBack={goBack} onSendPayment={() => setShowPayment(true)} />
      <MessageList messages={messages} endRef={endRef} />
      <ChatInputBar input={input} setInput={setInput} onSend={sendMessage} onOpenPayment={() => setShowPayment(true)} />

      <PaymentSheet
        open={showPayment}
        onClose={() => { setShowPayment(false); setShowAssetPicker(false); }}
        selectedAsset={selectedAsset} setSelectedAsset={setSelectedAsset}
        showAssetPicker={showAssetPicker} setShowAssetPicker={setShowAssetPicker}
        amount={amount} setAmount={setAmount}
        sending={sending} onSend={sendPayment}
      />
    </div>
  );
}
