import { motion } from 'motion/react';
import {
  Shield, Fingerprint, Bell, Eye, EyeOff, Lock, Smartphone, ChevronRight, Copy, Check,
} from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { ListSection } from '../../../shared/components/ListSection';
import { ListRow } from '../../../shared/components/ListRow';
import { ToggleSwitch } from '../../../shared/components/ToggleSwitch';
import type { SecurityStep } from './types';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../shared/context/AuthContext';
import * as securityApi from '../../../shared/api/security';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface SecurityMenuProps {
  goBack: () => void;
  onNavigate: (step: SecurityStep) => void;
  biometric: boolean;
  setBiometric: (v: boolean) => void;
  twoFA: boolean;
  setTwoFA: (v: boolean) => void;
  loginAlerts: boolean;
  setLoginAlerts: (v: boolean) => void;
  txAlerts: boolean;
  setTxAlerts: (v: boolean) => void;
  hideBalance: boolean;
  setHideBalance: (v: boolean) => void;
}

export function SecurityMenu({
  goBack,
  onNavigate,
  biometric,
  setBiometric,
  twoFA,
  setTwoFA,
  loginAlerts,
  setLoginAlerts,
  txAlerts,
  setTxAlerts,
  hideBalance,
  setHideBalance,
}: SecurityMenuProps) {
  const { t } = useLanguage();
  const { userId } = useAuth();
  const [antiPhishing, setAntiPhishing] = useState('');
  const [hasPin, setHasPin] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!userId) return;
    securityApi.getAntiPhishingCode(userId).then((r) => setAntiPhishing(r.code)).catch(() => {});
    securityApi
      .getTransactionPinStatus(userId)
      .then((s) => setHasPin(Boolean(s.hasPin ?? (s as { set?: boolean }).set)))
      .catch(() => {});
  }, [userId]);

  const score = useMemo(() => {
    let n = 35;
    if (hasPin) n += 20;
    if (biometric) n += 10;
    if (twoFA) n += 15;
    if (loginAlerts) n += 8;
    if (txAlerts) n += 7;
    if (antiPhishing) n += 5;
    return Math.min(100, n);
  }, [hasPin, biometric, twoFA, loginAlerts, txAlerts, antiPhishing]);

  const scoreLabel = score >= 85 ? 'Strong' : score >= 65 ? 'Good' : 'Needs work';
  const hint = !hasPin
    ? 'Set a transaction PIN first.'
    : !twoFA
      ? 'Authenticator enrollment is coming — keep alerts on.'
      : 'Enable address whitelist for withdrawals.';

  const copyCode = async () => {
    if (!antiPhishing) return;
    try {
      await navigator.clipboard.writeText(antiPhishing);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1400);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <ScreenHeader title={t('security.title')} subtitle="PIN, sessions, and alerts" onBack={goBack} />

      <div className="flex-1 overflow-y-auto px-5">
        <div className="rounded-[22px] p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center" style={{ background: 'var(--muted)' }}>
                <Shield size={20} style={{ color: 'var(--foreground)' }} />
              </div>
              <div>
                <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 16, letterSpacing: '-0.02em' }}>
                  {score}
                  <span style={{ color: 'var(--muted-foreground)', fontWeight: 500, fontSize: 13 }}>/100</span>
                </p>
                <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{scoreLabel}</p>
              </div>
            </div>
          </div>
          <div className="w-full h-1.5 rounded-full overflow-hidden mb-2" style={{ background: 'var(--muted)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${score}%` }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="h-full rounded-full"
              style={{ background: score >= 85 ? 'var(--positive)' : 'var(--primary)' }}
            />
          </div>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 12 }}>{hint}</p>
        </div>

        {antiPhishing ? (
          <button
            type="button"
            onClick={() => void copyCode()}
            className="w-full rounded-[18px] p-4 mb-4 text-left"
            style={{ background: 'var(--card)', border: '1px solid var(--border)' }}
          >
            <div className="flex items-center justify-between mb-1">
              <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, letterSpacing: '0.06em' }}>
                ANTI-PHISHING
              </p>
              {copied ? <Check size={14} style={{ color: 'var(--positive)' }} /> : <Copy size={14} style={{ color: 'var(--muted-foreground)' }} />}
            </div>
            <p style={{ color: 'var(--foreground)', fontWeight: 700, fontSize: 20, letterSpacing: '0.12em', fontVariantNumeric: 'tabular-nums' }}>
              {antiPhishing}
            </p>
            <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 6 }}>
              Genuine Convia emails include this code. Copy to compare.
            </p>
          </button>
        ) : null}

        <ListSection title="PROTECTION">
          <ListRow
            icon={Fingerprint}
            label="Biometric unlock"
            desc="Face ID / fingerprint on this device"
            trailing={<ToggleSwitch checked={biometric} onChange={() => setBiometric(!biometric)} />}
          />
          <ListRow
            icon={Shield}
            label="Two-factor"
            desc="Authenticator enrollment coming soon"
            trailing={<ToggleSwitch checked={twoFA} onChange={() => setTwoFA(!twoFA)} />}
          />
          <ListRow
            icon={Bell}
            label="Login alerts"
            desc="Email when a new device signs in"
            trailing={<ToggleSwitch checked={loginAlerts} onChange={() => setLoginAlerts(!loginAlerts)} />}
          />
          <ListRow
            icon={Bell}
            label="Transaction alerts"
            desc="Notify on every send and bill"
            trailing={<ToggleSwitch checked={txAlerts} onChange={() => setTxAlerts(!txAlerts)} />}
          />
          <ListRow
            icon={hideBalance ? EyeOff : Eye}
            label="Hide balances"
            desc="Mask amounts on Home"
            trailing={<ToggleSwitch checked={hideBalance} onChange={() => setHideBalance(!hideBalance)} />}
          />
        </ListSection>

        <ListSection title="ACTIONS">
          <ListRow
            icon={Lock}
            label={hasPin ? 'Change PIN' : 'Set transaction PIN'}
            desc={hasPin ? '6-digit PIN for withdrawals' : 'Required before you send funds'}
            onClick={() => onNavigate('pin')}
            trailing={<ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />}
          />
          <ListRow
            icon={Smartphone}
            label="Active sessions"
            desc="Devices signed in to this account"
            onClick={() => onNavigate('devices')}
            trailing={<ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />}
          />
          <ListRow
            icon={Shield}
            label="Address whitelist"
            desc="Restrict withdrawals to known addresses"
            onClick={() => onNavigate('whitelist')}
            trailing={<ChevronRight size={16} style={{ color: 'var(--muted-foreground)' }} />}
          />
        </ListSection>

        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}
