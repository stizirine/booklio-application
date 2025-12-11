import { MeResponse, User } from '@common/auth/types';
import api from '@services/api';
import React, { createContext, ReactNode, useCallback, useEffect, useState } from 'react';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  refreshUser: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshUser = useCallback(async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/v1/auth/me');
      const data = response.data as MeResponse;
      setUser(data.user);
    } catch (err) {
      console.error('Error fetching user data:', err);
      setError('Failed to load user information');
      setUser(null);
      // Token invalide, nettoyer
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    } finally {
      setLoading(false);
    }
  }, []);

  // Charger l'utilisateur au montage
  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  // Écouter les changements d'authentification
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setUser(null);
        setLoading(false);
      } else {
        refreshUser();
      }
    };

    window.addEventListener('authChanged', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [refreshUser]);

  const value: AuthContextType = {
    user,
    loading,
    error,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook pour utiliser le contexte auth
export const useAuth = (): AuthContextType => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

