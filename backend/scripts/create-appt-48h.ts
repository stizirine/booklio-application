#!/usr/bin/env tsx
import mongoose from 'mongoose';

import { AppointmentModel } from '@crm/appointments/model.js';
import { AppointmentStatuses } from '@crm/appointments/status.js';
import { ClientModel } from '@crm/clients/model.js';

const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://booklio:booklio_password@localhost:27017/booklio?authSource=admin';
let TENANT_ID = process.env.TENANT_ID as string;
const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const EMAIL = process.env.EMAIL || 'test@booklio.com';
const PASSWORD = process.env.PASSWORD || 'password123';

async function main() {
  if (!TENANT_ID) {
    const login = await fetch(`${BASE_URL}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
    });
    if (login.ok) {
      const lj = (await login.json()) as { tokens: { accessToken: string } };
      const token = lj.tokens.accessToken;
      const me = await fetch(`${BASE_URL}/v1/auth/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (me.ok) {
        const mj = (await me.json()) as { tenantId?: string };
        if (mj.tenantId) TENANT_ID = mj.tenantId;
      }
    }
  }
  if (!TENANT_ID) {
    console.error('TENANT_ID manquant');
    process.exit(1);
  }

  await mongoose.connect(MONGO_URI);
  try {
    const client = await ClientModel.create({
      tenantId: TENANT_ID,
      firstName: 'Alice',
      lastName: 'Reminder',
      phone: '+33600000000',
      email: 'alice.reminder@example.com',
    });

    const now = new Date();
    const startAt = new Date(now.getTime() + 48 * 60 * 60 * 1000 + 2 * 60 * 1000); // +48h +2min
    const endAt = new Date(startAt.getTime() + 30 * 60 * 1000);

    const appt = await AppointmentModel.create({
      tenantId: TENANT_ID,
      clientId: client._id,
      title: 'Test Reminder 48h',
      startAt,
      endAt,
      status: AppointmentStatuses.Scheduled,
      notes: { reason: 'smoke', comment: 'created by script' },
      reminder48hSentAt: null,
      deletedAt: null,
    });

    console.log('✅ Created client:', String(client._id));
    console.log('✅ Created appointment:', String(appt._id));
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
