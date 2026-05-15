import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import api from '../services/api.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'hrms_token';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [initializing, setInitializing] = useState(true);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const fetchMe = useCallback(async () => {
    const token = localStorage.getItem(TOKEN_KEY);
    if (!token) {
      setUser(null);
      setInitializing(false);
      return;
    }
    try {
      const { data } = await api.get('/api/auth/me');
      if (data.success) {
        setUser(data.data);
      } else {
        logout();
      }
    } catch {
      logout();
    } finally {
      setInitializing(false);
    }
  }, [logout]);

  useEffect(() => {
    fetchMe();
  }, [fetchMe]);

  const login = useCallback(async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password });
    if (!data.success) throw new Error(data.message || 'Login failed');
    const { token, user: u } = data.data;
    localStorage.setItem(TOKEN_KEY, token);
    setUser(u);
    return u;
  }, []);

  const value = useMemo(
    () => ({
      user,
      initializing,
      login,
      logout,
      refreshUser: fetchMe,
      isAdmin: user?.role === 'admin',
      isEmployee: user?.role === 'employee',
      token: typeof window !== 'undefined' ? localStorage.getItem(TOKEN_KEY) : null,
    }),
    [user, initializing, login, logout, fetchMe]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
