#!/usr/bin/env tsx
// Smoke: login puis send-now sur un rendez-vous fourni (ou dernier RDV du tenant)

import mongoose from 'mongoose';

import { AppointmentModel } from '@crm/appointments/model.js';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const EMAIL = process.env.EMAIL || 'test@booklio.com';
const PASSWORD = process.env.PASSWORD || 'password123';
const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://booklio:booklio_password@localhost:27017/booklio?authSource=admin';
const APPOINTMENT_ID = process.env.APPOINTMENT_ID;

async function login(): Promise<{ token: string; tenantId: string }> {
  const r = await fetch(`${BASE_URL}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!r.ok) throw new Error(`Login failed: ${r.status}`);
  const j = (await r.json()) as { tokens: { accessToken: string }; user: { tenantId: string } };
  return { token: j.tokens.accessToken, tenantId: j.user.tenantId };
}

async function findLatestAppointment(tenantId: string): Promise<string> {
  await mongoose.connect(MONGO_URI);
  try {
    const appt = await AppointmentModel.findOne({ tenantId, deletedAt: null }).sort({
      createdAt: -1,
    });
    if (!appt) throw new Error('No appointment found');
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
  const { token, tenantId } = await login();
  const apptId = APPOINTMENT_ID || (await findLatestAppointment(tenantId));
  await sendNow(token, apptId);
  console.log('Agent send-now smoke: SUCCESS');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
