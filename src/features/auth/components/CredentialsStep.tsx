import { motion } from 'motion/react';
import { Mail, Lock, Eye, EyeOff, Check, ArrowRight, Loader, AlertCircle, Gift, User } from 'lucide-react';
import type { PasswordStrength } from './passwordStrength';

interface CredentialsStepProps {
  mode: 'login' | 'signup' | 'forgot-password';
  email: string;
  setEmail: (v: string) => void;
  username?: string;
  setUsername?: (v: string) => void;
  referralCode?: string;
  setReferralCode?: (v: string) => void;
  password: string;
  setPassword: (v: string) => void;
  confirmPassword: string;
  setConfirmPassword: (v: string) => void;
  showPassword: boolean;
  setShowPassword: (v: boolean) => void;
  agreeTerms: boolean;
  setAgreeTerms: (v: boolean) => void;
  strength: PasswordStrength;
  loading: boolean;
  error: string;
  onSubmit: () => void;
  onForgotPassword: () => void;
  onQuickAccess: () => void;
  onSignup: () => void;
  onLogin: () => void;
}

/** Clean enterprise email/password form. */
export function CredentialsStep({
  mode,
  email,
  setEmail,
  username = '',
  setUsername,
  referralCode = '',
  setReferralCode,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  agreeTerms,
  setAgreeTerms,
  strength,
  loading,
  error,
  onSubmit,
  onForgotPassword,
  onQuickAccess,
  onSignup,
  onLogin,
}: CredentialsStepProps) {
  const isSignup = mode === 'signup';
  const isForgot = mode === 'forgot-password';

  return (
    <motion.div
      key="credentials"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ duration: 0.22 }}
      className="flex flex-col flex-1"
    >
      {/* Social */}
      {!isForgot && (
        <>
          <div className="flex flex-col gap-2.5 mb-5">
            <SocialBtn label="Continue with Google" onClick={onQuickAccess} />
            <SocialBtn label="Continue with Apple" onClick={onQuickAccess} dark />
          </div>
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            <span style={{ color: 'var(--muted-foreground)', fontSize: 12, fontWeight: 600 }}>or</span>
            <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
          </div>
        </>
      )}

      <div className="flex flex-col gap-3.5">
        <Field
          icon={<Mail size={17} style={{ color: 'var(--muted-foreground)' }} />}
          type="email"
          placeholder="Email"
          value={email}
          onChange={setEmail}
          autoComplete="email"
        />

        {isSignup && setUsername && (
          <Field
            icon={<User size={17} style={{ color: 'var(--muted-foreground)' }} />}
            type="text"
            placeholder="Username"
            value={username}
            onChange={setUsername}
            autoComplete="username"
          />
        )}

        {!isForgot && (
          <Field
            icon={<Lock size={17} style={{ color: 'var(--muted-foreground)' }} />}
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={setPassword}
            autoComplete={isSignup ? 'new-password' : 'current-password'}
            trailing={
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="p-1">
                {showPassword ? (
                  <EyeOff size={16} style={{ color: 'var(--muted-foreground)' }} />
                ) : (
                  <Eye size={16} style={{ color: 'var(--muted-foreground)' }} />
                )}
              </button>
            }
          />
        )}

        {isSignup && (
          <>
            <Field
              icon={<Lock size={17} style={{ color: 'var(--muted-foreground)' }} />}
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              autoComplete="new-password"
            />
            {/* Strength */}
            <div className="px-1">
              <div className="flex gap-1 mb-1.5">
                {[0, 1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-1 flex-1 rounded-full"
                    style={{
                      background:
                        i < strength.score
                          ? strength.score <= 1
                            ? 'var(--destructive)'
                            : strength.score === 2
                              ? 'var(--warning)'
                              : 'var(--positive)'
                          : 'var(--muted)',
                    }}
                  />
                ))}
              </div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{strength.label}</p>
            </div>
            {setReferralCode && (
              <Field
                icon={<Gift size={17} style={{ color: 'var(--muted-foreground)' }} />}
                type="text"
                placeholder="Referral code (optional)"
                value={referralCode}
                onChange={setReferralCode}
              />
            )}
            <label className="flex items-start gap-2.5 px-1 cursor-pointer">
              <button
                type="button"
                onClick={() => setAgreeTerms(!agreeTerms)}
                className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 mt-0.5"
                style={{
                  background: agreeTerms ? 'var(--primary)' : 'var(--muted)',
                  border: agreeTerms ? 'none' : '1px solid var(--border)',
                }}
              >
                {agreeTerms && <Check size={12} style={{ color: 'var(--primary-foreground)' }} strokeWidth={3} />}
              </button>
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.45 }}>
                I agree to the Terms of Service and Privacy Policy
              </span>
            </label>
          </>
        )}

        {mode === 'login' && (
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onForgotPassword}
              style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 650 }}
            >
              Forgot password?
            </button>
          </div>
        )}
      </div>

      {error && (
        <div
          className="flex items-start gap-2 mt-4 px-3.5 py-3 rounded-2xl"
          style={{
            background: 'color-mix(in oklab, var(--destructive) 12%, var(--card))',
            border: '1px solid color-mix(in oklab, var(--destructive) 30%, var(--border))',
          }}
        >
          <AlertCircle size={16} style={{ color: 'var(--destructive)', marginTop: 1, flexShrink: 0 }} />
          <p style={{ color: 'var(--foreground)', fontSize: 13, lineHeight: 1.4 }}>{error}</p>
        </div>
      )}

      <motion.button
        type="button"
        whileTap={{ scale: 0.98 }}
        disabled={loading}
        onClick={onSubmit}
        className="w-full h-12 rounded-full mt-6 flex items-center justify-center gap-2"
        style={{
          background: 'var(--primary)',
          color: 'var(--primary-foreground)',
          fontWeight: 750,
          fontSize: 15,
          opacity: loading ? 0.7 : 1,
        }}
      >
        {loading ? (
          <Loader size={18} className="animate-spin" />
        ) : (
          <>
            {isForgot ? 'Send reset link' : isSignup ? 'Create account' : 'Sign in'}
            <ArrowRight size={17} />
          </>
        )}
      </motion.button>

      <p className="text-center mt-6 mb-4" style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>
        {isForgot ? (
          <>
            Remember it?{' '}
            <button type="button" onClick={onLogin} style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Sign in
            </button>
          </>
        ) : isSignup ? (
          <>
            Already have an account?{' '}
            <button type="button" onClick={onLogin} style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Sign in
            </button>
          </>
        ) : (
          <>
            New to Convia?{' '}
            <button type="button" onClick={onSignup} style={{ color: 'var(--primary)', fontWeight: 700 }}>
              Create account
            </button>
          </>
        )}
      </p>
    </motion.div>
  );
}

function Field({
  icon,
  type,
  placeholder,
  value,
  onChange,
  trailing,
  autoComplete,
}: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  trailing?: React.ReactNode;
  autoComplete?: string;
}) {
  return (
    <div
      className="flex items-center gap-3 px-4 h-12 rounded-2xl"
      style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
    >
      {icon}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className="flex-1 bg-transparent outline-none"
        style={{ color: 'var(--foreground)', fontSize: 15, fontWeight: 500 }}
      />
      {trailing}
    </div>
  );
}

function SocialBtn({ label, onClick, dark }: { label: string; onClick: () => void; dark?: boolean }) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="w-full h-12 rounded-2xl font-semibold text-[14px]"
      style={{
        background: dark ? 'var(--foreground)' : 'var(--card)',
        color: dark ? 'var(--background)' : 'var(--foreground)',
        border: dark ? 'none' : '1px solid var(--border)',
      }}
    >
      {label}
    </motion.button>
  );
}
