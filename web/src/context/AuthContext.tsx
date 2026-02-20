import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi } from '../api/auth';
import type { RegisterBody } from '../api/auth';
import type { User } from '../types';

interface AuthCtx {
  user: User | null;
  isLoading: boolean;
  isAdmin: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (body: RegisterBody) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    if (token) {
      authApi
        .getProfile()
        .then(setUser)
        .catch(() => localStorage.removeItem('auth_token'))
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, []);

  const login = async (username: string, password: string) => {
    const res = await authApi.login(username, password);
    localStorage.setItem('auth_token', res.token);
    setUser(res.user);
  };

  const register = async (body: RegisterBody) => {
    const res = await authApi.register(body);
    localStorage.setItem('auth_token', res.token);
    setUser(res.user);
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAdmin: user?.role === 'ADMIN', login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
