import React, { createContext, ReactNode, useCallback, useContext, useState } from 'react';
import { FeatureFlag } from '../common/auth/types';
import { useCapabilities, useTenant } from './TenantContext';

interface UIConfig {
  // Configuration des factures
  invoice: {
    showStatistics: boolean;
    showList: boolean;
    allowCreate: boolean;
    creationMode: 'modal' | 'page';
    currency: string;
  };
  
  // Configuration des rendez-vous
  appointment: {
    showCalendar: boolean;
    allowCreate: boolean;
    allowEdit: boolean;
    allowDelete: boolean;
    defaultDuration: number; // en minutes
  };
  
  // Configuration des clients
  client: {
    showOpticsSection: boolean;
    allowBulkImport: boolean;
    showAdvancedFields: boolean;
  };
  
  // Configuration générale
  general: {
    language: string;
    timezone: string;
    dateFormat: string;
  };
}

interface UIConfigContextType {
  config: UIConfig;
  updateConfig: (updates: Partial<UIConfig>) => void;
  resetConfig: () => void;
  
  // Helpers spécifiques
  canCreateInvoice: (clientId?: string) => boolean;
  canCreateAppointment: (clientId?: string) => boolean;
  canEditAppointment: (appointmentId: string) => boolean;
  canDeleteAppointment: (appointmentId: string) => boolean;
  canAccessOptics: () => boolean;
}

const UIConfigContext = createContext<UIConfigContextType | undefined>(undefined);

const defaultConfig: UIConfig = {
  invoice: {
    showStatistics: true,
    showList: true,
    allowCreate: true,
    creationMode: 'modal',
    currency: 'EUR',
  },
  appointment: {
    showCalendar: true,
    allowCreate: true,
    allowEdit: true,
    allowDelete: true,
    defaultDuration: 60,
  },
  client: {
    showOpticsSection: false,
    allowBulkImport: false,
    showAdvancedFields: false,
  },
  general: {
    language: 'fr',
    timezone: 'Europe/Paris',
    dateFormat: 'DD/MM/YYYY',
  },
};

interface UIConfigProviderProps {
  children: ReactNode;
  initialConfig?: Partial<UIConfig>;
}

export const UIConfigProvider: React.FC<UIConfigProviderProps> = ({ 
  children, 
  initialConfig 
}) => {
  const [config, setConfig] = useState<UIConfig>({
    ...defaultConfig,
    ...initialConfig,
  });
  
  const { isOptician, hasFeatureFlag } = useCapabilities();
  const { tenant } = useTenant();

  const updateConfig = useCallback((updates: Partial<UIConfig>) => {
    setConfig(prev => ({
      ...prev,
      ...updates,
    }));
  }, []);

  const resetConfig = useCallback(() => {
    setConfig(defaultConfig);
  }, []);

  // Helpers basés sur les capacités du tenant
  const canCreateInvoice = useCallback((clientId?: string) => {
    return config.invoice.allowCreate && Boolean(clientId);
  }, [config.invoice.allowCreate]);

  const canCreateAppointment = useCallback((clientId?: string) => {
    return config.appointment.allowCreate && Boolean(clientId);
  }, [config.appointment.allowCreate]);

  const canEditAppointment = useCallback((appointmentId: string) => {
    return config.appointment.allowEdit && Boolean(appointmentId);
  }, [config.appointment.allowEdit]);

  const canDeleteAppointment = useCallback((appointmentId: string) => {
    return config.appointment.allowDelete && Boolean(appointmentId);
  }, [config.appointment.allowDelete]);

  const canAccessOptics = useCallback(() => {
    return isOptician() && config.client.showOpticsSection;
  }, [isOptician, config.client.showOpticsSection]);

  // Mise à jour automatique de la configuration basée sur les capacités
  React.useEffect(() => {
    setConfig(prevConfig => {
      const newConfig = { ...prevConfig };
      let hasChanges = false;
      
      // Mettre à jour la devise depuis le tenant
      if (tenant?.currency && prevConfig.invoice.currency !== tenant.currency) {
        newConfig.invoice = {
          ...prevConfig.invoice,
          currency: tenant.currency,
        };
        hasChanges = true;
      }
      
      // Configuration des factures basée sur les capacités
          if (hasFeatureFlag(FeatureFlag.InvoicesAutoReminder) && !prevConfig.invoice.showStatistics) {
        newConfig.invoice = {
          ...prevConfig.invoice,
          showStatistics: true,
        };
        hasChanges = true;
      }
      
      // Configuration des rendez-vous basée sur les capacités
          if (hasFeatureFlag(FeatureFlag.AppointmentsSmsNotifications)) {
        if (!prevConfig.appointment.allowCreate || !prevConfig.appointment.allowEdit) {
          newConfig.appointment = {
            ...prevConfig.appointment,
            allowCreate: true,
            allowEdit: true,
          };
          hasChanges = true;
        }
      }
      
      // Configuration des clients basée sur le type de client
      if (isOptician()) {
        if (!prevConfig.client.showOpticsSection || 
                prevConfig.client.showAdvancedFields !== hasFeatureFlag(FeatureFlag.OpticsAdvancedMeasurements)) {
          newConfig.client = {
            ...prevConfig.client,
            showOpticsSection: true,
                showAdvancedFields: hasFeatureFlag(FeatureFlag.OpticsAdvancedMeasurements),
          };
          hasChanges = true;
        }
      }
      
      // Configuration de l'import en masse
          if (hasFeatureFlag(FeatureFlag.ClientsBulkImport) && !prevConfig.client.allowBulkImport) {
        newConfig.client = {
          ...newConfig.client,
          allowBulkImport: true,
        };
        hasChanges = true;
      }
      
      return hasChanges ? newConfig : prevConfig;
    });
  }, [isOptician, hasFeatureFlag, tenant?.currency]);

  const value: UIConfigContextType = {
    config,
    updateConfig,
    resetConfig,
    canCreateInvoice,
    canCreateAppointment,
    canEditAppointment,
    canDeleteAppointment,
    canAccessOptics,
  };

  return (
    <UIConfigContext.Provider value={value}>
      {children}
    </UIConfigContext.Provider>
  );
};

export const useUIConfig = (): UIConfigContextType => {
  const context = useContext(UIConfigContext);
  if (context === undefined) {
    throw new Error('useUIConfig must be used within a UIConfigProvider');
  }
  return context;
};

export default UIConfigContext;
