import { api } from './client';

export type PortfolioSummary = {
  totalValueUsd?: number;
  assets?: Array<{
    asset: string;
    balance?: string | number;
    valueUsd?: number;
    change24h?: number;
  }>;
  [key: string]: unknown;
};

export function fetchPortfolio(userId: string) {
  return api.get<PortfolioSummary>(`/portfolio/${userId}`);
}
