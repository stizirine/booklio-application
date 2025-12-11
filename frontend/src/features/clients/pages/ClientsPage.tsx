import { useDashboardState } from '@hooks/useDashboardState';
import { useEventCreation } from '@hooks/useEventCreation';
import CreateEventModal from '@src/features/appointments/components/CreateEventModal';
import { ClientItem, NewClientPayload } from '@src/types';
import { useClientStore } from '@stores/clientStore';
import React, { useCallback, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../../../contexts/NotificationContext';
import { useTenant } from '../../../contexts/TenantContext';
import ClientsPanel from '../components/ClientsPanel';

interface ClientsPageProps {
  onEditClient?: (clientId: string) => void;
  onCreateAppointment?: (clientId: string) => void;
  onCreateInvoice?: (clientId: string) => void;
}

const ClientsPage: React.FC<ClientsPageProps> = ({
  onEditClient: _onEditClient,
  onCreateAppointment: _onCreateAppointment,
  onCreateInvoice: _onCreateInvoice,
}) => {
  const { tenant: _tenant } = useTenant();
  const { showSuccess, showError } = useNotification();
  const clientStore = useClientStore();
  const { state, actions } = useDashboardState();
  const hasLoadedClients = useRef(false);
  const eventCreation = useEventCreation(actions);
  const navigate = useNavigate();

  // Charger les clients au montage - une seule fois
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token && !hasLoadedClients.current) {
      hasLoadedClients.current = true;
      clientStore.fetchClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Pas de dépendances pour éviter les re-exécutions

  // Rafraîchir les clients si modifications depuis une fiche client
  useEffect(() => {
    const listener = () => {
      clientStore.fetchClients();
      // Rafraîchir aussi le client sélectionné pour mettre à jour ses RDV dans la modal
      const sel = clientStore.selectedClient;
      if (sel?.id) {
        clientStore.refreshClient(sel.id);
      }
    };
    window.addEventListener('refreshAppointments', listener);
    return () => window.removeEventListener('refreshAppointments', listener);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Pas de dépendances

  // Ouvrir CreateEventModal pré-rempli depuis la fiche client (sans navigation)
  useEffect(() => {
    const handler = (e: any) => {
      const d = e.detail || {};
      actions.setIsCreateOpen(true);
      // Laisser la modale se monter puis pré-remplir via un événement
      setTimeout(() => {
        const fillEvent = new CustomEvent('prefillCreateEvent', { detail: d });
        window.dispatchEvent(fillEvent);
      }, 0);
    };
    window.addEventListener('openCreateAppointmentForClient', handler);
    return () => window.removeEventListener('openCreateAppointmentForClient', handler);
  }, [actions]);

  // Ouvrir la fiche client depuis les détails de RDV
  useEffect(() => {
    const handler = async (e: any) => {
      const { clientId, tab } = e.detail || {};
      if (clientId) {
        // Naviguer vers la page de détails du client
        navigate(`/clients/${clientId}${tab ? `?tab=${tab}` : ''}`);
      }
    };
    window.addEventListener('openClientDetail', handler);
    return () => window.removeEventListener('openClientDetail', handler);
  }, [navigate]);

  // Charger les clients quand la modale de création s'ouvre si nécessaire
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (state.isCreateOpen && token && clientStore.clients.length === 0 && !clientStore.loading) {
      clientStore.fetchClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isCreateOpen, clientStore.clients.length, clientStore.loading]);

  const handleSearch = useCallback((query: string) => {
    if (query.trim()) {
      clientStore.searchClients(query);
    }
    // Ne pas appeler fetchClients() automatiquement pour éviter les boucles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = useCallback(async (payload: NewClientPayload) => {
    try {
      await clientStore.createClient(payload);
      showSuccess('Client créé', `${payload.firstName} ${payload.lastName} a été ajouté avec succès`);
    } catch (error) {
      showError('Erreur', `Impossible de créer le client: ${error}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showSuccess, showError]);

  const handleSelect = useCallback((client: ClientItem) => {
    // Naviguer vers la page de détails du client
    navigate(`/clients/${client.id}`);
  }, [navigate]);

  return (
    <>
      <ClientsPanel
        clients={clientStore.clients}
        loading={clientStore.loading}
        onSearch={handleSearch}
        onCreate={handleCreate}
        onSelect={handleSelect}
      />

      {/* Modal de création d'événement depuis le module Clients */}
      {state.isCreateOpen && (
        <CreateEventModal
          open={state.isCreateOpen}
          onClose={() => {
            actions.setIsCreateOpen(false);
          }}
          onCreate={async (payload) => {
            await eventCreation.createEvent(payload);
            // Rafraîchir la liste des clients et le client sélectionné après création
            try {
              await clientStore.fetchClients();
              const sel = clientStore.selectedClient;
              if (sel?.id) {
                await clientStore.refreshClient(sel.id);
              }
            } catch {}
          }}
          clients={clientStore.clients}
        />
      )}
    </>
  );
};

export default ClientsPage;
