#!/usr/bin/env tsx
const BASE = process.env.BASE_URL || 'http://localhost:4000';
const email = process.env.SMOKE_EMAIL || 'admin@booklio.com';
const password = process.env.SMOKE_PASSWORD || 'P@ssw0rd123';

async function login(): Promise<{ at: string; rt: string }> {
  let res = await fetch(`${BASE}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  } as any);
  if (res.status === 401) {
    const reg = await fetch(`${BASE}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: 't1', email, password }),
    } as any);
    if (!reg.ok && reg.status !== 409) throw new Error(`Register failed ${reg.status}`);
    res = await fetch(`${BASE}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    } as any);
  }
  if (!res.ok) throw new Error(`Login failed ${res.status}`);
  const json = (await res.json()) as any;
  return { at: json?.tokens?.accessToken, rt: json?.tokens?.refreshToken };
}

async function main() {
  const { at } = await login();
  console.log('Login OK');

  const create = await fetch(`${BASE}/v1/optician/prescriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${at}` },
    body: JSON.stringify({
      clientId: 'client-smoke-1',
      kind: 'glasses',
      correction: { od: { sphere: -2, cylinder: -0.5, axis: 180 }, og: { sphere: -1.75 } },
      glassesParams: { lensType: 'single_vision', index: '1.60', treatments: ['anti_reflect'] },
      issuedAt: new Date().toISOString(),
      notes: 'smoke',
    }),
  } as any);
  if (!create.ok) throw new Error(`Create failed ${create.status} ${await create.text()}`);
  const created = (await create.json()) as any;
  const id = created?.prescription?._id as string;
  if (!id) throw new Error('Missing id');
  console.log('Create OK', id);

  const list = await fetch(`${BASE}/v1/optician/prescriptions?clientId=client-smoke-1`, {
    headers: { Authorization: `Bearer ${at}` },
  } as any);
  if (!list.ok) throw new Error(`List failed ${list.status}`);
  const listed = (await list.json()) as any;
  if (!Array.isArray(listed.items) || listed.items.length === 0) throw new Error('List empty');
  console.log('List OK', listed.items.length);

  const get = await fetch(`${BASE}/v1/optician/prescriptions/${id}`, {
    headers: { Authorization: `Bearer ${at}` },
  } as any);
  if (!get.ok) throw new Error(`Get failed ${get.status}`);
  console.log('Get OK');

  const patch = await fetch(`${BASE}/v1/optician/prescriptions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${at}` },
    body: JSON.stringify({ notes: 'smoke-updated' }),
  } as any);
  if (!patch.ok) throw new Error(`Patch failed ${patch.status}`);
  console.log('Patch OK');

  const del = await fetch(`${BASE}/v1/optician/prescriptions/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${at}` },
  } as any);
  if (!del.ok) throw new Error(`Delete failed ${del.status}`);
  console.log('Delete OK');

  console.log('Smoke prescriptions: SUCCESS');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
