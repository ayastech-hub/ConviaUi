import { useState } from 'react';
import type { Screen, Transaction } from '../../../shared/data/mockData';
import { TransactionReceipt } from '../../../shared/components/TransactionReceipt';
import { BalanceSummaryCard } from '../components/BalanceSummaryCard';
import { WalletQuickActions } from '../components/WalletQuickActions';
import { AssetsHistoryTabs } from '../components/AssetsHistoryTabs';
import { AssetsList } from '../components/AssetsList';
import { WalletHistoryList } from '../components/WalletHistoryList';
import { useWalletAssets } from '../../../shared/hooks/useWalletAssets';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface WalletScreenProps {
  navigate: (s: Screen) => void;
}

/**
 * Wallet — shows all supported + canonical tokens (even at zero balance).
 * No chain filter: omnibus balances are per asset, not per chain.
 * Chain selection remains on Deposit / Receive / Withdraw only.
 */
export function WalletScreen({ navigate }: WalletScreenProps) {
  const { t } = useLanguage();
