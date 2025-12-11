import { AppointmentStatus } from '../../../types/enums';

// Statut par défaut pour les rendez-vous
export const DEFAULT_APPOINTMENT_STATUS = AppointmentStatus.Scheduled;

// Fonction utilitaire pour normaliser un statut (retourne le statut par défaut si undefined)
export const normalizeStatus = (status: AppointmentStatus | undefined): AppointmentStatus => {
  return status || DEFAULT_APPOINTMENT_STATUS;
};

// Fonction utilitaire pour obtenir les classes CSS basées sur le statut
export const getStatusClasses = (status: AppointmentStatus) => {
  switch (status) {
    case AppointmentStatus.Canceled:
      return {
        dot: 'bg-red-500',
        badge: 'bg-red-100 text-red-700',
        badgeDot: 'bg-red-500',
        icon: 'bg-red-100 text-red-600',
        border: 'border-red-200',
        background: 'bg-red-50'
      };
    case AppointmentStatus.Done:
      return {
        dot: 'bg-green-500',
        badge: 'bg-green-100 text-green-700',
        badgeDot: 'bg-green-500',
        icon: 'bg-green-100 text-green-600',
        border: 'border-green-200',
        background: 'bg-green-50'
      };
    case AppointmentStatus.InProgress:
      return {
        dot: 'bg-blue-500',
        badge: 'bg-blue-100 text-blue-700',
        badgeDot: 'bg-blue-500',
        icon: 'bg-blue-100 text-blue-600',
        border: 'border-blue-200',
        background: 'bg-blue-50'
      };
    case AppointmentStatus.Scheduled:
    case AppointmentStatus.Created:
    case AppointmentStatus.Rescheduled:
    default:
      return {
        dot: 'bg-yellow-500',
        badge: 'bg-yellow-100 text-yellow-700',
        badgeDot: 'bg-yellow-500',
        icon: 'bg-yellow-100 text-yellow-600',
        border: 'border-yellow-200',
        background: 'bg-yellow-50'
      };
  }
};

// Fonction utilitaire pour vérifier si un statut est "terminé" (Done ou Canceled)
export const isCompletedStatus = (status: AppointmentStatus): boolean => {
  return status === AppointmentStatus.Done || status === AppointmentStatus.Canceled;
};

// Fonction utilitaire pour vérifier si un statut est "en cours"
export const isInProgressStatus = (status: AppointmentStatus): boolean => {
  return status === AppointmentStatus.InProgress;
};

// Fonction utilitaire pour vérifier si un statut est "planifié" (Scheduled, Created, Rescheduled)
export const isScheduledStatus = (status: AppointmentStatus): boolean => {
  return status === AppointmentStatus.Scheduled || 
         status === AppointmentStatus.Created || 
         status === AppointmentStatus.Rescheduled;
};
