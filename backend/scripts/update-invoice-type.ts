#!/usr/bin/env tsx
/**
 * Script pour mettre à jour le type d'une facture spécifique
 * 
 * Usage:
 *   MONGO_URI="mongodb://..." tsx scripts/update-invoice-type.ts <invoiceId> [type]
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

const invoiceId = process.argv[2] || '693dc0259677788ba95bef10';
const newType = process.argv[3] || 'InvoiceClient';

async function updateInvoiceType() {
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
    console.log(`   - Type actuel: ${(invoice as any).type || 'non défini'}\n`);

    // Mettre à jour le type
    console.log(`🔄 Mise à jour du type vers "${newType}"...`);
    (invoice as any).type = newType;
    
    await invoice.save();

    console.log(`✅ Facture mise à jour avec le type "${newType}"\n`);

    // Vérifier la mise à jour
    const updatedInvoice = await InvoiceModel.findById(invoiceId);
    if (updatedInvoice) {
      console.log(`📋 Vérification - Type après mise à jour: ${(updatedInvoice as any).type}`);
    }

    await mongoose.disconnect();
    console.log('\n✅ Déconnexion de MongoDB');
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

updateInvoiceType();

