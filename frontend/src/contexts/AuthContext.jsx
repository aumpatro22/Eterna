import { createContext, useContext, useState, useEffect } from 'react';
import api, { setCsrfToken } from '../api/client';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const data = await api.get('/api/auth/me/');
      if (data.csrfToken) {
        setCsrfToken(data.csrfToken);
      }
      if (data.authenticated) {
        setUser(data.user);
      } else {
        setUser(null);
        localStorage.removeItem('eterna_auth_token');
      }
    } catch {
      setUser(null);
      localStorage.removeItem('eterna_auth_token');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (username, password) => {
    const data = await api.post('/api/auth/login/', { username, password });
    if (data.csrfToken) {
      setCsrfToken(data.csrfToken);
    }
    if (data.token) {
      localStorage.setItem('eterna_auth_token', data.token);
    }
    setUser(data.user);
    return data;
  };

  const register = async (formData) => {
    const data = await api.post('/api/auth/register/', formData);
    if (data.csrfToken) {
      setCsrfToken(data.csrfToken);
    }
    if (data.token) {
      localStorage.setItem('eterna_auth_token', data.token);
    }
    setUser(data.user);
    return data;
  };

  const logout = async () => {
    try {
      await api.post('/api/auth/logout/', {});
    } catch (err) {
      console.error('Logout failed', err);
    } finally {
      localStorage.removeItem('eterna_auth_token');
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, checkAuth }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
