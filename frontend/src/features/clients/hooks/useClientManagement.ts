import { useClientStore } from '@stores/clientStore';
import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react';

export type ClientFormState = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
};

export const useClientManagement = (client: any | null, onUpdated: (client: any) => void) => {
  const [loading, setLoading] = useState(false);
  const [state, dispatch] = useReducer(
    (s: ClientFormState, a: Partial<ClientFormState>) => ({ ...s, ...a }),
    { firstName: '', lastName: '', email: '', phone: '', address: '' }
  );
  const clientStore = useClientStore();

  // Initialiser le formulaire une seule fois par client (éviter d'écraser la saisie)
  const initializedForClientIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!client?.id) return;
    if (initializedForClientIdRef.current === client.id) return;
    initializedForClientIdRef.current = client.id;

    dispatch({
      firstName: (client.name || '').split(' ')[0] || '',
      lastName: (client.name || '').split(' ').slice(1).join(' ') || '',
      email: client.email || '',
      phone: client.phone || '',
      address: client.address || '',
    });
  }, [client?.id, client?.name, client?.email, client?.phone, client?.address]);

  // Mettre à jour les informations du client via le store
  const updateClient = useCallback(async () => {
    if (!client) return;

    try {
      setLoading(true);
      const updated = await clientStore.updateClient(client.id, state);
      // Synchroniser le client sélectionné dans le store
      clientStore.setSelectedClient(updated as any);
      // Empêcher la réinitialisation du formulaire sur le même client
      initializedForClientIdRef.current = updated.id;
      // Compat: rappeler le callback existant
      onUpdated(updated);
      // Forcer la mise à jour de la vue (ClientsPage écoute cet event pour refetch)
      try {
        window.dispatchEvent(new Event('refreshAppointments'));
      } catch {}
      return updated;
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [client, state, clientStore, onUpdated]);

  // Ouvrir la modal de création de rendez-vous pour ce client
  const openCreateAppointment = useCallback(() => {
    if (!client) return;
    
    const event = new CustomEvent('openCreateAppointmentForClient', { 
      detail: { 
        clientId: client.id, 
        ...state 
      } 
    });
    window.dispatchEvent(event);
  }, [client, state]);

  return useMemo(() => ({
    loading,
    state,
    dispatch,
    updateClient,
    openCreateAppointment
  }), [loading, state, dispatch, updateClient, openCreateAppointment]);
};
