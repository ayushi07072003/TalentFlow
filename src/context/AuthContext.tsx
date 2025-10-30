import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  name: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  initialized: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    // Check localStorage on mount
    try {
      const storedAuth = localStorage.getItem('talentflow-auth');
      if (storedAuth) {
        const { isAuthenticated: storedIsAuth, user: storedUser } = JSON.parse(storedAuth);
        setIsAuthenticated(storedIsAuth);
        setUser(storedUser);
      } else {
        // Auto-login a demo user in development to make local dev flows easier.
        const isDev = (import.meta as any)?.env?.DEV;
        if (isDev) {
          const demoUser = { name: 'Developer' };
          setIsAuthenticated(true);
          setUser(demoUser);
          localStorage.setItem('talentflow-auth', JSON.stringify({ isAuthenticated: true, user: demoUser }));
        }
      }
    } catch (error) {
      console.error('Error reading stored auth:', error);
      localStorage.removeItem('talentflow-auth');
    } finally {
      setInitialized(true);
    }
  }, []);

  const login = (userData: User) => {
    setIsAuthenticated(true);
    setUser(userData);
    localStorage.setItem('talentflow-auth', JSON.stringify({
      isAuthenticated: true,
      user: userData
    }));
  };

  const logout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem('talentflow-auth');
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, user, initialized, login, logout }}>
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
