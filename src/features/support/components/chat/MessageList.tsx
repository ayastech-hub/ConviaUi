import type { RefObject } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, CheckCircle2 } from 'lucide-react';
import type { Message } from './types';

interface MessageListProps {
  messages: Message[];
  endRef: RefObject<HTMLDivElement>;
}

/** Scrollable message list: text bubbles and payment-sent cards. */
export function MessageList({ messages, endRef }: MessageListProps) {
  return (
    <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-2">
      {messages.map((msg) => (
        <div key={msg.id} className={`flex ${msg.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
          <div style={{ maxWidth: '75%' }}>
            {msg.type === 'payment' && msg.payment ? (
              <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="rounded-[16px] p-3 mb-1 glass-card" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
                <div className="flex items-center gap-2 mb-1">
                  <ArrowUpRight size={14} style={{ color: 'var(--foreground)' }} />
                  <span style={{ color: 'var(--foreground)', fontSize: 11, fontWeight: 700 }}>Payment Sent</span>
                </div>
                <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>{msg.payment.amount} {msg.payment.asset}</p>
                <div className="flex items-center gap-1 mt-1">
                  <CheckCircle2 size={12} style={{ color: 'var(--muted-foreground)' }} />
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>Confirmed</span>
                </div>
              </motion.div>
            ) : (
              <div
                className="px-4 py-2.5 rounded-[18px]"
                style={{
                  background: msg.sender === 'me' ? 'var(--primary)' : 'var(--card)',
                  border: msg.sender === 'them' ? '1px solid var(--border)' : 'none',
                  borderBottomRightRadius: msg.sender === 'me' ? 4 : 18,
                  borderBottomLeftRadius: msg.sender === 'them' ? 4 : 18,
                }}
              >
                <p style={{ color: msg.sender === 'me' ? 'var(--primary-foreground)' : 'var(--foreground)', fontSize: 14, lineHeight: 1.4 }}>{msg.text}</p>
              </div>
            )}
            <p style={{ color: 'var(--muted-foreground)', fontSize: 10, textAlign: msg.sender === 'me' ? 'right' : 'left', marginTop: 2 }}>{msg.time}</p>
          </div>
        </div>
      ))}
      <div ref={endRef} />
    </div>
  );
}
