import { useMemo } from 'react';
import { InvoiceStatusEnum } from '../constants';
import { Invoice } from '../types';

export interface InvoiceStats {
  total: number;
  paid: number;
  pending: number;
  overdue: number;
  draft: number;
  draftAmount: number;
  count: number;
}

export function useInvoiceStatistics(invoices: Invoice[]): InvoiceStats {
  return useMemo(() => {
    // Total facturé
    const total = invoices.reduce((sum, inv) => sum + (inv.total || 0), 0);

    // Payé = factures complètement payées + toutes les avances
    const paid = invoices.reduce((sum, inv) => {
      if (inv.status === InvoiceStatusEnum.PAID) {
        // Facture complètement payée : on compte le total
        return sum + (inv.total || 0);
      }
      // Autres statuts : on compte l'avance déjà versée
      return sum + (inv.advanceAmount || 0);
    }, 0);

    // En attente = toutes les factures non payées (draft, sent, partial, overdue)
    const pending = invoices
      .filter((inv) =>
        [
          InvoiceStatusEnum.DRAFT,
          InvoiceStatusEnum.SENT,
          InvoiceStatusEnum.PARTIAL,
          InvoiceStatusEnum.OVERDUE,
        ].includes(inv.status as InvoiceStatusEnum)
      )
      .reduce((sum, inv) => sum + (inv.balanceDue || inv.total || 0), 0);

    // En retard
    const overdue = invoices
      .filter((inv) => inv.status === InvoiceStatusEnum.OVERDUE)
      .reduce((sum, inv) => sum + (inv.balanceDue || inv.total || 0), 0);

    // Brouillons
    const draftInvoices = invoices.filter(
      (inv) => inv.status === InvoiceStatusEnum.DRAFT
    );
    const draft = draftInvoices.length;
    const draftAmount = draftInvoices.reduce(
      (sum, inv) => sum + (inv.total || 0),
      0
    );

    return {
      total,
      paid,
      pending,
      overdue,
      draft,
      draftAmount,
      count: invoices.length,
    };
  }, [invoices]);
}
