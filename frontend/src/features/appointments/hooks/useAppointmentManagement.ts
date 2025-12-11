import { useDebouncedCallback } from '@hooks/useDebounce';
import { AppointmentStatus } from '@src/types';
import { useAppointmentStore } from '@stores/appointmentStore';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type AppointmentItem = {
  _id: string;
  title?: string;
  startAt: string;
  endAt: string;
  status?: AppointmentStatus;
};

export type EditAppointmentState = {
  editingId: string | null;
  title: string;
  start: string;
  end: string;
};

export const useAppointmentManagement = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [lastFetchedClientId, setLastFetchedClientId] = useState<string | null>(null);
  const [edit, setEdit] = useState<EditAppointmentState>({
    editingId: null,
    title: '',
    start: '',
    end: ''
  });
  const appointmentStore = useAppointmentStore();

  // Récupérer les rendez-vous d'un client (version non debouncée pour usage interne)
  const fetchClientAppointmentsInternal = useCallback(async (clientId: string) => {
    if (lastFetchedClientId === clientId && appointments.length > 0) {
      return;
    }

    try {
      setLoading(true);
      await appointmentStore.fetchAppointments({ clientId });
      const items: AppointmentItem[] = appointmentStore.appointments.map((e) => ({
        _id: e._id,
        title: e.title,
        startAt: e.startAt,
        endAt: e.endAt,
        status: e.status,
      }));
      setAppointments(items);
      setLastFetchedClientId(clientId);
    } catch (error) {
      // erreurs déjà gérées côté store
    } finally {
      setLoading(false);
    }
  }, [lastFetchedClientId, appointments.length, appointmentStore]);

  // Version debouncée pour éviter les appels trop fréquents
  const fetchClientAppointments = useDebouncedCallback(fetchClientAppointmentsInternal, 300);

  // Fonction pour forcer le rafraîchissement (sans cache)
  const refreshClientAppointments = useCallback(async (clientId: string) => {
    setLastFetchedClientId(null);
    await fetchClientAppointmentsInternal(clientId);
  }, [fetchClientAppointmentsInternal]);

  // Mettre à jour un rendez-vous (utilise reschedule si dates, sinon updateStatus)
  const updateAppointment = useCallback(async (appointmentId: string, updates: Partial<AppointmentItem>) => {
    try {
      setLoading(true);
      if (updates.startAt || updates.endAt || updates.title) {
        const _payload = {
          id: appointmentId,
          start: new Date(updates.startAt || ''),
          end: new Date(updates.endAt || ''),
          title: updates.title,
        } as any;
        await appointmentStore.rescheduleAppointment(appointmentId, updates.startAt || '', updates.endAt || '');
      } else if (updates.status) {
        await appointmentStore.updateAppointmentStatus(appointmentId, updates.status);
      }
      // Mettre à jour la liste locale depuis le store
      const items: AppointmentItem[] = appointmentStore.appointments.map((e) => ({
        _id: e._id,
        title: e.title,
        startAt: e.startAt,
        endAt: e.endAt,
        status: e.status,
      }));
      setAppointments(items);
      window.dispatchEvent(new CustomEvent('refreshAppointments'));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [appointmentStore]);

  // Supprimer un rendez-vous
  const deleteAppointment = useCallback(async (appointmentId: string) => {
    try {
      setLoading(true);
      await appointmentStore.deleteAppointment(appointmentId);
      setAppointments((prev) => prev.filter((x) => x._id !== appointmentId));
      window.dispatchEvent(new CustomEvent('refreshAppointments'));
    } catch (error) {
      throw error;
    } finally {
      setLoading(false);
    }
  }, [appointmentStore]);

  // Valider et sauvegarder un rendez-vous en cours d'édition
  const saveEditedAppointment = useCallback(async (_appointment: AppointmentItem) => {
    if (!edit.editingId) return;

    const startDate = new Date(edit.start);
    const endDate = new Date(edit.end);
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      throw new Error(t('errors.invalidDateFormat'));
    }
    if (startDate >= endDate) {
      throw new Error(t('errors.endDateAfterStartDate'));
    }

    const payload = { 
      title: edit.title, 
      startAt: startDate.toISOString(), 
      endAt: endDate.toISOString() 
    };

    await updateAppointment(edit.editingId, payload);
    setEdit({ editingId: null, title: '', start: '', end: '' });
  }, [edit, updateAppointment, t]);

  // Annuler l'édition
  const cancelEdit = useCallback(() => {
    setEdit({ editingId: null, title: '', start: '', end: '' });
  }, []);

  // Démarrer l'édition d'un rendez-vous
  const startEdit = useCallback((appointment: AppointmentItem) => {
    setEdit({
      editingId: appointment._id,
      title: appointment.title || '',
      start: toLocalDateTimeInput(appointment.startAt),
      end: toLocalDateTimeInput(appointment.endAt)
    });
  }, []);

  // Mettre à jour les champs d'édition
  const updateEditField = useCallback((field: keyof EditAppointmentState, value: string) => {
    setEdit(prev => {
      const newEdit = { ...prev, [field]: value };
      if (field === 'start' && value) {
        const startDate = new Date(value);
        const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);
        newEdit.end = toLocalDateTimeInput(endDate.toISOString());
      }
      return newEdit;
    });
  }, []);

  return useMemo(() => ({
    loading,
    appointments,
    edit,
    fetchClientAppointments,
    refreshClientAppointments,
    updateAppointment,
    deleteAppointment,
    saveEditedAppointment,
    cancelEdit,
    startEdit,
    updateEditField,
    setAppointments
  }), [
    loading,
    appointments,
    edit,
    fetchClientAppointments,
    refreshClientAppointments,
    updateAppointment,
    deleteAppointment,
    saveEditedAppointment,
    cancelEdit,
    startEdit,
    updateEditField
  ]);
};

// Fonction utilitaire pour convertir une date ISO en format datetime-local
const toLocalDateTimeInput = (iso: string) => {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
};
