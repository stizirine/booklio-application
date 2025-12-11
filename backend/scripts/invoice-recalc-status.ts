#!/usr/bin/env tsx

import { config } from 'dotenv';
import mongoose from 'mongoose';

import { InvoiceModel } from '../src/modules/crm/invoices/model.js';

config();

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

function computeStatus(
  total: number,
  advance: number,
  credit: number
): 'draft' | 'partial' | 'paid' {
  const paid = (advance || 0) + (credit || 0);
  const remaining = Math.max(0, (total || 0) - paid);
  if ((total || 0) > 0 && remaining === 0) return 'paid';
  if (paid > 0 && remaining > 0) return 'partial';
  return 'draft';
}

async function recalc() {
  const args = parseArgs(process.argv.slice(2));
  const tenantId = (args.tenantId as string) || 't1';
  const dryRun = Boolean(args['dry-run']);
  const clientId = (args.clientId as string) || '';

  await mongoose.connect(process.env.MONGO_URI!);
  console.log('✅ Connecté à MongoDB');

  const filter: any = { tenantId, deletedAt: null };
  if (clientId) filter.clientId = clientId;

  const cursor = InvoiceModel.find(filter).cursor();
  let scanned = 0;
  let changed = 0;
  for await (const inv of cursor) {
    scanned += 1;
    const desired = computeStatus(
      inv.totalAmount || 0,
      inv.advanceAmount || 0,
      inv.creditAmount || 0
    );
    if (inv.status !== desired) {
      changed += 1;
      if (!dryRun) {
        await InvoiceModel.updateOne({ _id: inv._id }, { $set: { status: desired } });
      }
      console.log(`→ ${inv._id} ${inv.status} -> ${desired}`);
    }
  }

  console.log(`📊 Parcouru: ${scanned}, Changé: ${changed}${dryRun ? ' (dry-run)' : ''}`);
  await mongoose.disconnect();
  console.log('✅ Déconnecté de MongoDB');
}

if (import.meta.url === `file://${process.argv[1]}`) {
  if (process.argv.includes('--help')) {
    console.log(
      'Usage: tsx scripts/invoice-recalc-status.ts [--tenantId t1] [--clientId <id>] [--dry-run]'
    );
    process.exit(0);
  }
  recalc().catch((e) => {
    console.error('❌ Erreur:', e?.message || e);
    process.exit(1);
  });
}

export {};
