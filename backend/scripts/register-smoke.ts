import crypto from 'node:crypto';

const BASE = process.env.BASE_URL || 'http://localhost:4000';
// Récupérer la clé API depuis les variables d'environnement ou utiliser une valeur par défaut pour les tests
const API_KEY =
  process.env.REQUIRED_HEADER_VALUE ||
  process.env.REQUIRED_HEADER_VALUE_DEV ||
  process.env.REQUIRED_HEADER_VALUE_STAGING ||
  process.env.REQUIRED_HEADER_VALUE_PROD ||
  'test-api-key';

async function main() {
  const rnd = crypto.randomBytes(4).toString('hex');
  const email = `smoke_${rnd}@booklio.com`;
  const password = 'P@ssw0rd123';
  const tenantId = 't1';

  // Register
  const regRes = await fetch(`${BASE}/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, email, password }),
  } as any);
  if (!regRes.ok) {
    console.error('Register failed', regRes.status, await regRes.text());
    process.exit(1);
  }
  const reg = (await regRes.json()) as any;
  const userId = reg?.user?.id;
  if (!userId) {
    console.error('No user id from register');
    process.exit(1);
  }
  console.log('Register OK', email);

  // Login
  const loginRes = await fetch(`${BASE}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  } as any);
  if (!loginRes.ok) {
    console.error('Login failed', loginRes.status, await loginRes.text());
    process.exit(1);
  }
  const login = (await loginRes.json()) as any;
  const at = login?.tokens?.accessToken;
  if (!at) {
    console.error('Missing access token');
    process.exit(1);
  }
  console.log('Login OK');

  // Me
  const meHeaders: Record<string, string> = { Authorization: `Bearer ${at}` };
  if (API_KEY) {
    meHeaders['x-api-key'] = API_KEY;
  }
  const meRes = await fetch(`${BASE}/v1/auth/me`, {
    headers: meHeaders,
  } as any);
  if (!meRes.ok) {
    console.error('ME failed', meRes.status, await meRes.text());
    process.exit(1);
  }
  console.log('ME OK');

  // Cleanup via API endpoint
  const deleteHeaders: Record<string, string> = {};
  if (API_KEY) {
    deleteHeaders['x-api-key'] = API_KEY;
  }
  const deleteRes = await fetch(`${BASE}/__internal__/users/${userId}`, {
    method: 'DELETE',
    headers: deleteHeaders,
  } as any);
  if (!deleteRes.ok) {
    console.error('Cleanup failed', deleteRes.status, await deleteRes.text());
    process.exit(1);
  }
  console.log('Cleanup DB OK');

  console.log('Smoke register: SUCCESS');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
