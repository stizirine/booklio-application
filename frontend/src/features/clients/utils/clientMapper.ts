import { AppointmentStatus } from '@src/types';

// Fonction utilitaire pour normaliser le statut des appointments
const normalizeToEnumStatus = (status?: string): AppointmentStatus => {
  const s = String(status || '').toLowerCase();
  if (s === 'inprogress' || s === 'in_progress') return AppointmentStatus.InProgress;
  if (s === 'canceled' || s === 'cancelled') return AppointmentStatus.Canceled;
  if (s === 'rescheduled') return AppointmentStatus.Rescheduled;
  if (s === 'created') return AppointmentStatus.Created;
  if (s === 'done') return AppointmentStatus.Done;
  return AppointmentStatus.Scheduled;
};

/**
 * Mappe un client de l'API vers le format frontend
 * @param client - Client reçu de l'API avec _id, firstName, lastName, etc.
 * @returns Client au format frontend avec id, name, appointments, etc.
 */
export const mapApiClientToFrontend = (client: any) => {
  const clientAppointments = client.appointments || [];
  
  // Calculer lastAppointment et notesCount depuis les appointments du client
  // Le backend renvoie les appointments déjà triés, on prend simplement le premier
  let lastAppointment = '';
  let notesCount = clientAppointments.length;
  
  if (clientAppointments.length > 0) {
    // Les appointments sont déjà triés par le backend, pas besoin de re-trier
    lastAppointment = clientAppointments[0].endAt || clientAppointments[0].startAt || '';
  }

  return {
    id: client._id,
    name: `${client.firstName || ''} ${client.lastName || ''}`.trim(),
    email: client.email || '',
    phone: client.phone || '',
    address: client.address || '',
    lastAppointment,
    notesCount,
    notes: client.notes || '',
    invoiceSummary: client.invoiceSummary ? {
      totalAmount: client.invoiceSummary.totalAmount || 0,
      dueAmount: client.invoiceSummary.dueAmount || 0,
      invoiceCount: client.invoiceSummary.invoiceCount || 0,
      lastInvoiceAt: client.invoiceSummary.lastInvoiceAt
    } : undefined,
    appointments: clientAppointments.map((app: any) => ({
      _id: app._id,
      title: app.title,
      startAt: app.startAt,
      endAt: app.endAt,
      status: normalizeToEnumStatus(app.status),
      notes: typeof app.notes === 'object' ? app.notes : undefined,
    }))
    // Pas de tri ici, les appointments sont déjà triés par le backend
  };
};
