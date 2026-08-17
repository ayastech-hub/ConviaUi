import { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Loader } from 'lucide-react';
import type { Screen, Transaction } from '../../../shared/data/mockData';
import { TransactionReceipt } from '../../../shared/components/TransactionReceipt';
import { SERVICE_GROUPS, isBillService, type ServiceItem } from '../components/serviceData';
import { ServiceHub } from '../components/ServiceHub';
import { ProviderSelector } from '../components/ProviderSelector';
import { ServiceAmountInput } from '../components/ServiceAmountInput';
import { PaymentSummaryCard } from '../components/PaymentSummaryCard';
import { ServicePaymentSuccess, type ServiceSuccessInfo } from '../components/ServicePaymentSuccess';
import { useAuth } from '../../../shared/context/AuthContext';
import { useSupportedCountries } from '../../../shared/hooks/useSupportedCountries';
import * as billsApi from '../../../shared/api/bills';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { WalletFeatureBanner } from '../../../shared/components/WalletFeatureBanner';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface ServicesScreenProps {
  navigate: (s: Screen) => void;
  goBack: () => void;
  switchTab: (s: Screen) => void;
}

/** Map UI service ids → backend CATEGORY (airtime|data|electricity|cable|betting). */
function toCategory(serviceId: string): string {
  if (serviceId === 'bills') return 'cable';
  return serviceId;
}

export function ServicesScreen({ navigate, switchTab }: ServicesScreenProps) {
  const { t } = useLanguage();
