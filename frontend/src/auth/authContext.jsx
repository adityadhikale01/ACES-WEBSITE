import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  getUser,
  saveUser,
  saveAccessToken,
  getAccessToken,
  clearAuth,
} from './authStorage.js';
import { api } from '../services/api.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const res = await api.auth.me();
      if (res.success && res.user) {
        setUser(res.user);
        saveUser(res.user);
      } else {
        const stored = getUser();
        if (stored) setUser(stored);
      }
    } catch {
      const stored = getUser();
      if (stored) setUser(stored);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const storedUser = getUser();
    const storedToken = getAccessToken();
    if (storedUser) setUser(storedUser);
    if (storedToken) setAccessToken(storedToken);
    refreshUser();
  }, []);

  const login = async (emailOrUser, passwordOrToken) => {
    if (typeof emailOrUser === 'object' && emailOrUser !== null) {
      // Direct user object passed
      setUser(emailOrUser);
      saveUser(emailOrUser);
      if (passwordOrToken) {
        setAccessToken(passwordOrToken);
        saveAccessToken(passwordOrToken);
      }
      return;
    }

    const res = await api.auth.login({ email: emailOrUser, password: passwordOrToken });
    if (res.success && res.user) {
      setUser(res.user);
      saveUser(res.user);
      if (res.token) {
        setAccessToken(res.token);
        saveAccessToken(res.token);
      }
    }
    return res;
  };

  const register = async (data) => {
    const res = await api.auth.register(data);
    if (res.success && res.user) {
      setUser(res.user);
      saveUser(res.user);
      if (res.token) {
        setAccessToken(res.token);
        saveAccessToken(res.token);
      }
    }
    return res;
  };

  const logout = async () => {
    try {
      await api.auth.logout();
    } finally {
      clearAuth();
      setUser(null);
      setAccessToken(null);
    }
  };

  const role = user?.role || 'VISITOR';
  const isAuthenticated = !!user;
  const isAdmin = user ? ['SUPER_ADMIN', 'ADMIN', 'FACULTY', 'PRESIDENT'].includes(user.role) : false;
  const isSuperAdmin = user ? ['SUPER_ADMIN', 'ADMIN'].includes(user.role) : false;
  const isFaculty = user?.role === 'FACULTY';
  const isPresident = user?.role === 'PRESIDENT';
  const isApprovedMember = Boolean(user?.isApprovedMember);

  return (
    <AuthContext.Provider
      value={{
        user,
        currentUser: user,
        accessToken,
        isLoading,
        loading: isLoading,
        isAuthenticated,
        role,
        isSuperAdmin,
        isFaculty,
        isPresident,
        isAdmin,
        isApprovedMember,
        login,
        register,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
