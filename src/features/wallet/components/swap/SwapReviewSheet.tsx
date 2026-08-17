import { Fragment } from 'react';
import { motion } from 'motion/react';
import { X, ArrowDownUp, ArrowRight, Route, Check } from 'lucide-react';
import type { Asset } from '../../../../shared/data/mockData';
import { AssetIcon } from '../../../../shared/components/AssetIcon';
import { formatAmount, formatRate, impactLevelFor, IMPACT_COLORS, IMPACT_LABELS } from './utils';
import { useLanguage } from '../../../../shared/context/LanguageContext';

interface SwapReviewSheetProps {
  fromAsset: Asset;
  toAsset: Asset;
  fromNum: number;
  toAmount: number;
  fromUSD: number;
  toUSD: number;
  format: (n: number) => string;
  rate: number;
  priceImpactPct: number;
  effectiveSlippage: string;
  minReceived: number;
  networkFeeUSD: number;
  route: string[];
  onClose: () => void;
  onConfirm: () => void;
}

/** The bottom-sheet "Review Swap" modal, shown before confirming a swap. */
export function SwapReviewSheet({
  fromAsset, toAsset, fromNum, toAmount, fromUSD, toUSD, format, rate,
  priceImpactPct, effectiveSlippage, minReceived, networkFeeUSD, route, onClose, onConfirm,
}: SwapReviewSheetProps) {
  const { t } = useLanguage();
