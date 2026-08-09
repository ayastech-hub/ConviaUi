import { api } from './client';

/** Actual shape from portfolioService.getSummary (src/services/portfolio-service.ts). */
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

export function fetchPortfolio(userId: string) {
  return api.get<PortfolioSummary>(`/portfolio/${userId}`);
}
