#!/usr/bin/env tsx
// E2E: trouve un MessageLog avec providerMessageId et simule les statuts delivered/read

import { MessageLogModel } from '@agent/messageLog.js';
import mongoose from 'mongoose';

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://booklio:booklio_password@localhost:27017/booklio?authSource=admin';
const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

async function callStatus(providerMessageId: string, event: 'delivered' | 'read') {
  const res = await fetch(`${BASE_URL}/v1/agent/webhooks/whatsapp/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ providerMessageId, event, timestamp: new Date().toISOString() }),
  });
  if (!res.ok) throw new Error(`Webhook status ${event} failed: ${res.status}`);
}

async function main() {
  await mongoose.connect(MONGO_URI);
  try {
    const log = await MessageLogModel.findOne({ providerMessageId: { $ne: null } }).sort({
      createdAt: -1,
    });
    if (!log || !log.providerMessageId)
      throw new Error('Aucun message avec providerMessageId trouvé');
    const pmid = log.providerMessageId;
    console.log('Using providerMessageId:', pmid);

    await callStatus(pmid, 'delivered');
    console.log('Delivered OK');
    await callStatus(pmid, 'read');
    console.log('Read OK');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
