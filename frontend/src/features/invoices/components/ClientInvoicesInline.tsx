import { ClientInvoiceSummary } from '@src/types/clients';
import React from 'react';
import ClientInvoicesSummary from './ClientInvoicesSummary';

interface ClientInvoicesInlineProps {
  invoiceSummary?: ClientInvoiceSummary;
  currency?: string;
}

// Composant qui affiche un résumé des factures d'un client
// directement depuis les données du backend (invoiceSummary)
const ClientInvoicesInline: React.FC<ClientInvoicesInlineProps> = ({ 
  invoiceSummary, 
  currency = 'EUR' 
}) => {
  if (!invoiceSummary || invoiceSummary.invoiceCount === 0) {
    return null;
  }

  return (
    <div className="mt-1">
      <ClientInvoicesSummary 
        total={invoiceSummary.totalAmount} 
        balanceDue={invoiceSummary.dueAmount} 
        currency={currency}
        invoiceCount={invoiceSummary.invoiceCount}
        lastInvoiceAt={invoiceSummary.lastInvoiceAt}
      />
    </div>
  );
};

export default ClientInvoicesInline;



