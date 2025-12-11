#!/usr/bin/env tsx

const BASE_URL = process.env.BASE_URL || 'http://localhost:4000';

async function main() {
  const r = await fetch(`${BASE_URL}/v1/tenants/me`, { headers: { 'x-tenant-id': 't1' } });
  if (!r.ok) throw new Error(`GET /v1/tenants/me failed: ${r.status}`);
  const me = (await r.json()) as {
    tenantId: string;
    clientType: string;
    capabilities: string[];
    featureFlags?: Record<string, boolean>;
  };
  console.log('tenants/me:', me);

  const r2 = await fetch(`${BASE_URL}/v1/tenants/${me.tenantId}/capabilities`);
  if (!r2.ok) throw new Error(`GET /v1/tenants/:id/capabilities failed: ${r2.status}`);
  const caps = (await r2.json()) as { tenantId: string; capabilities: string[] };
  console.log('capabilities:', caps);

  if (me.tenantId !== caps.tenantId) throw new Error('Tenant mismatch');
  if (!Array.isArray(caps.capabilities)) throw new Error('Capabilities not array');
  console.log('Integration tenants: SUCCESS');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
