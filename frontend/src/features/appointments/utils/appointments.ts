import { AppointmentStatus } from '../../../types/enums';

export const toTimestamp = (iso?: string) => (iso ? new Date(iso).getTime() : 0);

const STATUS_ORDER: string[] = ['in_progress', 'scheduled', 'rescheduled', 'created', 'done', 'canceled'];

const normalizeStatus = (s?: string) => String(s || '').toLowerCase();

export const compareAppointments = <T extends { startAt: string; status?: string }>(a: T, b: T) => {
  const sa = normalizeStatus(a.status);
  const sb = normalizeStatus(b.status);
  const ia = STATUS_ORDER.indexOf(sa);
  const ib = STATUS_ORDER.indexOf(sb);
  if (ia !== ib) return ia - ib;
  // Même statut → trier par date croissante
  return toTimestamp(a.startAt) - toTimestamp(b.startAt);
};

export function splitAppointmentsByTime<T extends { startAt: string; status?: string }>(appointments: T[] = []) {
  const now = Date.now();

  const isPast = (a: T) => {
    const status = String(a.status || '').toLowerCase();
    // Cas particulier: un RDV terminé ou annulé est considéré "passé"
    if (status === AppointmentStatus.Done || status === AppointmentStatus.Canceled) return true;
    return toTimestamp(a.startAt) < now;
  };

  const upcoming: T[] = [];
  const past: T[] = [];

  for (const appt of appointments) {
    (isPast(appt) ? past : upcoming).push(appt);
  }

  // Appliquer l'ordre de tri: statut puis date
  upcoming.sort(compareAppointments);
  past.sort(compareAppointments);

  return { upcoming, past };
}

export const formatDateRange = (start: string, end: string) => (
  `${new Date(start).toLocaleString()} → ${new Date(end).toLocaleString()}`
);

export const getStatusBadgeClass = (status: string) => {
  switch (status) {
    case AppointmentStatus.Canceled: return 'bg-red-100 text-red-700';
    case AppointmentStatus.Done: return 'bg-green-100 text-green-700';
    case AppointmentStatus.InProgress: return 'bg-blue-100 text-blue-700';
    case AppointmentStatus.Scheduled: return 'bg-yellow-100 text-yellow-700';
    default: return 'bg-gray-100 text-gray-700';
  }
};


