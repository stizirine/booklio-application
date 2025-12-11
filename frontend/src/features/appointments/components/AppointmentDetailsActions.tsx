import { Icon } from '@assets/icons';
import { Button } from '@components/ui';
import { useAppointmentStore } from '@src/stores/appointmentStore';
import { AppointmentStatus, SimpleEvent } from '@src/types';
import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import AppointmentActions from './AppointmentActions';
import type { AppointmentActionHandlers } from './types';

interface AppointmentDetailsActionsProps {
  appointment: SimpleEvent;
  onActionClick?: (action: 'start' | 'cancel' | 'markDone', status?: AppointmentStatus) => void;
  onUpdateStatus?: (id: string, status: AppointmentStatus) => void;
  onShare?: (appointment: SimpleEvent) => void;
  onRescheduleClick: () => void;
  actions?: AppointmentActionHandlers;
}

const AppointmentDetailsActions: React.FC<AppointmentDetailsActionsProps> = ({
  appointment,
  onActionClick,
  onUpdateStatus,
  onShare,
  onRescheduleClick,
  actions
}) => {
  const { t } = useTranslation();
  const updateAppointmentStatus = useAppointmentStore((s) => s.updateAppointmentStatus);

  const grouped = useMemo<AppointmentActionHandlers>(() => ({
    updateStatus: actions?.updateStatus ?? onUpdateStatus ?? ((id, status) => updateAppointmentStatus(id, status)),
    share: actions?.share ?? onShare,
  }), [actions, onUpdateStatus, onShare, updateAppointmentStatus]);

  // Si onActionClick est fourni, l'utiliser pour les actions nécessitant confirmation
  // Sinon, utiliser le comportement direct (pour compatibilité)
  const handleStart = () => {
    if (onActionClick) {
      onActionClick('start', AppointmentStatus.InProgress);
    } else if (grouped.updateStatus) {
      grouped.updateStatus(appointment.id, AppointmentStatus.InProgress);
    }
  };

  const handleMarkDone = () => {
    if (onActionClick) {
      onActionClick('markDone', AppointmentStatus.Done);
    } else if (grouped.updateStatus) {
      grouped.updateStatus(appointment.id, AppointmentStatus.Done);
    }
  };

  const handleCancel = () => {
    if (onActionClick) {
      onActionClick('cancel', AppointmentStatus.Canceled);
    } else if (grouped.updateStatus) {
      grouped.updateStatus(appointment.id, AppointmentStatus.Canceled);
    }
  };

  return (
    <div className="bg-[var(--color-surface)] px-6 py-4 sm:px-8 sm:py-6">
      <div className="flex flex-row flex-wrap gap-2 sm:gap-3 items-center">
        {/* Actions principales - Toujours horizontales */}
        <div className="flex flex-row flex-wrap gap-2 sm:flex-1">
          <AppointmentActions
            appointment={appointment}
            loading={false}
            size="sm"
            onRequestStart={handleStart}
            onRequestMarkDone={handleMarkDone}
            onRequestCancel={handleCancel}
            onRequestReschedule={onRescheduleClick}
          />
        </div>

        {/* Action partager - Icône seule en mobile */}
        <div className="flex flex-row gap-2 sm:gap-3">
          {grouped.share && (
            <Button onClick={() => grouped.share && grouped.share(appointment)} size="sm" variant="gradient" leftIcon={<Icon name="share" size="sm" />}>
              <span className="hidden sm:inline">{t('appointment.share')}</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default AppointmentDetailsActions;
