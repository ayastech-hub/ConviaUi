import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  ChevronLeft, Shield, Fingerprint, Lock, Smartphone, Bell, Eye, EyeOff,
  KeyRound, AlertTriangle, CheckCircle2, Loader, X, Globe, Clock
} from 'lucide-react';
import type { Screen } from '../../../shared/data/mockData';

interface SecurityScreenProps {
  goBack: () => void;
}

export function SecurityScreen({ goBack }: SecurityScreenProps) {
  const [step, setStep] = useState<'menu' | 'pin' | 'recovery' | 'devices' | 'whitelist'>('menu');
  const [biometric, setBiometric] = useState(true);
  const [twoFA, setTwoFA] = useState(true);
  const [loginAlerts, setLoginAlerts] = useState(true);
  const [txAlerts, setTxAlerts] = useState(true);
  const [hideBalance, setHideBalance] = useState(false);
  const [whitelist, setWhitelist] = useState(false);
  const [pinDigits, setPinDigits] = useState(['', '', '', '']);
  const [pinStep, setPinStep] = useState<'enter' | 'success'>('enter');

  const PIN_KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'del'];

  const handlePinKey = (key: string) => {
    if (key === 'del') {
      const idx = pinDigits.findIndex(d => d === '');
      const target = idx === -1 ? 3 : idx - 1;
      if (target >= 0) {
        const next = [...pinDigits];
        next[target] = '';
        setPinDigits(next);
      }
      return;
    }
    if (key === '') return;
    const idx = pinDigits.findIndex(d => d === '');
    if (idx === -1) return;
    const next = [...pinDigits];
    next[idx] = key;
    setPinDigits(next);
    if (idx === 3) {
      setTimeout(() => setPinStep('success'), 200);
      setTimeout(() => { setPinStep('enter'); setPinDigits(['', '', '', '']); setStep('menu'); }, 1800);
    }
  };

  if (step === 'pin') {
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
        <div style={{ height: 50 }} />
        <div className="flex items-center gap-3 px-5 mb-8">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setStep('menu')} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
            <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
          </motion.button>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Change PIN</h2>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center px-8">
          <AnimatePresence mode="wait">
            {pinStep === 'enter' ? (
              <motion.div key="enter" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="w-full flex flex-col items-center gap-10">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  <Lock size={28} style={{ color: 'var(--foreground)' }} />
                </div>
                <div className="text-center">
                  <h3 style={{ color: 'var(--foreground)', fontWeight: 700, marginBottom: 4 }}>Enter New PIN</h3>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Choose a 4-digit PIN</p>
                </div>
                <div className="flex gap-4">
                  {pinDigits.map((d, i) => (
                    <div key={i} className="w-4 h-4 rounded-full border-2" style={{
                      background: d ? 'var(--primary)' : 'transparent',
                      borderColor: d ? 'var(--primary)' : 'rgba(255,255,255,0.3)',
                    }} />
                  ))}
                </div>
                <div className="grid grid-cols-3 gap-4 w-full max-w-[260px]">
                  {PIN_KEYS.map((key, i) => (
                    <motion.button
                      key={i}
                      whileTap={{ scale: 0.88 }}
                      onClick={() => key !== '' && handlePinKey(key)}
                      className="h-14 rounded-2xl flex items-center justify-center glass-card"
                      style={{ color: 'var(--foreground)', fontSize: 22, fontWeight: 500, cursor: key === '' ? 'default' : 'pointer', border: '1px solid var(--border)' }}
                    >
                      {key === 'del' ? <X size={18} style={{ color: 'var(--muted-foreground)' }} /> : key}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <motion.div key="success" initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center gap-4">
                <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  <CheckCircle2 size={44} style={{ color: 'var(--foreground)' }} />
                </div>
                <h3 style={{ color: 'var(--foreground)', fontWeight: 700 }}>PIN Changed!</h3>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    );
  }

  if (step === 'recovery') {
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
        <div style={{ height: 50 }} />
        <div className="flex items-center gap-3 px-5 mb-6">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setStep('menu')} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
            <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
          </motion.button>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Recovery Phrase</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-5">
          <div className="flex items-start gap-2 p-3 rounded-[12px] mb-4" style={{ background: 'var(--muted)', border: '1px solid var(--muted)' }}>
            <AlertTriangle size={14} style={{ color: 'var(--muted-foreground)', flexShrink: 0, marginTop: 1 }} />
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.5 }}>
              Never share your recovery phrase with anyone. Convia staff will never ask for it.
            </p>
          </div>
          <div className="rounded-[16px] p-4 mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12 }}>Your 12-word recovery phrase</p>
            <div className="grid grid-cols-3 gap-2">
              {['abandon', 'ability', 'able', 'about', 'above', 'absent', 'absorb', 'abstract', 'absurd', 'abuse', 'access', 'accident'].map((word, i) => (
                <div key={i} className="flex items-center gap-2 p-2 rounded-[10px]" style={{ background: 'var(--muted)' }}>
                  <span style={{ color: 'var(--muted-foreground)', fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
                  <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 500 }}>{word}</span>
                </div>
              ))}
            </div>
          </div>
          <motion.button whileTap={{ scale: 0.97 }} className="w-full py-3.5 rounded-[16px] text-white mb-3" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15, boxShadow: 'none' }}>
            Copy to Clipboard
          </motion.button>
          <motion.button whileTap={{ scale: 0.97 }} onClick={() => setStep('menu')} className="w-full py-3.5 rounded-[16px]" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontWeight: 600, fontSize: 15, border: '1px solid var(--border)' }}>
            I've Saved It
          </motion.button>
        </div>
      </div>
    );
  }

  if (step === 'devices') {
    const sessions = [
      { device: 'iPhone 15 Pro', location: 'Lagos, Nigeria', current: true, time: 'Active now' },
      { device: 'MacBook Pro', location: 'Lagos, Nigeria', current: false, time: '2 hours ago' },
      { device: 'iPad Air', location: 'Abuja, Nigeria', current: false, time: '3 days ago' },
    ];
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
        <div style={{ height: 50 }} />
        <div className="flex items-center gap-3 px-5 mb-6">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setStep('menu')} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
            <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
          </motion.button>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Active Sessions</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-5">
          {sessions.map((s, i) => (
            <div key={i} className="flex items-center gap-3 p-4 rounded-[16px] mb-3 glass-card" style={{ border: '1px solid var(--border)' }}>
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: s.current ? 'var(--muted)' : 'var(--muted)' }}>
                <Smartphone size={18} style={{ color: s.current ? 'var(--primary)' : 'var(--muted-foreground)' }} />
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{s.device}</p>
                  {s.current && <span className="px-2 py-0.5 rounded-full" style={{ background: 'var(--muted)', color: 'var(--foreground)', fontSize: 10, fontWeight: 700 }}>CURRENT</span>}
                </div>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{s.location}</p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 11 }}>{s.time}</p>
              </div>
              {!s.current && (
                <motion.button whileTap={{ scale: 0.9 }} className="px-3 py-1.5 rounded-lg" style={{ background: 'var(--muted)', color: 'var(--destructive)', fontSize: 12, fontWeight: 600 }}>
                  Revoke
                </motion.button>
              )}
            </div>
          ))}
          <motion.button whileTap={{ scale: 0.97 }} className="w-full py-3.5 rounded-[16px] mt-2" style={{ background: 'var(--muted)', color: 'var(--destructive)', fontWeight: 700, fontSize: 15, border: '1px solid var(--muted)' }}>
            Revoke All Other Sessions
          </motion.button>
        </div>
      </div>
    );
  }

  if (step === 'whitelist') {
    return (
      <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
        <div style={{ height: 50 }} />
        <div className="flex items-center gap-3 px-5 mb-6">
          <motion.button whileTap={{ scale: 0.9 }} onClick={() => setStep('menu')} className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
            <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
          </motion.button>
          <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Address Whitelist</h2>
        </div>
        <div className="flex-1 overflow-y-auto px-5">
          <div className="flex items-center justify-between p-4 rounded-[16px] mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
            <div>
              <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>Whitelist Mode</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Only allow withdrawals to whitelisted addresses</p>
            </div>
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={() => setWhitelist(!whitelist)}
              className="w-12 h-7 rounded-full flex items-center px-1 transition-colors"
              style={{ background: whitelist ? 'var(--primary)' : 'var(--switch-background)', justifyContent: whitelist ? 'flex-end' : 'flex-start' }}
            >
              <div className="w-5 h-5 rounded-full bg-white" />
            </motion.button>
          </div>
          {whitelist ? (
            <>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 10 }}>Whitelisted Addresses</p>
              {[
                { label: 'Cold Wallet', address: '0x4f3a...B2E', asset: 'ETH' },
                { label: 'Hardware', address: 'bc1q...8x2f', asset: 'BTC' },
              ].map((addr, i) => (
                <div key={i} className="flex items-center gap-3 p-4 rounded-[16px] mb-3 glass-card" style={{ border: '1px solid var(--border)' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                    <CheckCircle2 size={18} style={{ color: 'var(--foreground)' }} />
                  </div>
                  <div className="flex-1">
                    <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 13 }}>{addr.label}</p>
                    <p style={{ color: 'var(--muted-foreground)', fontSize: 12, fontFamily: 'monospace' }}>{addr.address}</p>
                  </div>
                  <span className="px-2 py-1 rounded-lg" style={{ background: 'var(--muted)', color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600 }}>{addr.asset}</span>
                </div>
              ))}
              <motion.button whileTap={{ scale: 0.97 }} className="w-full py-3.5 rounded-[16px] text-white" style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}>
                Add Address
              </motion.button>
            </>
          ) : (
            <div className="text-center py-12">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                <Globe size={28} style={{ color: 'var(--muted-foreground)' }} />
              </div>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 13 }}>Whitelist is off. Withdrawals allowed to any address.</p>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main menu
  const toggles = [
    { icon: Fingerprint, label: 'Biometric Login', desc: 'Face ID / Fingerprint', value: biometric, onChange: setBiometric },
    { icon: Shield, label: '2FA Authentication', desc: 'Google Authenticator', value: twoFA, onChange: setTwoFA },
    { icon: Bell, label: 'Login Alerts', desc: 'Email on new login', value: loginAlerts, onChange: setLoginAlerts },
    { icon: Bell, label: 'Transaction Alerts', desc: 'Push for every transaction', value: txAlerts, onChange: setTxAlerts },
    { icon: hideBalance ? EyeOff : Eye, label: 'Hide Balances', desc: 'Tap to reveal balance', value: hideBalance, onChange: setHideBalance },
  ];

  const actions = [
    { icon: Lock, label: 'Change PIN', desc: 'Update your 4-digit PIN', onClick: () => setStep('pin') },
    { icon: KeyRound, label: 'Recovery Phrase', desc: 'View your 12-word seed', onClick: () => setStep('recovery') },
    { icon: Smartphone, label: 'Active Sessions', desc: 'Manage logged-in devices', onClick: () => setStep('devices') },
    { icon: Shield, label: 'Address Whitelist', desc: 'Restrict withdrawals', onClick: () => setStep('whitelist') },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <div className="flex items-center gap-3 px-5 mb-6">
        <motion.button whileTap={{ scale: 0.9 }} onClick={goBack} aria-label="Go back" className="w-10 h-10 rounded-2xl flex items-center justify-center glass-card" style={{ border: '1px solid var(--border)' }}>
          <ChevronLeft size={20} style={{ color: 'var(--foreground)' }} />
        </motion.button>
        <h2 style={{ color: 'var(--foreground)', fontWeight: 800 }}>Security</h2>
      </div>

      <div className="flex-1 overflow-y-auto px-5">
        <div className="rounded-[20px] p-5 mb-4 glass-card glass-refraction" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'var(--border)' }}>
              <Shield size={24} style={{ color: 'var(--foreground)' }} />
            </div>
            <div>
              <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16 }}>Security Score: 85/100</p>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>Good protection. Enable whitelist for max security.</p>
            </div>
          </div>
          <div className="w-full h-2 rounded-full overflow-hidden" style={{ background: 'var(--muted)' }}>
            <motion.div initial={{ width: 0 }} animate={{ width: '85%' }} transition={{ duration: 0.8 }} className="h-full rounded-full" style={{ background: 'var(--foreground)' }} />
          </div>
        </div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 10, fontWeight: 600 }}>PROTECTION</p>
        <div className="rounded-[20px] overflow-hidden mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
          {toggles.map((t, i) => {
            const Icon = t.icon;
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-3.5" style={{ borderBottom: i < toggles.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  <Icon size={18} style={{ color: 'var(--foreground)' }} />
                </div>
                <div className="flex-1">
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{t.label}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{t.desc}</p>
                </div>
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => t.onChange(!t.value)}
                  className="w-12 h-7 rounded-full flex items-center px-1 transition-colors"
                  style={{ background: t.value ? 'var(--primary)' : 'var(--switch-background)', justifyContent: t.value ? 'flex-end' : 'flex-start' }}
                >
                  <div className="w-5 h-5 rounded-full bg-white" />
                </motion.button>
              </div>
            );
          })}
        </div>

        <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 10, fontWeight: 600 }}>ACTIONS</p>
        <div className="rounded-[20px] overflow-hidden mb-4 glass-card" style={{ border: '1px solid var(--border)' }}>
          {actions.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.button
                key={i}
                whileTap={{ scale: 0.98 }}
                onClick={a.onClick}
                className="flex items-center gap-3 px-4 py-3.5 w-full"
                style={{ borderBottom: i < actions.length - 1 ? '1px solid var(--border)' : 'none' }}
              >
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                  <Icon size={18} style={{ color: 'var(--foreground)' }} />
                </div>
                <div className="flex-1 text-left">
                  <p style={{ color: 'var(--foreground)', fontWeight: 600, fontSize: 14 }}>{a.label}</p>
                  <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{a.desc}</p>
                </div>
                <ChevronLeft size={16} style={{ color: 'var(--muted-foreground)', transform: 'rotate(180deg)' }} />
              </motion.button>
            );
          })}
        </div>

        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}
