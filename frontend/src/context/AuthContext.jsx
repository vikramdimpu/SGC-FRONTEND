import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import authService from '../api/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuth = useCallback(async () => {
    try {
      const userData = await authService.getCurrentUser();
      setUser(userData);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = async (username, password) => {
    const data = await authService.login({ username, password });
    setUser(data);
    return data;
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout transport error
    } finally {
      setUser(null);
    }
  };

  const changePassword = async (currentPassword, newPassword) => {
    return await authService.changePassword({ currentPassword, newPassword });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        checkAuth,
        changePassword,
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
