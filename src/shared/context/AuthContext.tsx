import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import {
  bindAuthHandlers,
  loadStoredSession,
  persistSession,
} from '../api/client';
import * as authApi from '../api/auth';
import type { SessionTokens } from '../api/types';
import { ApiError } from '../api/types';

type AuthStatus = 'loading' | 'authenticated' | 'anonymous';

type AuthContextValue = {
  status: AuthStatus;
  session: SessionTokens | null;
  userId: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, username?: string) => Promise<void>;
  logout: () => Promise<void>;
  setSession: (s: SessionTokens | null) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSessionState] = useState<SessionTokens | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');

  const setSession = useCallback((s: SessionTokens | null) => {
    setSessionState(s);
    persistSession(s);
    setStatus(s ? 'authenticated' : 'anonymous');
  }, []);

  useEffect(() => {
    const stored = loadStoredSession();
    setSessionState(stored);
    setStatus(stored ? 'authenticated' : 'anonymous');

    bindAuthHandlers({
      getTokens: () => {
        try {
          const raw = localStorage.getItem('convia.session');
          return raw ? (JSON.parse(raw) as SessionTokens) : null;
        } catch {
          return null;
        }
      },
      setTokens: (s) => {
        persistSession(s);
        setSessionState(s);
        setStatus(s ? 'authenticated' : 'anonymous');
      },
      onAuthFailure: () => {
        persistSession(null);
        setSessionState(null);
        setStatus('anonymous');
      },
    });
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      const deviceId =
        typeof localStorage !== 'undefined'
          ? localStorage.getItem('convia.deviceId') || undefined
          : undefined;
      const res = await authApi.login({ email, password, deviceId });
      setSession({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        sessionId: res.sessionId,
        userId: res.userId,
      });
    },
    [setSession],
  );

  const register = useCallback(
    async (email: string, password: string, username?: string) => {
      const uname = username || authApi.usernameFromEmail(email);
      const res = await authApi.register({ email, password, username: uname });
      setSession({
        accessToken: res.accessToken,
        refreshToken: res.refreshToken,
        sessionId: res.sessionId,
        userId: res.userId,
        username: uname,
      });
    },
    [setSession],
  );

  const logout = useCallback(async () => {
    const sid = session?.sessionId;
    try {
      if (sid) await authApi.logout(sid);
    } catch (err) {
      // Still clear local session even if network fails
      if (!(err instanceof ApiError)) {
        // ignore
      }
    } finally {
      setSession(null);
    }
  }, [session?.sessionId, setSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      session,
      userId: session?.userId ?? null,
      login,
      register,
      logout,
      setSession,
    }),
    [status, session, login, register, logout, setSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
