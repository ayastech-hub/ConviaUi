import type { RefObject } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, MessageCircle, Check, CheckCheck, Send } from 'lucide-react';
import type { ChatMessage } from './chatData';
import { quickReplies } from './chatData';

interface SupportChatViewProps {
  messages: ChatMessage[];
  isTyping: boolean;
  scrollRef: RefObject<HTMLDivElement>;
  input: string;
  setInput: (v: string) => void;
  onSend: (text: string) => void;
  onBack: () => void;
}

/** The full "chat with support" view: header, message list, quick replies, and input bar. */
export function SupportChatView({ messages, isTyping, scrollRef, input, setInput, onSend, onBack }: SupportChatViewProps) {
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div className="flex items-center gap-3 px-5 pt-3 pb-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--card)' }}>
        <motion.button whileTap={{ scale: 0.9 }} onClick={onBack} aria-label="Back" className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <div className="flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--secondary)' }}>
            <MessageCircle size={18} className="text-white" />
          </div>
          <div>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15 }}>Convia Support</p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ background: 'var(--positive)' }} />
              <span style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Online · Usually replies instantly</span>
            </div>
          </div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-5 py-4">
        <div className="flex flex-col gap-3">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <motion.div key={msg.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                <div
                  className="px-4 py-2.5 rounded-[18px] max-w-[80%]"
                  style={{
                    background: isUser ? 'var(--primary)' : 'var(--card)',
                    color: isUser ? '#FFF' : 'var(--foreground)',
                    fontSize: 14, lineHeight: 1.5, fontWeight: 500,
                    borderBottomRightRadius: isUser ? 4 : 18,
                    borderBottomLeftRadius: isUser ? 18 : 4,
                    border: isUser ? 'none' : '1px solid var(--border)',
                  }}
                >
                  {msg.text}
                </div>
                <div className="flex items-center gap-1 mt-1 px-1">
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 10 }}>{msg.time}</span>
                  {isUser && msg.status === 'read' && <CheckCheck size={12} style={{ color: 'var(--foreground)' }} />}
                  {isUser && msg.status === 'sent' && <Check size={12} style={{ color: 'var(--muted-foreground)' }} />}
                </div>
              </motion.div>
            );
          })}

          <AnimatePresence>
            {isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="flex items-center gap-1.5 px-4 py-3 rounded-[18px]"
                style={{ background: 'var(--card)', border: '1px solid var(--border)', borderBottomLeftRadius: 4, width: 'fit-content' }}
              >
                {[0, 1, 2].map((i) => (
                  <motion.div key={i} className="w-2 h-2 rounded-full" style={{ background: 'var(--muted-foreground)' }} animate={{ scale: [1, 1.3, 1], opacity: [0.4, 1, 0.4] }} transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }} />
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {messages.length <= 1 && (
        <div className="px-5 pb-2">
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, marginBottom: 8 }}>QUICK REPLIES</p>
          <div className="flex gap-2 flex-wrap">
            {quickReplies.map((reply) => (
              <motion.button key={reply} whileTap={{ scale: 0.95 }} onClick={() => onSend(reply)} className="px-3 py-2 rounded-[12px]" style={{ background: 'var(--card)', border: '1px solid var(--border)', color: 'var(--foreground)', fontSize: 12, fontWeight: 500 }}>
                {reply}
              </motion.button>
            ))}
          </div>
        </div>
      )}

      <div className="px-4 py-3" style={{ borderTop: '1px solid var(--border)', background: 'var(--card)' }}>
        <div className="flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-4 py-2.5 rounded-[16px]" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') onSend(input); }}
              placeholder="Type a message..."
              className="flex-1 bg-transparent outline-none"
              style={{ color: 'var(--foreground)', fontSize: 14 }}
            />
          </div>
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => onSend(input)} disabled={!input.trim()} className="w-11 h-11 rounded-[16px] flex items-center justify-center" style={{ background: input.trim() ? 'var(--primary)' : 'var(--muted)' }}>
            <Send size={18} style={{ color: input.trim() ? '#FFF' : 'var(--muted-foreground)' }} />
          </motion.button>
        </div>
      </div>
    </div>
  );
}
