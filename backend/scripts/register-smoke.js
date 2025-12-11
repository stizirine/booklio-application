import crypto from 'node:crypto';

import mongoose from 'mongoose';

import { User } from '../src/modules/users/model.js';
const BASE = process.env.BASE_URL || 'http://localhost:4000';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/booklio';
async function main() {
  const rnd = crypto.randomBytes(4).toString('hex');
  const email = `smoke_${rnd}@example.com`;
  const password = 'P@ssw0rd123';
  const tenantId = 't1';
  // Register
  const regRes = await fetch(`${BASE}/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ tenantId, email, password }),
  });
  if (!regRes.ok) {
    console.error('Register failed', regRes.status, await regRes.text());
    process.exit(1);
  }
  const reg = await regRes.json();
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
  });
  if (!loginRes.ok) {
    console.error('Login failed', loginRes.status, await loginRes.text());
    process.exit(1);
  }
  const login = await loginRes.json();
  const at = login?.tokens?.accessToken;
  if (!at) {
    console.error('Missing access token');
    process.exit(1);
  }
  console.log('Login OK');
  // Me
  const meRes = await fetch(`${BASE}/v1/auth/me`, {
    headers: { Authorization: `Bearer ${at}` },
  });
  if (!meRes.ok) {
    console.error('ME failed', meRes.status, await meRes.text());
    process.exit(1);
  }
  console.log('ME OK');
  // Cleanup direct DB via Mongoose
  await mongoose.connect(MONGO_URI);
  await User.deleteOne({ _id: userId });
  await mongoose.connection.close();
  console.log('Cleanup DB OK');
  console.log('Smoke register: SUCCESS');
}
main().catch(async (e) => {
  console.error(e);
  try {
    await mongoose.connection.close();
  } catch {}
  process.exit(1);
});
//# sourceMappingURL=register-smoke.js.map
