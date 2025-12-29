import { ClientInvoiceSummary } from '@src/types/clients';
import { useTenant } from '@contexts/TenantContext';
import { DEFAULT_CURRENCY } from '../constants';
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
  currency 
}) => {
  const { tenant } = useTenant();
  
  // Utiliser la devise passée en prop, sinon celle du tenant, sinon la devise par défaut
  const displayCurrency = currency || tenant?.currency || DEFAULT_CURRENCY;
  
  if (!invoiceSummary || invoiceSummary.invoiceCount === 0) {
    return null;
  }

  return (
    <div className="mt-1">
      <ClientInvoicesSummary 
        total={invoiceSummary.totalAmount} 
        balanceDue={invoiceSummary.dueAmount} 
        currency={displayCurrency}
        invoiceCount={invoiceSummary.invoiceCount}
        lastInvoiceAt={invoiceSummary.lastInvoiceAt}
      />
    </div>
  );
};

export default ClientInvoicesInline;



