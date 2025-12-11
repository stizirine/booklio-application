// import { AppointmentStatus } from '../types/enums'; // Pas utilisé pour le moment

export interface AppointmentDetailItem {
  key: string;
  labelKey: string;
  value: string;
  icon: string;
  iconColor: string;
  bgColor: string;
  show: boolean;
  // Styles personnalisés pour les sections spéciales
  sectionBgColor?: string;
  labelColor?: string;
  valueColor?: string;
  useCustomSection?: boolean;
}

export const createAppointmentDetailsConfig = (
  appointment: any,
  _structuredNotes: any
): AppointmentDetailItem[] => {
  const formatDateTime = (date: Date) => {
    return date.toLocaleString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDuration = (start: Date, end: Date) => {
    const diffMs = end.getTime() - start.getTime();
    const diffMinutes = Math.round(diffMs / (1000 * 60));
    if (diffMinutes < 60) {
      return `${diffMinutes}min`;
    }
    const diffHours = Math.floor(diffMinutes / 60);
    const remainingMinutes = diffMinutes % 60;

    if (diffHours > 0) {
      return `${diffHours}h${remainingMinutes > 0 ? remainingMinutes.toString().padStart(2, '0') : ''}`;
    }
    return `${remainingMinutes}min`;
  };

  return [
    {
      key: 'dateTime',
      labelKey: 'appointment.dateTime',
      value: formatDateTime(appointment.start),
      icon: 'calendar',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      show: true
    },
    {
      key: 'duration',
      labelKey: 'appointment.duration',
      value: formatDuration(appointment.start, appointment.end),
      icon: 'clock',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      show: true
    },
    {
      key: 'email',
      labelKey: 'appointment.email',
      value: appointment.clientEmail || '',
      icon: 'mail',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      show: !!appointment.clientEmail
    },
    {
      key: 'phone',
      labelKey: 'appointment.phone',
      value: appointment.clientPhone || '',
      icon: 'phone',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-100',
      show: !!appointment.clientPhone
    },
    {
      key: 'location',
      labelKey: 'appointment.location',
      value: appointment.location || '',
      icon: 'location-marker',
      iconColor: 'text-green-600',
      bgColor: 'bg-green-100',
      show: !!appointment.location,
      sectionBgColor: 'bg-green-50',
      labelColor: 'text-green-900',
      valueColor: 'text-green-800',
      useCustomSection: true
    }
  ];
};

export const createNotesConfig = (structuredNotes: any) => {
  if (!structuredNotes) return [];

  return [
    {
      key: 'reason',
      labelKey: 'appointment.reason',
      value: structuredNotes.reason || '',
      icon: 'check-circle',
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-400',
      show: !!structuredNotes.reason
    },
    {
      key: 'comment',
      labelKey: 'appointment.comment',
      value: structuredNotes.comment || '',
      icon: 'edit',
      iconColor: 'text-gray-600',
      bgColor: 'bg-gray-50',
      borderColor: 'border-gray-400',
      show: !!structuredNotes.comment
    }
  ];
};
