import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { authApi } from '../../api/auth';
import { loadAuthToken, setAuthToken } from '../../api/client';
import type { User } from '../../api/types';

interface AuthContextValue {
  user: User | null;
  checking: boolean;
  login: (studentCode: string, password: string) => Promise<void>;
  register: (studentCode: string, fullName: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const stored = await loadAuthToken();
        if (!stored) return;

        const me = await authApi.me();
        if (alive) setUser(me);
      } catch {
        await setAuthToken(null);
      } finally {
        if (alive) setChecking(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (studentCode: string, password: string) => {
    const result = await authApi.login(studentCode, password);
    await setAuthToken(result.token);
    setUser(result.user);
  }, []);

  const register = useCallback(
    async (studentCode: string, fullName: string, password: string) => {
      const result = await authApi.register(studentCode, fullName, password);
      await setAuthToken(result.token);
      setUser(result.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    await setAuthToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ user, checking, login, register, logout }),
    [user, checking, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth phải nằm trong AuthProvider');
  return context;
}
