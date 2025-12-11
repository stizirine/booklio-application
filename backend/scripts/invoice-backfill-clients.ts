#!/usr/bin/env tsx

import { config } from 'dotenv';
import mongoose from 'mongoose';

import { ClientModel } from '../src/modules/crm/clients/model.js';
import { InvoiceModel } from '../src/modules/crm/invoices/model.js';

config();

async function backfillInvoiceClients() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('✅ Connecté à MongoDB');

    const tenantId = 't1';

    const clients = await ClientModel.find({ tenantId, deletedAt: null }).select({
      _id: 1,
      email: 1,
      firstName: 1,
      lastName: 1,
    });
    if (clients.length === 0) {
      console.log('❌ Aucun client trouvé pour le tenant');
      process.exit(1);
    }
    console.log(`👥 ${clients.length} clients trouvés`);

    const clientIds = new Set(clients.map((c) => String(c._id)));

    const invoices = await InvoiceModel.find({ tenantId }).select({ _id: 1, clientId: 1 });
    console.log(`🧾 ${invoices.length} factures à vérifier`);

    let fixedMissing = 0;
    let fixedInvalid = 0;
    let checked = 0;

    for (const inv of invoices) {
      checked += 1;
      const cid = inv.clientId ? String(inv.clientId) : '';
      if (!cid) {
        // Assigner round-robin un client existant
        const chosen = clients[fixedMissing % clients.length];
        await InvoiceModel.updateOne({ _id: inv._id }, { $set: { clientId: chosen._id } });
        fixedMissing += 1;
        continue;
      }
      if (!clientIds.has(cid)) {
        const chosen = clients[fixedInvalid % clients.length];
        await InvoiceModel.updateOne({ _id: inv._id }, { $set: { clientId: chosen._id } });
        fixedInvalid += 1;
      }
    }

    console.log(
      `✅ Backfill terminé. Vérifiées: ${checked}, corrigées (missing): ${fixedMissing}, corrigées (invalid): ${fixedInvalid}`
    );
  } catch (e) {
    console.error('❌ Erreur backfill:', e);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

backfillInvoiceClients();
