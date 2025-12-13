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

  // Utiliser useMemo avec des dépendances stables pour éviter les boucles infinies
  // Ne dépendre que des IDs et des valeurs primitives, pas des tableaux/objets qui changent
  const selectedClientIdStable = selectedClientId;
  const invoiceClientId = invoice?.client?.id;
  const invoiceClientName = invoice?.client?.name;
  const prefillClientName = prefill?.clientName;
  const selectedClientIdValue = selectedClient?.id;
  const selectedClientName = selectedClient?.name;
  const selectedClientAddress = selectedClient?.address;

  return useMemo(() => {
    if (!invoice) return undefined;

    // 1. Essayer d'abord par selectedClientId (le plus fiable après création)
    const clientFromSelectedId: Client | undefined = selectedClientIdStable
      ? clients.find(c => c.id === selectedClientIdStable)
      : undefined;

    // 2. Ensuite par l'id du client dans la facture
    const clientFromInvoiceId: Client | undefined = !clientFromSelectedId && invoiceClientId
      ? clients.find(c => c.id === invoiceClientId)
      : undefined;

    // 3. Puis par nom du client dans la facture (avec correspondance partielle)
    const clientFromInvoiceName: Client | undefined = !clientFromSelectedId && !clientFromInvoiceId && invoiceClientName
      ? clients.find(c => {
          const invoiceName = invoiceClientName || '';
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
      || (selectedClientIdValue && selectedClient ? selectedClient as Client : undefined)
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
    if (prefillClientName) {
      return {
        name: prefillClientName,
        address: selectedClientAddress,
        ssn: undefined,
        birthDate: undefined,
      };
    }

    // Dernier recours: utiliser juste le nom depuis la facture
    if (invoiceClientName) {
      return {
        name: invoiceClientName,
        address: undefined,
        ssn: undefined,
        birthDate: undefined,
      };
    }

    return undefined;
    // Dépendre uniquement des valeurs primitives pour éviter les re-calculs inutiles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invoice?.id, selectedClientIdStable, invoiceClientId, invoiceClientName, prefillClientName, selectedClientIdValue, selectedClientName, selectedClientAddress]);
}

