import { Client, useClientStore } from '@stores/clientStore';
import { useMemo } from 'react';

export const useClientServices = () => {
  const clientStore = useClientStore();

  return useMemo(() => ({
    clients: clientStore.clients,
    loading: clientStore.loading,
    selectedClient: clientStore.selectedClient as Client | null,
    setSelectedClient: clientStore.setSelectedClient,
    fetchClients: clientStore.fetchClients,
    searchClients: clientStore.searchClients,
    refreshClient: clientStore.refreshClient,
    createClient: clientStore.createClient,
    updateClient: clientStore.updateClient,
    deleteClient: clientStore.deleteClient,
  }), [
    clientStore.clients,
    clientStore.loading,
    clientStore.selectedClient,
    clientStore.setSelectedClient,
    clientStore.fetchClients,
    clientStore.searchClients,
    clientStore.refreshClient,
    clientStore.createClient,
    clientStore.updateClient,
    clientStore.deleteClient,
  ]);
};
