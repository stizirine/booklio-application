#!/usr/bin/env tsx

import { config } from 'dotenv';
import mongoose from 'mongoose';

import { ClientModel } from '../src/modules/crm/clients/model.js';
import { InvoiceModel, SupportedCurrencies } from '../src/modules/crm/invoices/index.js';

config();

async function createTestInvoices() {
  try {
    await mongoose.connect(process.env.MONGO_URI as string);
    console.log('✅ Connecté à MongoDB');

    // Utiliser le tenantId de l'utilisateur admin par défaut
    const tenantId = 't1'; // Même tenantId que l'utilisateur admin

    // Nettoyer les données existantes pour ce tenant
    await InvoiceModel.deleteMany({ tenantId });
    console.log('🧹 Factures existantes supprimées');

    // Créer des clients de test s'ils n'existent pas
    let client1 = await ClientModel.findOne({ email: 'test.client1@example.com', tenantId });
    if (!client1) {
      client1 = await ClientModel.create({
        tenantId,
        firstName: 'Jean',
        lastName: 'Dupont',
        email: 'test.client1@example.com',
        phone: '0123456789',
        address: '123 Rue de la Paix, 75001 Paris',
        deletedAt: null,
      });
      console.log('👤 Client 1 créé:', client1._id);
    }

    let client2 = await ClientModel.findOne({ email: 'test.client2@example.com', tenantId });
    if (!client2) {
      client2 = await ClientModel.create({
        tenantId,
        firstName: 'Marie',
        lastName: 'Martin',
        email: 'test.client2@example.com',
        phone: '0987654321',
        address: '456 Avenue des Champs, 69000 Lyon',
        deletedAt: null,
      });
      console.log('👤 Client 2 créé:', client2._id);
    }

    // Créer des factures de test avec différents statuts et devises
    const testInvoices = [
      {
        tenantId,
        clientId: client1._id,
        totalAmount: 1000,
        advanceAmount: 0,
        creditAmount: 0,
        currency: SupportedCurrencies.EUR,
        notes: 'Consultation initiale - Projet web',
      },
      {
        tenantId,
        clientId: client1._id,
        totalAmount: 2500,
        advanceAmount: 500,
        creditAmount: 0,
        currency: SupportedCurrencies.EUR,
        notes: 'Développement site e-commerce - Acompte reçu',
      },
      {
        tenantId,
        clientId: client1._id,
        totalAmount: 1500,
        advanceAmount: 1000,
        creditAmount: 200,
        currency: SupportedCurrencies.EUR,
        notes: 'Maintenance mensuelle - Solde partiel',
      },
      {
        tenantId,
        clientId: client2._id,
        totalAmount: 800,
        advanceAmount: 800,
        creditAmount: 0,
        currency: SupportedCurrencies.USD,
        notes: 'Formation React - Paiement complet',
      },
      {
        tenantId,
        clientId: client2._id,
        totalAmount: 3200,
        advanceAmount: 0,
        creditAmount: 0,
        currency: SupportedCurrencies.GBP,
        notes: 'Audit sécurité - En attente de paiement',
      },
      {
        tenantId,
        clientId: client2._id,
        totalAmount: 500,
        advanceAmount: 300,
        creditAmount: 0,
        currency: SupportedCurrencies.CAD,
        notes: 'Support technique - Paiement partiel',
      },
    ];

    const createdInvoices = await InvoiceModel.insertMany(testInvoices);
    console.log(`✅ ${createdInvoices.length} factures de test créées`);

    // Afficher le résumé des factures créées
    console.log('\n📊 Résumé des factures créées:');
    for (const invoice of createdInvoices) {
      const remaining = invoice.totalAmount - (invoice.advanceAmount + invoice.creditAmount);
      console.log(
        `- ${invoice._id}: ${invoice.totalAmount} ${invoice.currency} (${invoice.status}) - Restant: ${remaining}`
      );
    }

    // Afficher les statistiques par statut
    const stats = await InvoiceModel.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    console.log('\n📈 Statistiques par statut:');
    stats.forEach((stat) => {
      console.log(`- ${stat._id}: ${stat.count} factures`);
    });

    // Afficher les statistiques par devise
    const currencyStats = await InvoiceModel.aggregate([
      { $group: { _id: '$currency', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);
    console.log('\n💰 Statistiques par devise:');
    currencyStats.forEach((stat) => {
      console.log(`- ${stat._id}: ${stat.count} factures`);
    });
  } catch (error) {
    console.error('❌ Erreur lors de la création des données de test:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

createTestInvoices();
