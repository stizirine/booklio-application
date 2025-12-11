#!/usr/bin/env tsx

import { quotaManager } from '../src/modules/agent/quotas.js';

async function testQuotas() {
  console.log('🧪 Testing Quota System\n');

  const tenantId = 't1';

  try {
    // Test 1: Get quota configuration
    console.log('1️⃣ Testing quota configuration...');
    const quota = quotaManager.getQuota(tenantId);
    console.log('   Quota config:', quota);

    // Test 2: Check if can send message
    console.log('\n2️⃣ Testing canSendMessage...');
    const canSend = await quotaManager.canSendMessage(tenantId);
    console.log('   Can send:', canSend);

    // Test 3: Get usage
    console.log('\n3️⃣ Testing getUsage...');
    const usage = await quotaManager.getUsage(tenantId);
    console.log('   Usage:', {
      daily: usage.daily,
      hourly: usage.hourly,
      burst: usage.burst,
      remaining: usage.remaining,
    });

    // Test 4: Set custom quota
    console.log('\n4️⃣ Testing custom quota...');
    quotaManager.setQuota(tenantId, {
      dailyLimit: 10,
      hourlyLimit: 5,
      burstLimit: 2,
    });
    console.log('   Set custom quota: 10 daily, 5 hourly, 2 burst');

    // Test 5: Check with custom quota
    console.log('\n5️⃣ Testing with custom quota...');
    const canSendCustom = await quotaManager.canSendMessage(tenantId);
    console.log('   Can send with custom quota:', canSendCustom);

    // Test 6: Get all quota status
    console.log('\n6️⃣ Testing getAllQuotaStatus...');
    const allStatus = await quotaManager.getAllQuotaStatus();
    console.log(
      '   All quota status:',
      Object.keys(allStatus).map((tenant) => ({
        tenant,
        daily: allStatus[tenant].daily,
        hourly: allStatus[tenant].hourly,
        burst: allStatus[tenant].burst,
      }))
    );

    // Test 7: Check tenant activity
    console.log('\n7️⃣ Testing tenant activity...');
    const isActive = await quotaManager.isTenantActive(tenantId);
    console.log('   Tenant active:', isActive);

    console.log('\n✅ All quota tests completed successfully!');
  } catch (error) {
    console.error('❌ Quota test failed:', error.message);
    process.exit(1);
  }
}

testQuotas();
