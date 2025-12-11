#!/usr/bin/env tsx

import { config } from 'dotenv';
import mongoose from 'mongoose';

// Charger les variables d'environnement
config();

async function clearDatabase() {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('✅ Connecté à MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Base de données non disponible');
    }

    // Supprimer les collections CRM
    const collectionsToClear = ['clients', 'appointments', 'invoices'];

    for (const collectionName of collectionsToClear) {
      const result = await db.collection(collectionName).deleteMany({});
      console.log(`🗑️  Collection ${collectionName}: ${result.deletedCount} documents supprimés`);
    }

    // Garder les collections système
    console.log('✅ Collections CRM vidées');
    console.log('ℹ️  Collections conservées: users, googletokens');

    await mongoose.disconnect();
    console.log('✅ Déconnecté de MongoDB');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  clearDatabase();
}

export { clearDatabase };
