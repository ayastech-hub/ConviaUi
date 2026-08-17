import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { type Screen, type Asset } from '../../../shared/data/mockData';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import * as banksApi from '../../../shared/api/banks';
import type { BankAccount } from '../../../shared/api/banks';
import { OffRampFormStep } from '../components/offramp/OffRampFormStep';
import { OffRampReviewStep, OffRampProcessingStep, OffRampDoneStep } from '../components/offramp/OffRampStatusSteps';
import { WalletFeatureBanner } from '../../../shared/components/WalletFeatureBanner';
import { useAuth } from '../../../shared/context/AuthContext';
import { useAccountGates } from '../../../shared/hooks/useAccountGates';
import { GateHint } from '../../../shared/components/AccountStatusBanners';
import { queryClient, queryKeys } from '../../../shared/query/queryClient';
import { useKycStatus } from '../../../shared/hooks/useKycStatus';
import * as fiatApi from '../../../shared/api/fiat';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface OffRampScreenProps {
  goBack: () => void;
  navigate: (s: Screen) => void;
}

export function OffRampScreen({ goBack, navigate }: OffRampScreenProps) {
  const { t } = useLanguage();
