#!/usr/bin/env tsx
import mongoose from 'mongoose';

import { TenantModel } from '../src/modules/tenants/model.js';

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://booklio:booklio_password@localhost:27017/booklio?authSource=admin';
const TENANT_ID = process.env.TENANT_ID || 't1';
const CLIENT_TYPE = process.env.CLIENT_TYPE || 'optician';

async function main() {
  await mongoose.connect(MONGO_URI);
  try {
    const up = await TenantModel.findOneAndUpdate(
      { tenantId: TENANT_ID },
      {
        $set: {
          clientType: CLIENT_TYPE,
          capabilities: ['optics'],
          featureFlags: {
            optics_measurements: true,
            optics_prescriptions: true,
            optics_print: true,
          },
        },
      },
      { upsert: true, new: true }
    );
    console.log('Seed tenant OK:', up.tenantId, up.clientType, up.capabilities);
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
