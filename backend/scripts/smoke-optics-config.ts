#!/usr/bin/env tsx
const BASE = process.env.BASE_URL || 'http://localhost:4000';
const email = process.env.SMOKE_EMAIL || 'ichbilia-optique@gmail.com';
const password = process.env.SMOKE_PASSWORD || 'OptiqueIchbilia2025!';
const tenantId = process.env.TENANT_ID || 'ichbilia-optique';

async function login(): Promise<string> {
  let res = await fetch(`${BASE}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  } as any);
  console.log('res', res);
  if (res.status === 401) {
    const reg = await fetch(`${BASE}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tenantId, email, password }),
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

async function main() {
  const at = await login();
  console.log('Login OK');
  const res = await fetch(`${BASE}/v1/optician/config`, {
    headers: { 
      Authorization: `Bearer ${at}`,
      'x-api-key': 'dev-key-12345'
    },
  } as any);
  if (!res.ok) throw new Error(`Config failed ${res.status}`);
  const cfg = (await res.json()) as any;
  if (!cfg?.lenses?.types || !Array.isArray(cfg.lenses.types))
    throw new Error('Missing lenses.types');
  if (!cfg?.contacts?.types || !Array.isArray(cfg.contacts.types))
    throw new Error('Missing contacts.types');
  if (!cfg?.prismBases || !Array.isArray(cfg.prismBases)) throw new Error('Missing prismBases');
  console.log('Config OK', {
    lensTypes: cfg.lenses.types.length,
    indices: cfg.lenses.indices.length,
    treatments: cfg.lenses.treatments.length,
  });
  console.log('Smoke optics config: SUCCESS');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
