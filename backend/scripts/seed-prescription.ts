#!/usr/bin/env tsx
const BASE = process.env.BASE_URL || 'http://localhost:4000';
const email = process.env.SMOKE_EMAIL || 'admin@booklio.com';
const password = process.env.SMOKE_PASSWORD || 'P@ssw0rd123';
const clientId = process.env.CLIENT_ID || 'client-seed-1';

async function login(): Promise<string> {
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
  return json?.tokens?.accessToken as string;
}

async function seed() {
  const at = await login();
  // Glasses
  const bodyGlasses = {
    clientId,
    kind: 'glasses',
    correction: { od: { sphere: -2, cylinder: -0.5, axis: 180 }, og: { sphere: -1.75 } },
    glassesParams: { lensType: 'single_vision', index: '1.60', treatments: ['anti_reflect'] },
    issuedAt: new Date().toISOString(),
    notes: 'seed-glasses',
  };
  const res1 = await fetch(`${BASE}/v1/optician/prescriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${at}` },
    body: JSON.stringify(bodyGlasses),
  } as any);
  if (!res1.ok) throw new Error(`Create glasses failed ${res1.status} ${await res1.text()}`);
  const j1 = (await res1.json()) as any;
  console.log('Glasses OK', j1?.prescription?._id);

  // Contacts
  const bodyContacts = {
    clientId,
    kind: 'contacts',
    correction: { od: { sphere: -2 }, og: { sphere: -1.75 } },
    contactLensParams: {
      type: 'soft',
      design: 'spherical',
      material: { family: 'si_hydrogel' },
      schedule: { wear: 'daily', replacement: 'daily' },
      geometry: { bc: 8.6, dia: 14.1 },
    },
    issuedAt: new Date().toISOString(),
    notes: 'seed-contacts',
  };
  const res2 = await fetch(`${BASE}/v1/optician/prescriptions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${at}` },
    body: JSON.stringify(bodyContacts),
  } as any);
  if (!res2.ok) throw new Error(`Create contacts failed ${res2.status} ${await res2.text()}`);
  const j2 = (await res2.json()) as any;
  console.log('Contacts OK', j2?.prescription?._id);

  console.log('Seed prescriptions: DONE');
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
