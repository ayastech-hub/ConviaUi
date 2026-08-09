import { motion } from 'motion/react';
import { Shield, Loader, Check, AlertCircle } from 'lucide-react';

interface OtpStepProps {
  phone: string;
  otp: string[];
  setOtp: (otp: string[]) => void;
  loading: boolean;
  error: string;
  onSubmit: () => void;
}

/** 6-digit OTP entry step, shown after the phone step during signup. */
export function OtpStep({ phone, otp, setOtp, loading, error, onSubmit }: OtpStepProps) {
  return (
    <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <div className="flex flex-col items-center mb-8">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4" style={{ background: 'var(--muted)' }}>
          <Shield size={28} style={{ color: 'var(--foreground)' }} />
        </div>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 20, marginBottom: 4 }}>Enter Verification Code</h2>
        <p style={{ color: 'var(--muted-foreground)', fontSize: 13, textAlign: 'center' }}>Sent to {phone}</p>
      </div>
      <div className="flex gap-2 justify-center mb-4">
        {otp.map((digit, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '');
              const next = [...otp];
              next[i] = val;
              setOtp(next);
              if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
            }}
            className="w-12 h-14 rounded-[14px] text-center bg-transparent outline-none glass-card"
            style={{ color: 'var(--foreground)', fontSize: 24, fontWeight: 800, border: '1px solid var(--border)' }}
          />
        ))}
      </div>
      {error && (
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-1.5 justify-center" style={{ color: 'var(--destructive)', fontSize: 13 }}>
          <AlertCircle size={14} /> {error}
        </motion.p>
      )}
      <p style={{ color: 'var(--muted-foreground)', fontSize: 12, textAlign: 'center', marginBottom: 16 }}>
        Didn't get the code? <button style={{ color: 'var(--foreground)', fontWeight: 600 }}>Resend in 0:30</button>
      </p>
      <motion.button whileTap={{ scale: 0.97 }} onClick={onSubmit} disabled={loading} className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
        {loading ? <Loader size={18} className="animate-spin" /> : (<>Verify & Create Account <Check size={18} /></>)}
      </motion.button>
    </motion.div>
  );
}
