import { Queue } from 'bullmq';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export type ReminderJobData = {
  tenantId: string;
  appointmentId: string;
  originalJobId?: string;
  failureReason?: string;
  failedAt?: Date;
  attempts?: number;
};

export const remindersQueue = new Queue<ReminderJobData>('agent-reminders', {
  connection: { url: REDIS_URL },
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 500,
    removeOnFail: 1000,
  },
});

// Dead Letter Queue for failed reminder jobs
export const remindersDLQ = new Queue<ReminderJobData>('agent-reminders-dlq', {
  connection: { url: REDIS_URL },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export async function enqueueReminder(job: ReminderJobData, jobId?: string): Promise<void> {
  const id = jobId || `${job.tenantId}:${job.appointmentId}:48h`;
  await remindersQueue.add('send-48h', job, {
    jobId: id,
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 500,
    removeOnFail: 1000,
  });
}
