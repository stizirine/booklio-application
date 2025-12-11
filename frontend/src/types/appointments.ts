import type { ClientAppointmentNotes } from './clients';
import { AppointmentStatus } from './enums';

export interface SimpleEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  customerName?: string;
  location?: string;
  status?: AppointmentStatus | string;
  clientId?: string;
  clientEmail?: string;
  clientPhone?: string;
  notes?: ClientAppointmentNotes;
  reason?: string;
  invoiceSummary?: {
    totalAmount: number;
    dueAmount: number;
    invoiceCount: number;
    lastInvoiceAt?: string;
  };
}


