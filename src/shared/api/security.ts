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


export type SessionRow = {
  id: string;
  userId?: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt?: string;
  revokedAt?: string | null;
  [key: string]: unknown;
};

export function listSessions(userId: string) {
  return api.get<SessionRow[]>(`/security/${userId}/sessions`);
}

export function changeTransactionPin(userId: string, body: { currentPin: string; newPin: string }) {
  return api.put(`/security/${userId}/transaction-pin`, body);
}

export function submitKyc(
  userId: string,
  body: {
    documentType: 'national_id' | 'passport' | 'drivers_license';
    documentImageUrl: string;
    selfieImageUrl: string;
    declaredCountry?: string;
  },
) {
  return api.post(`/compliance/${userId}/kyc/submit`, body);
}


export function getAntiPhishingCode(userId: string) {
  return api.get<{ code: string }>(`/security/${userId}/anti-phishing-code`);
}
