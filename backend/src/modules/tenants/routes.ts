import express from 'express';

import type { TenantInfoResponse } from './types.js';

export const router = express.Router();

router.get('/me', (req, res) => {
  if (!req.tenant) return res.status(404).json({ error: 'tenant_not_found' });
  const payload: TenantInfoResponse = {
    tenantId: req.tenant.tenantId,
    clientType: req.tenant.clientType,
    capabilities: req.tenant.capabilities,
    featureFlags: req.tenant.featureFlags || {},
  };
  return res.json(payload);
});

router.get('/:id/capabilities', (req, res) => {
  const id = req.params.id;
  if (!req.tenant || req.tenant.tenantId !== id)
    return res.status(404).json({ error: 'tenant_not_found' });
  return res.json({ tenantId: id, capabilities: req.tenant.capabilities });
});
