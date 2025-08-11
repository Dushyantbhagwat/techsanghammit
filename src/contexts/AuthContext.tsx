import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '../types/user';
import { auth } from '../lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { authService } from '../services/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  signup: (email: string, password: string) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updates: Partial<Omit<User, 'id' | 'email' | 'createdAt'>>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Set initial auth state
    const initAuth = async () => {
      setLoading(true);
      try {
        const userData = await authService.getCurrentUser();
        setUser(userData);
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError(err instanceof Error ? err.message : 'Authentication error');
      } finally {
        setLoading(false);
      }
    };
    
    initAuth();
  }, []);

  const signup = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      await authService.signup({ email, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create account');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const userData = await authService.login({ email, password });
      setUser(userData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid email or password');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.signOut();
      setUser(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to logout');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateUser = async (updates: Partial<Omit<User, 'id' | 'email' | 'createdAt'>>) => {
    if (!user) throw new Error('No user logged in');
    try {
      setLoading(true);
      setError(null);
      const updatedUser = await authService.updateUser(user.id, updates);
      setUser(updatedUser);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    loading,
    error,
    signup,
    login,
    logout,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
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