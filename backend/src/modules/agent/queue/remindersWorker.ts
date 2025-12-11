import { Worker } from 'bullmq';

import { AppointmentModel } from '@crm/appointments/model.js';
import { ClientModel } from '@crm/clients/model.js';

import { metrics } from '../../../metrics.js';
import { MessageComposer } from '../composer.js';
import { MessageChannels, MessageStatuses, TemplatePurposes } from '../enums.js';
import { MessageLogModel } from '../messageLog.js';
import { MessageTemplateModel } from '../templates.js';
import { getWhatsAppProvider } from '../whatsapp/factory.js';

import { remindersDLQ } from './remindersQueue.js';

import type { ReminderJobData } from './remindersQueue.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const composer = new MessageComposer();

export function startRemindersWorker(concurrency = 5): Worker<ReminderJobData> {
  const worker = new Worker<ReminderJobData>(
    'agent-reminders',
    async (job) => {
      const { tenantId, appointmentId } = job.data;

      const appt = await AppointmentModel.findOne({
        _id: appointmentId,
        tenantId,
        deletedAt: null,
      });
      if (!appt) return;
      if (appt.reminder48hSentAt) return; // idempotence

      const clientId =
        typeof appt.clientId === 'object'
          ? String((appt.clientId as unknown as { _id: string })._id)
          : String(appt.clientId);
      const client = await ClientModel.findOne({ _id: clientId, tenantId });
      if (!client || !client.phone) return;

      const template = await MessageTemplateModel.findOne({
        tenantId,
        purpose: TemplatePurposes.Reminder48h,
        locale: 'fr',
      });
      if (!template) return;

      const composed = composer.compose({
        template,
        variables: {
          firstName: client.firstName,
          date: appt.startAt,
          time: appt.startAt,
          bookingLink: '',
        },
      });

      const idempotencyKey = `${tenantId}:${clientId}:${String(appt._id)}:${template.name}`;
      const provider = await getWhatsAppProvider(tenantId);
      const send = await provider.sendTemplateMessage({
        toPhone: client.phone,
        templateName: template.name,
        variables: { text: composed.text },
        locale: template.locale,
        idempotencyKey,
      });

      await MessageLogModel.create({
        tenantId,
        clientId: client._id,
        appointmentId: appt._id,
        channel: MessageChannels.WhatsApp,
        status: MessageStatuses.Sent,
        templateName: template.name,
        locale: template.locale,
        content: composed.text,
        provider: send.provider,
        providerMessageId: send.providerMessageId,
        idempotencyKey,
        sentAt: new Date(),
      });

      await AppointmentModel.updateOne(
        { _id: appt._id },
        { $set: { reminder48hSentAt: new Date() } }
      );
      metrics.jobsProcessed.inc();
      metrics.messagesSent.inc();
    },
    { connection: { url: REDIS_URL }, concurrency }
  );

  // Handle failed jobs by moving them to DLQ
  worker.on('failed', async (job, err) => {
    if (job && job.attemptsMade >= (job.opts.attempts || 5)) {
      // Job has exhausted all retries, move to DLQ
      const { tenantId, appointmentId } = job.data;

      await remindersDLQ.add(
        'dlq-reminder',
        {
          tenantId,
          appointmentId,
          originalJobId: job.id || 'unknown',
          failureReason: err.message,
          failedAt: new Date(),
          attempts: job.attemptsMade,
        },
        {
          jobId: `dlq-${job.id || 'unknown'}`,
          removeOnComplete: 100,
          removeOnFail: 50,
        }
      );

      console.error(
        `🚨 Reminder job ${job.id} moved to DLQ after ${job.attemptsMade} attempts: ${err.message}`
      );
    }
  });

  return worker;
}
