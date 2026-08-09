import { api } from './client';

export type TokenMarketInfo = {
  symbol: string;
  name?: string;
  priceUsd?: number | string;
  change24h?: number | string;
  volume24h?: number | string;
  marketCap?: number | string;
  [key: string]: unknown;
};

export async function fetchTokensInfo(symbols: string[]) {
  const q = symbols.map((s) => s.trim()).filter(Boolean).join(',');
  return api.get<{ tokens: TokenMarketInfo[] }>(`/tokens/info?symbols=${encodeURIComponent(q)}`, { auth: false });
}
