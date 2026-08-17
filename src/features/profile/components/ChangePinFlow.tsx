import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CheckCircle2, Loader } from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { useAuth } from '../../../shared/context/AuthContext';
import * as securityApi from '../../../shared/api/security';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface ChangePinFlowProps {
  onBack: () => void;
}

/** Set or change transaction PIN via POST/PUT /security/:userId/transaction-pin. */
export function ChangePinFlow({ onBack }: ChangePinFlowProps) {
  const { t } = useLanguage();
