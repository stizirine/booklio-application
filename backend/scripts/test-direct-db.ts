import mongoose from 'mongoose';

import { User } from '../src/modules/users/model.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/booklio';

async function testDirectDB() {
  try {
    console.log('🔌 Connexion directe à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    // Créer un utilisateur directement avec les champs du magasin
    const userData = {
      tenantId: 't1',
      email: 'direct_test@example.com',
      passwordHash: 'test_hash',
      roles: ['admin'],
      storeName: 'Direct Test Store',
      storeAddress: '456 Direct Street',
      patenteNumber: '555666777',
      rcNumber: 'RC555666',
      npeNumber: 'NPE777888',
      iceNumber: 'ICE555666777',
    };

    console.log("📤 Création directe d'utilisateur avec:", userData);

    const user = await User.create(userData);
    console.log('✅ Utilisateur créé directement:', {
      id: user.id,
      email: user.email,
      storeName: user.storeName,
      storeAddress: user.storeAddress,
      patenteNumber: user.patenteNumber,
      rcNumber: user.rcNumber,
      npeNumber: user.npeNumber,
      iceNumber: user.iceNumber,
    });

    // Vérifier en relisant depuis la base
    const savedUser = await User.findById(user.id);
    console.log('🔍 Utilisateur relu depuis la base:', {
      id: savedUser?.id,
      email: savedUser?.email,
      storeName: savedUser?.storeName,
      storeAddress: savedUser?.storeAddress,
      patenteNumber: savedUser?.patenteNumber,
      rcNumber: savedUser?.rcNumber,
      npeNumber: savedUser?.npeNumber,
      iceNumber: savedUser?.iceNumber,
    });

    // Nettoyage
    await User.deleteOne({ _id: user.id });
    console.log('🧹 Utilisateur de test supprimé');
  } catch (error) {
    console.error('❌ Erreur:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnecté de MongoDB');
  }
}

testDirectDB();
