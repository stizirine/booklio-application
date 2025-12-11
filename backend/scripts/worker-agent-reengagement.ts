/*
  Lance le worker BullMQ pour la campagne de réengagement.
  Utilisation:
    REDIS_URL=redis://localhost:6379 npm run worker:agent:reengagement
*/

import { startReengagementWorker } from '@src/modules/agent/queue/reengagementWorker.js';

const concurrency = Number(process.env.WORKER_CONCURRENCY || '5');
startReengagementWorker(concurrency);
// Garder le process vivant
process.stdin.resume();
