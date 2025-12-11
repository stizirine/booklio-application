import { Worker } from 'bullmq';

import { ClientModel } from '@crm/clients/model.js';

import { metrics } from '../../../metrics.js';
import { MessageComposer } from '../composer.js';
import { MessageChannels, TemplatePurposes } from '../enums.js';
import { MessageLogModel } from '../messageLog.js';
import { MessageTemplateModel } from '../templates.js';
import { getWhatsAppProvider } from '../whatsapp/factory.js';

import { reengagementDLQ } from './reengagementQueue.js';

import type { ReengagementJobData } from './reengagementQueue.js';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const composer = new MessageComposer();

export function startReengagementWorker(concurrency = 5): Worker<ReengagementJobData> {
  const worker = new Worker<ReengagementJobData>(
    'agent-reengagement',
    async (job) => {
      const { tenantId, clientId } = job.data;

      const client = await ClientModel.findOne({ _id: clientId, tenantId, deletedAt: null });
      if (!client) return;
      if (!client.phone) return;

      const template = await MessageTemplateModel.findOne({
        tenantId,
        purpose: TemplatePurposes.Reengagement,
        locale: 'fr',
      });
      if (!template) return;

      const composed = composer.compose({
        template,
        variables: { firstName: client.firstName },
      });

      const idempotencyKey = `${tenantId}:${clientId}:${template.name}:reengagement`;
      const provider = await getWhatsAppProvider(tenantId);
      const sendResult = await provider.sendTemplateMessage({
        toPhone: client.phone,
        templateName: template.name,
        variables: { text: composed.text },
        locale: 'fr',
        idempotencyKey,
      });

      await MessageLogModel.create({
        tenantId,
        clientId,
        channel: MessageChannels.WhatsApp,
        templateName: template.name,
        locale: 'fr',
        content: composed.text,
        provider: sendResult.provider,
        providerMessageId: sendResult.providerMessageId,
        idempotencyKey,
        sentAt: new Date(),
      });

      metrics.jobsProcessed.inc();
      metrics.messagesSent.inc();
    },
    { connection: { url: REDIS_URL }, concurrency }
  );

  // Handle failed jobs by moving them to DLQ
  worker.on('failed', async (job, err) => {
    if (job && job.attemptsMade >= (job.opts.attempts || 5)) {
      // Job has exhausted all retries, move to DLQ
      const { tenantId, clientId } = job.data;

      await reengagementDLQ.add(
        'dlq-reengagement',
        {
          tenantId,
          clientId,
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
        `🚨 Reengagement job ${job.id} moved to DLQ after ${job.attemptsMade} attempts: ${err.message}`
      );
    }
  });

  return worker;
}
