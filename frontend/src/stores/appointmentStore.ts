import api from '@services/api';
import { AppointmentStatus } from '@src/types';
import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type AppointmentItem = {
  _id: string;
  title?: string;
  startAt: string;
  endAt: string;
  status?: AppointmentStatus;
  customerName?: string;
  clientEmail?: string;
  clientPhone?: string;
  clientId?: string;
  notes?: string;
  reason?: string;
  location?: string;
  invoiceSummary?: any;
};

export type EditAppointmentState = {
  editingId: string | null;
  title: string;
  start: string;
  end: string;
};

interface AppointmentStore {
  // État
  appointments: AppointmentItem[];
  selectedAppointment: AppointmentItem | null;
  loading: boolean;
  error: string | null;
  lastFetchedClientId: string | null;

  // Actions de base
  setAppointments: (appointments: AppointmentItem[]) => void;
  setSelectedAppointment: (appointment: AppointmentItem | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;

  // Actions API
  fetchAppointments: (params?: { clientId?: string; mode?: string; date?: Date }) => Promise<void>;
  refreshAppointments: (clientId: string) => Promise<void>;
  createAppointment: (data: any) => Promise<void>;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => Promise<void>;
  rescheduleAppointment: (id: string, start: string, end: string) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
}

export const useAppointmentStore = create<AppointmentStore>()(
  devtools(
    (set, _get) => ({
      // État initial
      appointments: [],
      selectedAppointment: null,
      loading: false,
      error: null,
      lastFetchedClientId: null,

      // Actions de base
      setAppointments: (appointments) => set({ appointments }),
      setSelectedAppointment: (selectedAppointment) => set({ selectedAppointment }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
      clearError: () => set({ error: null }),

      // Actions API
      fetchAppointments: async (params?: { clientId?: string; mode?: string; date?: Date }) => {
        set({ loading: true, error: null });
        try {
          const res = await api.get('/v1/appointments', { params: {
            clientId: params?.clientId,
            mode: params?.mode,
            date: params?.date?.toISOString(),
          }});
          const items = (res as any).data?.items || (res as any).data || [];
          set({
            appointments: items as AppointmentItem[],
            loading: false,
            lastFetchedClientId: params?.clientId || null,
          });
        } catch (err: any) {
          set({ error: err?.message || 'Failed to fetch appointments', loading: false });
        }
      },

      refreshAppointments: async (clientId: string) => {
        set({ lastFetchedClientId: null });
        // Appeler fetchAppointments avec le clientId
        const { fetchAppointments } = _get();
        await fetchAppointments({ clientId });
      },

      createAppointment: async (data: any) => {
        set({ loading: true, error: null });
        try {
          // Normaliser les dates (accepte string ou Date)
          const normalizeDate = (d: any): Date => {
            if (!d) return new Date();
            if (d instanceof Date) return d;
            const parsed = new Date(d);
            return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
          };
          const startDate = normalizeDate(data.start);
          const endDate = normalizeDate(data.end);

          // Corrections côté client pour satisfaire les validations backend
          const now = new Date();
          const safeStart = startDate.getTime() <= now.getTime() ? new Date(now.getTime() + 60 * 1000) : startDate; // +1min si passé
          const safeEnd = endDate.getTime() <= safeStart.getTime() ? new Date(safeStart.getTime() + 30 * 60 * 1000) : endDate; // +30min min
          const payload = {
            title: data.title || 'Nouveau rendez-vous',
            startAt: safeStart.toISOString(),
            endAt: safeEnd.toISOString(),
            status: data.status || AppointmentStatus.Scheduled,
            customerName: data.customerName || `${data.firstName || ''} ${data.lastName || ''}`.trim(),
            clientEmail: data.clientEmail || data.customerEmail,
            clientPhone: data.clientPhone || data.phone,
            clientId: data.clientId,
            notes: data.notes,
            reason: data.reason,
            location: data.location,
          };
          const res = await api.post('/v1/appointments', payload);
          const created = (res as any).data || payload;
          set(state => ({
            appointments: [created as AppointmentItem, ...state.appointments],
            loading: false,
          }));
          return created as AppointmentItem;
        } catch (err: any) {
          set({ error: err?.message || 'Failed to create appointment', loading: false });
          throw err;
        }
      },

      updateAppointmentStatus: async (id: string, status: AppointmentStatus) => {
        set({ loading: true, error: null });
        try {
          const payload = {
            status: status,
          };
          const res = await api.patch(`/v1/appointments/${id}`, payload);
          const updated = (res as any).data;
          
          set(state => ({
            appointments: state.appointments.map(apt => 
              apt._id === id ? { ...apt, ...updated, status } : apt
            ),
            selectedAppointment: state.selectedAppointment?._id === id 
              ? { ...state.selectedAppointment, ...updated, status } 
              : state.selectedAppointment,
            loading: false
          }));
        } catch (err: any) {
          set({ error: err?.message || 'Failed to update appointment status', loading: false });
          throw err;
        }
      },

      rescheduleAppointment: async (id: string, start: string, end: string) => {
        set({ loading: true, error: null });
        try {
          const payload = {
            startAt: start,
            endAt: end,
            status: AppointmentStatus.Rescheduled,
          };
          const res = await api.patch(`/v1/appointments/${id}`, payload);
          const updated = (res as any).data;
          
          set(state => ({
            appointments: state.appointments.map(apt => 
              apt._id === id ? { ...apt, ...updated, startAt: start, endAt: end, status: AppointmentStatus.Rescheduled } : apt
            ),
            selectedAppointment: state.selectedAppointment?._id === id 
              ? { ...state.selectedAppointment, ...updated, startAt: start, endAt: end, status: AppointmentStatus.Rescheduled } 
              : state.selectedAppointment,
            loading: false
          }));
        } catch (err: any) {
          set({ error: err?.message || 'Failed to reschedule appointment', loading: false });
          throw err;
        }
      },

      deleteAppointment: async (id: string) => {
        set({ loading: true, error: null });
        try {
          await api.delete(`/v1/appointments/${id}`);
          
          set(state => ({
            appointments: state.appointments.filter(apt => apt._id !== id),
            selectedAppointment: state.selectedAppointment?._id === id 
              ? null 
              : state.selectedAppointment,
            loading: false
          }));
        } catch (err: any) {
          set({ error: err?.message || 'Failed to delete appointment', loading: false });
          throw err;
        }
      },
    }),
    {
      name: 'appointment-store',
    }
  )
);

export default useAppointmentStore;