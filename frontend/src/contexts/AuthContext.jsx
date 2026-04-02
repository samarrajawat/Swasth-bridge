import { createContext, useContext, useState, useEffect } from 'react';
import API from '../api/axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('swasthUser')); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem('swasthToken'));
  const [loading, setLoading] = useState(false);

  const login = async (email, password) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/login', { email, password });
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('swasthToken', data.token);
      localStorage.setItem('swasthUser', JSON.stringify(data.user));
      return { success: true, role: data.user.role };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    setLoading(true);
    try {
      const { data } = await API.post('/auth/register', userData);
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem('swasthToken', data.token);
      localStorage.setItem('swasthUser', JSON.stringify(data.user));
      return { success: true, role: data.user.role };
    } catch (err) {
      return { success: false, message: err.response?.data?.message || 'Registration failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('swasthToken');
    localStorage.removeItem('swasthUser');
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, register, logout, isAuthenticated: !!token }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
