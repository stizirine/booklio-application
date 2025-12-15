// Backend API types (exact mapping from endpoint)
export type ApiInvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'canceled';

export interface ApiInvoiceNotes {
  reason?: string;
  comment?: string;
}

// PaymentEntry (modèle backend)
export interface PaymentEntry {
  _id: string;
  amount: number;
  method: 'cash' | 'card' | 'transfer' | 'check' | 'other';
  reference?: string;
  paidAt: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiInvoice {
  _id: string;
  tenantId: string;
  invoiceNumber?: number;
  client?: {
    _id: string;
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
  };
  totalAmount: number;
  advanceAmount: number;
  creditAmount: number;
  currency: string;
  status: ApiInvoiceStatus;
  notes?: ApiInvoiceNotes;
  remainingAmount: number;
  payments: PaymentEntry[];
  items?: Array<{
    id?: string;
    _id?: string;
    name?: string;
    description?: string;
    quantity?: number;
    unitPrice?: number;
    price?: number;
    taxRate?: number;
    discountAmount?: number;
  }>;
  type?: 'InvoiceClient' | 'Invoice';
  createdAt: string; // ISO
  updatedAt: string; // ISO
}

// UI types (normalized across the app)
export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | string;

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'partial' | 'overdue' | 'canceled';

export interface InvoiceItem {
  id?: string;
  name: string;
  description?: string;
  quantity: number;
  unitPrice: number;
  taxRate?: number;
  discountAmount?: number;
}

// Payment (modèle frontend normalisé)
export interface Payment {
  id: string;
  amount: number;
  method: string;
  reference?: string;
  date: string;
  note?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Invoice {
  id: string;
  number?: string;
  client?: {
    id: string;
    name?: string;
    email?: string;
    phone?: string;
  };
  status: InvoiceStatus;
  currency: CurrencyCode;
  issuedAt?: string;
  dueAt?: string;
  createdAt?: string;
  updatedAt?: string;
  items: InvoiceItem[];
  notes?: string;
  payments?: Payment[];
  subtotal?: number;
  taxTotal?: number;
  total?: number;
  balanceDue?: number;
  advanceAmount?: number;
  creditAmount?: number;
  type?: 'InvoiceClient' | 'Invoice';
}

export interface InvoiceCreatePayload {
  clientId: string;
  totalAmount: number;
  creditAmount?: number;
  currency: string;
  notes?: {
    reason?: string;
    comment?: string;
  };
  payments?: Array<{
    amount: number;
    method: 'cash' | 'card' | 'transfer' | 'check' | 'other';
    reference?: string;
    notes?: string;
  }>;
  type?: 'InvoiceClient' | 'Invoice';
}

export interface InvoiceUpdatePayload {
  clientId: string;
  totalAmount: number;
  advanceAmount?: number;
  creditAmount?: number;
  currency: string;
  notes?: {
    reason?: string;
    comment?: string;
  };
  type?: 'InvoiceClient' | 'Invoice';
}

export interface PaymentCreatePayload {
  amount: number;
  method: 'cash' | 'card' | 'transfer' | 'check' | 'other';
  reference?: string;
  notes?: string;
}

// Invoice Summary (résumé des factures d'un client)
export interface InvoiceSummary {
  totalAmount: number;
  dueAmount: number;
  invoiceCount: number;
  lastInvoiceAt?: string;
}

// Réponses API avec invoiceSummary
export interface InvoiceCreateResponse {
  invoice: ApiInvoice;
  invoiceSummary: InvoiceSummary;
}

export interface InvoiceUpdateResponse {
  invoice: ApiInvoice;
  invoiceSummary: InvoiceSummary;
}

export interface InvoiceDeleteResponse {
  ok: boolean;
  hardDeleted: boolean;
  clientId: string;
  invoiceSummary: InvoiceSummary;
}

// Mappers
export const mapApiStatusToInvoiceStatus = (s: ApiInvoiceStatus): InvoiceStatus => s;

export const mapPaymentEntryToPayment = (entry: PaymentEntry): Payment => ({
  id: entry._id,
  amount: entry.amount,
  method: entry.method,
  reference: entry.reference,
  date: entry.paidAt,
  note: entry.notes,
  createdAt: entry.createdAt,
  updatedAt: entry.updatedAt,
});

export const mapApiInvoiceToInvoice = (api: ApiInvoice): Invoice => ({
  id: api._id,
  number:
    typeof api.invoiceNumber === 'number'
      ? api.invoiceNumber.toString().padStart(4, '0')
      : undefined,
  client: api.client
    ? {
        id: api.client._id,
        name: `${api.client.firstName || ''} ${api.client.lastName || ''}`.trim() || undefined,
        email: api.client.email,
        phone: api.client.phone,
      }
    : undefined,
  status: mapApiStatusToInvoiceStatus(api.status),
  currency: api.currency,
  // Map dates
  issuedAt: api.createdAt,
  createdAt: api.createdAt,
  updatedAt: api.updatedAt,
  items: Array.isArray(api.items) ? api.items.map((item: any) => ({
    id: item.id || item._id || '',
    name: item.name || item.description || '',
    description: item.description || '',
    quantity: item.quantity || 1,
    unitPrice: item.unitPrice || item.price || 0,
    taxRate: item.taxRate || 0.20,
    discountAmount: item.discountAmount || 0,
  })) : [],
  // Mapper les notes: combiner reason et comment, ou utiliser celui qui existe
  notes: api.notes 
    ? [api.notes.reason, api.notes.comment].filter(Boolean).join(' — ') || undefined
    : undefined,
  // Mapper les paiements
  payments: Array.isArray(api.payments) ? api.payments.map(mapPaymentEntryToPayment) : [],
  subtotal: undefined,
  taxTotal: undefined,
  total: typeof api.totalAmount === 'number' ? api.totalAmount : 0,
  balanceDue: typeof api.remainingAmount === 'number' ? api.remainingAmount : undefined,
  advanceAmount: typeof api.advanceAmount === 'number' ? api.advanceAmount : undefined,
  creditAmount: typeof api.creditAmount === 'number' ? api.creditAmount : undefined,
  type: api.type as 'InvoiceClient' | 'Invoice' | undefined,
});
