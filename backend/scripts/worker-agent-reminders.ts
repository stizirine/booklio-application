#!/usr/bin/env tsx
import { startRemindersWorker } from '@agent/queue/remindersWorker.js';

const worker = startRemindersWorker(5);
console.log('🚀 Reminders worker started');

process.on('SIGINT', async () => {
  console.log('🛑 Stopping worker...');
  await worker.close();
  process.exit(0);
});
