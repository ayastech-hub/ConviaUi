import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { useCurrency } from '../../../../shared/context/CurrencyContext';
import { useLanguage } from '../../../../shared/context/LanguageContext';

interface WithdrawTokenListProps {
  assets: Asset[];
  goBack: () => void;
  onSelect: (a: Asset) => void;
}

/** Initial "Select a token to withdraw" list, showing each asset's balance. */
export function WithdrawTokenList({ assets, goBack, onSelect }: WithdrawTokenListProps) {
  const { t } = useLanguage();
