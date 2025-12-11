import { SimpleEvent } from '@src/types';

export interface StatisticsConfig {
  key: string;
  label: string;
  value: number;
  color: string;
  bgColor: string;
  borderColor: string;
}

export const createStatisticsConfig = (appointments: SimpleEvent[]): StatisticsConfig[] => {
  // Grouper les rendez-vous par statut pour les statistiques
  const appointmentsByStatus = appointments.reduce((acc, appointment) => {
    const status = String(appointment.status).toLowerCase();
    if (!acc[status]) {
      acc[status] = [];
    }
    acc[status].push(appointment);
    return acc;
  }, {} as Record<string, SimpleEvent[]>);

  return [
    {
      key: 'total',
      label: 'summary.total',
      value: appointments.length,
      color: 'text-[var(--color-primary)]',
      bgColor: 'bg-[var(--color-card)]',
      borderColor: 'border-[var(--color-border)]'
    },
    {
      key: 'completed',
      label: 'summary.completed',
      value: appointmentsByStatus['done']?.length || 0,
      color: 'text-[var(--color-success)]',
      bgColor: 'bg-[var(--color-card)]',
      borderColor: 'border-[var(--color-border)]'
    },
    {
      key: 'inProgress',
      label: 'summary.inProgress',
      value: appointmentsByStatus['in_progress']?.length || 0,
      color: 'text-[var(--color-primary)]',
      bgColor: 'bg-[var(--color-card)]',
      borderColor: 'border-[var(--color-border)]'
    },
    {
      key: 'upcoming',
      label: 'summary.upcoming',
      value: (appointmentsByStatus['created']?.length || 0) + 
             (appointmentsByStatus['scheduled']?.length || 0) + 
             (appointmentsByStatus['rescheduled']?.length || 0),
      color: 'text-[var(--color-warning)]',
      bgColor: 'bg-[var(--color-card)]',
      borderColor: 'border-[var(--color-border)]'
    },
    {
      key: 'canceled',
      label: 'summary.canceled',
      value: appointmentsByStatus['canceled']?.length || 0,
      color: 'text-[var(--color-danger)]',
      bgColor: 'bg-[var(--color-card)]',
      borderColor: 'border-[var(--color-border)]'
    }
  ];
};
