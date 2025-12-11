const BASE = process.env.BASE_URL || 'http://localhost:4000';
const email = process.env.SMOKE_EMAIL || 'admin@booklio.com';
const password = process.env.SMOKE_PASSWORD || 'P@ssw0rd123';
async function main() {
  const loginRes = await fetch(`${BASE}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  if (!loginRes.ok) {
    console.error('Login failed', loginRes.status, await loginRes.text());
    process.exit(1);
  }
  const loginJson = await loginRes.json();
  const at = loginJson?.tokens?.accessToken;
  const rt = loginJson?.tokens?.refreshToken;
  if (!at || !rt) {
    console.error('Missing tokens in login response');
    process.exit(1);
  }
  console.log('Login OK');
  const meRes = await fetch(`${BASE}/v1/auth/me`, {
    headers: { Authorization: `Bearer ${at}` },
  });
  if (!meRes.ok) {
    console.error('ME failed', meRes.status, await meRes.text());
    process.exit(1);
  }
  console.log('ME OK');
  const refreshRes = await fetch(`${BASE}/v1/auth/refresh`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${rt}` },
  });
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
export {};
//# sourceMappingURL=auth-smoke.js.map
