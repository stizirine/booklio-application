import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import { ClientType, TenantModel } from './model.js';
import { Capability, FeatureFlag } from './types.js';

import type { TenantConfig } from './types.js';

// Default registry by profile (ENV)
const PROFILE_DEFAULTS: Record<string, Omit<TenantConfig, 'tenantId'>> = {
  generic: {
    clientType: ClientType.Generic,
    capabilities: [],
    featureFlags: {} as Partial<Record<FeatureFlag, boolean>>,
    currency: 'EUR',
  },
  optician: {
    clientType: ClientType.Optician,
    capabilities: [Capability.Optics],
    featureFlags: { [FeatureFlag.OpticsMeasurements]: true } as Partial<
      Record<FeatureFlag, boolean>
    >,
    currency: 'EUR',
  },
};

function readJsonSafe(filePath: string): unknown | undefined {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(raw) as unknown;
  } catch {
    return undefined;
  }
}

export class TenantRegistry {
  private byTenantId: Map<string, TenantConfig> = new Map();

  async load(): Promise<void> {
    this.byTenantId.clear();

    const profile = process.env.TENANT_PROFILE || ClientType.Generic;
    const resolvedDefaults: Omit<TenantConfig, 'tenantId'> =
      (PROFILE_DEFAULTS[profile] as Omit<TenantConfig, 'tenantId'>) ||
      (PROFILE_DEFAULTS.generic as Omit<TenantConfig, 'tenantId'>);

    // Load from DB first
    try {
      const docs = await TenantModel.find({}).lean();
      for (const t of docs) {
        const cfg: TenantConfig = {
          tenantId: t.tenantId,
          clientType: t.clientType,
          capabilities: Array.isArray(t.capabilities) ? t.capabilities : [],
          featureFlags: (t.featureFlags as Record<string, boolean>) || {},
          ...(t.currency !== undefined && { currency: t.currency }),
        };
        this.byTenantId.set(cfg.tenantId, cfg);
      }
    } catch {
      // ignore if DB not ready
    }

    // Load from tenants/*.json if provided (only for tenants not already in DB)
    const explicitDir = process.env.TENANTS_DIR;
    const moduleDir = path.dirname(fileURLToPath(import.meta.url));
    // project root = src/modules/tenants -> go up three levels
    const projectRoot = path.resolve(moduleDir, '../../..');
    const dir = explicitDir ? path.resolve(explicitDir) : path.join(projectRoot, 'tenants');
    if (fs.existsSync(dir)) {
      const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'));
      for (const f of files) {
        const data = readJsonSafe(path.join(dir, f));
        if (!data || typeof data !== 'object') continue;
        const j = data as Partial<TenantConfig>;
        if (!j.tenantId) continue;
        
        // Only load from JSON if tenant doesn't exist in DB
        if (this.byTenantId.has(j.tenantId)) {
          continue;
        }
        
        const cfg: TenantConfig = {
          tenantId: j.tenantId,
          clientType: j.clientType || resolvedDefaults.clientType,
          capabilities: Array.isArray(j.capabilities)
            ? j.capabilities
            : resolvedDefaults.capabilities,
          featureFlags: {
            ...(resolvedDefaults.featureFlags || {}),
            ...(j.featureFlags || {}),
          },
          ...((j.currency !== undefined || resolvedDefaults.currency !== undefined) && {
            currency: j.currency || resolvedDefaults.currency,
          }),
        };
        this.byTenantId.set(cfg.tenantId, cfg);
      }
    }

    // Fallback: ENV defaults for known test tenant t1
    if (!this.byTenantId.has('t1')) {
      this.byTenantId.set('t1', { tenantId: 't1', ...resolvedDefaults });
    }
  }

  get(tenantId: string): TenantConfig | undefined {
    return this.byTenantId.get(tenantId);
  }
}

export const tenantRegistry = new TenantRegistry();
