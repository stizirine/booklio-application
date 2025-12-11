import api from '@services/api';
import { mapApiClientToFrontend } from '@src/features/clients/utils/clientMapper';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

// Types
export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  lastAppointment?: string;
  notesCount?: number;
  notes?: string;
  invoiceSummary?: {
    totalAmount: number;
    dueAmount: number;
    invoiceCount: number;
    lastInvoiceAt?: string;
  };
  appointments?: any[];
}

interface ClientStore {
  // État
  clients: Client[];
  selectedClient: Client | null;
  loading: boolean;
  error: string | null;

  // Actions de base
  setClients: (clients: Client[]) => void;
  setSelectedClient: (client: Client | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;

  // Actions API
  fetchClients: () => Promise<void>;
  fetchClient: (id: string) => Promise<Client>;
  createClient: (data: any) => Promise<Client>;
  updateClient: (id: string, data: any) => Promise<Client>;
  deleteClient: (id: string) => Promise<void>;
  
  // Rafraîchir un client spécifique dans la liste
  refreshClient: (id: string) => Promise<void>;
  
  // Recherche de clients
  searchClients: (query: string) => Promise<void>;
  
  // Mise à jour optimiste (pour un meilleur UX)
  optimisticUpdateClient: (id: string, updates: Partial<Client>) => void;
}

export const useClientStore = create<ClientStore>()(
  devtools(
    (set, get) => {
      // Déduplication: promesse en vol pour fetchClients et par id pour fetchClient
      let fetchClientsPromise: Promise<void> | null = null;
      const fetchClientPromises = new Map<string, Promise<Client>>();

      return {
        // État initial
        clients: [],
        selectedClient: null,
        loading: false,
        error: null,

        // Actions de base
        setClients: (clients) => set({ clients }),
        
        setSelectedClient: (client) => set({ selectedClient: client }),
        
        setLoading: (loading) => set({ loading }),
        
        setError: (error) => set({ error }),

        // Récupérer tous les clients (dédupliqué)
        fetchClients: async () => {
          if (fetchClientsPromise) {
            return fetchClientsPromise;
          }
          set({ loading: true, error: null });
          fetchClientsPromise = (async () => {
            try {
              const response = await api.get('/v1/clients');
              const d: any = response.data;
              const rawList: any[] = Array.isArray(d)
                ? d
                : (d?.clients || d?.data?.clients || d?.items || []);

              const normalized = rawList.map((c: any) => {
                if (c && c._id) return c;
                const firstName = (c?.name || '').split(' ')[0] || '';
                const lastName = (c?.name || '').split(' ').slice(1).join(' ') || '';
                return {
                  _id: c?.id,
                  firstName,
                  lastName,
                  email: c?.email || '',
                  phone: c?.phone || '',
                  address: c?.address || '',
                  appointments: Array.isArray(c?.appointments) ? c.appointments : [],
                  invoiceSummary: c?.invoiceSummary,
                };
              });

              const mappedClients = normalized.map(mapApiClientToFrontend);
              set({ clients: mappedClients, loading: false });
            } catch (error: any) {
              const errorMsg = error?.message || 'Failed to fetch clients';
              set({ error: errorMsg, loading: false });
              console.error('❌ Error fetching clients:', error);
              throw error;
            } finally {
              fetchClientsPromise = null;
            }
          })();
          return fetchClientsPromise;
        },

        // Récupérer un client spécifique (dédupliqué par id)
        fetchClient: async (id: string) => {
          const inFlight = fetchClientPromises.get(id);
          if (inFlight) return inFlight;

          const promise = (async () => {
            try {
              const response = await api.get(`/v1/clients/${id}`);
              
              let apiClient: any;
              const d: any = response.data;
              if (d && d.client) {
                apiClient = {
                  ...d.client,
                  invoiceSummary: d.invoiceSummary,
                  appointments: Array.isArray(d.appointments) ? d.appointments : [],
                };
              } else if (d && d.data) {
                apiClient = d.data;
              } else {
                apiClient = d;
              }
              
              const mappedClient = mapApiClientToFrontend(apiClient);
              
              set(state => {
                const exists = state.clients.some(c => c.id === id);
                const nextClients = exists
                  ? state.clients.map(c => (c.id === id ? mappedClient : c))
                  : [mappedClient, ...state.clients];
                return {
                  clients: nextClients,
                  selectedClient: state.selectedClient?.id === id || !state.selectedClient
                    ? mappedClient
                    : state.selectedClient,
                };
              });
              return mappedClient;
            } catch (error: any) {
              console.error('❌ Error fetching client:', error);
              throw error;
            } finally {
              fetchClientPromises.delete(id);
            }
          })();

          fetchClientPromises.set(id, promise);
          return promise;
        },

        // Créer un nouveau client
        createClient: async (data: any) => {
          set({ loading: true, error: null });
          try {
            const response = await api.post('/v1/clients', data);
            const apiClient = (response.data as any).client || response.data;
            const mappedClient = mapApiClientToFrontend(apiClient);
            
            set(state => ({
              clients: [mappedClient, ...state.clients],
              loading: false
            }));
            
            return mappedClient;
          } catch (error: any) {
            const errorMsg = error?.message || 'Failed to create client';
            set({ error: errorMsg, loading: false });
            console.error('❌ Error creating client:', error);
            throw error;
          }
        },

        // Mettre à jour un client
        updateClient: async (id: string, data: any) => {
          set({ loading: true, error: null });
          try {
            await api.patch(`/v1/clients/${id}`, data);
            const response = await api.get(`/v1/clients/${id}`);
            const apiClient = response.data;
            const mappedClient = mapApiClientToFrontend(apiClient);
            console.log('clientStore - updateClient mappedClient', mappedClient);
            set(state => ({
              clients: state.clients.map(c => 
                c.id === id ? mappedClient : c
              ),
              selectedClient: state.selectedClient?.id === id 
                ? mappedClient 
                : state.selectedClient,
              loading: false
            }));
            
            return mappedClient;
          } catch (error: any) {
            const errorMsg = error?.message || 'Failed to update client';
            set({ error: errorMsg, loading: false });
            console.error('❌ Error updating client:', error);
            throw error;
          }
        },

        // Supprimer un client
        deleteClient: async (id: string) => {
          set({ loading: true, error: null });
          try {
            await api.delete(`/v1/clients/${id}`);
            
            set(state => ({
              clients: state.clients.filter(c => c.id !== id),
              selectedClient: state.selectedClient?.id === id 
                ? null 
                : state.selectedClient,
              loading: false
            }));
            
          } catch (error: any) {
            const errorMsg = error?.message || 'Failed to delete client';
            set({ error: errorMsg, loading: false });
            console.error('❌ Error deleting client:', error);
            throw error;
          }
        },

        // Rafraîchir un client spécifique (utile après création/modification de facture)
        refreshClient: async (id: string) => {
          try {
            await get().fetchClient(id);
          } catch (error) {
            console.error('❌ Error refreshing client:', error);
          }
        },

        // Rechercher des clients
        searchClients: async (query: string) => {
          set({ loading: true, error: null });
          try {
            const q = (query || '').trim();
            const response = await api.get('/v1/clients', { params: { q, limit: 100 } });
            const d: any = response.data;
            const rawList: any[] = Array.isArray(d)
              ? d
              : (d?.clients || d?.data?.clients || d?.items || []);

            const normalized = rawList.map((c: any) => {
              if (c && c._id) return c;
              const firstName = (c?.name || '').split(' ')[0] || '';
              const lastName = (c?.name || '').split(' ').slice(1).join(' ') || '';
              return {
                _id: c?.id,
                firstName,
                lastName,
                email: c?.email || '',
                phone: c?.phone || '',
                address: c?.address || '',
                appointments: Array.isArray(c?.appointments) ? c.appointments : [],
                invoiceSummary: c?.invoiceSummary,
              };
            });

            const mapped = normalized.map(mapApiClientToFrontend);
            set({ clients: mapped, loading: false });
          } catch (error: any) {
            const errorMsg = error?.message || 'Failed to search clients';
            set({ error: errorMsg, loading: false });
            console.error('❌ Error searching clients:', error);
            throw error;
          }
        },

        // Mise à jour optimiste (sans appel API, pour un meilleur UX)
        optimisticUpdateClient: (id: string, updates: Partial<Client>) => {
          set(state => ({
            clients: state.clients.map(c =>
              c.id === id ? { ...c, ...updates } : c
            ),
            selectedClient: state.selectedClient?.id === id
              ? { ...state.selectedClient, ...updates }
              : state.selectedClient
          }));
        },
      };
    },
    { name: 'ClientStore' }
  )
);
