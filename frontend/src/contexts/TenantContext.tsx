import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { Capability, ClientType, FeatureFlag, MeResponse, Tenant } from '../common/auth/types';
import api from '../services/api';

interface TenantContextType {
  tenant: Tenant | null;
  loading: boolean;
  error: string | null;
  refreshTenant: () => Promise<void>;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refreshTenant = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setTenant(null);
        return;
      }

      const response = await api.get('/v1/auth/me');
      const data = response.data as MeResponse;
      setTenant(data.tenant);
    } catch (err) {
      console.error('Error fetching tenant data:', err);
      setError('Failed to load tenant information');
      setTenant(null);
    } finally {
      setLoading(false);
    }
  };

  // Charger les données du tenant au montage
  useEffect(() => {
    refreshTenant();
  }, []);

  // Écouter les changements d'authentification
  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setTenant(null);
        setLoading(false);
      } else if (!tenant) {
        refreshTenant();
      }
    };

    // Écouter les événements de changement d'auth
    window.addEventListener('authChanged', handleAuthChange);
    window.addEventListener('storage', handleAuthChange);

    return () => {
      window.removeEventListener('authChanged', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, [tenant]);

  const value: TenantContextType = {
    tenant,
    loading,
    error,
    refreshTenant,
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};

// Hook pour utiliser le contexte tenant
export const useTenant = (): TenantContextType => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

// Hook pour vérifier les capacités (plus pratique)
export const useCapabilities = () => {
  const { tenant } = useTenant();
  
  return useMemo(() => ({
    hasCapability: (capability: Capability) => tenant?.capabilities.includes(capability) || false,
    hasFeatureFlag: (flag: FeatureFlag) => tenant?.featureFlags[flag] === true,
    canAccessOptics: () => tenant?.clientType === ClientType.Optician && tenant?.capabilities.includes(Capability.Optics),
    canManagePrescriptions: () => tenant?.clientType === ClientType.Optician && tenant?.featureFlags[FeatureFlag.OpticsPrescriptions] === true,
    canTakeMeasurements: () => tenant?.clientType === ClientType.Optician && tenant?.featureFlags[FeatureFlag.OpticsMeasurements] === true,
    canPrintOptics: () => tenant?.clientType === ClientType.Optician && tenant?.featureFlags[FeatureFlag.OpticsPrint] === true,
    isOptician: () => tenant?.clientType === ClientType.Optician,
    isGeneric: () => tenant?.clientType === ClientType.Generic,
  }), [tenant]);
};

export default TenantContext;
