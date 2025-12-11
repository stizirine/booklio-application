#!/usr/bin/env tsx

import mongoose from 'mongoose';

import { AppointmentModel } from '../src/modules/crm/appointments/model.js';
import { ClientModel } from '../src/modules/crm/clients/model.js';
import { InvoiceModel } from '../src/modules/crm/invoices/model.js';
import { User } from '../src/modules/users/model.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/booklio';

async function cleanupTestData() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB');

    // Trouver l'utilisateur test@booklio.com
    console.log("🔍 Recherche de l'utilisateur test@booklio.com...");
    const testUser = await User.findOne({ email: 'test@booklio.com' });

    if (!testUser) {
      console.log('❌ Utilisateur test@booklio.com non trouvé');
      return;
    }

    const tenantId = testUser.tenantId;
    console.log(`📋 TenantId trouvé: ${tenantId}`);

    // Compter les données existantes
    const clientCount = await ClientModel.countDocuments({ tenantId });
    const appointmentCount = await AppointmentModel.countDocuments({ tenantId });
    const invoiceCount = await InvoiceModel.countDocuments({ tenantId });

    console.log(`📊 Données existantes:`);
    console.log(`   - Clients: ${clientCount}`);
    console.log(`   - Rendez-vous: ${appointmentCount}`);
    console.log(`   - Factures: ${invoiceCount}`);

    if (clientCount === 0 && appointmentCount === 0 && invoiceCount === 0) {
      console.log('✅ Aucune donnée à supprimer');
      return;
    }

    // Confirmation
    console.log(
      '\n⚠️  ATTENTION: Cette action va supprimer définitivement toutes les données du tenant!'
    );
    console.log('Appuyez sur Ctrl+C pour annuler, ou attendez 5 secondes pour continuer...');

    await new Promise((resolve) => setTimeout(resolve, 5000));

    // Supprimer les données dans l'ordre des dépendances
    console.log('\n🗑️  Suppression des données...');

    // 1. Supprimer les factures (dépendent des clients)
    if (invoiceCount > 0) {
      console.log(`   - Suppression de ${invoiceCount} factures...`);
      const invoiceResult = await InvoiceModel.deleteMany({ tenantId });
      console.log(`   ✅ ${invoiceResult.deletedCount} factures supprimées`);
    }

    // 2. Supprimer les rendez-vous (dépendent des clients)
    if (appointmentCount > 0) {
      console.log(`   - Suppression de ${appointmentCount} rendez-vous...`);
      const appointmentResult = await AppointmentModel.deleteMany({ tenantId });
      console.log(`   ✅ ${appointmentResult.deletedCount} rendez-vous supprimés`);
    }

    // 3. Supprimer les clients
    if (clientCount > 0) {
      console.log(`   - Suppression de ${clientCount} clients...`);
      const clientResult = await ClientModel.deleteMany({ tenantId });
      console.log(`   ✅ ${clientResult.deletedCount} clients supprimés`);
    }

    console.log('\n✅ Nettoyage terminé avec succès!');
    console.log('📊 Résumé:');
    console.log(`   - Clients supprimés: ${clientCount}`);
    console.log(`   - Rendez-vous supprimés: ${appointmentCount}`);
    console.log(`   - Factures supprimées: ${invoiceCount}`);
  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
cleanupTestData().catch(console.error);
