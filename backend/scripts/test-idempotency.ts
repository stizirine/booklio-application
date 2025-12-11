#!/usr/bin/env tsx

import { idempotencyManager } from '../src/modules/agent/idempotency.js';

async function testIdempotency() {
  console.log('🔄 Testing Idempotency System\n');

  const tenantId = 't1';
  const appointmentId = 'test-appointment-123';

  try {
    // Test 1: Generate idempotency key
    console.log('1️⃣ Testing key generation...');
    const key1 = idempotencyManager.generateKey({
      tenantId,
      type: 'outbound',
      source: appointmentId,
      action: 'send-now',
    });
    console.log('   Generated key:', key1);

    // Test 2: Check non-existent key
    console.log('\n2️⃣ Testing non-existent key...');
    const check1 = await idempotencyManager.checkIdempotency(key1);
    console.log('   Is duplicate:', check1.isDuplicate);
    console.log('   Expected: false');

    // Test 3: Record success
    console.log('\n3️⃣ Testing success recording...');
    await idempotencyManager.recordSuccess(key1, {
      messageId: 'msg-123',
      status: 'sent',
      sentAt: new Date(),
    });
    console.log('   Success recorded');

    // Test 4: Check existing key
    console.log('\n4️⃣ Testing existing key...');
    const check2 = await idempotencyManager.checkIdempotency(key1);
    console.log('   Is duplicate:', check2.isDuplicate);
    console.log('   Existing result:', check2.existingResult);
    console.log('   Expected: true');

    // Test 5: Generate different key
    console.log('\n5️⃣ Testing different key...');
    const key2 = idempotencyManager.generateKey({
      tenantId,
      type: 'outbound',
      source: 'different-appointment',
      action: 'send-now',
    });
    console.log('   Different key:', key2);

    const check3 = await idempotencyManager.checkIdempotency(key2);
    console.log('   Is duplicate:', check3.isDuplicate);
    console.log('   Expected: false');

    // Test 6: Webhook signature generation
    console.log('\n6️⃣ Testing webhook signature...');
    const payload = { clientId: 'client-123', text: 'STOP' };
    const secret = 'test-secret';
    const signature = idempotencyManager.generateWebhookSignature(payload, secret);
    console.log('   Generated signature:', signature);

    // Test 7: Webhook duplicate check
    console.log('\n7️⃣ Testing webhook duplicate check...');
    const webhookCheck = await idempotencyManager.checkWebhookDuplicate(
      tenantId,
      signature,
      payload
    );
    console.log('   Is duplicate webhook:', webhookCheck.isDuplicate);
    console.log('   Expected: false');

    // Test 8: Outbound idempotency check
    console.log('\n8️⃣ Testing outbound idempotency...');
    const outboundCheck = await idempotencyManager.checkOutboundIdempotency(
      tenantId,
      appointmentId,
      'send-now'
    );
    console.log('   Is duplicate outbound:', outboundCheck.isDuplicate);
    console.log('   Expected: true (same appointment)');

    // Test 9: Inbound idempotency check
    console.log('\n9️⃣ Testing inbound idempotency...');
    const inboundCheck = await idempotencyManager.checkInboundIdempotency(
      tenantId,
      payload,
      secret
    );
    console.log('   Is duplicate inbound:', inboundCheck.isDuplicate);
    console.log('   Expected: false');

    // Test 10: Cache statistics
    console.log('\n🔟 Testing cache statistics...');
    const stats = idempotencyManager.getCacheStats();
    console.log('   Cache stats:', stats);

    console.log('\n✅ All idempotency tests completed successfully!');
  } catch (error) {
    console.error('❌ Idempotency test failed:', error.message);
    process.exit(1);
  }
}

testIdempotency();
