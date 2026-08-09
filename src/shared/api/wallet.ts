import { api } from './client';

export type WalletAddress = { chainFamily: string; address: string };

export type DepositInfo = {
  address: string;
  chainName: string;
  requiredConfirmations: number;
  contractAddress: string | null;
};

export function fetchAddresses(userId: string) {
  return api.get<WalletAddress[]>(`/wallets/${userId}/addresses`);
}

export function fetchDepositInfo(userId: string, asset: string, chainKey: string) {
  const q = new URLSearchParams({ asset, chainKey });
  return api.get<DepositInfo>(`/wallets/${userId}/deposit-info?${q}`);
}

export function fetchBalances(userId: string) {
  return api.get<unknown>(`/wallets/${userId}/balances`);
}

export function withdrawCrypto(body: {
  userId: string;
  destinationAddress: string;
  asset: string;
  amount: string;
  chainKey: string;
  chainFamily: string;
}) {
  return api.post('/crypto/withdraw', body, { idempotent: true });
}
