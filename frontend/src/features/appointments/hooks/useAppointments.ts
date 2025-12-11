import { useAppointmentStore } from '@stores/appointmentStore';
import { useClientStore } from '@stores/clientStore';
import { useCallback, useRef } from 'react';
import { AppointmentStatus, CalendarViewModeEnum } from '../../../types/enums';

// Fonction utilitaire pour calculer les dates selon le mode de vue
const getDateRange = (mode: string, specificDate?: Date) => {
  const now = specificDate || new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (mode) {
    case CalendarViewModeEnum.Day: {
      const startOfDay = new Date(today);
      const endOfDay = new Date(today);
      endOfDay.setHours(23, 59, 59, 999);
      return { from: startOfDay.toISOString(), to: endOfDay.toISOString() };
    }
    case CalendarViewModeEnum.Week: {
      const startOfWeek = new Date(today);
      const dayOfWeek = startOfWeek.getDay();
      const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
      startOfWeek.setDate(startOfWeek.getDate() + diff);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(endOfWeek.getDate() + 6);
      endOfWeek.setHours(23, 59, 59, 999);
      return { from: startOfWeek.toISOString(), to: endOfWeek.toISOString() };
    }
    case CalendarViewModeEnum.Month: {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      return { from: startOfMonth.toISOString(), to: endOfMonth.toISOString() };
    }
    default:
      return { from: today.toISOString(), to: today.toISOString() };
  }
};

export function useAppointments(actions: any) {
  const normalizeToEnumStatus = useCallback((status?: string): AppointmentStatus => {
    const s = String(status || '').toLowerCase();
    if (s === 'inprogress' || s === 'in_progress') return AppointmentStatus.InProgress;
    if (s === 'canceled' || s === 'cancelled') return AppointmentStatus.Canceled;
    if (s === 'rescheduled') return AppointmentStatus.Rescheduled;
    if (s === 'created') return AppointmentStatus.Created;
    if (s === 'done') return AppointmentStatus.Done;
    return AppointmentStatus.Scheduled;
  }, []);

  const appointmentsLoadingRef = useRef(false);
  const clientsLoadingRef = useRef(false);
  const searchLoadingRef = useRef(false);
  const clientStore = useClientStore();
  const appointmentStore = useAppointmentStore();

  const loadAppointments = useCallback(async (_from?: string, _to?: string) => {
    try {
      if (appointmentsLoadingRef.current) return;
      appointmentsLoadingRef.current = true;
      actions.setLoading(true);

      await appointmentStore.fetchAppointments({ mode: 'week' });

      // Compat: aussi pousser dans le state legacy si nécessaire
      const events = appointmentStore.appointments.map((e) => ({
        id: e._id,
        summary: e.title,
        status: normalizeToEnumStatus(e.status),
        start: { dateTime: e.startAt },
        end: { dateTime: e.endAt },
        description: e.notes,
        clientId: e.clientId,
        customerName: e.customerName,
        clientEmail: e.clientEmail,
        clientPhone: e.clientPhone,
        notes: e.notes,
        reason: e.reason,
        location: e.location,
      }));
      actions.setEvents(events);
    } catch (err: any) {
      actions.setError('Erreur lors du chargement des rendez-vous');
    } finally {
      actions.setLoading(false);
      appointmentsLoadingRef.current = false;
    }
  }, [actions, appointmentStore, normalizeToEnumStatus]);

  // Nouvelle fonction pour charger les rendez-vous selon le mode de vue
  const loadAppointmentsByMode = useCallback(async (mode: string, specificDate?: Date) => {
    const { from, to } = getDateRange(mode, specificDate);
    return loadAppointments(from, to);
  }, [loadAppointments]);

  const loadClients = useCallback(async () => {
    try {
      if (clientsLoadingRef.current) return;
      clientsLoadingRef.current = true;
      actions.setLoading(true);
      await clientStore.fetchClients();
    } catch (err: any) {
      actions.setError('Erreur lors du chargement des clients');
    } finally {
      actions.setLoading(false);
      clientsLoadingRef.current = false;
    }
  }, [actions, clientStore]);

  return {
    loadAppointments,
    loadClients,
    searchClients: useCallback(async (query: string) => {
      try {
        if (searchLoadingRef.current) return;
        searchLoadingRef.current = true;
        actions.setLoading(true);
        await clientStore.searchClients(query);
      } catch (err) {
        actions.setError('Erreur lors de la recherche de clients');
      } finally {
        actions.setLoading(false);
        searchLoadingRef.current = false;
      }
    }, [actions, clientStore]),
    createClient: useCallback(async (payload: { firstName?: string; lastName?: string; email?: string; phone?: string; address?: string }) => {
      try {
        actions.setLoading(true);
        await clientStore.createClient(payload);
      } catch (err) {
        actions.setError('Erreur lors de la création du client');
        throw err;
      } finally {
        actions.setLoading(false);
      }
    }, [actions, clientStore]),
    loadAppointmentsByMode,
  };
}
