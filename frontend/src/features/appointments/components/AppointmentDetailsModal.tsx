import ConfirmationModal from '@components/ConfirmationModal';
import { createAppointmentDetailsConfig, createNotesConfig } from '@src/features/appointments/utils/appointmentDetailsConfig';
import { AppointmentStatus, ClientAppointmentNotes, SimpleEvent } from '@src/types';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AppointmentDetailsActions from './AppointmentDetailsActions';
import AppointmentDetailsContent from './AppointmentDetailsContent';
import AppointmentDetailsHeader from './AppointmentDetailsHeader';
import RescheduleModal from './RescheduleModal';

interface AppointmentDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  appointment: SimpleEvent | null;
  onUpdateStatus?: (id: string, status: AppointmentStatus) => void;
  onReschedule?: (appointment: SimpleEvent) => void;
  onShare?: (appointment: SimpleEvent) => void;
}

const AppointmentDetailsModal: React.FC<AppointmentDetailsModalProps> = ({
  isOpen,
  onClose,
  appointment,
  onUpdateStatus,
  onReschedule,
  onShare
}) => {
  const { t } = useTranslation();
  const [showReschedule, setShowReschedule] = useState(false);
  const [currentAppointment, setCurrentAppointment] = useState<SimpleEvent | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [pendingAction, setPendingAction] = useState<{
    type: 'start' | 'cancel' | 'markDone';
    status?: AppointmentStatus;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  // Synchroniser l'appointment local avec les changements
  useEffect(() => {
    if (appointment) {
      setCurrentAppointment(appointment);
    }
  }, [appointment]);

  const dialogRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => { if (isOpen) dialogRef.current?.focus(); }, [isOpen]);

  // Handler pour gérer les clics sur les actions (ouvre la confirmation)
  const handleActionClick = useCallback((action: 'start' | 'cancel' | 'markDone', status?: AppointmentStatus) => {
    setPendingAction({ type: action, status });
    setShowConfirmation(true);
  }, []);

  // Handler pour fermer la confirmation
  const handleCloseConfirmation = useCallback(() => {
    setShowConfirmation(false);
    setPendingAction(null);
  }, []);

  // Handler pour confirmer l'action après confirmation
  const handleConfirmAction = useCallback(async () => {
    if (!pendingAction || !currentAppointment || !onUpdateStatus) return;
    
    setLoading(true);
    try {
      // Mettre à jour l'état local immédiatement
      setCurrentAppointment(prev => prev ? { ...prev, status: pendingAction.status! } : null);
      // Appeler le handler parent
      await onUpdateStatus(currentAppointment.id, pendingAction.status!);
      setShowConfirmation(false);
      setPendingAction(null);
    } catch (error) {
      console.error('Erreur lors de l\'action:', error);
    } finally {
      setLoading(false);
    }
  }, [pendingAction, currentAppointment, onUpdateStatus]);

  if (!isOpen || !appointment || !currentAppointment) return null;

  // Type guard pour vérifier si notes est un objet ClientAppointmentNotes
  const isStructuredNotes = (notes: any): notes is ClientAppointmentNotes => {
    return notes && typeof notes === 'object' && ('reason' in notes || 'comment' in notes);
  };

  // Cast notes pour TypeScript après vérification
  const structuredNotes = currentAppointment.notes && isStructuredNotes(currentAppointment.notes) 
    ? currentAppointment.notes as ClientAppointmentNotes 
    : null;

  // Configuration des détails
  const detailsConfig = createAppointmentDetailsConfig(currentAppointment, structuredNotes);
  const notesConfig = createNotesConfig(structuredNotes);

  // Fonctions pour obtenir les textes de confirmation
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

  // Gestion de la reprogrammation
  const handleRescheduleClick = () => {
    setShowReschedule(true);
  };

  const handleRescheduleConfirm = async (newDate: string, newTime: string, reason?: string) => {
    if (onReschedule && currentAppointment) {
      // Calculer les nouvelles dates
      const newStartDate = new Date(`${newDate}T${newTime}`);
      // endAt = startAt + 30 minutes
      const newEndDate = new Date(newStartDate.getTime() + 30 * 60 * 1000);
      
      // Créer un nouvel objet appointment avec les nouvelles dates
      const updatedAppointment = {
        ...currentAppointment,
        start: newStartDate,
        end: newEndDate,
        notes: reason ? {
          ...currentAppointment.notes,
          reason: reason,
          comment: currentAppointment.notes?.comment || ''
        } : currentAppointment.notes
      };
      
      // Mettre à jour l'état local immédiatement
      setCurrentAppointment(updatedAppointment);
      
      // Appeler le handler parent
      await onReschedule(updatedAppointment);
    }
    setShowReschedule(false);
  };

  

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" role="dialog" aria-modal="true" aria-labelledby="appointment-details-title" onKeyDown={(e) => { if (e.key === 'Escape') onClose(); }}>
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0" ref={dialogRef} tabIndex={-1}>
        {/* Overlay */}
        <div 
          className="fixed inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />
        {/* Modal */}
        <div className="bg-[var(--color-card)] border border-[var(--color-border)] rounded-t-[var(--radius-md)] sm:rounded-[var(--radius-md)] text-left overflow-hidden shadow-card transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full w-full max-h-[calc(100vh-5rem)] sm:max-h-[90vh] flex flex-col">
          {/* Header fixe */}
          <div className="flex-shrink-0">
            <AppointmentDetailsHeader
              appointment={currentAppointment}
              onClose={onClose}
            />
          </div>

          {/* Contenu scrollable */}
          <div className="flex-1 overflow-y-auto bg-[var(--color-bg)]">
            <AppointmentDetailsContent
              appointment={currentAppointment}
              detailsConfig={detailsConfig}
              notesConfig={notesConfig}
              structuredNotes={structuredNotes}
            />
          </div>

          {/* Actions fixes */}
          <div className="flex-shrink-0 border-t border-[var(--color-border)] bg-[var(--color-card)]">
            <AppointmentDetailsActions
              appointment={currentAppointment}
              onActionClick={handleActionClick}
              onShare={onShare}
              onRescheduleClick={handleRescheduleClick}
            />
          </div>
        </div>
      </div>

      {/* Modal de confirmation */}
      <ConfirmationModal
        isOpen={showConfirmation}
        onClose={handleCloseConfirmation}
        onConfirm={handleConfirmAction}
        title={getConfirmationTitle()}
        message={getConfirmationMessage()}
        type={getConfirmationType()}
        loading={loading}
        autoClose={false}
      />

      {/* Modal de reprogrammation */}
      <RescheduleModal
        isOpen={showReschedule}
        onClose={() => setShowReschedule(false)}
        onConfirm={handleRescheduleConfirm}
        appointment={currentAppointment}
        loading={false}
      />
    </div>
  );
};

export default AppointmentDetailsModal;
