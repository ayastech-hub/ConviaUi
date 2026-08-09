import { motion } from 'motion/react';
import { Phone, ArrowRight, AlertCircle } from 'lucide-react';
import { InputField } from './FormPrimitives';

interface PhoneStepProps {
  phone: string;
  setPhone: (v: string) => void;
  error: string;
  onSubmit: () => void;
}

/** Phone number entry step, shown during signup before the OTP step. */
export function PhoneStep({ phone, setPhone, error, onSubmit }: PhoneStepProps) {
  return (
    <motion.div key="phone" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--muted)' }}>
          <Phone size={28} style={{ color: 'var(--foreground)' }} />
        </div>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Verify Your Phone</h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, textAlign: 'center' }}>We'll send a 6-digit code to confirm your number</p>
      </div>
      <InputField icon={<Phone size={18} style={{ color: 'var(--muted-foreground)' }} />} type="tel" placeholder="+234 801 234 5678" value={phone} onChange={setPhone} />
      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 mt-2" style={{ color: 'var(--destructive)', fontSize: 13 }}>
          <AlertCircle size={14} /> {error}
        </motion.p>
      )}
      <motion.button whileTap={{ scale: 0.97 }} onClick={onSubmit} className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2 mt-4" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
        Send Code <ArrowRight size={18} />
      </motion.button>
    </motion.div>
  );
}
