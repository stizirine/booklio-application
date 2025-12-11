import ConfirmationModal from '@components/ConfirmationModal';
import { useAppointmentStore } from '@src/stores/appointmentStore';
import { AppointmentStatus, SimpleEvent } from '@src/types';
import React, { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppointmentCardView from './AppointmentCardView';
import RescheduleModal from './RescheduleModal';
import type { AppointmentActionHandlers } from './types';

interface AppointmentCardProps {
  appointment: SimpleEvent;
  /**
   * Actions optionnelles pour override le store
   * Si non fournies, le store est utilisé automatiquement
   */
  actions?: AppointmentActionHandlers;
}

const AppointmentCard: React.FC<AppointmentCardProps> = ({
  appointment,
  actions
}) => {
  // Sélecteurs optimisés du store (uniquement les fonctions nécessaires)
  const storeUpdateStatus = useAppointmentStore((s) => s.updateAppointmentStatus);
  const storeReschedule = useAppointmentStore((s) => s.rescheduleAppointment);
  
  /**
   * Actions finales : utilise le store par défaut, avec override possible via props
   * Le store est la source de vérité principale
   */
  const groupedActions: AppointmentActionHandlers = useMemo(() => ({
    updateStatus: actions?.updateStatus ?? ((id, status) => storeUpdateStatus(id, status)),
    reschedule: actions?.reschedule ?? ((a) =>
      storeReschedule(
        a.id as any,
        (a as any).start?.toISOString?.() || (a as any).startAt,
        (a as any).end?.toISOString?.() || (a as any).endAt
      )
    ),
    viewDetails: actions?.viewDetails,
    share: actions?.share,
  }), [actions, storeUpdateStatus, storeReschedule]);
  const { t } = useTranslation();
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'start' | 'cancel' | 'markDone';
    status?: AppointmentStatus;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  const handleActionClick = useCallback((action: 'start' | 'cancel' | 'markDone', status?: AppointmentStatus) => {
    setPendingAction({ type: action, status });
    setShowConfirmation(true);
  }, []);

  const handleConfirmAction = async () => {
    if (!pendingAction || !groupedActions.updateStatus) return;
    
    setLoading(true);
    try {
      await groupedActions.updateStatus(appointment.id, pendingAction.status!);
      setShowConfirmation(false);
      setPendingAction(null);
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRescheduleClick = useCallback(() => {
    setShowReschedule(true);
  }, []);

  const handleRescheduleConfirm = async (newDate: string, newTime: string, reason?: string) => {
    if (!groupedActions.reschedule) return;
    
    setLoading(true);
    try {
      // Calculer les nouvelles dates
      const newStartDate = new Date(`${newDate}T${newTime}`);
      // endAt = startAt + 30 minutes
      const newEndDate = new Date(newStartDate.getTime() + 30 * 60 * 1000);
      
      // Créer un nouvel objet appointment avec les nouvelles dates
      const newAppointment = {
        ...appointment,
        start: newStartDate,
        end: newEndDate,
        notes: reason ? {
          ...appointment.notes,
          reason: reason,
          comment: appointment.notes?.comment ? `${appointment.notes.comment}\nRaison du report: ${reason}`.trim() : `Raison du report: ${reason}`
        } : appointment.notes
      };
      
      await groupedActions.reschedule(newAppointment);
      setShowReschedule(false);
    } catch (error) {
      console.error('Erreur lors du report:', error);
    } finally {
      setLoading(false);
    }
  };

  const getConfirmationTitle = () => {
    if (!pendingAction) return '';
    switch (pendingAction.type) {
      case 'start': return t('appointment.startConfirmation');
      case 'cancel': return t('appointment.confirmCancel');
      case 'markDone': return t('appointment.confirmMarkDone');
      default: return t('common.confirm');
    }
  };

  const getConfirmationMessage = () => {
    if (!pendingAction) return '';
    switch (pendingAction.type) {
      case 'start': return t('appointment.startAppointmentConfirmation');
      case 'cancel': return t('appointment.cancelConfirmation');
      case 'markDone': return t('appointment.markDoneConfirmation');
      default: return '';
    }
  };

  const getConfirmationType = () => {
    if (!pendingAction) return 'info';
    switch (pendingAction.type) {
      case 'start': return 'info';
      case 'cancel': return 'danger';
      case 'markDone': return 'success';
      default: return 'info';
    }
  };

  const handleCardClick = useCallback(() => {
    if (groupedActions.viewDetails) groupedActions.viewDetails(appointment);
  }, [groupedActions, appointment]);

  const handleCardKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if ((e.key === 'Enter' || e.key === ' ') && groupedActions.viewDetails) {
      e.preventDefault();
      groupedActions.viewDetails(appointment);
    }
  }, [groupedActions, appointment]);

  const handleToggleExpanded = useCallback(() => {
    setIsExpanded(prev => !prev);
  }, []);

  const handleCloseConfirmation = useCallback(() => {
    setShowConfirmation(false);
    setPendingAction(null);
  }, []);

  const handleCloseReschedule = useCallback(() => {
    setShowReschedule(false);
  }, []);

  return (
    <>
      <AppointmentCardView
        appointment={appointment}
        isExpanded={isExpanded}
        loading={loading}
        onToggleExpanded={handleToggleExpanded}
        onCardClick={handleCardClick}
        onCardKeyDown={handleCardKeyDown}
        onActionClick={handleActionClick}
        onRescheduleClick={handleRescheduleClick}
        actions={groupedActions}
      />
      {/* Modales */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmAction}
        title={getConfirmationTitle()}
        message={getConfirmationMessage()}
        type={getConfirmationType()}
        loading={loading}
      />

      <RescheduleModal
        isOpen={showReschedule}
        onClose={handleCloseReschedule}
        onConfirm={handleRescheduleConfirm}
        appointment={appointment}
        loading={loading}
      />
    </>
  );
};

export default React.memo(AppointmentCard);