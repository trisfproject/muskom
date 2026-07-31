'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import Cookies from 'js-cookie';

export interface User {
  id: string;
  username: string;
  full_name: string;
  role: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (accessToken: string, refreshToken: string, userData: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Rehydrate user from cookie on mount
    const userDataStr = Cookies.get('user_data');
    if (userDataStr) {
      try {
        const parsed = JSON.parse(userDataStr);
        // eslint-disable-next-line
        setUser(parsed);
      } catch {
        // failed to parse
      }
    }
    setLoading(false);
  }, []);

  const login = (accessToken: string, refreshToken: string, userData: User) => {
    // Next.js middleware needs access to these, so they shouldn't be HttpOnly 
    // unless you have a backend proxying it. For this architecture, we use js-cookie.
    Cookies.set('access_token', accessToken, { expires: 1, path: '/' });
    Cookies.set('refresh_token', refreshToken, { expires: 7, path: '/' });
    Cookies.set('user_data', JSON.stringify(userData), { expires: 1, path: '/' });
    setUser(userData);
  };

  const logout = () => {
    Cookies.remove('access_token', { path: '/' });
    Cookies.remove('refresh_token', { path: '/' });
    Cookies.remove('user_data', { path: '/' });
    setUser(null);
    window.location.href = '/admin/login';
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
