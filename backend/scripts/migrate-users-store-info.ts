import mongoose from 'mongoose';

import { User } from '../src/modules/users/model.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/booklio';

interface UserUpdate {
  _id: string;
  email: string;
  storeName?: string;
  storeAddress?: string;
  phoneNumber?: string;
  patenteNumber?: string;
  rcNumber?: string;
  npeNumber?: string;
  iceNumber?: string;
}

async function migrateUsersStoreInfo() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    // 1. Compter les utilisateurs existants
    const totalUsers = await User.countDocuments();
    console.log(`📊 Nombre total d'utilisateurs: ${totalUsers}`);

    if (totalUsers === 0) {
      console.log('ℹ️ Aucun utilisateur à migrer');
      return;
    }

    // 2. Récupérer tous les utilisateurs
    const users = await User.find({}).lean();
    console.log(`📋 Récupération de ${users.length} utilisateurs\n`);

    // 3. Identifier les utilisateurs qui n'ont pas les nouveaux champs
    const usersToUpdate: UserUpdate[] = [];

    for (const user of users) {
      const hasStoreInfo =
        user.storeName ||
        user.storeAddress ||
        user.phoneNumber ||
        user.patenteNumber ||
        user.rcNumber ||
        user.npeNumber ||
        user.iceNumber;

      if (!hasStoreInfo) {
        usersToUpdate.push({
          _id: user._id.toString(),
          email: user.email,
          // Les champs du magasin resteront undefined/null
        });
      }
    }

    console.log(`🔍 Utilisateurs sans informations du magasin: ${usersToUpdate.length}`);
    console.log(`✅ Utilisateurs déjà à jour: ${users.length - usersToUpdate.length}\n`);

    if (usersToUpdate.length === 0) {
      console.log('🎉 Tous les utilisateurs sont déjà à jour !');
      return;
    }

    // 4. Afficher les utilisateurs qui seront mis à jour
    console.log('📝 Utilisateurs qui seront mis à jour:');
    usersToUpdate.forEach((user, index) => {
      console.log(`   ${index + 1}. ${user.email} (${user._id})`);
    });
    console.log('');

    // 5. Demander confirmation (simulation - en production, vous pourriez vouloir une vraie confirmation)
    console.log(
      '⚠️  Cette migration va ajouter les nouveaux champs du magasin aux utilisateurs existants.'
    );
    console.log('   Les champs seront initialisés à undefined/null (optionnels).\n');

    // 6. Effectuer la migration
    console.log('🚀 Début de la migration...');

    let migratedCount = 0;
    let errorCount = 0;

    for (const userUpdate of usersToUpdate) {
      try {
        // Mettre à jour l'utilisateur avec les nouveaux champs (undefined)
        await User.updateOne(
          { _id: userUpdate._id },
          {
            $set: {
              storeName: undefined,
              storeAddress: undefined,
              phoneNumber: undefined,
              patenteNumber: undefined,
              rcNumber: undefined,
              npeNumber: undefined,
              iceNumber: undefined,
            },
          }
        );

        migratedCount++;
        console.log(`   ✅ ${userUpdate.email} migré`);
      } catch (error) {
        errorCount++;
        console.error(`   ❌ Erreur pour ${userUpdate.email}:`, error);
      }
    }

    // 7. Résumé de la migration
    console.log('\n📊 Résumé de la migration:');
    console.log(`   ✅ Utilisateurs migrés avec succès: ${migratedCount}`);
    console.log(`   ❌ Erreurs: ${errorCount}`);
    console.log(`   📋 Total traité: ${migratedCount + errorCount}`);

    // 8. Vérification post-migration
    console.log('\n🔍 Vérification post-migration...');
    const updatedUsers = await User.find({}).lean();
    const usersWithStoreFields = updatedUsers.filter(
      (user) =>
        user.hasOwnProperty('storeName') &&
        user.hasOwnProperty('storeAddress') &&
        user.hasOwnProperty('phoneNumber') &&
        user.hasOwnProperty('patenteNumber') &&
        user.hasOwnProperty('rcNumber') &&
        user.hasOwnProperty('npeNumber') &&
        user.hasOwnProperty('iceNumber')
    );

    console.log(
      `📊 Utilisateurs avec les nouveaux champs: ${usersWithStoreFields.length}/${updatedUsers.length}`
    );

    if (usersWithStoreFields.length === updatedUsers.length) {
      console.log(
        '🎉 Migration terminée avec succès ! Tous les utilisateurs ont maintenant les nouveaux champs.'
      );
    } else {
      console.log('⚠️  Migration partiellement réussie. Vérifiez les erreurs ci-dessus.');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnecté de MongoDB');
  }
}

// Fonction pour créer un utilisateur de test avec les nouveaux champs
async function createTestUserWithStoreInfo() {
  try {
    console.log("\n🧪 Création d'un utilisateur de test avec informations du magasin...");

    const testUser = await User.create({
      tenantId: 't1',
      email: 'test_migration@example.com',
      passwordHash: 'test_hash',
      roles: ['admin'],
      storeName: 'Optique Test Migration',
      storeAddress: '123 Rue de la Migration, 75001 Paris',
      phoneNumber: '+33 1 23 45 67 89',
      patenteNumber: '123456789',
      rcNumber: 'RC123456',
      npeNumber: 'NPE987654',
      iceNumber: 'ICE123456789',
    });

    console.log('✅ Utilisateur de test créé:', {
      id: testUser.id,
      email: testUser.email,
      storeName: testUser.storeName,
      storeAddress: testUser.storeAddress,
      phoneNumber: testUser.phoneNumber,
      patenteNumber: testUser.patenteNumber,
      rcNumber: testUser.rcNumber,
      npeNumber: testUser.npeNumber,
      iceNumber: testUser.iceNumber,
    });

    // Nettoyage
    await User.deleteOne({ _id: testUser.id });
    console.log('🧹 Utilisateur de test supprimé');
  } catch (error) {
    console.error('❌ Erreur lors de la création du test:', error);
  }
}

async function main() {
  console.log('🚀 Script de migration des utilisateurs avec informations du magasin\n');

  // Exécuter la migration
  await migrateUsersStoreInfo();

  // Tester la création d'un utilisateur avec les nouveaux champs
  await createTestUserWithStoreInfo();

  console.log('\n✨ Script terminé !');
}

main().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
