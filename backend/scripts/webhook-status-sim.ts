#!/usr/bin/env tsx
// Simule l'appel du webhook de statut WhatsApp (provider mock)

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

type Event = 'queued' | 'sent' | 'delivered' | 'read' | 'failed';

async function main() {
  const providerMessageId = process.env.PROVIDER_MESSAGE_ID || 'msg_123';
  const event = (process.env.EVENT as Event) || 'delivered';
  const timestamp = new Date().toISOString();

  const res = await fetch(`${BASE_URL}/v1/agent/webhooks/whatsapp/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ providerMessageId, event, timestamp }),
  });
  const text = await res.text();
  if (!res.ok) {
    console.error('Webhook status FAILED', res.status, text);
    process.exit(1);
  }
  console.log('Webhook status OK', text);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
