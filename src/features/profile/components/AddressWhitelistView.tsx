import { useCallback, useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Trash2, Loader } from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { useAuth } from '../../../shared/context/AuthContext';
import * as securityApi from '../../../shared/api/security';
import type { WhitelistEntry } from '../../../shared/api/security';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface AddressWhitelistViewProps {
  onBack: () => void;
  enabled?: boolean;
  onToggle?: () => void;
}

const CHAINS: Array<{ id: 'evm' | 'solana' | 'bitcoin' | 'tron'; label: string }> = [
  { id: 'evm', label: 'EVM (ETH / Base / BSC…)' },
  { id: 'solana', label: 'Solana' },
  { id: 'bitcoin', label: 'Bitcoin' },
  { id: 'tron', label: 'Tron' },
];

/** Live withdrawal whitelist — GET/POST/DELETE /security/:userId/withdrawal-whitelist */
export function AddressWhitelistView({ onBack }: AddressWhitelistViewProps) {
  const { t } = useLanguage();
