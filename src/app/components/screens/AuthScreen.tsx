import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, Loader, Apple, Facebook } from 'lucide-react';
import { ConviaLogo } from '../ConviaLogo';
import type { Screen } from '../../data/mockData';

interface AuthScreenProps {
  mode: 'login' | 'signup' | 'forgot-password';
  navigate: (s: Screen) => void;
  goBack: () => void;
  switchTab: (s: Screen) => void;
}

export function AuthScreen({ mode, navigate, goBack, switchTab }: AuthScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = () => {
    setError('');
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }
    if (mode !== 'forgot-password' && !password) {
      setError('Please enter your password');
      return;
    }
    if (mode === 'signup' && password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        if (mode === 'forgot-password') {
          goBack();
        } else {
          switchTab('home');
        }
      }, 1500);
    }, 2000);
  };

  const titles = {
    login: 'Welcome Back',
    signup: 'Create Account',
    'forgot-password': 'Reset Password',
  };

  const subtitles = {
    login: 'Sign in to your Convia account',
    signup: 'Join Africa\'s financial universe',
    'forgot-password': 'We\'ll send you a reset link',
  };

  const buttonLabels = {
    login: 'Sign In',
    signup: 'Create Account',
    'forgot-password': 'Send Reset Link',
  };

  if (success) {
    return (
      <div className="flex flex-col h-full items-center justify-center px-8" style={{ background: 'var(--background)' }}>
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ background: 'rgba(99,102,241,0.15)' }}>
            <CheckCircle2 size={44} style={{ color: 'var(--primary)' }} />
          </div>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800, marginBottom: 8 }}>
            {mode === 'forgot-password' ? 'Link Sent!' : mode === 'signup' ? 'Account Created!' : 'Signed In!'}
          </h2>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 14, textAlign: 'center' }}>
            {mode === 'forgot-password' ? 'Check your email for a reset link' : mode === 'signup' ? 'Welcome to Convia' : 'Redirecting to your dashboard...'}
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-y-auto" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />

      <div className="flex items-center gap-3 px-5 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
      </div>

      <div className="px-6 flex-1 flex flex-col">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.9), rgba(79,70,229,0.95))', boxShadow: '0 8px 24px rgba(99,102,241,0.3)' }}>
            <ConviaLogo size={28} color="#FFFFFF" />
          </div>
          <div>
            <h1 style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 24, letterSpacing: -0.5 }}>{titles[mode]}</h1>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>{subtitles[mode]}</p>
          </div>
        </div>

        {mode !== 'forgot-password' && (
          <>
            <div className="flex flex-col gap-3 mb-6">
              <SocialButton icon="google" label="Continue with Google" onClick={() => switchTab('home')} />
              <SocialButton icon="apple" label="Continue with Apple" onClick={() => switchTab('home')} />
              <SocialButton icon="facebook" label="Continue with Facebook" onClick={() => switchTab('home')} />
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
            </div>
          </>
        )}

        <div className="flex flex-col gap-4">
          <InputField
            icon={<Mail size={18} style={{ color: 'var(--muted-foreground)' }} />}
            type="email"
            placeholder="Email address"
            value={email}
            onChange={setEmail}
          />

          {mode !== 'forgot-password' && (
            <InputField
              icon={<Lock size={18} style={{ color: 'var(--muted-foreground)' }} />}
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={setPassword}
              trailing={
                <button onClick={() => setShowPassword(!showPassword)}>
                  {showPassword ? <EyeOff size={18} style={{ color: 'var(--muted-foreground)' }} /> : <Eye size={18} style={{ color: 'var(--muted-foreground)' }} />}
                </button>
              }
            />
          )}

          {mode === 'signup' && (
            <InputField
              icon={<Lock size={18} style={{ color: 'var(--muted-foreground)' }} />}
              type={showPassword ? 'text' : 'password'}
              placeholder="Confirm password"
              value={confirmPassword}
              onChange={setConfirmPassword}
            />
          )}

          {mode === 'login' && (
            <div className="flex justify-end">
              <button onClick={() => navigate('forgot-password')} style={{ color: 'var(--primary)', fontSize: 13, fontWeight: 600 }}>
                Forgot password?
              </button>
            </div>
          )}

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ color: '#EF4444', fontSize: 13 }}>
              {error}
            </motion.p>
          )}

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2"
            style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15, boxShadow: '0 8px 24px rgba(99,102,241,0.4)' }}
          >
            {loading ? <Loader size={18} className="animate-spin" /> : buttonLabels[mode]}
            {!loading && <ArrowRight size={18} />}
          </motion.button>
        </div>

        {mode === 'login' && (
          <p className="text-center mt-6" style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>
            Don't have an account?{' '}
            <button onClick={() => navigate('signup')} style={{ color: 'var(--primary)', fontWeight: 700 }}>Sign up</button>
          </p>
        )}
        {mode === 'signup' && (
          <p className="text-center mt-6" style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>
            Already have an account?{' '}
            <button onClick={() => navigate('login')} style={{ color: 'var(--primary)', fontWeight: 700 }}>Sign in</button>
          </p>
        )}
        {mode === 'forgot-password' && (
          <p className="text-center mt-6" style={{ color: 'var(--muted-foreground)', fontSize: 14 }}>
            Remember your password?{' '}
            <button onClick={() => navigate('login')} style={{ color: 'var(--primary)', fontWeight: 700 }}>Sign in</button>
          </p>
        )}

        <p className="text-center mt-4 mb-8" style={{ color: 'var(--muted-foreground)', fontSize: 11, lineHeight: 1.5 }}>
          By continuing, you agree to Convia's Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

function InputField({ icon, type, placeholder, value, onChange, trailing }: {
  icon: React.ReactNode;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  trailing?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 px-4 py-3.5 rounded-[14px] glass-card" style={{ border: '1px solid var(--border)' }}>
      {icon}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="flex-1 bg-transparent outline-none"
        style={{ color: 'var(--foreground)', fontSize: 15 }}
      />
      {trailing}
    </div>
  );
}

function SocialButton({ icon, label, onClick }: { icon: string; label: string; onClick: () => void }) {
  return (
    <motion.button whileTap={{ scale: 0.97 }} onClick={onClick} className="flex items-center justify-center gap-3 py-3.5 rounded-[14px] glass-card" style={{ border: '1px solid var(--border)' }}>
      {icon === 'google' && (
        <svg width="18" height="18" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
      )}
      {icon === 'apple' && <Apple size={18} style={{ color: 'var(--foreground)' }} />}
      {icon === 'facebook' && <Facebook size={18} style={{ color: '#1877F2' }} />}
      <span style={{ color: 'var(--foreground)', fontSize: 14, fontWeight: 600 }}>{label}</span>
    </motion.button>
  );
}
