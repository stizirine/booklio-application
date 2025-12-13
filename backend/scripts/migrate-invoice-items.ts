#!/usr/bin/env tsx
/**
 * Migration : Ajouter le champ items aux factures existantes
 * 
 * Ce script ajoute le champ items (tableau vide par défaut) à toutes les factures
 * qui n'ont pas encore ce champ dans la base de données.
 * 
 * Usage:
 *   MONGO_URI="mongodb://..." tsx scripts/migrate-invoice-items.ts
 */

import mongoose from 'mongoose';

import { InvoiceModel } from '../src/modules/crm/invoices/model.js';

const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  'mongodb://booklio:booklio_password@localhost:27017/booklio?authSource=admin';

async function migrateInvoiceItems() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Trouver toutes les factures qui n'ont pas le champ items
    console.log('🔍 Recherche des factures sans champ items...');
    const invoicesWithoutItems = await InvoiceModel.find({
      $or: [
        { items: { $exists: false } },
        { items: null },
      ],
    });

    const count = invoicesWithoutItems.length;
    console.log(`📊 Trouvé ${count} facture(s) sans champ items\n`);

    if (count === 0) {
      console.log('✅ Toutes les factures ont déjà le champ items');
      await mongoose.disconnect();
      return;
    }

    // Ajouter le champ items (tableau vide) à toutes ces factures
    console.log('🔄 Ajout du champ items aux factures...');
    const result = await InvoiceModel.updateMany(
      {
        $or: [
          { items: { $exists: false } },
          { items: null },
        ],
      },
      {
        $set: {
          items: [],
        },
      }
    );

    console.log(`✅ ${result.modifiedCount} facture(s) mise(s) à jour\n`);

    // Vérification
    const remaining = await InvoiceModel.countDocuments({
      $or: [
        { items: { $exists: false } },
        { items: null },
      ],
    });

    if (remaining === 0) {
      console.log('✅ Migration terminée avec succès !');
    } else {
      console.log(`⚠️  Attention: ${remaining} facture(s) n'ont toujours pas le champ items`);
    }

    await mongoose.disconnect();
    console.log('✅ Déconnexion de MongoDB');
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

migrateInvoiceItems();

