import { ClientType } from '../modules/tenants/model.js';
import { tenantRegistry } from '../modules/tenants/registry.js';

import type { Capability, FeatureFlag } from '../modules/tenants/types.js';
import type { NextFunction, Request, Response } from 'express';

declare module 'express-serve-static-core' {
  interface Request {
    tenant?: {
      tenantId: string;
      clientType: ClientType;
      capabilities: Capability[];
      featureFlags?: Partial<Record<FeatureFlag, boolean>>;
      currency?: string;
    };
  }
}

export function resolveTenant(req: Request, _res: Response, next: NextFunction) {
  // Resolve tenantId from JWT, header, query, or default
  const headerTid = (req.headers['x-tenant-id'] as string | undefined)?.trim();
  const queryTid = (req.query.tenantId as string | undefined)?.trim();
  const jwtTid = (req as unknown as { user?: { tenantId?: string } }).user?.tenantId;
  const tenantId = headerTid || queryTid || jwtTid || 't1';

  const cfg = tenantRegistry.get(tenantId);
  if (cfg) {
    req.tenant = {
      tenantId: cfg.tenantId,
      clientType: cfg.clientType,
      capabilities: cfg.capabilities,
      featureFlags: cfg.featureFlags ?? {},
      ...(cfg.currency !== undefined && { currency: cfg.currency }),
    };
  }
  return next();
}

export function requireModule(moduleId: Capability) {
  return (req: Request, res: Response, next: NextFunction) => {
    // Si resolveTenant n'a pas encore été appelé, l'appeler maintenant
    if (!req.tenant) {
      resolveTenant(req, res, () => {});
    }
    
    const caps = req.tenant?.capabilities || [];
    if (!caps.includes(moduleId)) return res.status(403).json({ error: 'module_forbidden' });
    return next();
  };
}
