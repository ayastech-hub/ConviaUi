import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, Eye, EyeOff, Shield, Camera, CheckCircle2, Check, RefreshCw, ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';
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
  { icon: Eye, text: 'Look directly at the camera' },
  { icon: EyeOff, text: 'Remove glasses, hats or masks' },
  { icon: CheckCircle2, text: 'Ensure your face is well lit' },
  { icon: Shield, text: 'No filters or face modifications' },
];

/**
 * KYC Step 3: face viewfinder + liveness prompts. The actual capture happens
 * in a full-screen `CameraCapture` modal owned by the parent `KYCScreen`
 * (triggered via `onStartCapture`); this component only renders the
 * pre-capture viewfinder/tips and the post-capture "captured" state.
 */
export function SelfieVerificationStep({ selfieCaptured, onStartCapture, onRetake, errors, onBack, onContinue }: SelfieVerificationStepProps) {
  // Local-only, cosmetic liveness-prompt state — the real capture flow is
  // handled by the camera modal; this only affects the idle viewfinder look.
  const [livenessActive] = useState(false);
  const [livenessStep] = useState(0);
  const livenessComplete = selfieCaptured;

  return (
    <div>
      <div className="mb-5">
        <h3 style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 17, marginBottom: 4 }}>Selfie Verification</h3>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>We need to confirm it's really you. Follow the liveness prompts.</p>
      </div>

      <div className="rounded-[20px] p-5 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
        <div className="relative mx-auto rounded-[20px] overflow-hidden mb-4" style={{ width: 220, height: 280, background: 'var(--card)' }}>
          <div
            className="absolute top-1/2 left-1/2"
            style={{
              width: 150, height: 190, transform: 'translate(-50%, -50%)', borderRadius: '50%',
              border: `2.5px ${livenessComplete ? 'solid var(--positive)' : livenessActive ? 'solid var(--primary)' : 'dashed rgba(255,255,255,0.45)'}`,
              boxShadow: livenessActive ? '0 0 24px var(--muted)' : 'none',
              transition: 'all 0.4s ease',
            }}
          />
          {!selfieCaptured && (
            <div className="absolute top-1/2 left-1/2 flex items-center justify-center" style={{ transform: 'translate(-50%, -50%)' }}>
              <User size={56} style={{ color: 'rgba(255,255,255,0.25)' }} />
            </div>
          )}
          {selfieCaptured && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 flex items-center justify-center" style={{ background: 'var(--card)' }}>
              <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                <CheckCircle2 size={40} style={{ color: 'var(--positive)' }} />
              </div>
            </motion.div>
          )}

          <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-3 py-2.5" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0.5), transparent)' }}>
            <span style={{ color: '#fff', fontSize: 11, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: livenessActive ? 'var(--destructive)' : 'var(--positive)', display: 'inline-block' }} />
              {livenessActive ? 'LIVE' : 'READY'}
            </span>
            {livenessComplete && (
              <span style={{ color: 'var(--positive)', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', gap: 3 }}>
                <Check size={12} /> VERIFIED
              </span>
            )}
          </div>

          <AnimatePresence>
            {livenessActive && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} className="absolute bottom-0 left-0 right-0 px-3 pb-3 pt-8" style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.7), transparent)' }}>
                <motion.div key={livenessStep} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="rounded-full px-3 py-2 flex items-center justify-center gap-2" style={{ background: 'var(--foreground)' }}>
                  {livenessStep === 0 ? (
                    <><ArrowLeft size={14} style={{ color: '#fff' }} /><span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>Look Left</span></>
                  ) : livenessStep === 1 ? (
                    <><ArrowRight size={14} style={{ color: '#fff' }} /><span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>Look Right</span></>
                  ) : (
                    <><CheckCircle2 size={14} style={{ color: '#fff' }} /><span style={{ color: '#fff', fontSize: 12, fontWeight: 700 }}>Hold Still</span></>
                  )}
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {livenessActive && (
            <div className="absolute top-10 left-1/2 flex gap-1.5" style={{ transform: 'translateX(-50%)' }}>
              {[0, 1, 2].map((i) => (
                <div key={i} style={{ width: 18, height: 3, borderRadius: 2, background: i <= livenessStep ? '#fff' : 'rgba(255,255,255,0.3)', transition: 'background 0.3s' }} />
              ))}
            </div>
          )}
        </div>

        {!selfieCaptured && !livenessActive && (
          <>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 15, textAlign: 'center', marginBottom: 6 }}>Position Your Face</p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, textAlign: 'center', lineHeight: 1.5, marginBottom: 16 }}>
              Center your face in the oval and follow the on-screen prompts.
            </p>
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
            <motion.button whileTap={{ scale: 0.97 }} onClick={onStartCapture} className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
              <Camera size={18} /> Start Selfie Capture
            </motion.button>
          </>
        )}

        {livenessActive && (
          <div className="text-center py-2">
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 14, marginBottom: 4 }}>
              Liveness Check in Progress
            </motion.p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Keep your face within the oval and follow the prompts</p>
          </div>
        )}

        {selfieCaptured && (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <div className="rounded-[12px] p-3 mb-4 flex items-center gap-2.5" style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}>
              <CheckCircle2 size={18} style={{ color: 'var(--positive)' }} />
              <div className="flex-1">
                <p style={{ color: 'var(--positive)', fontWeight: 700, fontSize: 13 }}>Selfie Captured Successfully</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>Liveness verification passed</p>
              </div>
            </div>
            <motion.button whileTap={{ scale: 0.97 }} onClick={onRetake} className="w-full py-3 rounded-[14px] flex items-center justify-center gap-2 mb-3" style={{ background: 'var(--muted)', border: '1px solid var(--border)', color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>
              <RefreshCw size={16} /> Retake Selfie
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
