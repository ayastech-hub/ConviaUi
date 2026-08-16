import { api } from './client';

export type ContactMatch = {
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  matchedPhone?: string;
  onConvia: true;
};

export function matchContacts(phones: string[]) {
  return api.post<{
    matches: ContactMatch[];
    matchedCount: number;
    scanned: number;
    policy: string;
    message?: string;
  }>('/contacts/match', { phones });
}
