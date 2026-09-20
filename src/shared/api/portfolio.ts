import { api } from './client';

/** Actual shape from portfolioService.getSummary */
export type HoldingView = {
  asset: string;
  quantity: string;
  priceUsd: string;
  valueUsd: string;
};

export type PortfolioSummary = {
  totalValueUsd: string;
  holdings: HoldingView[];
};

export async function fetchPortfolio(userId: string): Promise<PortfolioSummary> {
  const raw = await api.get<PortfolioSummary | { holdings?: HoldingView[]; totalValueUsd?: string }>(
    `/portfolio/${userId}`,
  );
  const holdings = Array.isArray(raw?.holdings) ? raw.holdings : [];
  return {
    totalValueUsd: String(raw?.totalValueUsd ?? '0'),
    holdings,
  };
}
