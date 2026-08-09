import { api } from './client';
import type { LoginResponse, RegisterResponse, SessionTokens } from './types';

export async function register(input: {
  email: string;
  password: string;
  username: string;
}): Promise<RegisterResponse> {
  return api.post<RegisterResponse>('/auth/register', input, { auth: false });
}

export async function login(input: {
  email: string;
  password: string;
  deviceId?: string;
}): Promise<LoginResponse> {
  return api.post<LoginResponse>('/auth/login', input, { auth: false });
}

export async function logout(sessionId: string): Promise<void> {
  await api.post<void>('/auth/logout', { sessionId }, { auth: false });
}

export async function sendPhoneOtp(phone: string): Promise<void> {
  await api.post('/auth/phone/send-otp', { phone }, { auth: false });
}

export async function verifyPhoneOtp(phone: string, code: string): Promise<SessionTokens> {
  return api.post<SessionTokens>('/auth/phone/verify-otp', { phone, code }, { auth: false });
}

export async function sendMagicLink(email: string): Promise<void> {
  await api.post('/auth/magic-link', { email }, { auth: false });
}

export async function sendPasswordResetEmail(email: string): Promise<void> {
  // Backend exposes magic-link / email flows; use magic-link as reset entry until dedicated route is confirmed.
  await sendMagicLink(email);
}

/** Derive a valid username (3–24, alphanumeric + underscore) from an email local-part. */
export function usernameFromEmail(email: string): string {
  const local = email.split('@')[0] || 'user';
  let cleaned = local.replace(/[^a-zA-Z0-9_]/g, '_').replace(/_+/g, '_');
  if (cleaned.length < 3) cleaned = `${cleaned}_user`;
  return cleaned.slice(0, 24);
}
