import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { authAPI, setUnauthorizedHandler } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(() => {
    sessionStorage.removeItem('access_token');
    sessionStorage.removeItem('refresh_token');
    setUser(null);
  }, []);

  const login = useCallback(async (username, password) => {
    const res = await authAPI.login(username, password);
    sessionStorage.setItem('access_token', res.data.access);
    sessionStorage.setItem('refresh_token', res.data.refresh);
    const me = await authAPI.me();
    setUser(me.data);
    return me.data;
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(logout);
    const token = sessionStorage.getItem('access_token');
    if (!token) {
      setLoading(false);
      return;
    }
    authAPI
      .me()
      .then((res) => setUser(res.data))
      .catch(() => logout())
      .finally(() => setLoading(false));
  }, [logout]);

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: Boolean(user),
      login,
      logout,
    }),
    [user, loading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
}
