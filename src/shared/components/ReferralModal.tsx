import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, CheckCircle2, Share2, MessageCircle, Mail, Twitter, Gift } from 'lucide-react';

interface ReferralModalProps {
  open: boolean;
  onClose: () => void;
  code: string;
  reward: string;
}

export function ReferralModal({ open, onClose, code, reward }: ReferralModalProps) {
  const [copied, setCopied] = useState(false);

  const link = `https://convia.app/ref/${code}`;

  const copyCode = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOptions = [
    { icon: MessageCircle, label: 'WhatsApp', color: '#25D366' },
    { icon: Twitter, label: 'Twitter', color: '#1DA1F2' },
    { icon: Mail, label: 'Email', color: 'var(--foreground)' },
    { icon: Share2, label: 'More', color: '#64748B' },
  ];

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 z-40"
            style={{ background: 'rgba(0,0,0,0.5)' }}
          />
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 z-50 rounded-t-[28px] p-6 pb-8"
            style={{ background: 'var(--card)' }}
          >
            <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: 'var(--border)' }} />

            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  <Gift size={18} style={{ color: 'var(--foreground)' }} />
                </div>
                <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Refer & Earn</h3>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={onClose} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                <X size={16} style={{ color: 'var(--muted-foreground)' }} />
              </motion.button>
            </div>

            <div className="rounded-[20px] p-5 mb-5 text-center" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 28 }}>{reward}</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>per friend you invite</p>
            </div>

            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Your referral code</p>
            <div className="flex items-center gap-2 mb-2">
              <div className="flex-1 px-4 py-3 rounded-[12px]" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
                <span style={{ color: 'var(--foreground)', fontSize: 18, fontWeight: 800, letterSpacing: 2 }}>{code}</span>
              </div>
              <motion.button whileTap={{ scale: 0.9 }} onClick={copyCode} className="w-12 h-12 rounded-[12px] flex items-center justify-center" style={{ background: 'var(--primary)' }}>
                {copied ? <CheckCircle2 size={20} className="text-white" /> : <Copy size={18} className="text-white" />}
              </motion.button>
            </div>

            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>Referral link</p>
            <div className="px-4 py-3 rounded-[12px] mb-5" style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, wordBreak: 'break-all' }}>{link}</p>
            </div>

            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12 }}>Share via</p>
            <div className="grid grid-cols-4 gap-3 mb-5">
              {shareOptions.map(opt => {
                const Icon = opt.icon;
                return (
                  <motion.button key={opt.label} whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: `${opt.color}18` }}>
                      <Icon size={20} style={{ color: opt.color }} />
                    </div>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 10, fontWeight: 500 }}>{opt.label}</span>
                  </motion.button>
                );
              })}
            </div>

            {copied && (
              <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-center gap-2">
                <CheckCircle2 size={14} style={{ color: 'var(--foreground)' }} />
                <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>Code copied to clipboard!</span>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
