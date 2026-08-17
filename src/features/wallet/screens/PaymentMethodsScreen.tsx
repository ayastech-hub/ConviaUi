import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Plus, Building2, Trash2, Check, Loader, ChevronDown } from 'lucide-react';
import { useAuth } from '../../../shared/context/AuthContext';
import * as banksApi from '../../../shared/api/banks';
import type { BankAccount } from '../../../shared/api/banks';
import { ApiError } from '../../../shared/api/types';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { ScreenHeader } from '../../../shared/components/ScreenHeader';
import { useSupportedCountries, useBanksForCountry } from '../../../shared/hooks/useSupportedCountries';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface PaymentMethodsScreenProps {
  goBack: () => void;
}

/**
 * Bank accounts for off-ramp — same flow as before (list + sheet),
 * but country & bank directory come from the API.
 */
export function PaymentMethodsScreen({ goBack }: PaymentMethodsScreenProps) {
  const { t } = useLanguage();
