import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Loader } from 'lucide-react';
import { type Asset } from '../../../shared/data/mockData';
import { NETWORKS } from '../components/deposit/types';
import { AssetDropdown } from '../components/deposit/AssetDropdown';
import { NetworkDropdown } from '../components/deposit/NetworkDropdown';
import { TokenSelectionList } from '../components/deposit/TokenSelectionList';
import { DepositSelectors } from '../components/deposit/DepositSelectors';
import { DepositAddressCard } from '../components/deposit/DepositAddressCard';
import { DepositInfoAndHistory } from '../components/deposit/DepositInfoAndHistory';
import { WalletFeatureBanner } from '../../../shared/components/WalletFeatureBanner';
import { FeatureAlert, mapApiCodeToReason } from '../../../shared/components/FeatureAlert';
import { useAuth } from '../../../shared/context/AuthContext';
import { fetchDepositInfo, fetchAddresses } from '../../../shared/api/wallet';
import { resolveChain } from '../../../shared/utils/chains';
import { ApiError } from '../../../shared/api/types';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { useTokenRegistry } from '../../../shared/hooks/useTokenRegistry';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface DepositScreenProps {
  goBack: () => void;
}

/** Deposit crypto to custodial address — same live source as Receive. */
export function DepositScreen({ goBack }: DepositScreenProps) {
  const { t } = useLanguage();
