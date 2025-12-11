import type { AppointmentStatus, SimpleEvent } from '@src/types';

// Centralise les handlers d’actions RDV pour éviter les définitions dupliquées
export type AppointmentActionHandlers = {
  updateStatus?: (id: string, status: AppointmentStatus) => void;
  reschedule?: (appointment: SimpleEvent) => void;
  viewDetails?: (appointment: SimpleEvent) => void;
  share?: (appointment: SimpleEvent) => void;
};


