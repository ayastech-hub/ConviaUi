import { useEffect, useState } from 'react';
import { type Asset } from '../../../shared/data/mockData';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft } from 'lucide-react';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { OnRampFormStep } from '../components/onramp/OnRampFormStep';
import { OnRampReviewStep } from '../components/onramp/OnRampReviewStep';
import { OnRampInstructionsStep } from '../components/onramp/OnRampInstructionsStep';
import { OnRampProcessingStep, OnRampDoneStep } from '../components/onramp/OnRampStatusSteps';
import { WalletFeatureBanner } from '../../../shared/components/WalletFeatureBanner';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { GateHint } from '../../../shared/components/AccountStatusBanners';
import { useAuth } from '../../../shared/context/AuthContext';
import { useAccountGates } from '../../../shared/hooks/useAccountGates';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import * as fiatApi from '../../../shared/api/fiat';
import type { LocalOnrampOrder, LocalOnrampQuote } from '../../../shared/api/fiat';
import { ApiError } from '../../../shared/api/types';
import { queryClient, queryKeys } from '../../../shared/query/queryClient';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface OnRampScreenProps {
  goBack: () => void;
}

/**
 * Live local on-ramp: quote → order (Paystack/Flutterwave by country) → bank details or checkout URL.
 * No mock bank accounts.
 */
export function OnRampScreen({ goBack }: OnRampScreenProps) {
  const { t } = useLanguage();
