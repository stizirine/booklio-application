#!/usr/bin/env tsx

import { config } from 'dotenv';
import mongoose from 'mongoose';

import { InvoiceStatuses, SupportedCurrencies } from '../src/modules/crm/invoices/index.js';

config();

async function showInvoiceTableSchema() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('✅ Connecté à MongoDB');

    console.log('\n📋 SCHÉMA DE LA TABLE INVOICES\n');
    console.log('┌─────────────────┬─────────────────┬─────────────────┬─────────────────┐');
    console.log('│ Champ           │ Type            │ Requis          │ Valeur par défaut│');
    console.log('├─────────────────┼─────────────────┼─────────────────┼─────────────────┤');
    console.log('│ _id             │ ObjectId        │ ✅              │ Auto-généré     │');
    console.log('│ tenantId        │ String          │ ✅              │ -               │');
    console.log('│ clientId        │ ObjectId        │ ✅              │ -               │');
    console.log('│ totalAmount     │ Number (≥0)     │ ✅              │ -               │');
    console.log('│ advanceAmount   │ Number (≥0)     │ ✅              │ 0               │');
    console.log('│ creditAmount    │ Number (≥0)     │ ✅              │ 0               │');
    console.log('│ currency        │ String (enum)   │ ✅              │ EUR             │');
    console.log('│ status          │ String (enum)   │ ✅              │ draft           │');
    console.log('│ notes           │ String          │ ❌              │ null            │');
    console.log('│ deletedAt       │ Date            │ ❌              │ null            │');
    console.log('│ createdAt       │ Date            │ ✅              │ Auto-généré     │');
    console.log('│ updatedAt       │ Date            │ ✅              │ Auto-généré     │');
    console.log('└─────────────────┴─────────────────┴─────────────────┴─────────────────┘');

    console.log('\n📊 ENUMS DISPONIBLES\n');

    console.log('🏷️  STATUTS (InvoiceStatuses):');
    Object.entries(InvoiceStatuses).forEach(([key, value]) => {
      console.log(`   ${key}: "${value}"`);
    });

    console.log('\n💰 DEVISES (SupportedCurrencies):');
    Object.entries(SupportedCurrencies).forEach(([key, value]) => {
      console.log(`   ${key}: "${value}"`);
    });

    console.log('\n🔢 CHAMPS CALCULÉS (Virtuals):');
    console.log('   remainingAmount: totalAmount - (advanceAmount + creditAmount)');

    console.log('\n📏 CONTRAINTES MÉTIER:');
    console.log('   • advanceAmount + creditAmount ≤ totalAmount');
    console.log('   • Status automatique basé sur les montants:');
    console.log('     - paid: si remainingAmount = 0 et totalAmount > 0');
    console.log('     - partial: si advanceAmount + creditAmount > 0 et remainingAmount > 0');
    console.log('     - draft: sinon');

    console.log('\n🔍 INDEX:');
    console.log('   • tenantId (pour la multi-tenancy)');
    console.log('   • clientId (pour les relations)');
    console.log('   • status (pour les filtres)');
    console.log('   • deletedAt (pour le soft delete)');

    // Afficher un exemple de document
    console.log('\n📄 EXEMPLE DE DOCUMENT:');
    const exampleDoc = {
      _id: '507f1f77bcf86cd799439011',
      tenantId: 'tenant-123',
      clientId: '507f1f77bcf86cd799439012',
      totalAmount: 1500,
      advanceAmount: 500,
      creditAmount: 100,
      currency: 'EUR',
      status: 'partial',
      notes: 'Développement site web - Acompte reçu',
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      remainingAmount: 900, // Calculé automatiquement
    };
    console.log(JSON.stringify(exampleDoc, null, 2));
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

showInvoiceTableSchema();
