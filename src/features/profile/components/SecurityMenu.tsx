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
