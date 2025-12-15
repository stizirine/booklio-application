import { AppointmentStatus } from '@src/types';
import { ClientAppointmentNotes } from '@src/types/clients';
import { useAppointmentStore } from '@stores/appointmentStore';
import { useClientStore } from '@stores/clientStore';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useSocialShare } from './useSocialShare';

export function useEventCreation(actions: any) {
  const { t } = useTranslation();
  const clientStore = useClientStore();
  const appointmentStore = useAppointmentStore();
  const socialShare = useSocialShare();

  const createEvent = useCallback(async (payload: {
    clientId?: string;
    title: string;
    start: string;
    end: string;
    firstName?: string;
    lastName?: string;
    address?: string;
    phone?: string;
    customerEmail?: string;
    notes?: ClientAppointmentNotes;
    reason?: string;
  }) => {
    try {
      actions.setLoading(true);
      actions.clearError();
      
      let clientId: string | null = payload.clientId || null;
      
      if (!clientId && (payload.firstName || payload.lastName || payload.customerEmail || payload.phone)) {
        try {
          const q = [payload.customerEmail, payload.phone].filter(Boolean).join(' ');
          if (q) {
            await clientStore.searchClients(q);
            const found = (clientStore.clients || []).find(c => c.email === payload.customerEmail || c.phone === payload.phone);
            if (found) {
              clientId = found.id;
            }
          }
          if (!clientId) {
            const created = await clientStore.createClient({
              firstName: payload.firstName || '',
              lastName: payload.lastName || '',
              email: payload.customerEmail || '',
              phone: payload.phone || '',
              address: payload.address || ''
            });
            clientId = created.id;
          }
        } catch (e) {
          clientId = `mock_client_${Date.now()}_${Math.random().toString(36).slice(2)}`;
        }
      }
      
      await appointmentStore.createAppointment({
        clientId: clientId || undefined,
        title: payload.title,
        // On laisse le store normaliser les dates (et gérer les cas invalides)
        start: payload.start,
        end: payload.end,
        status: AppointmentStatus.Scheduled,
        notes: payload.reason || payload.notes || '',
        firstName: payload.firstName,
        lastName: payload.lastName,
        customerEmail: payload.customerEmail,
        phone: payload.phone,
        address: payload.address,
      });
      
      await appointmentStore.fetchAppointments({ mode: 'day' });
      window.dispatchEvent(new CustomEvent('refreshAppointments'));
      actions.setIsCreateOpen(false);
    } catch (err: any) {
      actions.setError(t('event.createError', { defaultValue: 'Erreur lors de la création du rendez-vous' }));
    } finally {
      actions.setLoading(false);
    }
  }, [actions, t, clientStore, appointmentStore]);

  const shareEvent = useCallback((ev: any) => {
    const text = t('event.share.text', {
      title: ev.title,
      start: ev.start.toLocaleString(),
      end: ev.end.toLocaleString()
    });
    const title = t('event.share.subject', { title: ev.title });

    // Utiliser la configuration par défaut pour les rendez-vous
    socialShare.openShareModal(title, text, {
      enabledPlatforms: ['email', 'whatsapp', 'copy'] // Plateformes par défaut pour les RDV
    });
  }, [t, socialShare]);

  return useMemo(() => ({
    createEvent,
    shareEvent,
    shareModal: socialShare.shareState,
    closeShareModal: socialShare.closeShareModal,
  }), [createEvent, shareEvent, socialShare.shareState, socialShare.closeShareModal]);
}
