#!/usr/bin/env tsx

import 'dotenv/config.js';
import { AppointmentStatuses } from '../src/modules/crm/appointments/status.js';

const BASE = process.env.BASE_URL || 'http://localhost:4000';
const email = process.env.SMOKE_EMAIL || 'admin@booklio.com';
const password = process.env.SMOKE_PASSWORD || 'P@ssw0rd123';

type LoginResponse = {
  tokens: { accessToken: string; refreshToken: string };
};

async function tryLogin(): Promise<Response> {
  return await fetch(`${BASE}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  } as any);
}

async function ensureUserAndLogin(): Promise<string> {
  let loginRes = await tryLogin();
  if (loginRes.status === 401) {
    const reg = await fetch(`${BASE}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: 't1', email, password }),
    } as any);
    if (!reg.ok && reg.status !== 409) {
      console.error('Register failed', reg.status, await reg.text());
      process.exit(1);
    }
    loginRes = await tryLogin();
  }
  if (!loginRes.ok) {
    console.error('Login failed', loginRes.status, await loginRes.text());
    process.exit(1);
  }
  const loginJson = (await loginRes.json()) as LoginResponse;
  const at = loginJson?.tokens?.accessToken;
  if (!at) {
    console.error('Missing access token in login response');
    process.exit(1);
  }
  return at;
}

async function createClient(at: string): Promise<string> {
  const res = await fetch(`${BASE}/v1/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${at}`,
    },
    body: JSON.stringify({
      firstName: 'Smoke',
      lastName: 'Client',
      email: 'smoke.client@example.com',
    }),
  } as any);
  if (!res.ok) {
    console.error('Create client failed', res.status, await res.text());
    process.exit(1);
  }
  const js = (await res.json()) as any;
  return js?.client?._id as string;
}

function toIso(d: Date): string {
  return new Date(d).toISOString().replace(/\.\d{3}Z$/, 'Z');
}

async function createAppointment(at: string, clientId: string): Promise<string> {
  const now = new Date();
  const later = new Date(now.getTime() + 30 * 60 * 1000);
  const res = await fetch(`${BASE}/v1/appointments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${at}`,
    },
    body: JSON.stringify({
      clientId,
      title: 'Smoke RDV',
      startAt: toIso(now),
      endAt: toIso(later),
    }),
  } as any);
  if (!res.ok) {
    console.error('Create appointment failed', res.status, await res.text());
    process.exit(1);
  }
  const js = (await res.json()) as any;
  return js?.appointment?._id as string;
}

async function updateStatus(
  at: string,
  apptId: string,
  status: (typeof AppointmentStatuses)[keyof typeof AppointmentStatuses]
) {
  const res = await fetch(`${BASE}/v1/appointments/${apptId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${at}`,
    },
    body: JSON.stringify({ status }),
  } as any);
  if (!res.ok) {
    console.error('Update status failed', res.status, await res.text());
    process.exit(1);
  }
  const js = (await res.json()) as any;
  const returned = js?.appointment?.status as string;
  if (returned !== status) {
    console.error('Status mismatch', { expected: status, got: returned });
    process.exit(1);
  }
}

async function getAppointment(at: string, id: string): Promise<any> {
  const res = await fetch(`${BASE}/v1/appointments/${id}`, {
    headers: { Authorization: `Bearer ${at}` },
  } as any);
  if (!res.ok) {
    console.error('Get appointment failed', res.status, await res.text());
    process.exit(1);
  }
  return await res.json();
}

async function main() {
  const at = await ensureUserAndLogin();
  console.log('Auth OK');
  const clientId = await createClient(at);
  console.log('Client OK', clientId);
  const apptId = await createAppointment(at, clientId);
  console.log('Appointment OK', apptId);
  await updateStatus(at, apptId, AppointmentStatuses.InProgress);
  await updateStatus(at, apptId, AppointmentStatuses.Done);
  console.log('Status update OK');
  const after = await getAppointment(at, apptId);
  const status = after?.appointment?.status;
  if (status !== AppointmentStatuses.Done) {
    console.error('Verification failed: expected done, got', status);
    process.exit(1);
  }
  console.log('Smoke appointments: SUCCESS');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
