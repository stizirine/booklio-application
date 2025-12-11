#!/usr/bin/env tsx

import { config } from 'dotenv';

config();

const BASE = process.env.BASE_URL || 'http://localhost:4000';
const email = process.env.SMOKE_EMAIL || 'admin@booklio.com';
const password = process.env.SMOKE_PASSWORD || 'P@ssw0rd123';

async function tryLogin() {
  const res = await fetch(`${BASE}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  } as any);
  return res;
}

async function ensureAuth(): Promise<{ at: string; rt: string }> {
  let loginRes = await tryLogin();
  if (loginRes.status === 401) {
    const reg = await fetch(`${BASE}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: 't1', email, password }),
    } as any);
    if (!reg.ok && reg.status !== 409) {
      throw new Error(`Register failed: ${reg.status} ${await reg.text()}`);
    }
    loginRes = await tryLogin();
  }
  if (!loginRes.ok) {
    throw new Error(`Login failed: ${loginRes.status} ${await loginRes.text()}`);
  }
  const loginJson = (await loginRes.json()) as any;
  const at = loginJson?.tokens?.accessToken as string;
  const rt = loginJson?.tokens?.refreshToken as string;
  if (!at || !rt) throw new Error('Missing tokens');
  return { at, rt };
}

async function expect(condition: any, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

async function main() {
  const { at } = await ensureAuth();

  // List clients and verify aggregate fields
  const clientsRes = await fetch(`${BASE}/v1/clients`, {
    headers: { Authorization: `Bearer ${at}` },
  } as any);
  if (!clientsRes.ok) throw new Error(`Clients list failed: ${clientsRes.status}`);
  const clientsJson = (await clientsRes.json()) as any;
  console.log(`Clients: ${clientsJson.items?.length} items`);
  const first = clientsJson.items?.[0];
  await expect(first !== undefined, 'At least one client expected');
  await expect('totalAmount' in first, 'totalAmount missing in client list item');
  await expect('dueAmount' in first, 'dueAmount missing in client list item');
  await expect('invoiceCount' in first, 'invoiceCount missing in client list item');

  // Pick a known test client by email if present
  const testClient =
    clientsJson.items.find((c: any) => c.email === 'test.client1@example.com') || first;

  // Get client details with invoice summary and invoices
  const clientDetailRes = await fetch(
    `${BASE}/v1/clients/${testClient._id}?includeInvoiceSummary=true&includeInvoices=true&invoicesLimit=3`,
    { headers: { Authorization: `Bearer ${at}` } } as any
  );
  if (!clientDetailRes.ok) throw new Error(`Client detail failed: ${clientDetailRes.status}`);
  const clientDetail = (await clientDetailRes.json()) as any;
  await expect(!!clientDetail.client, 'client missing in detail');
  await expect(!!clientDetail.invoiceSummary, 'invoiceSummary missing in client detail');
  await expect(Array.isArray(clientDetail.invoices), 'invoices missing/invalid in client detail');
  console.log('Client detail OK (summary + invoices)');

  // List invoices and verify client is embedded by default
  const invoicesRes = await fetch(`${BASE}/v1/invoices`, {
    headers: { Authorization: `Bearer ${at}` },
  } as any);
  if (!invoicesRes.ok) throw new Error(`Invoices list failed: ${invoicesRes.status}`);
  const invoicesJson = (await invoicesRes.json()) as any;
  const invFirst = invoicesJson.items?.[0];
  await expect(invFirst !== undefined, 'At least one invoice expected');
  await expect(invFirst.client && invFirst.client.firstName, 'Embedded client missing in invoice');
  console.log('Invoices list OK (client embedded by default)');

  console.log('Smoke clients+invoices: SUCCESS');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
