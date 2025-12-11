#!/usr/bin/env tsx
const BASE = process.env.BASE_URL || 'http://localhost:4000';
const email = process.env.SMOKE_EMAIL || 'admin@booklio.com';
const password = process.env.SMOKE_PASSWORD || 'P@ssw0rd123';

async function login(): Promise<string> {
  let res = await fetch(`${BASE}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  } as any);
  if (res.status === 401) {
    await fetch(`${BASE}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId: 't1', email, password }),
    } as any);
    res = await fetch(`${BASE}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    } as any);
  }
  if (!res.ok) throw new Error(`Login failed ${res.status}`);
  const json = (await res.json()) as any;
  return json?.tokens?.accessToken as string;
}

async function main() {
  const at = await login();
  console.log('Login OK');

  // Create baseline prescription (glasses)
  const createRes = await fetch(`${BASE}/v1/optician/prescriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${at}` },
    body: JSON.stringify({
      clientId: 'client-patch-partial',
      kind: 'glasses',
      correction: { od: { sphere: -1 }, og: { sphere: -0.5 } },
      glassesParams: {
        lensType: 'single_vision',
        index: '1.60',
        treatments: ['anti_reflect'],
        frame: {
          type: 'semi_rim',
          eye: 52,
          bridge: 17,
          temple: 140,
          material: 'acetate',
        },
      },
      issuedAt: new Date().toISOString(),
      notes: 'partial-patch-test',
    }),
  } as any);
  if (!createRes.ok) throw new Error(`Create failed ${createRes.status} ${await createRes.text()}`);
  const created = (await createRes.json()) as any;
  const id = created?.prescription?._id as string;
  if (!id) throw new Error('Missing id');
  console.log('Create OK', id);

  // PATCH only lensType
  const patchRes = await fetch(`${BASE}/v1/optician/prescriptions/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${at}` },
    body: JSON.stringify({ glassesParams: { lensType: 'progressive' } }),
  } as any);
  if (!patchRes.ok) throw new Error(`Patch failed ${patchRes.status} ${await patchRes.text()}`);
  const patched = (await patchRes.json()) as any;
  const gp = patched?.prescription?.glassesParams;
  if (!gp) throw new Error('Missing glassesParams after patch');
  if (gp.lensType !== 'progressive') throw new Error('lensType not updated');
  if (gp.index !== '1.60') throw new Error('index should remain unchanged');
  if (!Array.isArray(gp.treatments) || gp.treatments[0] !== 'anti_reflect')
    throw new Error('treatments should remain unchanged');
  console.log('Patch partial OK');

  // Cleanup
  await fetch(`${BASE}/v1/optician/prescriptions/${id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${at}` },
  } as any);
  console.log('Cleanup OK');
  console.log('Smoke prescriptions partial patch: SUCCESS');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
