'use client';

import {createContext, useContext, useState, useEffect, ReactNode} from 'react';
import { setUserCookie } from '@/app/actions/auth';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'patient' | 'doctor' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({children}: {children: ReactNode}) {
  const [user, setUser] = useState<User | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('auth_user');
    if (saved) {
      try {
        const parsedUser = JSON.parse(saved);
        setUser(parsedUser);
        setUserCookie(parsedUser);
      } catch {}
    }
  }, []);

  const login = (newUser: User) => {
    setUser(newUser);
    localStorage.setItem('auth_user', JSON.stringify(newUser));
    setUserCookie(newUser);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    setUserCookie(null);
  };

  return (
    <AuthContext.Provider value={{user, isAuthenticated: !!user, login, logout}}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
