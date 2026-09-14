import { api } from './client';

export function convertRate(params: { from: string; to: string; amount: string }) {
  const q = new URLSearchParams(params);
  return api.get<{
    from: string;
    to: string;
    amountIn: string;
    amountOut: string;
    rate: number;
    hops?: unknown;
    direction?: string;
  }>(`/rates/convert?${q}`, { auth: false });
}
