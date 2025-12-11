#!/usr/bin/env tsx

import { config } from 'dotenv';
import mongoose from 'mongoose';

import { TenantModel } from '../src/modules/tenants/model.js';
import { Capability, FeatureFlag } from '../src/modules/tenants/types.js';

config();

function normalizeCapabilities(oldCaps: unknown): [Capability[], Record<FeatureFlag, boolean>] {
  const modules = new Set<string>();
  const featureFlags: Partial<Record<FeatureFlag, boolean>> = {};

  const caps = Array.isArray(oldCaps) ? (oldCaps as unknown[]) : [];
  for (const c of caps) {
    if (typeof c !== 'string') continue;
    switch (c) {
      case 'optician.measurements':
      case FeatureFlag.OpticsMeasurements:
      case FeatureFlag.OpticsPrescriptions:
      case FeatureFlag.OpticsPrint:
        modules.add(Capability.Optics);
        // Fine-grained capabilities become feature flags
        if (c === FeatureFlag.OpticsMeasurements)
          featureFlags[FeatureFlag.OpticsMeasurements] = true;
        if (c === FeatureFlag.OpticsPrescriptions)
          featureFlags[FeatureFlag.OpticsPrescriptions] = true;
        if (c === FeatureFlag.OpticsPrint) featureFlags[FeatureFlag.OpticsPrint] = true;
        break;
      case Capability.Dashboard:
      case Capability.Clients:
      case Capability.Appointments:
      case Capability.Invoices:
      case Capability.Optics:
        modules.add(c);
        break;
      default:
        // ignore unknown
        break;
    }
  }
  return [Array.from(modules) as Capability[], featureFlags as Record<FeatureFlag, boolean>];
}

async function migrate() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const tenantIdArgIdx = args.findIndex((a) => a === '--tenantId');
  const tenantIdFilter = tenantIdArgIdx >= 0 ? args[tenantIdArgIdx + 1] : undefined;

  const uri = process.env.MONGO_URI as string;
  if (!uri) {
    console.error('MONGO_URI manquant');
    process.exit(1);
  }
  await mongoose.connect(uri);
  console.log('Connecté à MongoDB');

  const query: Record<string, unknown> = tenantIdFilter ? { tenantId: tenantIdFilter } : {};
  const cursor = TenantModel.find(query).cursor();
  let updated = 0;
  for await (const t of cursor) {
    const [newCaps, newFlagsAny] = normalizeCapabilities(t.capabilities);
    const newFlags = {
      ...(t.featureFlags as Record<string, boolean>),
      ...newFlagsAny,
    } as Record<FeatureFlag, boolean>;

    const capsChanged = JSON.stringify(t.capabilities || []) !== JSON.stringify(newCaps);
    const flagsChanged = JSON.stringify(t.featureFlags || {}) !== JSON.stringify(newFlags);

    if (capsChanged || flagsChanged) {
      if (dryRun) {
        console.log(`▶️  ${t.tenantId}:`);
        if (capsChanged) {
          console.log('  capabilities:', t.capabilities, '=>', newCaps);
        }
        if (flagsChanged) {
          console.log('  featureFlags:', t.featureFlags, '=>', newFlags);
        }
      } else {
        await TenantModel.updateOne(
          { _id: t._id },
          { $set: { capabilities: newCaps, featureFlags: newFlags } }
        );
        updated += 1;
        console.log(`✅ Tenant ${t.tenantId} mis à jour`);
      }
    }
  }

  console.log(`Terminée. Tenants ${dryRun ? 'différents' : 'modifiés'}: ${updated}`);
  await mongoose.disconnect();
}

if (import.meta.url === `file://${process.argv[1]}`) {
  migrate().catch((e) => {
    console.error('Erreur migration:', e?.message || e);
    process.exit(1);
  });
}

export {};
