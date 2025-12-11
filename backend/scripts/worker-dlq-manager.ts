#!/usr/bin/env tsx

import { dlqManager } from '../src/modules/agent/queue/dlqManager.js';

console.log('🚨 Starting DLQ Manager...');

// Handle graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down DLQ Manager...');
  await dlqManager.close();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Shutting down DLQ Manager...');
  await dlqManager.close();
  process.exit(0);
});

console.log('✅ DLQ Manager started and monitoring for failed jobs');
console.log('   - Reminders DLQ: agent-reminders-dlq');
console.log('   - Reengagement DLQ: agent-reengagement-dlq');
console.log('   - Press Ctrl+C to stop');
