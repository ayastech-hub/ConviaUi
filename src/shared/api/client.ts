import { ApiError, type ApiErrorBody, type SessionTokens } from './types';

const BASE_URL = (import.meta as ImportMeta & { env: Record<string, string> }).env
  ?.VITE_API_BASE_URL || 'http://localhost:4000';

const SESSION_KEY = 'convia.session';

type TokenGetter = () => SessionTokens | null;
type TokenSetter = (s: SessionTokens | null) => void;
type OnAuthFailure = () => void;

let getTokens: TokenGetter = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionTokens) : null;
  } catch {
    return null;
  }
};

let setTokens: TokenSetter = (s) => {
  if (!s) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(s));
};

let onAuthFailure: OnAuthFailure = () => {};

/** Called once from AuthProvider so the client stays decoupled from React. */
export function bindAuthHandlers(handlers: {
  getTokens: TokenGetter;
  setTokens: TokenSetter;
  onAuthFailure: OnAuthFailure;
}) {
  getTokens = handlers.getTokens;
  setTokens = handlers.setTokens;
  onAuthFailure = handlers.onAuthFailure;
}

export function loadStoredSession(): SessionTokens | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as SessionTokens) : null;
  } catch {
    return null;
  }
}

export function persistSession(s: SessionTokens | null) {
  if (!s) localStorage.removeItem(SESSION_KEY);
  else localStorage.setItem(SESSION_KEY, JSON.stringify(s));
}

export function newIdempotencyKey(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `idemp_${Date.now()}_${Math.random().toString(36).slice(2)}`;
}

type RequestOptions = {
  method?: string;
  body?: unknown;
  auth?: boolean;
  idempotent?: boolean;
  headers?: Record<string, string>;
  signal?: AbortSignal;
};

async function parseBody(res: Response): Promise<ApiErrorBody | unknown> {
  const text = await res.text();
  if (!text) return {};
  try {
    return JSON.parse(text);
  } catch {
    return { message: text };
  }
}

async function refreshSession(): Promise<SessionTokens | null> {
  const current = getTokens();
  if (!current?.refreshToken || !current.sessionId) return null;
  const res = await fetch(`${BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sessionId: current.sessionId, refreshToken: current.refreshToken }),
  });
  if (!res.ok) {
    setTokens(null);
    onAuthFailure();
    return null;
  }
  const data = (await res.json()) as { accessToken: string; refreshToken: string };
  const next: SessionTokens = {
    ...current,
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
  };
  setTokens(next);
  return next;
}

export async function apiRequest<T>(path: string, opts: RequestOptions = {}): Promise<T> {
  const method = opts.method || (opts.body ? 'POST' : 'GET');
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(opts.headers || {}),
  };
  if (opts.body !== undefined) headers['Content-Type'] = 'application/json';
  if (opts.idempotent) headers['Idempotency-Key'] = newIdempotencyKey();

  const attachAuth = (token: string | undefined) => {
    if (opts.auth !== false && token) headers.Authorization = `Bearer ${token}`;
  };

  attachAuth(getTokens()?.accessToken);

  const doFetch = () =>
    fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: opts.body !== undefined ? JSON.stringify(opts.body) : undefined,
      signal: opts.signal,
    });

  let res = await doFetch();

  if (res.status === 401 && opts.auth !== false) {
    const refreshed = await refreshSession();
    if (refreshed) {
      attachAuth(refreshed.accessToken);
      res = await doFetch();
    }
  }

  if (!res.ok) {
    const body = (await parseBody(res)) as ApiErrorBody;
    if (res.status === 401) {
      setTokens(null);
      onAuthFailure();
    }
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return (await parseBody(res)) as T;
}

export const api = {
  get: <T>(path: string, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'GET' }),
  post: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'POST', body }),
  patch: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'PATCH', body }),
  put: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'PUT', body }),
  delete: <T>(path: string, body?: unknown, opts?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiRequest<T>(path, { ...opts, method: 'DELETE', body }),
};

export function getApiBaseUrl() {
  return BASE_URL;
}
