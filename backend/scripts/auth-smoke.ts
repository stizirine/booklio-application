const BASE = process.env.BASE_URL || 'http://localhost:4000';
const email = process.env.SMOKE_EMAIL || 'admin@booklio.com';
const password = process.env.SMOKE_PASSWORD || 'P@ssw0rd123';
// Récupérer la clé API depuis les variables d'environnement ou utiliser une valeur par défaut pour les tests
const API_KEY =
  process.env.REQUIRED_HEADER_VALUE ||
  process.env.REQUIRED_HEADER_VALUE_DEV ||
  process.env.REQUIRED_HEADER_VALUE_STAGING ||
  process.env.REQUIRED_HEADER_VALUE_PROD ||
  'test-api-key';

async function tryLogin() {
  const res = await fetch(`${BASE}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  } as any);
  return res;
}

async function main() {
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
  const loginJson = (await loginRes.json()) as any;
  const at = loginJson?.tokens?.accessToken;
  const rt = loginJson?.tokens?.refreshToken;
  if (!at || !rt) {
    console.error('Missing tokens in login response');
    process.exit(1);
  }
  console.log('Login OK');

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

  const refreshRes = await fetch(`${BASE}/v1/auth/refresh`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${rt}` },
  } as any);
  if (!refreshRes.ok) {
    console.error('Refresh failed', refreshRes.status, await refreshRes.text());
    process.exit(1);
  }
  console.log('Refresh OK');

  console.log('Smoke auth: SUCCESS');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
