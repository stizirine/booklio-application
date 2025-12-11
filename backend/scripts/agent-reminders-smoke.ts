#!/usr/bin/env tsx
// Smoke test: login then trigger reminders run endpoint

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

async function runReminders(token: string) {
  const window = process.env.WINDOW_MINUTES ? `?windowMinutes=${process.env.WINDOW_MINUTES}` : '';
  const res = await fetch(`${BASE_URL}/v1/agent/reminders/run${window}`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`Run failed: ${res.status}`);
  const json = await res.json();
  console.log('Reminders run:', json);
}

async function main() {
  const token = await login();
  console.log('Login OK');
  await runReminders(token);
  console.log('Agent reminders smoke: SUCCESS');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
