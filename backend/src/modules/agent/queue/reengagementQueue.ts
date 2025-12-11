import { Queue, type JobsOptions } from 'bullmq';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export type ReengagementJobData = {
  tenantId: string;
  clientId: string;
  originalJobId?: string;
  failureReason?: string;
  failedAt?: Date;
  attempts?: number;
};

export const reengagementQueue = new Queue<ReengagementJobData>('agent-reengagement', {
  connection: { url: REDIS_URL },
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 500,
    removeOnFail: 1000,
  },
});

// Dead Letter Queue for failed reengagement jobs
export const reengagementDLQ = new Queue<ReengagementJobData>('agent-reengagement-dlq', {
  connection: { url: REDIS_URL },
  defaultJobOptions: {
    removeOnComplete: 100,
    removeOnFail: 50,
  },
});

export async function enqueueReengagement(job: ReengagementJobData, jobId?: string): Promise<void> {
  const options: JobsOptions = {
    attempts: 5,
    backoff: { type: 'exponential', delay: 1000 },
    removeOnComplete: 500,
    removeOnFail: 1000,
  };
  if (jobId) options.jobId = jobId;
  await reengagementQueue.add('reengage-client', job, options);
}
