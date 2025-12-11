#!/usr/bin/env tsx

import { config } from 'dotenv';
import mongoose from 'mongoose';
import { z } from 'zod';

import { InvoiceModel } from '../src/modules/crm/invoices/model.js';

config();

const Status = z.enum(['draft', 'partial', 'paid']);

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

async function bulkUpdateInvoiceStatus() {
  const argv = process.argv.slice(2);
  const args = parseArgs(argv);

  const tenantId = (args.tenantId as string) || 't1';
  const ids = (args.ids as string) || '';
  const clientId = (args.clientId as string) || '';
  const statusFrom = (args['status-from'] as string) || undefined;
  const statusTo = (args['status-to'] as string) || undefined;

  if (!statusTo || !Status.safeParse(statusTo).success) {
    console.error('❌ --status-to requis (draft|partial|paid)');
    process.exit(1);
  }

  const filter: any = { tenantId, deletedAt: null };
  if (ids)
    filter._id = {
      $in: ids
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
    };
  if (clientId) filter.clientId = clientId;
  if (statusFrom) {
    if (!Status.safeParse(statusFrom).success) {
      console.error('❌ --status-from invalide');
      process.exit(1);
    }
    filter.status = statusFrom;
  }

  await mongoose.connect(process.env.MONGO_URI!);
  console.log('✅ Connecté à MongoDB');

  const result = await InvoiceModel.updateMany(filter, {
    $set: { status: statusTo },
  });
  console.log('✅ Statut mis à jour pour', result.modifiedCount, 'factures');

  await mongoose.disconnect();
  console.log('✅ Déconnecté de MongoDB');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes('--help')) {
    console.log(
      'Usage: tsx scripts/invoice-status-bulk.ts --status-to <status> [--ids id1,id2] [--clientId <id>] [--status-from <status>] [--tenantId t1]'
    );
    process.exit(0);
  }
  bulkUpdateInvoiceStatus().catch((e) => {
    console.error('❌ Erreur:', e?.message || e);
    process.exit(1);
  });
}

export {};
