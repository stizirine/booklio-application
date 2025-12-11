#!/usr/bin/env tsx

import { config } from 'dotenv';
import mongoose from 'mongoose';
import { z } from 'zod';

import { AppointmentModel } from '../src/modules/crm/appointments/model.js';
import { AppointmentStatusValues } from '../src/modules/crm/appointments/status.js';

config();

const Status = z.enum([...AppointmentStatusValues]);

function parseArgs(argv: string[]) {
  const args: Record<string, string | boolean> = {};
  for (let i = 0; i < argv.length; i++) {
    const key = argv[i];
    const next = argv[i + 1];
    if (key.startsWith('--')) {
      if (!next || next.startsWith('--')) {
        args[key.slice(2)] = true;
      } else {
        args[key.slice(2)] = next;
        i++;
      }
    }
  }
  return args;
}

async function bulkUpdateStatus() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);

  const tenantId = (args.tenantId as string) || 't1';
  const ids = (args.ids as string) || '';
  const from = args.from as string | undefined;
  const to = args.to as string | undefined;
  const statusFrom = (args['status-from'] as string) || undefined;
  const statusTo = (args['status-to'] as string) || undefined;

  if (!statusTo || !Status.safeParse(statusTo).success) {
    console.error('❌ --status-to requis:', [...AppointmentStatusValues].join('|'));
    process.exit(1);
  }

  const filter: any = { tenantId, deletedAt: null };
  if (ids) {
    filter._id = {
      $in: ids
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };
  }
  if (from || to) {
    filter.startAt = {};
    if (from) filter.startAt.$gte = new Date(from);
    if (to) filter.startAt.$lte = new Date(to);
  }
  if (statusFrom) {
    if (!Status.safeParse(statusFrom).success) {
      console.error('❌ --status-from invalide');
      process.exit(1);
    }
    filter.status = statusFrom;
  }

  await mongoose.connect(process.env.MONGO_URI!);
  console.log('✅ Connecté à MongoDB');

  const result = await AppointmentModel.updateMany(filter, {
    $set: { status: statusTo },
  });
  console.log('✅ Statut mis à jour pour', result.modifiedCount, 'rendez-vous');

  await mongoose.disconnect();
  console.log('✅ Déconnecté de MongoDB');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes('--help')) {
    console.log(
      'Usage: tsx scripts/appt-status-bulk.ts --status-to <status> [--ids id1,id2] [--from ISO] [--to ISO] [--status-from <status>] [--tenantId t1]'
    );
    process.exit(0);
  }
  bulkUpdateStatus().catch((e) => {
    console.error('❌ Erreur:', e?.message || e);
    process.exit(1);
  });
}

export {};
