import React, { createContext, useContext } from 'react';

export enum ClientDetailTabKey {
  Info = 'info',
  Appts = 'appts',
  Invoices = 'invoices',
  Optics = 'optics',
}

interface ClientDetailContextValue {
  activeTab: ClientDetailTabKey;
  setActiveTab: (tab: ClientDetailTabKey) => void;
  appointmentsCount: number;
  invoicesCount: number;
  isOptician: () => boolean;
  t: (key: string, opts?: any) => any;
  onOpenCreateAppointment: () => void;
  onCreateInvoice: () => void;
  canCreateInvoice: boolean;
  onClose: () => void;
}

const ClientDetailContext = createContext<ClientDetailContextValue | undefined>(undefined);

export const ClientDetailProvider: React.FC<{
  value: ClientDetailContextValue;
  children: React.ReactNode;
}> = ({ value, children }) => {
  return <ClientDetailContext.Provider value={value}>{children}</ClientDetailContext.Provider>;
};

export const useClientDetail = (): ClientDetailContextValue => {
  const ctx = useContext(ClientDetailContext);
  if (!ctx) throw new Error('useClientDetail must be used within ClientDetailProvider');
  return ctx;
};

export default ClientDetailContext;


