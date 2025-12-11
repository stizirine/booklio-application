import type { Invoice } from '../types';

/**
 * Centralise les handlers d'actions de factures pour éviter les définitions dupliquées
 * Pattern similaire à AppointmentActionHandlers dans le module appointments
 */
export type InvoiceActionHandlers = {
  edit?: (invoice: Invoice, clientId: string) => void;
  send?: (invoice: Invoice) => Promise<void>;
  delete?: (invoice: Invoice) => Promise<void>;
  addPayment?: (invoice: Invoice) => void;
  downloadPDF?: (invoice: Invoice) => Promise<void>;
  cancel?: (invoice: Invoice) => Promise<void>;
  deletePayment?: (invoiceId: string, paymentId: string) => Promise<void>;
};

