import { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { Monitor, Loader } from 'lucide-react';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { useAuth } from '../../../shared/context/AuthContext';
import * as securityApi from '../../../shared/api/security';
import type { SessionRow } from '../../../shared/api/security';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { ApiError } from '../../../shared/api/types';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface ActiveSessionsViewProps {
  onBack: () => void;
}

/** Login history from GET /security/:userId/sessions (UserSession rows). */
export function ActiveSessionsView({ onBack }: ActiveSessionsViewProps) {
  const { t } = useLanguage();
