import api from '@services/api';
import { Invoice, InvoiceCreatePayload, InvoiceUpdatePayload } from '../types';

// Types spécifiques pour les factures optiques
export interface OpticsInvoiceItem {
  id: string;
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
  category: 'frame' | 'lens' | 'service';
  // Données spécifiques à la monture
  frameData?: {
    brand: string;
    model: string;
    material: string;
    color: string;
  };
  // Données spécifiques aux verres
  lensData?: {
    material: string;
    index: string;
    treatment: string;
    brand: string;
    rightEye: {
      sphere: string;
      cylinder: string;
      axis: string;
      add: string;
    };
    leftEye: {
      sphere: string;
      cylinder: string;
      axis: string;
      add: string;
    };
    pd: number | { mono: { od: number; og: number }; near?: number };
  };
}

export interface OpticsInvoiceCreatePayload extends Omit<InvoiceCreatePayload, 'items'> {
  items: OpticsInvoiceItem[];
  // Informations spécifiques à l'optique
  prescriptionData?: {
    rightEye: {
      sphere: number;
      cylinder: number;
      axis: number;
      add: number;
    };
    leftEye: {
      sphere: number;
      cylinder: number;
      axis: number;
      add: number;
    };
    pd: number | { mono: { od: number; og: number }; near?: number };
  };
  frameData?: {
    brand: string;
    model: string;
    material: string;
    color: string;
  };
  lensData?: {
    material: string;
    index: string;
    treatment: string;
    brand: string;
  };
}

export interface OpticsInvoiceUpdatePayload extends Omit<InvoiceUpdatePayload, 'items'> {
  items?: OpticsInvoiceItem[];
  prescriptionData?: {
    rightEye: {
      sphere: number;
      cylinder: number;
      axis: number;
      add: number;
    };
    leftEye: {
      sphere: number;
      cylinder: number;
      axis: number;
      add: number;
    };
    pd: number | { mono: { od: number; og: number }; near?: number };
  };
  frameData?: {
    brand: string;
    model: string;
    material: string;
    color: string;
  };
  lensData?: {
    material: string;
    index: string;
    treatment: string;
    brand: string;
  };
}

// API pour les factures optiques
export const opticsInvoicesApi = {
  /**
   * Récupérer toutes les factures optiques
   */
  async listOpticsInvoices(params?: {
    clientId?: string;
    status?: string;
    fromDate?: string;
    toDate?: string;
    page?: number;
    limit?: number;
  }): Promise<Invoice[]> {
    // Les factures optiques utilisent le même endpoint que les factures normales
    const response = await api.get('/v1/invoices', { 
      params
    });
    return response.data;
  },

  /**
   * Récupérer une facture optique par ID
   */
  async getOpticsInvoice(id: string): Promise<Invoice> {
    const response = await api.get(`/v1/invoices/${id}`);
    return response.data;
  },

  /**
   * Créer une nouvelle facture optique
   */
  async createOpticsInvoice(payload: OpticsInvoiceCreatePayload): Promise<Invoice> {
    // Les factures optiques utilisent le même endpoint que les factures normales
    const response = await api.post('/v1/invoices', payload);
    return response.data;
  },

  /**
   * Mettre à jour une facture optique
   */
  async updateOpticsInvoice(id: string, payload: OpticsInvoiceUpdatePayload): Promise<Invoice> {
    const response = await api.patch(`/v1/invoices/${id}`, payload);
    return response.data;
  },

  /**
   * Supprimer une facture optique
   */
  async deleteOpticsInvoice(id: string): Promise<void> {
    await api.delete(`/v1/invoices/${id}`);
  },

  /**
   * Générer un PDF pour une facture optique
   */
  async generateOpticsInvoicePDF(id: string): Promise<Blob> {
    const response = await api.get(`/v1/invoices/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  /**
   * Envoyer une facture optique par email
   */
  async sendOpticsInvoice(id: string, email: string): Promise<void> {
    await api.post(`/v1/invoices/${id}/send`, { email });
  },

  /**
   * Marquer une facture comme payée
   */
  async markOpticsInvoiceAsPaid(id: string, paymentData: {
    amount: number;
    method: 'cash' | 'card' | 'transfer' | 'check' | 'other';
    reference?: string;
    notes?: string;
  }): Promise<Invoice> {
    const response = await api.post(`/v1/invoices/${id}/payments`, paymentData);
    return response.data;
  },

  /**
   * Récupérer les statistiques des factures optiques
   */
  async getOpticsInvoiceStats(params?: {
    fromDate?: string;
    toDate?: string;
  }): Promise<{
    totalInvoices: number;
    totalAmount: number;
    paidInvoices: number;
    pendingInvoices: number;
    averageAmount: number;
  }> {
    const response = await api.get('/v1/invoices/stats', { 
      params: {
        ...params,
        type: 'optics'
      }
    });
    return response.data;
  }
};

// Hook pour utiliser l'API des factures optiques
export const useOpticsInvoicesApi = () => {
  return {
    list: opticsInvoicesApi.listOpticsInvoices,
    get: opticsInvoicesApi.getOpticsInvoice,
    create: opticsInvoicesApi.createOpticsInvoice,
    update: opticsInvoicesApi.updateOpticsInvoice,
    delete: opticsInvoicesApi.deleteOpticsInvoice,
    generatePDF: opticsInvoicesApi.generateOpticsInvoicePDF,
    send: opticsInvoicesApi.sendOpticsInvoice,
    markAsPaid: opticsInvoicesApi.markOpticsInvoiceAsPaid,
    getStats: opticsInvoicesApi.getOpticsInvoiceStats,
  };
};
