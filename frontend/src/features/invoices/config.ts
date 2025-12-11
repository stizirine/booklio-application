export type InvoiceCreationMode = 'modal' | 'page';

export interface InvoiceUiConfig {
  showStatistics: boolean;
  showList: boolean;
  allowCreate: boolean;
  creationMode: InvoiceCreationMode;
  canCreate?: (ctx: { clientId?: string }) => boolean;
  currency?: string;
}

export const defaultInvoiceUiConfig: InvoiceUiConfig = {
  showStatistics: true,
  showList: true,
  allowCreate: true,
  creationMode: 'modal',
  currency: 'EUR',
};

export function getInvoiceUiConfig(overrides?: Partial<InvoiceUiConfig>): InvoiceUiConfig {
  return { ...defaultInvoiceUiConfig, ...(overrides || {}) };
}


