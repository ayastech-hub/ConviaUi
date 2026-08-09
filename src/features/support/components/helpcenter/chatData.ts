export interface ChatMessage {
  id: string;
  text: string;
  sender: 'user' | 'support';
  time: string;
  status?: 'sent' | 'delivered' | 'read';
}

export const initialMessages: ChatMessage[] = [
  { id: '1', text: 'Hi there! Welcome to Convia Support. How can I help you today?', sender: 'support', time: 'Just now', status: 'read' },
];

export const quickReplies = [
  'I have a withdrawal issue',
  'My KYC is pending',
  'I was charged a wrong fee',
  'I cannot log in',
];

const botResponses: Record<string, string> = {
  withdrawal: 'I understand you are having a withdrawal issue. Could you please share the transaction ID or the asset you are trying to withdraw? I will look into it right away.',
  kyc: 'For KYC pending issues, verification typically takes 1-5 minutes. If it has been longer, please ensure your document photo is clear and all corners are visible. I can escalate this to our verification team if needed.',
  fee: 'I am sorry about the fee concern. All our fees are transparent and shown before each transaction. Could you tell me which transaction had the incorrect fee so I can investigate?',
  login: 'For login issues, please try resetting your password using the "Forgot Password" link. If you have 2FA enabled and cannot access it, I can help you recover your account securely.',
};

/** Simple keyword-matching mock bot reply for the support chat demo. */
export function getBotResponse(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('withdraw')) return botResponses.withdrawal;
  if (lower.includes('kyc') || lower.includes('verif')) return botResponses.kyc;
  if (lower.includes('fee') || lower.includes('charge')) return botResponses.fee;
  if (lower.includes('login') || lower.includes('log in') || lower.includes('password')) return botResponses.login;
  return 'Thank you for reaching out. I have noted your concern and our team will look into this. Is there anything else I can help you with?';
}
