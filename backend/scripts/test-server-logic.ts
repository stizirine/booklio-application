import mongoose from 'mongoose';
import { z } from 'zod';

import { User } from '../src/modules/users/model.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/booklio';

// Reproduire exactement le schéma et la logique du serveur
const registerSchema = z.object({
  tenantId: z.string().min(1),
  email: z.string().email(),
  password: z.string().min(8),
  // Informations du magasin/entreprise (optionnelles)
  storeName: z.string().optional(),
  storeAddress: z.string().optional(),
  patenteNumber: z.string().optional(),
  rcNumber: z.string().optional(),
  npeNumber: z.string().optional(),
  iceNumber: z.string().optional(),
});

async function testServerLogic() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    const testData = {
      tenantId: 't1',
      email: 'server_logic_test@example.com',
      password: 'password123',
      storeName: 'Server Logic Test Store',
      storeAddress: '123 Server Logic Street',
      patenteNumber: '999888777',
      rcNumber: 'RC999888',
      npeNumber: 'NPE777666',
      iceNumber: 'ICE999888777',
    };

    console.log('📤 Données de test:', testData);

    // Étape 1: Validation
    const parse = registerSchema.safeParse(testData);
    if (!parse.success) {
      console.error('❌ Validation échouée:', parse.error);
      return;
    }
    console.log('✅ Validation réussie');

    const {
      tenantId,
      email,
      storeName,
      storeAddress,
      patenteNumber,
      rcNumber,
      npeNumber,
      iceNumber,
    } = parse.data;

    console.log('🔍 Données extraites:', {
      tenantId,
      email,
      storeName,
      storeAddress,
      patenteNumber,
      rcNumber,
      npeNumber,
      iceNumber,
    });

    // Étape 2: Vérifier si l'utilisateur existe
    const existing = await User.findOne({ email });
    if (existing) {
      console.log('⚠️ Utilisateur existe déjà');
      return;
    }
    console.log("✅ Utilisateur n'existe pas");

    // Étape 3: Construire l'objet utilisateur
    const passwordHash = 'test_hash'; // Simuler le hash
    const userData: any = {
      tenantId,
      email,
      passwordHash,
      roles: ['admin'],
    };

    // Ajouter les informations du magasin seulement si elles sont définies
    if (storeName) userData.storeName = storeName;
    if (storeAddress) userData.storeAddress = storeAddress;
    if (patenteNumber) userData.patenteNumber = patenteNumber;
    if (rcNumber) userData.rcNumber = rcNumber;
    if (npeNumber) userData.npeNumber = npeNumber;
    if (iceNumber) userData.iceNumber = iceNumber;

    console.log('📦 Objet utilisateur à sauvegarder:', userData);

    // Étape 4: Créer l'utilisateur
    const user = await User.create(userData);
    console.log('✅ Utilisateur créé:', {
      id: user.id,
      email: user.email,
      storeName: user.storeName,
      storeAddress: user.storeAddress,
      patenteNumber: user.patenteNumber,
      rcNumber: user.rcNumber,
      npeNumber: user.npeNumber,
      iceNumber: user.iceNumber,
    });

    // Étape 5: Vérifier en relisant depuis la base
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

testServerLogic();
