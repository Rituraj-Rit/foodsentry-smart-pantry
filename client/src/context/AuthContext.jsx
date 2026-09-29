import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('foodsentry-token');
    if (!token) {
      setLoading(false);
      return undefined;
    }
    let active = true;
    api.get('/auth/me').then(({ data }) => {
      if (active) setUser(data.data.user);
    }).catch(() => {
      localStorage.removeItem('foodsentry-token');
    }).finally(() => {
      if (active) setLoading(false);
    });
    const reset = () => setUser(null);
    window.addEventListener('foodsentry:unauthorized', reset);
    return () => {
      active = false;
      window.removeEventListener('foodsentry:unauthorized', reset);
    };
  }, []);

  async function authenticate(path, values) {
    const { data } = await api.post(`/auth/${path}`, values);
    localStorage.setItem('foodsentry-token', data.data.token);
    setUser(data.data.user);
    return data.data.user;
  }

  function logout() {
    localStorage.removeItem('foodsentry-token');
    setUser(null);
  }

  function updateUser(updates) {
    setUser((current) => current ? { ...current, ...updates } : current);
  }

  return <AuthContext.Provider value={{ user, loading, authenticate, logout, updateUser }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
