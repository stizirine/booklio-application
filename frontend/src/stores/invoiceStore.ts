import { addPayment, cancelInvoice, createInvoice, deleteInvoice, deletePayment, getInvoice, listInvoices, sendInvoice, updateInvoice } from '@invoices/api/invoices.api';
import { Invoice, InvoiceCreatePayload, InvoiceSummary, InvoiceUpdatePayload, PaymentCreatePayload } from '@invoices/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

interface InvoiceStore {
  // État
  invoices: Invoice[];
  currentInvoice: Invoice | null;
  loading: boolean;
  error: string | null;

  // Actions de base
  setInvoices: (invoices: Invoice[]) => void;
  setCurrentInvoice: (invoice: Invoice | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Actions API
  fetchInvoices: (params?: Record<string, unknown>) => Promise<void>;
  fetchInvoice: (id: string) => Promise<void>;
  createInvoiceAction: (payload: InvoiceCreatePayload) => Promise<{ invoice: Invoice; invoiceSummary: InvoiceSummary }>;
  updateInvoiceAction: (id: string, payload: InvoiceUpdatePayload) => Promise<{ invoice: Invoice; invoiceSummary: InvoiceSummary }>;
  deleteInvoiceAction: (id: string) => Promise<void>;
  sendInvoiceAction: (id: string) => Promise<void>;
  cancelInvoiceAction: (id: string) => Promise<void>;
  addPaymentAction: (id: string, payload: PaymentCreatePayload) => Promise<void>;
  deletePaymentAction: (invoiceId: string, paymentId: string) => Promise<void>;
}

export const useInvoiceStore = create<InvoiceStore>()(
  devtools(
    (set, _get) => ({
      // État initial
      invoices: [],
      currentInvoice: null,
      loading: false,
      error: null,

      // Actions de base
      setInvoices: (invoices) => set({ invoices }),
      setCurrentInvoice: (currentInvoice) => set({ currentInvoice }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Actions API
      fetchInvoices: async (params?: Record<string, unknown>) => {
        set({ loading: true, error: null });
        try {
          const data = await listInvoices(params);
          set({ invoices: data, loading: false });
        } catch (e: any) {
          set({ error: e?.message || 'Failed to load invoices', loading: false });
        }
      },

      fetchInvoice: async (id: string) => {
        set({ loading: true, error: null });
        try {
          const data = await getInvoice(id);
          set({ currentInvoice: data, loading: false });
        } catch (e: any) {
          set({ error: e?.message || 'Failed to load invoice', loading: false });
        }
      },

      createInvoiceAction: async (payload: InvoiceCreatePayload): Promise<{ invoice: Invoice; invoiceSummary: InvoiceSummary }> => {
        set({ loading: true, error: null });
        try {
          const result = await createInvoice(payload);
          const newInvoice = {
            ...result.invoice,
            id: (result.invoice as any).id || (result.invoice as any)._id,
          } as Invoice;
          set(state => ({ 
            invoices: [newInvoice, ...state.invoices], 
            loading: false 
          }));
          return result;
        } catch (e: any) {
          set({ error: e?.message || 'Failed to create invoice', loading: false });
          throw e;
        }
      },

      updateInvoiceAction: async (id: string, payload: InvoiceUpdatePayload): Promise<{ invoice: Invoice; invoiceSummary: InvoiceSummary }> => {
        set({ loading: true, error: null });
        try {
          const result = await updateInvoice(id, payload);
          const normalizedId = (inv: any) => inv?.id || inv?._id;
          const updated = {
            ...result.invoice,
            id: normalizedId(result.invoice),
          } as Invoice;
          set(state => ({
            invoices: state.invoices.map(inv => {
              const invId = normalizedId(inv);
              return invId === id ? updated : inv;
            }),
            currentInvoice: normalizedId(state.currentInvoice) === id ? updated : state.currentInvoice,
            loading: false
          }));
          return result;
        } catch (e: any) {
          set({ error: e?.message || 'Failed to update invoice', loading: false });
          throw e;
        }
      },

      deleteInvoiceAction: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await deleteInvoice(id);
          set(state => ({
            invoices: state.invoices.filter(inv => inv.id !== id),
            currentInvoice: state.currentInvoice?.id === id ? null : state.currentInvoice,
            loading: false
          }));
        } catch (e: any) {
          set({ error: e?.message || 'Failed to delete invoice', loading: false });
          throw e;
        }
      },

      sendInvoiceAction: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await sendInvoice(id);
          // Rafraîchir la facture après envoi
          const updatedInvoice = await getInvoice(id);
          set(state => ({
            invoices: state.invoices.map(inv => inv.id === id ? updatedInvoice : inv),
            currentInvoice: state.currentInvoice?.id === id ? updatedInvoice : state.currentInvoice,
            loading: false
          }));
        } catch (e: any) {
          set({ error: e?.message || 'Failed to send invoice', loading: false });
          throw e;
        }
      },

      cancelInvoiceAction: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await cancelInvoice(id);
          // Rafraîchir la facture après annulation
          const updatedInvoice = await getInvoice(id);
          set(state => ({
            invoices: state.invoices.map(inv => inv.id === id ? updatedInvoice : inv),
            currentInvoice: state.currentInvoice?.id === id ? updatedInvoice : state.currentInvoice,
            loading: false
          }));
        } catch (e: any) {
          set({ error: e?.message || 'Failed to cancel invoice', loading: false });
          throw e;
        }
      },

      addPaymentAction: async (id: string, payload: PaymentCreatePayload) => {
        set({ loading: true, error: null });
        try {
          const result = await addPayment(id, payload);
          set(state => ({
            invoices: state.invoices.map(inv => inv.id === id ? result.invoice : inv),
            currentInvoice: state.currentInvoice?.id === id ? result.invoice : state.currentInvoice,
            loading: false
          }));
        } catch (e: any) {
          set({ error: e?.message || 'Failed to add payment', loading: false });
          throw e;
        }
      },

      deletePaymentAction: async (invoiceId: string, paymentId: string) => {
        set({ loading: true, error: null });
        try {
          const result = await deletePayment(invoiceId, paymentId);
          set(state => ({
            invoices: state.invoices.map(inv => inv.id === invoiceId ? result.invoice : inv),
            currentInvoice: state.currentInvoice?.id === invoiceId ? result.invoice : state.currentInvoice,
            loading: false
          }));
        } catch (e: any) {
          set({ error: e?.message || 'Failed to delete payment', loading: false });
          throw e;
        }
      },
    }),
    {
      name: 'invoice-store',
    }
  )
);

export default useInvoiceStore;
