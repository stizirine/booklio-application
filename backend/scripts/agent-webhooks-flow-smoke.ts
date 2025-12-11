#!/usr/bin/env tsx
// Flow: send-now puis simulate delivered/read

import { MessageLogModel } from '@agent/messageLog.js';
import mongoose from 'mongoose';

import { AppointmentModel } from '@crm/appointments/model.js';

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const EMAIL = process.env.EMAIL || 'test@booklio.com';
const PASSWORD = process.env.PASSWORD || 'password123';
const MONGO_URI =
  process.env.MONGO_URI ||
  'mongodb://booklio:booklio_password@localhost:27017/booklio?authSource=admin';

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

async function latestAppointment(tenantId: string): Promise<string> {
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

async function sendNow(token: string, appointmentId: string): Promise<string> {
  const r = await fetch(`${BASE_URL}/v1/agent/send-now`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ appointmentId, locale: 'fr' }),
  });
  if (!r.ok) throw new Error(`send-now failed: ${r.status}`);
  const j = (await r.json()) as { providerMessageId: string };
  return j.providerMessageId;
}

async function mark(event: 'delivered' | 'read', providerMessageId: string) {
  const r = await fetch(`${BASE_URL}/v1/agent/webhooks/whatsapp/status`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ providerMessageId, event, timestamp: new Date().toISOString() }),
  });
  if (!r.ok) throw new Error(`webhook ${event} failed: ${r.status}`);
}

async function assertUpdated(providerMessageId: string) {
  await mongoose.connect(MONGO_URI);
  try {
    const log = await MessageLogModel.findOne({ providerMessageId });
    if (!log) throw new Error('message log not found');
  } finally {
    await mongoose.disconnect();
  }
}

async function main() {
  const { token, tenantId } = await login();
  const apptId = await latestAppointment(tenantId);
  const pmid = await sendNow(token, apptId);
  await mark('delivered', pmid);
  await mark('read', pmid);
  await assertUpdated(pmid);
  console.log('Agent webhooks flow smoke: SUCCESS');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
