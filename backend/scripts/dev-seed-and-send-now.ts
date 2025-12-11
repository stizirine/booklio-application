#!/usr/bin/env tsx
// Dev helper: crée un user/tenant si besoin, seed un client+RDV (+48h) puis envoie immédiatement (send-now)

import mongoose from 'mongoose';

import { AppointmentModel } from '@crm/appointments/model.js';
import { AppointmentStatuses } from '@crm/appointments/status.js';
import { ClientModel } from '@crm/clients/model.js';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const EMAIL = process.env.EMAIL || 'test+tenant@booklio.com';
const PASSWORD = process.env.PASSWORD || 'password123';
const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://booklio:booklio_password@localhost:27017/booklio?authSource=admin';
let TENANT_ID = process.env.TENANT_ID || 't1';

async function ensureUserAndGetToken(): Promise<string> {
  // register (ignore conflit)
  await fetch(`${BASE_URL}/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId: TENANT_ID, email: EMAIL, password: PASSWORD }),
  }).catch(() => undefined);

  const r = await fetch(`${BASE_URL}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!r.ok) throw new Error(`Login failed: ${r.status}`);
  const j = (await r.json()) as { tokens: { accessToken: string }; user?: { tenantId?: string } };
  if (j.user?.tenantId) TENANT_ID = j.user.tenantId;
  return j.tokens.accessToken;
}

async function createClientAndAppointment(): Promise<string> {
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
    const startAt = new Date(now.getTime() + 48 * 60 * 60 * 1000 + 2 * 60 * 1000);
    const endAt = new Date(startAt.getTime() + 30 * 60 * 1000);

    const appt = await AppointmentModel.create({
      tenantId: TENANT_ID,
      clientId: client._id,
      title: 'Test Reminder 48h',
      startAt,
      endAt,
      status: AppointmentStatuses.Scheduled,
      notes: { reason: 'smoke', comment: 'dev-seed-and-send-now' },
      reminder48hSentAt: null,
      deletedAt: null,
    });

    return String(appt._id);
  } finally {
    await mongoose.disconnect();
  }
}

async function sendNow(token: string, appointmentId: string) {
  const r = await fetch(`${BASE_URL}/v1/agent/send-now`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ appointmentId, locale: 'fr' }),
  });
  if (!r.ok) throw new Error(`send-now failed: ${r.status}`);
  const j = await r.json();
  console.log('send-now:', j);
}

async function main() {
  const token = await ensureUserAndGetToken();
  const apptId = await createClientAndAppointment();
  await sendNow(token, apptId);
  console.log('Dev seed & send-now: SUCCESS');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
