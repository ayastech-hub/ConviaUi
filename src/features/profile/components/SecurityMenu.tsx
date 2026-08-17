import { motion } from 'motion/react';
import { Shield, Fingerprint, Bell, Eye, EyeOff, Lock, Smartphone, ChevronLeft } from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { ListSection } from '../../../shared/components/ListSection';
import { ListRow } from '../../../shared/components/ListRow';
import { ToggleSwitch } from '../../../shared/components/ToggleSwitch';
import type { SecurityStep } from './types';
import { useEffect, useState } from 'react';
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

/** Main Security Center menu: score card, protection toggles, and quick actions. */
export function SecurityMenu({
  goBack, onNavigate,
  biometric, setBiometric, twoFA, setTwoFA,
  loginAlerts, setLoginAlerts, txAlerts, setTxAlerts,
  hideBalance, setHideBalance,
}: SecurityMenuProps) {
  const { t } = useLanguage();
  const { userId } = useAuth();
  const [antiPhishing, setAntiPhishing] = useState('');
  useEffect(() => {
    if (!userId) return;
    securityApi.getAntiPhishingCode(userId).then((r) => setAntiPhishing(r.code)).catch(() => {});
  }, [userId]);

  const toggles = [
    { icon: Fingerprint, label: 'Biometric Login', desc: 'Face ID / Fingerprint', value: biometric, onChange: () => setBiometric(!biometric) },
    { icon: Shield, label: '2FA Authentication', desc: 'Google Authenticator', value: twoFA, onChange: () => setTwoFA(!twoFA) },
    { icon: Bell, label: 'Login Alerts', desc: 'Email on new login', value: loginAlerts, onChange: () => setLoginAlerts(!loginAlerts) },
    { icon: Bell, label: 'Transaction Alerts', desc: 'Push for every transaction', value: txAlerts, onChange: () => setTxAlerts(!txAlerts) },
    { icon: hideBalance ? EyeOff : Eye, label: 'Hide Balances', desc: 'Tap to reveal balance', value: hideBalance, onChange: () => setHideBalance(!hideBalance) },
  ];

  const actions: { icon: typeof Lock; label: string; desc: string; step: SecurityStep }[] = [
    { icon: Lock, label: 'Change PIN', desc: 'Update your 6-digit transaction PIN', step: 'pin' },
    { icon: Smartphone, label: 'Active Sessions', desc: 'Manage logged-in devices', step: 'devices' },
    { icon: Shield, label: 'Address Whitelist', desc: 'Restrict withdrawals', step: 'whitelist' },
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: 'var(--background)' }}>
      <div style={{ height: 50 }} />
      <ScreenHeader title={t('security.title')} onBack={goBack} />

      <div className="flex-1 overflow-y-auto px-5">
        <div className="rounded-[20px] p-5 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
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

        {antiPhishing ? (
        <div className="rounded-[16px] p-4 mb-4" style={{ background: 'var(--card)', border: '1px solid var(--border)' }}>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, fontWeight: 600, marginBottom: 4 }}>ANTI-PHISHING CODE</p>
          <p style={{ color: 'var(--foreground)', fontWeight: 800, fontSize: 18, letterSpacing: 2 }}>{antiPhishing}</p>
          <p style={{ color: 'var(--muted-foreground)', fontSize: 11, marginTop: 6 }}>Convia emails include this code — ignore messages without it.</p>
        </div>
      ) : null}
      <ListSection title="PROTECTION">
          {toggles.map((t) => (
            <ListRow key={t.label} icon={t.icon} label={t.label} desc={t.desc} trailing={<ToggleSwitch checked={t.value} onChange={t.onChange} />} />
          ))}
        </ListSection>

        <ListSection title="ACTIONS">
          {actions.map((a) => (
            <ListRow
              key={a.label}
              icon={a.icon}
              label={a.label}
              desc={a.desc}
              onClick={() => onNavigate(a.step)}
              trailing={<ChevronLeft size={16} style={{ color: 'var(--muted-foreground)', transform: 'rotate(180deg)' }} />}
            />
          ))}
        </ListSection>

        <div style={{ height: 32 }} />
      </div>
    </div>
  );
}
