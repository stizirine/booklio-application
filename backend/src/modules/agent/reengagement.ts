import { subDays } from 'date-fns';

import { AppointmentModel } from '@crm/appointments/model.js';
import { ClientModel } from '@crm/clients/model.js';

import { enqueueReengagement } from './queue/reengagementQueue.js';

type RunParams = {
  tenantId: string;
  days?: number; // X jours sans RDV
  now?: Date;
  limit?: number;
};

export async function runReengagementOnce({
  tenantId,
  days = 30,
  now = new Date(),
  limit = 100,
}: RunParams): Promise<{ matched: number; enqueued: number }> {
  const since = subDays(now, days);

  // Clients sans RDV depuis X jours: on considère aucun rendez-vous depuis 'since'
  // Approche: récupérer les clients qui n'ont aucun Appointment avec startAt >= since
  const clients = await ClientModel.find({ tenantId, deletedAt: null })
    .select({ _id: 1 })
    .limit(limit);

  let matched = 0;
  let enqueued = 0;
  for (const client of clients) {
    const hasRecentAppt = await AppointmentModel.exists({
      tenantId,
      clientId: client._id,
      deletedAt: null,
      startAt: { $gte: since },
    });
    if (hasRecentAppt) continue;

    matched += 1;
    await enqueueReengagement(
      { tenantId, clientId: String(client._id) },
      `${tenantId}-${String(client._id)}-reengagement-${days}d`
    );
    enqueued += 1;
  }

  return { matched, enqueued };
}
