#!/usr/bin/env tsx

import { dlqManager } from '../src/modules/agent/queue/dlqManager.js';

async function showDLQStats() {
  try {
    console.log('📊 DLQ Statistics\n');

    const stats = await dlqManager.getDLQStats();

    console.log('🔔 Reminders DLQ:');
    console.log(`   - Waiting: ${stats.reminders.waiting}`);
    console.log(`   - Active: ${stats.reminders.active}`);
    console.log(`   - Completed: ${stats.reminders.completed}`);
    console.log(`   - Failed: ${stats.reminders.failed}`);

    console.log('\n🔄 Reengagement DLQ:');
    console.log(`   - Waiting: ${stats.reengagement.waiting}`);
    console.log(`   - Active: ${stats.reengagement.active}`);
    console.log(`   - Completed: ${stats.reengagement.completed}`);
    console.log(`   - Failed: ${stats.reengagement.failed}`);

    const totalWaiting = stats.reminders.waiting + stats.reengagement.waiting;
    const totalFailed = stats.reminders.failed + stats.reengagement.failed;

    console.log('\n📈 Summary:');
    console.log(`   - Total waiting: ${totalWaiting}`);
    console.log(`   - Total failed: ${totalFailed}`);

    if (totalWaiting > 0 || totalFailed > 0) {
      console.log('\n⚠️  WARNING: Jobs in DLQ detected!');
      console.log('   Check logs for failure reasons and consider retrying jobs.');
    } else {
      console.log('\n✅ No jobs in DLQ - all good!');
    }
  } catch (error: unknown) {
    if (error instanceof Error) {
      console.error('❌ Error fetching DLQ stats:', error.message);
    } else {
      console.error('❌ Error fetching DLQ stats:', String(error));
    }
    process.exit(1);
  }
}

showDLQStats();
