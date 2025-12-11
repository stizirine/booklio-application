#!/usr/bin/env tsx
import { AgentPolicyModel } from '@agent/policies.js';
import mongoose from 'mongoose';

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://booklio:booklio_password@localhost:27017/booklio?authSource=admin';
const TENANT_ID = process.env.TENANT_ID as string;

if (!TENANT_ID) {
  console.error('TENANT_ID manquant');
  process.exit(1);
}

async function main() {
  await mongoose.connect(MONGO_URI);
  try {
    const doc = await AgentPolicyModel.findOneAndUpdate(
      { tenantId: TENANT_ID },
      { $set: { enabled: true } },
      { new: true, upsert: true }
    );
    console.log('✅ Agent enabled for tenant', TENANT_ID, '->', doc?.enabled);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
