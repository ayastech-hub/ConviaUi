import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Copy, CheckCircle2, Share2, MessageCircle, Mail, Twitter, Gift } from 'lucide-react';

interface ReferralModalProps {
  open: boolean;
  onClose: () => void;
  code: string;
  reward: string;
  shareUrl?: string;
}

/** Live referral code from GET /referrals/:userId/code — no hardcoded codes. */
export function ReferralModal({ open, onClose, code, reward, shareUrl }: ReferralModalProps) {
  const [copied, setCopied] = useState(false);
  const link = shareUrl || (code && code !== '—' ? `https://convia.app/ref/${code}` : '');

  const copyCode = async () => {
    const text = code && code !== '—' ? code : link;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const copyLink = async () => {
    if (!link) return;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  const shareOptions = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      color: '#25D366',
      href: link ? `https://wa.me/?text=${encodeURIComponent(`Join Convia with my code ${code}: ${link}`)}` : undefined,
    },
    {
      icon: Twitter,
      label: 'Twitter',
      color: '#1DA1F2',
      href: link
        ? `https://twitter.com/intent/tweet?text=${encodeURIComponent(`Join Convia — code ${code}`)}&url=${encodeURIComponent(link)}`
        : undefined,
    },
    {
      icon: Mail,
      label: 'Email',
      color: 'var(--foreground)',
      href: link
        ? `mailto:?subject=Join%20Convia&body=${encodeURIComponent(`Use my referral code ${code}: ${link}`)}`
        : undefined,
    },
    { icon: Share2, label: 'Copy link', color: '#64748B', onClick: copyLink },
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
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ background: 'var(--muted)' }}
                >
                  <Gift size={18} style={{ color: 'var(--foreground)' }} />
                </div>
                <h3 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18 }}>Refer & Earn</h3>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center"
                style={{ background: 'var(--muted)' }}
              >
                <X size={16} style={{ color: 'var(--muted-foreground)' }} />
              </motion.button>
            </div>

            <div
              className="rounded-[20px] p-5 mb-5 text-center"
              style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
            >
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 8 }}>{reward}</p>
              <p
                style={{
                  color: 'var(--foreground)',
                  fontWeight: 800,
                  fontSize: 28,
                  letterSpacing: 2,
                  fontFamily: 'monospace',
                }}
              >
                {code || '—'}
              </p>
              {link ? (
                <p
                  className="mt-2 truncate px-2"
                  style={{ color: 'var(--muted-foreground)', fontSize: 11 }}
                >
                  {link}
                </p>
              ) : (
                <p className="mt-2" style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>
                  Sign in to load your referral code
                </p>
              )}
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={copyCode}
                className="mt-4 px-4 py-2 rounded-xl text-sm font-bold"
                style={{ background: 'var(--primary)', color: '#fff' }}
              >
                Copy code
              </motion.button>
            </div>

            <div className="grid grid-cols-4 gap-3 mb-4">
              {shareOptions.map((opt) => {
                const Icon = opt.icon;
                const inner = (
                  <motion.div whileTap={{ scale: 0.9 }} className="flex flex-col items-center gap-2">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{ background: `${opt.color}18` }}
                    >
                      <Icon size={20} style={{ color: opt.color }} />
                    </div>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 10, fontWeight: 500 }}>
                      {opt.label}
                    </span>
                  </motion.div>
                );
                if (opt.href) {
                  return (
                    <a key={opt.label} href={opt.href} target="_blank" rel="noopener noreferrer">
                      {inner}
                    </a>
                  );
                }
                return (
                  <button key={opt.label} type="button" onClick={opt.onClick}>
                    {inner}
                  </button>
                );
              })}
            </div>

            {copied && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={14} style={{ color: 'var(--foreground)' }} />
                <span style={{ color: 'var(--foreground)', fontSize: 13, fontWeight: 600 }}>
                  Copied to clipboard
                </span>
              </motion.div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
