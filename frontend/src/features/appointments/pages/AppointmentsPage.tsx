import { useDashboardState } from '@hooks/useDashboardState';
import { useEventCreation } from '@hooks/useEventCreation';
import { AppointmentStatus, SimpleEvent } from '@src/types';
import { useAppointmentStore } from '@stores/appointmentStore';
import { useClientStore } from '@stores/clientStore';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import AppointmentDetailsModal from '../components/AppointmentDetailsModal';
import AppointmentsHeader from '../components/AppointmentsHeader';
import AppointmentsSection from '../components/AppointmentsSection';
import CreateEventModal from '../components/CreateEventModal';
import SocialShareModal from '../components/SocialShareModal';
import { compareAppointments } from '../utils/appointments';

interface AppointmentsPageProps {
  onCreateAppointment?: () => void;
  onSelectAppointment?: (appointment: SimpleEvent) => void;
  onUpdateStatus?: (eventId: string, status: AppointmentStatus) => Promise<void>;
  onReschedule?: (event: SimpleEvent) => void;
  onShareEvent?: (event: SimpleEvent) => void;
}

const AppointmentsPage: React.FC<AppointmentsPageProps> = ({
  onCreateAppointment,
  onSelectAppointment,
  onUpdateStatus: _onUpdateStatus,
  onReschedule: _onReschedule,
  onShareEvent: _onShareEvent,
}) => {
  const { state, actions } = useDashboardState();
  const eventCreation = useEventCreation(actions);
  const appointments = useAppointmentStore((s) => s.appointments);
  const loading = useAppointmentStore((s) => s.loading);
  const fetchAppointments = useAppointmentStore((s) => s.fetchAppointments);
  const updateAppointmentStatus = useAppointmentStore((s) => s.updateAppointmentStatus);
  const rescheduleAppointment = useAppointmentStore((s) => s.rescheduleAppointment);
  const clientStore = useClientStore();
  const [showSearch, setShowSearch] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDateForCreate, setSelectedDateForCreate] = useState<Date | null>(null);

  // Charger les données au montage
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchAppointments({ mode: state.viewMode });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Recharger les rendez-vous quand le mode de vue change
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      fetchAppointments({ mode: state.viewMode });
    }
  }, [state.viewMode, fetchAppointments]);

  // Rafraîchir globalement les rendez-vous si modifications depuis une fiche client
  useEffect(() => {
    const listener = () => {
      fetchAppointments({ mode: state.viewMode });
    };
    window.addEventListener('refreshAppointments', listener);
    return () => window.removeEventListener('refreshAppointments', listener);
  }, [state.viewMode, fetchAppointments]);

  // Ouvrir CreateEventModal pré-rempli depuis la fiche client
  useEffect(() => {
    const handler = (e: any) => {
      const d = e.detail || {};
      actions.setIsCreateOpen(true);
      // Petite temporisation pour laisser la modale se monter puis remplir via un événement custom
      setTimeout(() => {
        const fillEvent = new CustomEvent('prefillCreateEvent', { detail: d });
        window.dispatchEvent(fillEvent);
      }, 0);
    };
    window.addEventListener('openCreateAppointmentForClient', handler);
    return () => window.removeEventListener('openCreateAppointmentForClient', handler);
  }, [actions]);

  // Charger la liste des clients quand la modale de création s'ouvre (ou au besoin)
  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (state.isCreateOpen && token && clientStore.clients.length === 0 && !clientStore.loading) {
      console.log('Chargement des clients pour la modale de création');
      clientStore.fetchClients();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.isCreateOpen]);

  // Convertir les événements du store en format SimpleEvent
  const simpleEvents = useMemo(() => {
    const events = appointments.map((e) => {
      // Valider et créer les dates de manière sécurisée
      const parseDate = (dateValue: string | undefined | null): Date => {
        if (!dateValue) return new Date();
        const parsed = new Date(dateValue);
        // Vérifier si la date est valide
        if (isNaN(parsed.getTime())) {
          console.warn('Date invalide détectée:', dateValue);
          return new Date();
        }
        return parsed;
      };

      const startDate = parseDate(e.startAt);
      const endDate = parseDate(e.endAt);

      return {
        id: e._id,
        title: e.title || 'Sans titre',
        start: startDate,
        end: endDate,
        status: e.status,
        customerName: e.customerName,
        clientEmail: e.clientEmail,
        clientPhone: e.clientPhone,
        clientId: e.clientId,
        notes: e.notes as any,
        reason: e.reason,
        location: e.location,
        invoiceSummary: e.invoiceSummary
      };
    });
    return events;
  }, [appointments]);

  // Tri unifié par statut puis par date (utilitaire commun)
  const sortedEvents = useMemo(() => {
    return [...simpleEvents].sort((a, b) => {
      // Fonction helper pour obtenir une date ISO string de manière sécurisée
      const getSafeISOString = (date: Date | undefined): string => {
        if (!date) return new Date().toISOString();
        if (isNaN(date.getTime())) {
          console.warn('Tentative de tri avec une date invalide');
          return new Date().toISOString();
        }
        return date.toISOString();
      };

      return compareAppointments(
        { startAt: getSafeISOString(a.start), status: a.status },
        { startAt: getSafeISOString(b.start), status: b.status }
      );
    });
  }, [simpleEvents]);

  // Fonction pour gérer le changement de date dans le calendrier mensuel
  const handleDateChange = useCallback((date: Date) => {
    setCurrentDate(date);
    fetchAppointments({ mode: 'month', date });
  }, [fetchAppointments]);

  // Fonctions de gestion des rendez-vous
  const handleUpdateAppointmentStatus = useCallback(async (id: string, status: AppointmentStatus) => {
    try {
      actions.setLoading(true);
      await updateAppointmentStatus(id, status);
    } catch (err: any) {
      console.error('Erreur mise à jour statut:', err?.response?.data || err);
      actions.setError('Erreur lors de la mise à jour du statut');
    } finally {
      actions.setLoading(false);
    }
  }, [updateAppointmentStatus, actions]);

  const handleRescheduleAppointment = useCallback(async (appointment: any) => {
    try {
      actions.setLoading(true);
      await rescheduleAppointment(appointment.id, appointment.start.toISOString(), appointment.end.toISOString());
      
      // Rafraîchir les données après reprogrammation
      await fetchAppointments({ mode: state.viewMode });
      
      // Mettre à jour l'appointment sélectionné dans la modal
      actions.setSelectedAppointment(appointment);
    } catch (err: any) {
      console.error('Erreur lors du report:', err);
      actions.setError('Erreur lors du report du rendez-vous');
    } finally {
      actions.setLoading(false);
    }
  }, [rescheduleAppointment, fetchAppointments, state.viewMode, actions]);

  const handleViewAppointmentDetails = (appointment: any) => {
    // Ouvrir la modal de détails
    actions.setSelectedAppointment(appointment);
    actions.setAppointmentDetailsOpen(true);
  };


  const handleCreateClick = () => {
    if (onCreateAppointment) {
      onCreateAppointment();
    } else {
      actions.setIsCreateOpen(true);
    }
  };

  const handleDateClick = useCallback((date: Date) => {
    setSelectedDateForCreate(date);
    setCurrentDate(date);
    actions.setIsCreateOpen(true);
  }, [actions]);

  const _handleEventClick = (event: SimpleEvent) => {
    if (onSelectAppointment) {
      onSelectAppointment(event);
    } else {
      actions.setSelectedAppointment(event);
      actions.setAppointmentDetailsOpen(true);
    }
  };

  return (
    <>
      <div className="space-y-6">
        <AppointmentsHeader
          viewMode={state.viewMode}
          loading={loading}
          appointmentsCount={simpleEvents.length}
          onViewModeChange={actions.setViewMode}
          onCreateClick={handleCreateClick}
          onSearchToggle={() => setShowSearch(!showSearch)}
          showSearch={showSearch}
        />

        <AppointmentsSection
          viewMode={state.viewMode}
          events={sortedEvents}
          loading={loading}
          onCreateClick={handleCreateClick}
          onViewModeChange={actions.setViewMode}
          onShareEvent={eventCreation.shareEvent}
          onUpdateStatus={handleUpdateAppointmentStatus}
          onReschedule={handleRescheduleAppointment}
          onViewDetails={handleViewAppointmentDetails}
          onDateChange={handleDateChange}
          onDateClick={handleDateClick}
          showSearch={showSearch && state.viewMode !== 'month'}
          currentDate={currentDate}
        />
      </div>

      {/* Modal de création d'événement */}
      {state.isCreateOpen && (
        <CreateEventModal 
          open={state.isCreateOpen} 
          onClose={() => {
            actions.setIsCreateOpen(false);
            setSelectedDateForCreate(null);
          }} 
          onCreate={eventCreation.createEvent}
          clients={clientStore.clients}
          initialDate={selectedDateForCreate || currentDate}
        />
      )}

      {/* Modal de détails du rendez-vous */}
      {state.isAppointmentDetailsOpen && state.selectedAppointment && (
        <AppointmentDetailsModal
          isOpen={state.isAppointmentDetailsOpen}
          onClose={() => {
            actions.setAppointmentDetailsOpen(false);
            actions.setSelectedAppointment(null);
          }}
          appointment={state.selectedAppointment}
          onUpdateStatus={handleUpdateAppointmentStatus}
          onReschedule={handleRescheduleAppointment}
          onShare={eventCreation.shareEvent}
        />
      )}

      {/* Modal de partage social */}
      <SocialShareModal
        isOpen={eventCreation.shareModal.isOpen}
        onClose={eventCreation.closeShareModal}
        title={eventCreation.shareModal.title}
        text={eventCreation.shareModal.text}
        url={eventCreation.shareModal.url}
        enabledPlatforms={eventCreation.shareModal.enabledPlatforms}
        customConfig={eventCreation.shareModal.customConfig}
      />
    </>
  );
};

export default AppointmentsPage;
