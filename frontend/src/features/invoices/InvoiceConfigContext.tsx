import React, { createContext, useContext, useMemo } from 'react';
import { InvoiceUiConfig, defaultInvoiceUiConfig } from './config';

interface InvoiceConfigProviderProps {
  value?: Partial<InvoiceUiConfig>;
  children: React.ReactNode;
}

const InvoiceConfigContext = createContext<InvoiceUiConfig | null>(null);

export const InvoiceConfigProvider: React.FC<InvoiceConfigProviderProps> = ({ value, children }) => {
  const merged = useMemo<InvoiceUiConfig>(() => ({
    ...defaultInvoiceUiConfig,
    ...(value || {}),
  }), [value]);

  return (
    <InvoiceConfigContext.Provider value={merged}>{children}</InvoiceConfigContext.Provider>
  );
};

export const useInvoiceUiConfig = (): InvoiceUiConfig => {
  return useContext(InvoiceConfigContext) || defaultInvoiceUiConfig;
};

export default InvoiceConfigContext;


