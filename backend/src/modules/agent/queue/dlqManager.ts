import { Worker, type Job } from 'bullmq';
import pino from 'pino';

import { metrics } from '../../../metrics.js';

import { reengagementDLQ } from './reengagementQueue.js';
import { remindersDLQ } from './remindersQueue.js';

const logger = pino({ transport: { target: 'pino-pretty' } });

export type DLQJobData = {
  tenantId: string;
  appointmentId?: string;
  clientId?: string;
  originalJobId: string;
  failureReason: string;
  failedAt: Date;
  attempts: number;
};

// DLQ Manager for handling failed jobs
export class DLQManager {
  private remindersWorker: Worker;
  private reengagementWorker: Worker;

  constructor() {
    this.remindersWorker = new Worker('agent-reminders-dlq', this.handleReminderDLQ.bind(this), {
      connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
      concurrency: 1, // Process DLQ jobs one at a time
    });

    this.reengagementWorker = new Worker(
      'agent-reengagement-dlq',
      this.handleReengagementDLQ.bind(this),
      {
        connection: { url: process.env.REDIS_URL || 'redis://localhost:6379' },
        concurrency: 1,
      }
    );

    this.setupEventHandlers();
  }

  private setupEventHandlers(): void {
    this.remindersWorker.on('completed', (job) => {
      logger.info({ jobId: job.id, queue: 'reminders-dlq' }, 'DLQ job completed');
    });

    this.remindersWorker.on('failed', (job, err) => {
      logger.error(
        { jobId: job?.id, error: err.message, queue: 'reminders-dlq' },
        'DLQ job failed'
      );
    });

    this.reengagementWorker.on('completed', (job) => {
      logger.info({ jobId: job.id, queue: 'reengagement-dlq' }, 'DLQ job completed');
    });

    this.reengagementWorker.on('failed', (job, err) => {
      logger.error(
        { jobId: job?.id, error: err.message, queue: 'reengagement-dlq' },
        'DLQ job failed'
      );
    });
  }

  private async handleReminderDLQ(job: Job<DLQJobData>): Promise<void> {
    const { tenantId, appointmentId, originalJobId, failureReason, failedAt, attempts } = job.data;

    logger.error(
      {
        tenantId,
        appointmentId,
        originalJobId,
        failureReason,
        failedAt,
        attempts,
        queue: 'reminders-dlq',
      },
      'Reminder job moved to DLQ'
    );

    // Send alert (in production, this would be a real alerting system)
    const alertData: {
      type: string;
      tenantId: string;
      jobId: string;
      appointmentId?: string;
      clientId?: string;
      failureReason: string;
      attempts: number;
    } = {
      type: 'reminder-dlq',
      tenantId,
      jobId: originalJobId,
      failureReason,
      attempts,
    };
    if (appointmentId) {
      alertData.appointmentId = appointmentId;
    }
    await this.sendAlert(alertData);

    // Update metrics
    metrics.webhookErrors.inc({ tenant_id: tenantId, error_type: 'dlq_reminder' });
  }

  private async handleReengagementDLQ(job: Job<DLQJobData>): Promise<void> {
    const { tenantId, clientId, originalJobId, failureReason, failedAt, attempts } = job.data;

    logger.error(
      {
        tenantId,
        clientId,
        originalJobId,
        failureReason,
        failedAt,
        attempts,
        queue: 'reengagement-dlq',
      },
      'Reengagement job moved to DLQ'
    );

    // Send alert
    const alertData: {
      type: string;
      tenantId: string;
      jobId: string;
      appointmentId?: string;
      clientId?: string;
      failureReason: string;
      attempts: number;
    } = {
      type: 'reengagement-dlq',
      tenantId,
      jobId: originalJobId,
      failureReason,
      attempts,
    };
    if (clientId) {
      alertData.clientId = clientId;
    }
    await this.sendAlert(alertData);

    // Update metrics
    metrics.webhookErrors.inc({ tenant_id: tenantId, error_type: 'dlq_reengagement' });
  }

  private async sendAlert(alert: {
    type: string;
    tenantId: string;
    jobId: string;
    appointmentId?: string;
    clientId?: string;
    failureReason: string;
    attempts: number;
  }): Promise<void> {
    // In production, this would integrate with real alerting systems:
    // - Slack webhook
    // - PagerDuty
    // - Email notifications
    // - SMS alerts

    const alertMessage = {
      timestamp: new Date().toISOString(),
      severity: 'ERROR',
      service: 'booklio-agent',
      ...alert,
    };

    logger.error(alertMessage, 'DLQ Alert');

    // For now, we'll just log the alert
    // In production, you would send this to your alerting system
    console.error('🚨 DLQ ALERT:', JSON.stringify(alertMessage, null, 2));
  }

  // Method to manually retry a DLQ job
  async retryDLQJob(queueName: string, jobId: string): Promise<void> {
    try {
      let dlq: typeof remindersDLQ | typeof reengagementDLQ;
      if (queueName === 'reminders') {
        dlq = remindersDLQ;
      } else if (queueName === 'reengagement') {
        dlq = reengagementDLQ;
      } else {
        throw new Error(`Unknown queue: ${queueName}`);
      }

      const job = await dlq.getJob(jobId);
      if (!job) {
        throw new Error(`Job ${jobId} not found in DLQ`);
      }

      // For now, just log the retry request
      // In a full implementation, you would move the job back to the original queue
      logger.info({ jobId, queueName }, 'DLQ job retry requested');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error({ jobId, queueName, error: errorMessage }, 'Failed to retry DLQ job');
      throw error;
    }
  }

  // Method to get DLQ statistics
  async getDLQStats(): Promise<{
    reminders: { waiting: number; active: number; completed: number; failed: number };
    reengagement: { waiting: number; active: number; completed: number; failed: number };
  }> {
    const [remindersStats, reengagementStats] = await Promise.all([
      remindersDLQ.getJobCounts(),
      reengagementDLQ.getJobCounts(),
    ]);

    return {
      reminders: {
        waiting: remindersStats.waiting || 0,
        active: remindersStats.active || 0,
        completed: remindersStats.completed || 0,
        failed: remindersStats.failed || 0,
      },
      reengagement: {
        waiting: reengagementStats.waiting || 0,
        active: reengagementStats.active || 0,
        completed: reengagementStats.completed || 0,
        failed: reengagementStats.failed || 0,
      },
    };
  }

  async close(): Promise<void> {
    await Promise.all([this.remindersWorker.close(), this.reengagementWorker.close()]);
  }
}

// Export singleton instance
export const dlqManager = new DLQManager();
