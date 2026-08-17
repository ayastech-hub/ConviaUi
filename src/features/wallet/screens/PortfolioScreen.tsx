import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, TrendingUp, TrendingDown } from 'lucide-react';
import {
  AreaChart, Area, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid,
  PieChart, Pie, Cell,
} from 'recharts';
import { usePortfolio } from '../../../shared/hooks/usePortfolio';
import { holdingToAsset } from '../../../shared/utils/mapApiToUi';
import { useCurrency } from '../../../shared/context/CurrencyContext';
import { AssetIcon } from '../../../shared/components/AssetIcon';
import { useLanguage } from '../../../shared/context/LanguageContext';

interface PortfolioScreenProps {
  goBack: () => void;
}

const COLORS = ['#3B82F6', '#627EEA', '#9945FF', '#F3BA2F', '#26A17B', '#2775CA'];
const periods = ['1D', '1W', '1M', '3M', 'YTD', 'All'];

export function PortfolioScreen({ goBack }: PortfolioScreenProps) {
  const { t } = useLanguage();
