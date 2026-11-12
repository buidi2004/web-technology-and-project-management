import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { clearAuth, readAuth, writeAuth } from '../../lib/authStorage';
import type { User } from '../../lib/types';
import { authApi } from './authApi';

interface AuthContextValue {
  user: User | null;
  checking: boolean;
  login: (studentCode: string, password: string) => Promise<void>;
  register: (studentCode: string, fullName: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => readAuth()?.user ?? null);
  const [checking, setChecking] = useState(() => readAuth() !== null);

  useEffect(() => {
    const stored = readAuth();
    if (!stored) {
      setChecking(false);
      return;
    }

    let alive = true;

    authApi
      .me()
      .then((freshUser) => {
        if (!alive) return;
        setUser(freshUser);
        writeAuth({ token: stored.token, user: freshUser });
      })
      .catch(() => {
        if (!alive) return;
        clearAuth();
        setUser(null);
      })
      .finally(() => {
        if (alive) setChecking(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const login = useCallback(async (studentCode: string, password: string) => {
    const result = await authApi.login(studentCode, password);
    writeAuth({ token: result.token, user: result.user });
    setUser(result.user);
  }, []);

  const register = useCallback(
    async (studentCode: string, fullName: string, password: string) => {
      const result = await authApi.register(studentCode, fullName, password);
      writeAuth({ token: result.token, user: result.user });
      setUser(result.user);
    },
    [],
  );

  const logout = useCallback(() => {
    clearAuth();
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
