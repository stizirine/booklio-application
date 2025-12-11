#!/usr/bin/env tsx
// Simule un message entrant WhatsApp (ex: STOP)

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

async function main() {
  const tenantId = process.env.TENANT_ID || 't1';
  const text = process.env.TEXT || 'STOP';
  const clientId = process.env.CLIENT_ID;
  const fromPhone = process.env.FROM_PHONE || '+33600000000';

  const res = await fetch(`${BASE_URL}/v1/agent/webhooks/whatsapp/inbound`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, clientId, fromPhone, text }),
  });
  const textRes = await res.text();
  if (!res.ok) {
    console.error('Webhook inbound FAILED', res.status, textRes);
    process.exit(1);
  }
  console.log('Webhook inbound OK', textRes);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
