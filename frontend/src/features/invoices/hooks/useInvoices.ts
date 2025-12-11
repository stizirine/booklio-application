import { useCallback, useState } from 'react';
import { addPayment, cancelInvoice, createInvoice, deleteInvoice, deletePayment, getInvoice, listInvoices, sendInvoice, updateInvoice } from '../api/invoices.api';
import { Invoice, InvoiceCreatePayload, InvoiceSummary, InvoiceUpdatePayload, PaymentCreatePayload } from '../types';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [current, setCurrent] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchList = useCallback(async (params?: Record<string, unknown>) => {
    setLoading(true);
    setError(null);
    try {
      const data = await listInvoices(params);
      setInvoices(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load invoices');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchOne = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getInvoice(id);
      setCurrent(data);
    } catch (e: any) {
      setError(e?.message || 'Failed to load invoice');
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (payload: InvoiceCreatePayload): Promise<{ invoice: Invoice; invoiceSummary: InvoiceSummary }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await createInvoice(payload);
      setInvoices(prev => [result.invoice, ...prev]);
      return result;
    } catch (e: any) {
      setError(e?.message || 'Failed to create invoice');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const update = useCallback(async (id: string, payload: InvoiceUpdatePayload): Promise<{ invoice: Invoice; invoiceSummary: InvoiceSummary }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await updateInvoice(id, payload);
      setInvoices(prev => prev.map(inv => inv.id === id ? result.invoice : inv));
      setCurrent(prev => (prev && prev.id === id ? result.invoice : prev));
      return result;
    } catch (e: any) {
      setError(e?.message || 'Failed to update invoice');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const send = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await sendInvoice(id);
    } catch (e: any) {
      setError(e?.message || 'Failed to send invoice');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const pay = useCallback(async (id: string, payload: PaymentCreatePayload): Promise<{ invoice: Invoice; invoiceSummary: InvoiceSummary }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await addPayment(id, payload);
      setInvoices(prev => prev.map(inv => inv.id === id ? result.invoice : inv));
      setCurrent(prev => (prev && prev.id === id ? result.invoice : prev));
      return result;
    } catch (e: any) {
      setError(e?.message || 'Failed to add payment');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const removePayment = useCallback(async (invoiceId: string, paymentId: string): Promise<{ invoice: Invoice; invoiceSummary: InvoiceSummary }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await deletePayment(invoiceId, paymentId);
      setInvoices(prev => prev.map(inv => inv.id === invoiceId ? result.invoice : inv));
      setCurrent(prev => (prev && prev.id === invoiceId ? result.invoice : prev));
      return result;
    } catch (e: any) {
      setError(e?.message || 'Failed to remove payment');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const cancel = useCallback(async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await cancelInvoice(id);
      setInvoices(prev => prev.map(inv => inv.id === id ? updated : inv));
      setCurrent(prev => (prev && prev.id === id ? updated : prev));
      return updated;
    } catch (e: any) {
      setError(e?.message || 'Failed to cancel invoice');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const remove = useCallback(async (id: string): Promise<{ clientId: string; invoiceSummary: InvoiceSummary }> => {
    setLoading(true);
    setError(null);
    try {
      const result = await deleteInvoice(id);
      setInvoices(prev => prev.filter(inv => inv.id !== id));
      setCurrent(prev => (prev && prev.id === id ? null : prev));
      return {
        clientId: result.clientId,
        invoiceSummary: result.invoiceSummary,
      };
    } catch (e: any) {
      setError(e?.message || 'Failed to delete invoice');
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    invoices,
    current,
    loading,
    error,
    fetchList,
    fetchOne,
    create,
    update,
    send,
    pay,
    removePayment,
    cancel,
    remove,
  };
}


