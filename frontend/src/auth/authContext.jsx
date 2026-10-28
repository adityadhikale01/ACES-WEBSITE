import React, { createContext, useEffect, useState } from 'react';
import {
  getUser,
  saveUser,
  saveAccessToken,
  getAccessToken,
  clearAuth,
} from './authStorage.js';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = getUser();
    const storedToken = getAccessToken();

    if (storedUser && storedToken) {
      setCurrentUser(storedUser);
      setAccessToken(storedToken);
    }
    setLoading(false);
  }, []);

  function login(user, token) {
    saveUser(user);
    if (token) {
      saveAccessToken(token);
    }
    setCurrentUser(user);
    setAccessToken(token);
  }

  function logout() {
    clearAuth();
    setCurrentUser(null);
    setAccessToken(null);
    fetch('/api/v1/auth/logout', { method: 'POST' }).catch(() => {});
  }

  const role = currentUser?.role || 'VISITOR';
  const isSuperAdmin = role === 'SUPER_ADMIN' || role === 'ADMIN';
  const isFaculty = role === 'FACULTY';
  const isPresident = role === 'PRESIDENT';
  const isAdmin = isSuperAdmin || isFaculty || isPresident;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        accessToken,
        loading,
        isAuthenticated: !!currentUser,
        role,
        isSuperAdmin,
        isFaculty,
        isPresident,
        isAdmin,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
