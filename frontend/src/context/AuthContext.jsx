import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('smartdeliver_token'));
  const [loading, setLoading] = useState(true);

  // Modal controls
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalTab, setAuthModalTab] = useState('login'); // 'login' or 'register'

  // Fetch current user if token exists on mount
  useEffect(() => {
    const fetchMe = async () => {
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { data } = await api.get('/auth/me');
        setUser(data.user);
      } catch (err) {
        console.error('Failed to verify token:', err);
        logout();
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [token]);

  const login = async (email, password) => {
    const { data } = await api.post('/auth/login', { email, password });
    localStorage.setItem('smartdeliver_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setIsAuthModalOpen(false);
    return data.user;
  };

  const register = async ({ name, email, password, role, phone }) => {
    const { data } = await api.post('/auth/register', { name, email, password, role, phone });
    localStorage.setItem('smartdeliver_token', data.token);
    setToken(data.token);
    setUser(data.user);
    setIsAuthModalOpen(false);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem('smartdeliver_token');
    setToken(null);
    setUser(null);
  };

  const openLogin = () => {
    setAuthModalTab('login');
    setIsAuthModalOpen(true);
  };

  const openRegister = () => {
    setAuthModalTab('register');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthModalOpen,
        authModalTab,
        setAuthModalTab,
        openLogin,
        openRegister,
        closeAuthModal,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
