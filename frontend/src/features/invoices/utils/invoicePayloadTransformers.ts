import { OpticsInvoiceCreatePayload, OpticsInvoiceUpdatePayload } from '../api/opticsInvoices.api';
import { Invoice } from '../types';

/**
 * Transforme les données d'une facture en payload pour la création d'une facture optique
 */
export function transformToCreatePayload(invoiceData: Partial<Invoice>, clientId: string): OpticsInvoiceCreatePayload {
  return {
    clientId: invoiceData.client?.id || clientId || 'temp',
    totalAmount: invoiceData.total || 0,
    currency: 'MAD',
    notes: {
      reason: 'Facture optique',
      comment: invoiceData.notes || '',
    },
    items: (invoiceData.items || []).map(item => ({
      id: item.id || Date.now().toString(),
      name: item.name || item.description || '',
      description: item.description || '',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      category: (item.description?.includes('Monture') || item.name?.includes('Monture') ? 'frame' : 'lens') as 'frame' | 'lens',
    })),
    prescriptionData: {
      rightEye: {
        sphere: 0,
        cylinder: 0,
        axis: 0,
        add: 0,
      },
      leftEye: {
        sphere: 0,
        cylinder: 0,
        axis: 0,
        add: 0,
      },
      pd: 0,
    },
  };
}

/**
 * Transforme les données d'une facture en payload pour la mise à jour d'une facture optique
 */
export function transformToUpdatePayload(
  invoiceData: Partial<Invoice>,
  currentInvoice: Invoice
): OpticsInvoiceUpdatePayload {
  return {
    clientId: invoiceData.client?.id || currentInvoice.client?.id || 'temp',
    totalAmount: invoiceData.total || currentInvoice.total || 0,
    currency: 'MAD',
    notes: {
      reason: 'Facture optique',
      comment: invoiceData.notes || currentInvoice.notes || '',
    },
    items: (invoiceData.items || currentInvoice.items || []).map(item => ({
      id: item.id || Date.now().toString(),
      name: item.name || item.description || '',
      description: item.description || '',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      category: (item.description?.includes('Monture') || item.name?.includes('Monture') ? 'frame' : 'lens') as 'frame' | 'lens',
    })),
  };
}

/**
 * Enrichit une facture créée avec les données du formulaire
 */
export function enrichInvoiceWithFormData(
  newInvoice: Invoice,
  invoiceData: Partial<Invoice>
): Invoice {
  return {
    ...newInvoice,
    items: invoiceData.items || newInvoice.items || [],
    number: invoiceData.number || newInvoice.number,
    issuedAt: invoiceData.issuedAt || newInvoice.issuedAt,
    notes: invoiceData.notes || newInvoice.notes,
    // Conserver le client depuis invoiceData si disponible
    client: invoiceData.client || newInvoice.client,
  };
}

