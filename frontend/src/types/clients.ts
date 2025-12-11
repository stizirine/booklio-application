import { AppointmentStatus } from './enums';

export interface ClientAppointmentNotes {
  reason?: string;
  comment?: string;
}

export interface ClientAppointmentItem {
  _id: string;
  title: string;
  startAt: string;
  endAt: string;
  status: AppointmentStatus;
  notes?: ClientAppointmentNotes;
}

export interface ClientInvoiceSummary {
  totalAmount: number;
  dueAmount: number;
  invoiceCount: number;
  lastInvoiceAt?: string;
}

export interface ClientItem {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  lastAppointment?: string;
  notesCount?: number;
  appointments?: ClientAppointmentItem[];
  invoiceSummary?: ClientInvoiceSummary;
}

export interface NewClientPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
}
