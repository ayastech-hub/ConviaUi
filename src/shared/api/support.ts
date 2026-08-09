import { api } from './client';

export type SupportAttachment = {
  name: string;
  mimeType: string;
  size: number;
  dataUrl?: string;
};

export type SupportMessage = {
  id: string;
  caseId?: string;
  senderId: string;
  senderRole: 'user' | 'agent' | 'system' | string;
  body: string;
  attachments?: SupportAttachment[] | null;
  createdAt: string;
};

export type SupportCase = {
  id: string;
  userId: string;
  subject: string;
  category: string;
  status: string;
  priority: string;
  assigneeId?: string | null;
  closedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  messages?: SupportMessage[];
};

export function listMyCases() {
  return api.get<{ cases: SupportCase[] }>('/support/cases');
}

export function createCase(body: {
  subject: string;
  category: string;
  priority?: string;
  body: string;
  attachments?: SupportAttachment[];
}) {
  return api.post<SupportCase>('/support/cases', body);
}

export function getCase(caseId: string) {
  return api.get<SupportCase>(`/support/cases/${caseId}`);
}

export function postMessage(caseId: string, body: string, attachments?: SupportAttachment[]) {
  return api.post<SupportMessage>(`/support/cases/${caseId}/messages`, { body, attachments });
}

export function fileToAttachment(file: File): Promise<SupportAttachment> {
  return new Promise((resolve, reject) => {
    if (file.size > 400_000) {
      reject(new Error('File must be under 400KB'));
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      resolve({
        name: file.name,
        mimeType: file.type || 'application/octet-stream',
        size: file.size,
        dataUrl: String(reader.result || ''),
      });
    };
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.readAsDataURL(file);
  });
}
