import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { useLanguage } from '../../../../shared/context/LanguageContext';

interface ReceiveTokenListProps {
  assets: Asset[];
  goBack: () => void;
  onSelect: (a: Asset) => void;
}

/** Initial "Select a token to receive" full-screen list. */
export function ReceiveTokenList({ assets, goBack, onSelect }: ReceiveTokenListProps) {
  const { t } = useLanguage();
