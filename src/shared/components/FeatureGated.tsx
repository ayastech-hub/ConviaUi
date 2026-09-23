import type { ReactNode } from 'react';
import { useFeatureGates, SCREEN_FEATURE } from '../hooks/useFeatureGates';
import { FeatureGatePage } from './FeatureGatePage';

const LABELS: Record<string, string> = {
  swap: 'Swap',
  onramp: 'Buy',
  offramp: 'Sell',
  withdraw: 'Withdraw',
  transfer: 'Send',
  airtime: 'Airtime',
  data: 'Mobile data',
  electricity: 'Electricity',
  cable: 'TV & cable',
  betting: 'Betting',
  bills: 'Bills',
};

type Props = {
  /** Screen id or feature key */
  screen: string;
  goBack: () => void;
  children: ReactNode;
};

export function FeatureGated({ screen, goBack, children }: Props) {
  const { isScreenBlocked, country, loading } = useFeatureGates();
  const { blocked, reason } = isScreenBlocked(screen);
  if (loading) return <>{children}</>;
  if (!blocked) return <>{children}</>;
  const feat = SCREEN_FEATURE[screen] || screen;
  return (
    <FeatureGatePage
      featureLabel={LABELS[feat] || feat}
      reason={reason}
      country={country}
      goBack={goBack}
    />
  );
}
