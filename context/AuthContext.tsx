import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUser: (user: User) => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user from secure storage on app start
  useEffect(() => {
    bootstrapAsync();
  }, []);

  const bootstrapAsync = async () => {
    try {
      const token = await SecureStore.getItemAsync('userToken');
      if (token) {
        // Validate token and fetch user
        const response = await fetch('http://YOUR_API/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
        }
      }
    } catch (e) {
      console.error('Failed to restore token:', e);
    } finally {
      setLoading(false);
    }
  };

  const authContext: AuthContextType = {
    user,
    loading,
    signUp: async (email, password, name) => {
      const response = await fetch('http://YOUR_API/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name }),
      });

      if (!response.ok) throw new Error('Sign up failed');
      const data = await response.json();
      await SecureStore.setItemAsync('userToken', data.token);
      setUser(data.user);
    },

    signIn: async (email, password) => {
      const response = await fetch('http://YOUR_API/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) throw new Error('Sign in failed');
      const data = await response.json();
      await SecureStore.setItemAsync('userToken', data.token);
      setUser(data.user);
    },

    signOut: async () => {
      await SecureStore.deleteItemAsync('userToken');
      setUser(null);
    },

    updateUser: (updatedUser) => setUser(updatedUser),
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}