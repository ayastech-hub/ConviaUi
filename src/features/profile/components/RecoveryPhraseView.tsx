import { useState } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, Eye, EyeOff, Loader } from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { useAuth } from '../../../shared/context/AuthContext';
import * as securityApi from '../../../shared/api/security';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';

interface RecoveryPhraseViewProps {
  onBack: () => void;
}

/**
 * Reveals BIP39 mnemonic via POST /security/:userId/recovery-phrase/reveal
 * after transaction PIN (+ optional MFA). Never mocks a seed.
 */
export function RecoveryPhraseView({ onBack }: RecoveryPhraseViewProps) {
  const { userId } = useAuth();
  const [pin, setPin] = useState('');
  const [mfa, setMfa] = useState('');
  const [showPin, setShowPin] = useState(false);
  const [words, setWords] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<{ code?: string; message?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const reveal = async () => {
    if (!userId) {
      setError({ message: 'Sign in required' });
      return;
    }
    if (!/^\d{6}$/.test(pin)) {
      setError({ message: 'Enter your 6-digit transaction PIN' });
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await securityApi.revealRecoveryPhrase(userId, pin, mfa || undefined);
      setWords(res.mnemonic.trim().split(/\s+/));
    } catch (err) {
      if (err instanceof ApiError) {
        setError({ code: err.code, message: err.body.message || err.message });
      } else {
        setError({ message: 'Could not reveal recovery phrase' });
      }
    } finally {
      setLoading(false);
    }
  };

  const copy = async () => {
    if (!words) return;
    try {
      await navigator.clipboard.writeText(words.join(' '));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <ScreenHeader title="Recovery Phrase" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-5 pb-8">
        <div
          className="flex items-start gap-2 p-3 rounded-[12px] mb-4"
          style={{ background: 'var(--muted)', border: '1px solid var(--border)' }}
        >
          <AlertTriangle size={14} style={{ color: 'var(--warning)', flexShrink: 0, marginTop: 1 }} />
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12, lineHeight: 1.5 }}>
            Never share your recovery phrase. Convia staff will never ask for it. This reveal is rate-limited and audited.
          </p>
        </div>

        {error && (
          <FeatureAlert
            reason={mapApiCodeToReason(error.code)}
            message={error.message}
            detail={error.code}
          />
        )}

        {!words ? (
          <>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 13, marginBottom: 12 }}>
              Enter your transaction PIN to decrypt and show your BIP39 seed (stored encrypted at rest).
            </p>
            <div className="relative mb-3">
              <input
                type={showPin ? 'text' : 'password'}
                inputMode="numeric"
                maxLength={6}
                placeholder="Transaction PIN"
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 6))}
                className="w-full rounded-[14px] px-4 py-3.5"
                style={{
                  background: 'var(--muted)',
                  border: '1px solid var(--border)',
                  color: 'var(--foreground)',
                  fontSize: 16,
                  letterSpacing: 4,
                }}
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setShowPin((v) => !v)}
              >
                {showPin ? <EyeOff size={18} style={{ color: 'var(--muted-foreground)' }} /> : <Eye size={18} style={{ color: 'var(--muted-foreground)' }} />}
              </button>
            </div>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="MFA code (if enabled)"
              value={mfa}
              onChange={(e) => setMfa(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full rounded-[14px] px-4 py-3.5 mb-4"
              style={{
                background: 'var(--muted)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
                fontSize: 15,
              }}
            />
            <motion.button
              whileTap={{ scale: 0.97 }}
              disabled={loading || !userId}
              onClick={() => void reveal()}
              className="w-full py-3.5 rounded-[16px] text-white flex items-center justify-center gap-2"
              style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15, opacity: loading ? 0.7 : 1 }}
            >
              {loading ? <Loader size={18} className="animate-spin" /> : null}
              Reveal seed phrase
            </motion.button>
          </>
        ) : (
          <>
            <div className="rounded-[16px] p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
              <p style={{ color: 'var(--muted-foreground)', fontSize: 12, marginBottom: 12 }}>
                Your {words.length}-word recovery phrase
              </p>
              <div className="grid grid-cols-3 gap-2">
                {words.map((word, i) => (
                  <div key={i} className="flex items-center gap-2 p-2 rounded-[10px]" style={{ background: 'var(--muted)' }}>
                    <span style={{ color: 'var(--muted-foreground)', fontSize: 10, fontWeight: 700 }}>{i + 1}</span>
                    <span style={{ color: 'var(--foreground)', fontSize: 12, fontWeight: 500 }}>{word}</span>
                  </div>
                ))}
              </div>
            </div>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={() => void copy()}
              className="w-full py-3.5 rounded-[16px] text-white mb-3"
              style={{ background: 'var(--primary)', fontWeight: 700, fontSize: 15 }}
            >
              {copied ? 'Copied' : 'Copy to Clipboard'}
            </motion.button>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={onBack}
              className="w-full py-3.5 rounded-[16px]"
              style={{
                background: 'var(--muted)',
                color: 'var(--foreground)',
                fontWeight: 600,
                fontSize: 15,
                border: '1px solid var(--border)',
              }}
            >
              I've Saved It
            </motion.button>
          </>
        )}
      </div>
    </div>
  );
}
