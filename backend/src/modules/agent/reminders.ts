import { addMinutes } from 'date-fns';

import { AppointmentModel } from '@crm/appointments/model.js';
import { ClientModel } from '@crm/clients/model.js';

import { TemplatePurposes } from './enums.js';
import { enqueueReminder } from './queue/remindersQueue.js';
import { MessageTemplateModel } from './templates.js';

type RunParams = {
  tenantId: string;
  now?: Date;
  windowMinutes?: number; // largeur de fenêtre autour de +48h
};

// Cherche les RDV dont startAt est dans [now+48h, now+48h+window]
export async function runReminders48hOnce({
  tenantId,
  now = new Date(),
  windowMinutes = 15,
}: RunParams) {
  const targetStart = addMinutes(now, 48 * 60);
  const targetEnd = addMinutes(targetStart, windowMinutes);

  const appointments = await AppointmentModel.find({
    tenantId,
    deletedAt: null,
    startAt: { $gte: targetStart, $lt: targetEnd },
    reminder48hSentAt: null,
  });

  if (appointments.length === 0) return { processed: 0 };

  // Vérifie qu'au moins un template existe pour anticiper les erreurs côté worker
  const template = await MessageTemplateModel.findOne({
    tenantId,
    purpose: TemplatePurposes.Reminder48h,
  });
  if (!template) return { processed: 0, error: 'template_not_found' } as const;

  let processed = 0;
  for (const appt of appointments) {
    const clientId =
      typeof appt.clientId === 'object'
        ? String((appt.clientId as unknown as { _id: string })._id)
        : String(appt.clientId);
    const client = await ClientModel.findOne({ _id: clientId, tenantId });
    if (!client || !client.phone) continue;

    await enqueueReminder({ tenantId, appointmentId: String(appt._id) });
    processed += 1;
  }

  return { processed };
}
