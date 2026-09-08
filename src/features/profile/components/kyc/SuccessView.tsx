import { motion } from 'motion/react';
import { Check, Clock, Shield, Lock, Mail } from 'lucide-react';
import { ScreenHeader } from '../../../../shared/components/ScreenHeader';

interface SuccessViewProps {
  firstName: string;
  onDone: () => void;
}

export function SuccessView({ firstName, onDone }: SuccessViewProps) {
  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <ScreenHeader title="Submitted" onBack={onDone} />
      <div className="flex-1 flex flex-col items-center justify-center px-5 pb-10">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-[340px]"
        >
          <div
            className="w-16 h-16 rounded-full flex items-center justify-center mb-6 mx-auto"
            style={{ background: 'color-mix(in oklab, var(--positive) 16%, var(--muted))' }}
          >
            <Check size={28} style={{ color: 'var(--positive)', strokeWidth: 2.5 }} />
          </div>
          <h2
            style={{
              color: 'var(--foreground)',
              fontWeight: 700,
              fontSize: 22,
              letterSpacing: '-0.03em',
              textAlign: 'center',
              marginBottom: 8,
            }}
          >
            Documents received
          </h2>
          <p
            style={{
              color: 'var(--muted-foreground)',
              fontSize: 14,
              lineHeight: 1.5,
              textAlign: 'center',
              marginBottom: 24,
            }}
          >
            Thank you{firstName ? `, ${firstName}` : ''}. Review usually takes 24–48 hours. You will get an email when it completes.
          </p>

          <div className="rounded-[20px] p-4 mb-6" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
            {[
              { icon: Clock, label: 'Typical review 24–48 hours' },
              { icon: Shield, label: 'Encrypted in transit' },
              { icon: Lock, label: 'Stored for compliance only' },
              { icon: Mail, label: 'Email when status changes' },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-2.5 py-2"
                  style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border)' }}
                >
                  <Icon size={15} style={{ color: 'var(--foreground)' }} />
                  <span style={{ color: 'var(--foreground)', fontSize: 13 }}>{item.label}</span>
                </div>
              );
            })}
          </div>

          <motion.button
            type="button"
            whileTap={{ scale: 0.98 }}
            onClick={onDone}
            className="w-full py-3.5 rounded-[16px] text-white"
            style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}
          >
            Back to account
          </motion.button>
        </motion.div>
      </div>
    </div>
  );
}
