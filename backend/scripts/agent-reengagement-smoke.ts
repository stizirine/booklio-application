/*
  Smoke test reengagement:
  - Récupère TENANT_ID
  - Appelle POST /v1/agent/reengagement/run?days=30&limit=50
*/
import fetch from 'node-fetch';

import { getTenantId } from './get-tenant-id.js';

async function main() {
  const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
  const accessToken = process.env.ACCESS_TOKEN || '';
  const tenantId = await getTenantId();
  if (!tenantId) throw new Error('TENANT_ID introuvable');

  const url = new URL('/v1/agent/reengagement/run', baseUrl);
  if (process.env.DAYS) url.searchParams.set('days', String(process.env.DAYS));
  if (process.env.LIMIT) url.searchParams.set('limit', String(process.env.LIMIT));

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Reengagement failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as unknown;
  console.log('reengagement result:', data);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
