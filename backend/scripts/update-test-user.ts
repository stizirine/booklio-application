import mongoose from 'mongoose';

import { User } from '../src/modules/users/model.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/booklio';

async function updateTestUser() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Rechercher l'utilisateur test@booklio.com
    const testUser = await User.findOne({ email: 'test@booklio.com' });

    if (!testUser) {
      console.log('❌ Utilisateur test@booklio.com non trouvé');
      return;
    }

    console.log('👤 Utilisateur trouvé:', {
      id: testUser.id,
      email: testUser.email,
      tenantId: testUser.tenantId,
      roles: testUser.roles,
    });

    // Informations du magasin à ajouter
    const storeInfo = {
      storeName: 'Optique Test Booklio',
      storeAddress: '123 Avenue des Tests, 75001 Paris',
      phoneNumber: '+33 1 23 45 67 89',
      patenteNumber: '123456789',
      rcNumber: 'RC123456',
      npeNumber: 'NPE987654',
      iceNumber: 'ICE123456789',
    };

    console.log('\n📝 Mise à jour avec les informations du magasin:');
    console.log(storeInfo);

    // Mettre à jour l'utilisateur
    const updatedUser = await User.findByIdAndUpdate(
      testUser._id,
      {
        $set: storeInfo,
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      console.log('❌ Erreur lors de la mise à jour');
      return;
    }

    console.log('\n✅ Utilisateur mis à jour avec succès!');
    console.log('👤 Utilisateur après mise à jour:', {
      id: updatedUser.id,
      email: updatedUser.email,
      tenantId: updatedUser.tenantId,
      roles: updatedUser.roles,
      storeName: updatedUser.storeName,
      storeAddress: updatedUser.storeAddress,
      phoneNumber: updatedUser.phoneNumber,
      patenteNumber: updatedUser.patenteNumber,
      rcNumber: updatedUser.rcNumber,
      npeNumber: updatedUser.npeNumber,
      iceNumber: updatedUser.iceNumber,
    });

    // Vérification finale
    console.log('\n🔍 Vérification des champs du magasin:');
    const storeFields = [
      'storeName',
      'storeAddress',
      'phoneNumber',
      'patenteNumber',
      'rcNumber',
      'npeNumber',
      'iceNumber',
    ];
    storeFields.forEach((field) => {
      const value = updatedUser[field];
      const status = value ? `✅ ${value}` : '❌ undefined';
      console.log(`   ${field}: ${status}`);
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnecté de MongoDB');
  }
}

updateTestUser();
