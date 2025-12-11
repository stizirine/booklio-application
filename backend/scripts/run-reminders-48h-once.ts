#!/usr/bin/env tsx
import { runReminders48hOnce } from '@agent/reminders.js';
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI as string;
const TENANT_ID = process.env.TENANT_ID as string;

if (!MONGO_URI) throw new Error('MONGO_URI manquant');
if (!TENANT_ID) throw new Error('TENANT_ID manquant');

async function main() {
  await mongoose.connect(MONGO_URI);
  try {
    const result = await runReminders48hOnce({ tenantId: TENANT_ID });
    console.log('✅ reminders-48h:', result);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
