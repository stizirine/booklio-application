import { useClientServices } from '@features/clients/services';
import type { Client } from '@stores/clientStore';
import { useMemo } from 'react';
import { Invoice } from '../types';

export interface ClientDataForPrint {
  name: string;
  address?: string;
  ssn?: string;
  birthDate?: string;
}

interface UseOpticsInvoiceClientResolutionProps {
  invoice: Invoice | null;
  selectedClientId: string | null;
  prefill?: { clientName?: string } | null;
}

export function useOpticsInvoiceClientResolution({
  invoice,
  selectedClientId,
  prefill,
}: UseOpticsInvoiceClientResolutionProps): ClientDataForPrint | undefined {
  const { clients, selectedClient } = useClientServices();

  return useMemo(() => {
    if (!invoice) return undefined;

    // 1. Essayer d'abord par selectedClientId (le plus fiable après création)
    const clientFromSelectedId: Client | undefined = selectedClientId
      ? clients.find(c => c.id === selectedClientId)
      : undefined;

    // 2. Ensuite par l'id du client dans la facture
    const clientFromInvoiceId: Client | undefined = !clientFromSelectedId && invoice.client?.id
      ? clients.find(c => c.id === invoice.client!.id)
      : undefined;

    // 3. Puis par nom du client dans la facture (avec correspondance partielle)
    const clientFromInvoiceName: Client | undefined = !clientFromSelectedId && !clientFromInvoiceId && invoice.client?.name
      ? clients.find(c => {
          const invoiceName = invoice.client!.name || '';
          return c.name === invoiceName || 
                 c.name.includes(invoiceName) || 
                 invoiceName.includes(c.name);
        })
      : undefined;

    // 4. Ensuite selectedClient
    // 5. Puis premier client de la liste comme dernier recours
    const sourceClient: Client | undefined = clientFromSelectedId
      || clientFromInvoiceId
      || clientFromInvoiceName
      || (selectedClient as Client | undefined)
      || (clients.length > 0 ? clients[0] : undefined);

    // Construire les données du client pour l'impression
    if (sourceClient) {
      return {
        name: sourceClient.name,
        address: sourceClient.address,
        ssn: undefined,
        birthDate: undefined,
      };
    }

    // Fallback: utiliser prefill si disponible
    if (prefill?.clientName) {
      return {
        name: prefill.clientName,
        address: selectedClient?.address,
        ssn: undefined,
        birthDate: undefined,
      };
    }

    // Dernier recours: utiliser juste le nom depuis la facture
    if (invoice.client?.name) {
      return {
        name: invoice.client.name,
        address: undefined,
        ssn: undefined,
        birthDate: undefined,
      };
    }

    return undefined;
  }, [invoice, selectedClientId, clients, selectedClient, prefill]);
}

