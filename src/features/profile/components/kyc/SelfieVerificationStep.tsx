import { motion } from 'motion/react';
import { User, Sun, EyeOff, Camera, CheckCircle2, RefreshCw, AlertCircle } from 'lucide-react';
import { StepNavButtons } from './StepNavButtons';

interface SelfieVerificationStepProps {
  selfieCaptured: boolean;
  onStartCapture: () => void;
  onRetake: () => void;
  errors: Record<string, string>;
  onBack: () => void;
  onContinue: () => void;
}

const TIPS = [
  { icon: User, text: 'Look straight at the camera' },
  { icon: EyeOff, text: 'Remove glasses, hats, or masks' },
  { icon: Sun, text: 'Use even lighting — no backlight' },
];

export function SelfieVerificationStep({
  selfieCaptured,
  onStartCapture,
  onRetake,
  errors,
  onBack,
  onContinue,
}: SelfieVerificationStepProps) {
  return (
    <div>
      <div className="mb-5">
        <h3 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 18, letterSpacing: '-0.02em', marginBottom: 4 }}>
          Selfie
        </h3>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.45 }}>
          A still photo of your face. This is matched against your ID — not a live liveness exam.
        </p>
      </div>

      <div className="rounded-[20px] p-5 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div
          className="relative mx-auto rounded-[20px] overflow-hidden mb-4 flex items-center justify-center"
          style={{ width: 200, height: 240, background: 'var(--muted)' }}
        >
          <div
            className="absolute"
            style={{
              width: 140,
              height: 180,
              borderRadius: '50%',
              border: `2px ${selfieCaptured ? 'solid var(--positive)' : 'dashed color-mix(in oklab, var(--foreground) 25%, transparent)'}`,
            }}
          />
          {selfieCaptured ? (
            <CheckCircle2 size={40} style={{ color: 'var(--positive)' }} />
          ) : (
            <User size={48} style={{ color: 'var(--muted-foreground)', opacity: 0.45 }} />
          )}
        </div>

        {!selfieCaptured ? (
          <>
            <div className="space-y-2 mb-5">
              {TIPS.map((tip) => {
                const Icon = tip.icon;
                return (
                  <div key={tip.text} className="flex items-center gap-2.5">
                    <Icon size={14} style={{ color: 'var(--foreground)' }} />
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{tip.text}</span>
                  </div>
                );
              })}
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onStartCapture}
              className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2"
              style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}
            >
              <Camera size={18} /> Take selfie
            </motion.button>
          </>
        ) : (
          <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-[12px] p-3 mb-3 flex items-center gap-2.5" style={{ background: 'var(--muted)' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--positive)' }} />
              <div>
                <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>Selfie captured</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>You can retake if it is unclear</p>
              </div>
            </div>
            <motion.button
              type="button"
              whileTap={{ scale: 0.97 }}
              onClick={onRetake}
              className="w-full py-3 rounded-[14px] flex items-center justify-center gap-2"
              style={{
                background: 'var(--muted)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                fontWeight: 600,
                fontSize: 14,
              }}
            >
              <RefreshCw size={16} /> Retake
            </motion.button>
          </motion.div>
        )}
      </div>

      {errors.selfie && (
        <p className="flex items-center gap-1 mb-3" style={{ color: 'var(--destructive)', fontSize: 11 }}>
          <AlertCircle size={11} /> {errors.selfie}
        </p>
      )}

      <StepNavButtons onBack={onBack} onContinue={onContinue} />
    </div>
  );
}
