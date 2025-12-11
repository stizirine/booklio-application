#!/usr/bin/env tsx
// Récupère le tenantId via l'API /v1/auth/me pour un utilisateur (par défaut test@booklio.com)

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';
const EMAIL = process.env.EMAIL || 'test@booklio.com';
const PASSWORD = process.env.PASSWORD || 'password123';

async function login(): Promise<string> {
  const res = await fetch(`${BASE_URL}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: EMAIL, password: PASSWORD }),
  });
  if (!res.ok) throw new Error(`Login failed: ${res.status}`);
  const json = (await res.json()) as { tokens: { accessToken: string } };
  return json.tokens.accessToken;
}

async function me(token: string) {
  const res = await fetch(`${BASE_URL}/v1/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`me failed: ${res.status}`);
  return (await res.json()) as { tenantId: string };
}

async function main() {
  const token = await login();
  const info = await me(token);
  console.log(info.tenantId);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
