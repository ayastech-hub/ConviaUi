import { motion } from 'motion/react';

interface OtpStepProps {
  email: string;
  otp: string[];
  setOtp: (otp: string[]) => void;
  loading: boolean;
  error: string;
  onSubmit: () => void;
  onResend?: () => void;
}

/** 6-digit email OTP after credentials on signup. */
export function OtpStep({ email, otp, setOtp, loading, error, onSubmit, onResend }: OtpStepProps) {
  return (
    <motion.div key="otp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
      <p className="text-center mb-1" style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 17 }}>
        Verify your email
      </p>
      <p className="text-center mb-6" style={{ color: 'var(--muted-foreground)', fontSize: 13, lineHeight: 1.45 }}>
        Enter the 6-digit code sent to
        <br />
        <span style={{ color: 'var(--foreground)', fontWeight: 600 }}>{email}</span>
      </p>

      <div className="flex justify-center gap-2 mb-4">
        {otp.map((digit, i) => (
          <input
            key={i}
            id={`otp-${i}`}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            autoComplete="one-time-code"
            className="w-11 h-12 rounded-xl text-center tabular-nums outline-none"
            style={{
              background: 'var(--muted)',
              border: '1px solid var(--border)',
              color: 'var(--foreground)',
              fontWeight: 700,
              fontSize: 18,
            }}
            onChange={(e) => {
              const val = e.target.value.replace(/\D/g, '').slice(-1);
              const next = [...otp];
              next[i] = val;
              setOtp(next);
              if (val && i < 5) document.getElementById(`otp-${i + 1}`)?.focus();
            }}
            onKeyDown={(e) => {
              if (e.key === 'Backspace' && !otp[i] && i > 0) {
                document.getElementById(`otp-${i - 1}`)?.focus();
              }
            }}
          />
        ))}
      </div>

      {error && (
        <p className="text-center mb-3" style={{ color: 'var(--destructive)', fontSize: 13 }}>
          {error}
        </p>
      )}

      <button
        type="button"
        disabled={loading}
        onClick={onSubmit}
        className="w-full py-3.5 rounded-full font-bold text-[15px] mb-3"
        style={{ background: 'var(--primary)', color: 'var(--primary-foreground)', opacity: loading ? 0.7 : 1 }}
      >
        {loading ? 'Verifying…' : 'Verify & create account'}
      </button>

      {onResend && (
        <button
          type="button"
          onClick={onResend}
          className="w-full text-center text-sm font-semibold"
          style={{ color: 'var(--primary)' }}
        >
          Resend code
        </button>
      )}
    </motion.div>
  );
}
