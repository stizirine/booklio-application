import mongoose from 'mongoose';

import { User } from '../src/modules/users/model.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/booklio';

async function checkUsersSchema() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    // 1. Compter les utilisateurs
    const totalUsers = await User.countDocuments();
    console.log(`📊 Nombre total d'utilisateurs: ${totalUsers}\n`);

    if (totalUsers === 0) {
      console.log('ℹ️ Aucun utilisateur dans la base de données');
      return;
    }

    // 2. Récupérer quelques utilisateurs pour analyser leur structure
    const sampleUsers = await User.find({}).limit(3).lean();

    console.log('🔍 Analyse de la structure des utilisateurs:');
    sampleUsers.forEach((user, index) => {
      console.log(`\n👤 Utilisateur ${index + 1}: ${user.email}`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Tenant ID: ${user.tenantId}`);
      console.log(`   Rôles: ${user.roles}`);

      // Vérifier la présence des champs du magasin
      const storeFields = [
        'storeName',
        'storeAddress',
        'phoneNumber',
        'patenteNumber',
        'rcNumber',
        'npeNumber',
        'iceNumber',
      ];
      console.log('   Champs du magasin:');
      storeFields.forEach((field) => {
        const value = user[field];
        const status = value !== undefined ? `✅ ${value || 'null'}` : '❌ undefined';
        console.log(`     ${field}: ${status}`);
      });
    });

    // 3. Statistiques détaillées
    console.log('\n📊 Statistiques des champs du magasin:');
    const storeFields = [
      'storeName',
      'storeAddress',
      'phoneNumber',
      'patenteNumber',
      'rcNumber',
      'npeNumber',
      'iceNumber',
    ];

    for (const field of storeFields) {
      const count = await User.countDocuments({ [field]: { $exists: true } });
      const nonNullCount = await User.countDocuments({ [field]: { $exists: true, $ne: null } });
      console.log(`   ${field}: ${count} documents ont ce champ (${nonNullCount} non-null)`);
    }

    // 4. Vérifier si les utilisateurs ont tous les nouveaux champs
    const usersWithAllFields = await User.countDocuments({
      storeName: { $exists: true },
      storeAddress: { $exists: true },
      phoneNumber: { $exists: true },
      patenteNumber: { $exists: true },
      rcNumber: { $exists: true },
      npeNumber: { $exists: true },
      iceNumber: { $exists: true },
    });

    console.log(
      `\n📈 Utilisateurs avec tous les champs du magasin: ${usersWithAllFields}/${totalUsers}`
    );

    if (usersWithAllFields === totalUsers) {
      console.log('✅ Tous les utilisateurs ont les nouveaux champs du magasin');
    } else {
      console.log("⚠️  Certains utilisateurs n'ont pas tous les nouveaux champs");
      console.log('   Exécutez le script de migration pour les mettre à jour');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnecté de MongoDB');
  }
}

checkUsersSchema();
