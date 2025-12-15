import 'dotenv/config';
import mongoose from 'mongoose';

import { User } from '../src/modules/users/model.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/booklio';

async function checkUserData() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Récupérer le dernier utilisateur de test créé (par email de test-storephone)
    const lastUser = await User.findOne({ email: /test-storephone/ }).sort({ createdAt: -1 });

    if (lastUser) {
      console.log('👤 Dernier utilisateur de test trouvé:');
      console.log({
        id: lastUser.id,
        email: lastUser.email,
        tenantId: lastUser.tenantId,
        roles: lastUser.roles,
        storeName: lastUser.storeName,
        storeAddress: lastUser.storeAddress,
        phoneNumber: lastUser.phoneNumber,
        storePhone: lastUser.storePhone,
        patenteNumber: lastUser.patenteNumber,
        rcNumber: lastUser.rcNumber,
        npeNumber: lastUser.npeNumber,
        iceNumber: lastUser.iceNumber,
        createdAt: lastUser.createdAt,
      });
    } else {
      console.log('❌ Aucun utilisateur de test trouvé');
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnecté de MongoDB');
  }
}

checkUserData();
