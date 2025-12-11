import { Icon } from '@assets/icons';
import { Button } from '@components/ui';
import { AppointmentStatus, SimpleEvent } from '@src/types';
import React from 'react';
import { useTranslation } from 'react-i18next';

interface AppointmentActionsProps {
  appointment: SimpleEvent;
  loading?: boolean;
  onRequestStart?: () => void;
  onRequestMarkDone?: () => void;
  onRequestCancel?: () => void;
  onRequestReschedule?: () => void;
  size?: 'sm' | 'md';
  showStart?: boolean;
  showMarkDone?: boolean;
  showCancel?: boolean;
  showReschedule?: boolean;
}

const AppointmentActions: React.FC<AppointmentActionsProps> = ({
  appointment,
  loading = false,
  onRequestStart,
  onRequestMarkDone,
  onRequestCancel,
  onRequestReschedule,
  size = 'md',
  showStart = true,
  showMarkDone = true,
  showCancel = true,
  showReschedule = true,
}) => {
  const { t } = useTranslation();
  const statusStr = String(appointment.status).toLowerCase();
  const isScheduled = statusStr === AppointmentStatus.Scheduled;
  const isRescheduled = statusStr === AppointmentStatus.Rescheduled;
  const isInProgress = statusStr === AppointmentStatus.InProgress;
  const isDone = statusStr === AppointmentStatus.Done;
  const isCanceled = statusStr === AppointmentStatus.Canceled;
  const canReschedule = isScheduled || isRescheduled || isInProgress;
  const canStart = isScheduled || isRescheduled;


  const iconSize = size === 'sm' ? 'w-3 h-3' : 'w-4 h-4';

  return (
    <div className="flex flex-row flex-wrap items-center gap-2">
      {/* Bouton Démarrer/Terminer - Mobile: pleine largeur */}
      {((canStart && showStart) || (isInProgress && showMarkDone)) && (
        <Button
          onClick={() => {
            if (canStart && onRequestStart) return onRequestStart();
            if (isInProgress && onRequestMarkDone) return onRequestMarkDone();
          }}
          size={size}
          variant={canStart ? 'primary' : isInProgress ? 'success' as any : 'secondary'}
          disabled={loading || isDone || (!canStart && !isInProgress)}
          title={canStart ? 'Démarrer' : isInProgress ? 'Terminer' : 'Terminé'}
          leftIcon={<Icon name={canStart ? 'play' : isInProgress ? 'check-circle' : 'check'} className={iconSize} size="sm" />}
        >
          <span className="hidden lg:inline">{canStart ? t('common.start') : isInProgress ? t('common.finish') : t('common.finished')}</span>
        </Button>
      )}

      {/* Boutons secondaires - Mobile: en ligne, Desktop: flex-wrap */}
      <div className="flex flex-row flex-wrap items-center gap-1.5">
        {showCancel && (
          <Button
            onClick={() => onRequestCancel && onRequestCancel()}
            size={size}
            variant="danger"
            disabled={loading || isInProgress || isDone || isCanceled}
            title={t('common.cancel')}
            leftIcon={<Icon name="x" className={iconSize} size="sm" />}
          >
            <span className="hidden lg:inline">{t('common.cancel')}</span>
          </Button>
        )}

        {canReschedule && showReschedule && (
          <Button
            onClick={() => onRequestReschedule && onRequestReschedule()}
            size={size}
            variant="warning"
            disabled={loading}
            title={t('common.reschedule')}
            leftIcon={<Icon name="calendar" className={iconSize} size="sm" />}
          >
            <span className="hidden lg:inline">{t('common.reschedule')}</span>
          </Button>
        )}
      </div>
    </div>
  );
};

export default AppointmentActions;


