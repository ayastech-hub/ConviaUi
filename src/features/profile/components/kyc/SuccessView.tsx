import { motion } from 'motion/react';
import { ChevronLeft, Check, Sparkles, Clock, Shield, Lock, CheckCircle2, Home } from 'lucide-react';
import { ScreenHeader } from '../../../../shared/components/ScreenHeader';

interface SuccessViewProps {
  firstName: string;
  onDone: () => void;
}

/** Shown after the KYC verification has been submitted. */
export function SuccessView({ firstName, onDone }: SuccessViewProps) {
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <ScreenHeader title="Verification" onBack={onDone} />

      <div className="flex-1 flex flex-col items-center justify-center px-5">
        <motion.div initial={{ scale: 0.6, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 18 }} className="text-center w-full">
          <div className="relative w-32 h-32 mx-auto mb-8">
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', stiffness: 160, damping: 14, delay: 0.1 }}
              className="absolute inset-0 rounded-full flex items-center justify-center"
              style={{ background: 'var(--muted)' }}
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 220, damping: 16, delay: 0.25 }}
                className="w-20 h-20 rounded-full flex items-center justify-center"
                style={{ background: 'var(--positive)' }}
              >
                <motion.div initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 1 }} transition={{ duration: 0.5, delay: 0.5 }}>
                  <Check size={40} style={{ color: '#fff', strokeWidth: 3 }} />
                </motion.div>
              </motion.div>
            </motion.div>
            {[0, 1, 2, 3].map((i) => (
              <motion.div
                key={i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 1.6, delay: 0.6 + i * 0.2, repeat: Infinity, repeatDelay: 0.8 }}
                className="absolute"
                style={{ top: `${[10, 20, 80, 70][i]}%`, left: `${[85, 5, 90, 0][i]}%` }}
              >
                <Sparkles size={14} style={{ color: 'var(--foreground)' }} />
              </motion.div>
            ))}
          </div>

          <motion.h2 initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 22, marginBottom: 8 }}>
            Verification Submitted
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
            style={{ color: 'var(--muted-foreground)', fontSize: 14, lineHeight: 1.6, marginBottom: 24, maxWidth: 300, margin: '0 auto 24px' }}
          >
            Thank you, {firstName || 'there'}. Your KYC documents have been securely received and are now under review.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
            className="rounded-[20px] p-5 mb-6 mx-auto" style={{ background: 'var(--card)', border: '1px solid var(--border)', maxWidth: 340, width: '100%' }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                <Clock size={18} style={{ color: 'var(--foreground)' }} />
              </div>
              <div className="text-left">
                <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14 }}>Estimated Review Time</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>24 – 48 hours</p>
              </div>
            </div>
            <div className="h-px mb-4" style={{ background: 'var(--border)' }} />
            <div className="space-y-3 text-left">
              {[
                { icon: Shield, label: 'Bank-grade encryption', color: 'var(--foreground)' },
                { icon: Lock, label: 'Data stored securely', color: 'var(--positive)' },
                { icon: CheckCircle2, label: 'Email notification on completion', color: 'var(--warning)' },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center gap-2.5">
                    <Icon size={15} style={{ color: item.color }} />
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{item.label}</span>
                  </div>
                );
              })}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }} className="flex flex-col gap-3" style={{ maxWidth: 340, width: '100%', margin: '0 auto' }}>
            <motion.button whileTap={{ scale: 0.97 }} onClick={onDone} className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
              <Home size={18} /> Back to Home
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
