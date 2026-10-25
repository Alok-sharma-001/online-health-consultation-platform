/**
 * Authentication Context
 * Manages user session, JWT storage, role-state, and instant demo switching.
 */
import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('curepulse_token'));
  const [loading, setLoading] = useState(true);

  // Initialize and load user profile on startup if token exists
  useEffect(() => {
    async function loadUser() {
      if (token) {
        try {
          const res = await api.getMe();
          if (res.success) {
            setUser(res.user);
          } else {
            logout();
          }
        } catch (err) {
          console.error('Failed to authenticate session:', err);
          logout();
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    }
    loadUser();
  }, [token]);

  // Sync token changes across multiple tabs
  useEffect(() => {
    const handleStorageChange = (e) => {
      if (e.key === 'curepulse_token') {
        setToken(e.newValue);
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = async (email, password) => {
    const res = await api.login({ email, password });
    if (res.success) {
      localStorage.setItem('curepulse_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const register = async (userData) => {
    const res = await api.register(userData);
    if (res.success) {
      localStorage.setItem('curepulse_token', res.token);
      setToken(res.token);
      setUser(res.user);
    }
    return res;
  };

  const logout = () => {
    localStorage.removeItem('curepulse_token');
    setToken(null);
    setUser(null);
  };

  const refreshUser = async () => {
    if (token) {
      const res = await api.getMe();
      if (res.success) {
        setUser(res.user);
      }
    }
  };

  /**
   * 1-Click Persona Switcher for Project Evaluation & Demonstration
   */
  const quickSwitch = async (role) => {
    const demoAccounts = {
      ADMIN: { email: 'admin@health.com', password: 'admin123' },
      DOCTOR_CARDIOLOGY: { email: 'dr.smith@health.com', password: 'doctor123' },
      DOCTOR_DERMATOLOGY: { email: 'dr.patel@health.com', password: 'doctor123' },
      DOCTOR_SARAH: { email: 'dr.sarah@health.com', password: 'doctor123' },
      PATIENT_JOHN: { email: 'john.doe@patient.com', password: 'patient123' },
      PATIENT_JANE: { email: 'jane.roe@patient.com', password: 'patient123' },
    };

    const target = demoAccounts[role];
    if (target) {
      return await login(target.email, target.password);
    }
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
        refreshUser,
        quickSwitch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
