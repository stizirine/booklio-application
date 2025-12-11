import {
    ApiInvoice,
    Invoice,
    InvoiceCreatePayload,
    InvoiceCreateResponse,
    InvoiceDeleteResponse,
    InvoiceSummary,
    InvoiceUpdatePayload,
    InvoiceUpdateResponse,
    mapApiInvoiceToInvoice,
    PaymentCreatePayload
} from '@features/invoices/types';
import api from '@services/api';

// Note: ces fonctions mappent les endpoints backend réels. Les URLs exactes
// seront ajustées selon le projet backend booklio (ex: /invoices ...)

const unwrap = (res: any) => (res && 'data' in res ? res.data : res);

export async function listInvoices(params?: Record<string, unknown>): Promise<Invoice[]> {
  const res = await api.get('/v1/invoices', { params });
  const data = unwrap(res);
  const list: ApiInvoice[] = Array.isArray(data?.items) ? data.items : Array.isArray(data) ? data : [];
  return list.map(mapApiInvoiceToInvoice);
}

export async function getInvoice(id: string): Promise<Invoice> {
  const res = await api.get(`/v1/invoices/${id}`);
  return mapApiInvoiceToInvoice(unwrap(res) as ApiInvoice);
}

export async function createInvoice(payload: InvoiceCreatePayload): Promise<{ invoice: Invoice; invoiceSummary: InvoiceSummary }> {
  const res = await api.post('/v1/invoices', payload);
  const data = unwrap(res) as InvoiceCreateResponse;
  return {
    invoice: mapApiInvoiceToInvoice(data.invoice),
    invoiceSummary: data.invoiceSummary,
  };
}

export async function updateInvoice(id: string, payload: InvoiceUpdatePayload): Promise<{ invoice: Invoice; invoiceSummary: InvoiceSummary }> {
  const res = await api.patch(`/v1/invoices/${id}`, payload);
  const data = unwrap(res) as InvoiceUpdateResponse;
  return {
    invoice: mapApiInvoiceToInvoice(data.invoice),
    invoiceSummary: data.invoiceSummary,
  };
}

export async function sendInvoice(id: string): Promise<void> {
  await api.post(`/v1/invoices/${id}/send`);
}

export async function addPayment(id: string, payload: PaymentCreatePayload): Promise<{ invoice: Invoice; invoiceSummary: InvoiceSummary }> {
  const res = await api.post(`/v1/invoices/${id}/payments`, payload);
  const data = unwrap(res) as InvoiceUpdateResponse;
  return {
    invoice: mapApiInvoiceToInvoice(data.invoice),
    invoiceSummary: data.invoiceSummary,
  };
}

export async function deletePayment(invoiceId: string, paymentId: string): Promise<{ invoice: Invoice; invoiceSummary: InvoiceSummary }> {
  const res = await api.delete(`/v1/invoices/${invoiceId}/payments/${paymentId}`);
  const data = unwrap(res) as InvoiceUpdateResponse;
  return {
    invoice: mapApiInvoiceToInvoice(data.invoice),
    invoiceSummary: data.invoiceSummary,
  };
}

export async function cancelInvoice(id: string): Promise<Invoice> {
  const res = await api.post(`/v1/invoices/${id}/cancel`);
  return mapApiInvoiceToInvoice(unwrap(res) as ApiInvoice);
}

export async function deleteInvoice(id: string): Promise<InvoiceDeleteResponse> {
  const res = await api.delete(`/v1/invoices/${id}`);
  return unwrap(res) as InvoiceDeleteResponse;
}


