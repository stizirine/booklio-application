import { useMemo } from 'react';
import { InvoiceStatusEnum } from '../constants';
import { Invoice } from '../types';

export interface InvoicePermissions {
  canEdit: boolean;
  canSend: boolean;
  canDelete: boolean;
  canAddPayment: boolean;
  canDownloadPDF: boolean;
  canCancel: boolean;
}

/**
 * Hook pour gérer les permissions d'actions sur une facture
 * Centralise toute la logique métier des autorisations
 */
export function useInvoicePermissions(invoice: Invoice | null): InvoicePermissions {
  return useMemo(() => {
    if (!invoice) {
      return {
        canEdit: false,
        canSend: false,
        canDelete: false,
        canAddPayment: false,
        canDownloadPDF: false,
        canCancel: false,
      };
    }

    const status = invoice.status as InvoiceStatusEnum;

    // On peut toujours éditer une facture (sauf si annulée et complètement payée)
    const canEdit = status !== InvoiceStatusEnum.CANCELED || 
                    (invoice.balanceDue !== undefined && invoice.balanceDue > 0);

    // On peut envoyer uniquement les brouillons
    const canSend = status === InvoiceStatusEnum.DRAFT;

    // On peut supprimer les brouillons et les factures annulées
    const canDelete = 
      status === InvoiceStatusEnum.DRAFT || 
      status === InvoiceStatusEnum.CANCELED;

    // On peut ajouter un paiement sur les factures non payées avec un solde dû
    const canAddPayment = 
      [
        InvoiceStatusEnum.DRAFT,
        InvoiceStatusEnum.SENT,
        InvoiceStatusEnum.PARTIAL,
        InvoiceStatusEnum.OVERDUE,
      ].includes(status) &&
      invoice.balanceDue !== undefined &&
      invoice.balanceDue > 0;

    // On peut toujours télécharger le PDF (pour archive)
    const canDownloadPDF = true;

    // On peut annuler une facture envoyée ou en retard
    const canCancel = 
      status === InvoiceStatusEnum.SENT || 
      status === InvoiceStatusEnum.OVERDUE;

    return {
      canEdit,
      canSend,
      canDelete,
      canAddPayment,
      canDownloadPDF,
      canCancel,
    };
  }, [invoice]);
}
