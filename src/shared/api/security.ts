import { api } from './client';

export type WhitelistEntry = {
  id?: string;
  chainType: string;
  address: string;
  createdAt?: string;
  [key: string]: unknown;
};

export function listWhitelist(userId: string) {
  return api.get<WhitelistEntry[]>(`/security/${userId}/withdrawal-whitelist`);
}

export function addWhitelist(userId: string, chainType: 'evm' | 'solana' | 'bitcoin' | 'tron', address: string) {
  return api.post<WhitelistEntry>(`/security/${userId}/withdrawal-whitelist`, { chainType, address });
}

export function removeWhitelist(userId: string, chainType: string, address: string) {
  return api.delete<void>(`/security/${userId}/withdrawal-whitelist`, { chainType, address });
}

export function revealRecoveryPhrase(userId: string, transactionPin: string, mfaCode?: string) {
  return api.post<{ mnemonic: string; wordCount: number }>(
    `/security/${userId}/recovery-phrase/reveal`,
    { transactionPin, mfaCode },
  );
}

export function getTransactionPinStatus(userId: string) {
  return api.get<{ hasPin?: boolean; [k: string]: unknown }>(`/security/${userId}/transaction-pin/status`);
}

export function setTransactionPin(userId: string, pin: string) {
  return api.post(`/security/${userId}/transaction-pin`, { pin });
}
