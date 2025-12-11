export interface ClientAppointment {
  _id: string;
  title?: string;
  startAt: string;
  endAt: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  appointments?: ClientAppointment[];
}

export interface ClientInvoiceConfig {
  allowCreate: boolean;
  creationMode?: 'modal' | 'page';
  showStatistics: boolean;
  currency?: string;
}

