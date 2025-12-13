#!/usr/bin/env tsx
/**
 * Script pour mettre à jour les items d'une facture spécifique
 * 
 * Usage:
 *   MONGO_URI="mongodb://..." tsx scripts/update-invoice-items.ts <invoiceId>
 */

import mongoose from 'mongoose';

import { InvoiceModel } from '../src/modules/crm/invoices/model.js';

// Essayer de lire depuis .env.dev ou utiliser les valeurs par défaut du docker-compose
const MONGO_PASSWORD = process.env.MONGO_PASSWORD || 'booklio_password';
// Encoder le mot de passe pour l'URI (gérer les caractères spéciaux comme @)
const encodedPassword = encodeURIComponent(MONGO_PASSWORD);
const MONGO_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  `mongodb://booklio:${encodedPassword}@localhost:27017/booklio?authSource=admin`;

const invoiceId = process.argv[2];

if (!invoiceId) {
  console.error('❌ Erreur: ID de facture requis');
  console.log('Usage: tsx scripts/update-invoice-items.ts <invoiceId>');
  process.exit(1);
}

const items = [
  {
    id: '1',
    name: 'Monture metal ENRP ',
    description: 'Monture metal ENRP ',
    quantity: 1,
    unitPrice: 400,
    category: 'frame' as const,
  },
  {
    id: '2',
    name: 'Verres organique 1.50 anti_reflect Cabelans',
    description: 'Verres organique 1.50 anti_reflect Cabelans',
    quantity: 1,
    unitPrice: 0,
    category: 'lens' as const,
  },
  {
    id: '3',
    name: 'V.OD3 Plan (1 1.25 à 180)',
    description: 'V.OD3 Plan (1 1.25 à 180)',
    quantity: 1,
    unitPrice: 100,
    category: 'lens' as const,
  },
  {
    id: '4',
    name: 'V.OG3 Plan (1.5 0.24 à 150)',
    description: 'V.OG3 Plan (1.5 0.24 à 150)',
    quantity: 1,
    unitPrice: 100,
    category: 'lens' as const,
  },
];

async function updateInvoiceItems() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    console.log(`🔍 Recherche de la facture ${invoiceId}...`);
    const invoice = await InvoiceModel.findById(invoiceId);

    if (!invoice) {
      console.error(`❌ Facture ${invoiceId} non trouvée`);
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`✅ Facture trouvée:`);
    console.log(`   - Client: ${invoice.clientId}`);
    console.log(`   - Montant total: ${invoice.totalAmount} ${invoice.currency}`);
    console.log(`   - Statut: ${invoice.status}`);
    console.log(`   - Items actuels: ${invoice.items?.length || 0}\n`);

    // Mettre à jour les items
    console.log('🔄 Mise à jour des items...');
    invoice.items = items as any;
    
    await invoice.save();

    console.log(`✅ Facture mise à jour avec ${items.length} items\n`);
    console.log('📋 Items ajoutés:');
    items.forEach((item, index) => {
      console.log(`   ${index + 1}. ${item.name} - ${item.unitPrice} ${invoice.currency} x ${item.quantity}`);
    });

    await mongoose.disconnect();
    console.log('\n✅ Déconnexion de MongoDB');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

updateInvoiceItems();

