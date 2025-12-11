import crypto from 'node:crypto';

import mongoose from 'mongoose';

import { User } from '../src/modules/users/model.js';

const BASE = process.env.BASE_URL || 'http://localhost:4000';
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/booklio';

async function testRegisterWithStoreInfo() {
  const rnd = crypto.randomBytes(4).toString('hex');
  const email = `test_store_${rnd}@example.com`;
  const password = 'P@ssw0rd123';
  const tenantId = 't1';

  console.log("🧪 Test d'inscription avec informations du magasin...");
  console.log(`📧 Email: ${email}`);

  try {
    // Test d'inscription avec informations du magasin
    const registerData = {
      tenantId,
      email,
      password,
      storeName: 'Optique Test Centre',
      storeAddress: '456 Avenue des Champs-Élysées, 75008 Paris',
      patenteNumber: '987654321',
      rcNumber: 'RC987654',
      npeNumber: 'NPE123456',
      iceNumber: 'ICE987654321',
    };

    console.log("📤 Envoi de la requête d'inscription...");
    const regRes = await fetch(`${BASE}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    });

    if (!regRes.ok) {
      const errorText = await regRes.text();
      console.error("❌ Échec de l'inscription:", regRes.status, errorText);
      return false;
    }

    const regData = await regRes.json();
    console.log('✅ Inscription réussie!');
    console.log('👤 Utilisateur créé:', {
      id: regData.user.id,
      email: regData.user.email,
      tenantId: regData.user.tenantId,
      roles: regData.user.roles,
      storeName: regData.user.storeName,
      storeAddress: regData.user.storeAddress,
      patenteNumber: regData.user.patenteNumber,
      rcNumber: regData.user.rcNumber,
      npeNumber: regData.user.npeNumber,
      iceNumber: regData.user.iceNumber,
    });

    // Vérifier que les tokens sont présents
    if (!regData.tokens?.accessToken || !regData.tokens?.refreshToken) {
      console.error('❌ Tokens manquants dans la réponse');
      return false;
    }
    console.log('🔑 Tokens générés avec succès');

    // Test de connexion
    console.log('\n🔐 Test de connexion...');
    const loginRes = await fetch(`${BASE}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!loginRes.ok) {
      console.error('❌ Échec de la connexion:', loginRes.status, await loginRes.text());
      return false;
    }

    const loginData = await loginRes.json();
    console.log('✅ Connexion réussie!');
    console.log('👤 Utilisateur connecté:', {
      id: loginData.user.id,
      email: loginData.user.email,
      storeName: loginData.user.storeName,
      storeAddress: loginData.user.storeAddress,
    });

    // Vérifier que les informations du magasin sont bien retournées
    const expectedStoreInfo = {
      storeName: 'Optique Test Centre',
      storeAddress: '456 Avenue des Champs-Élysées, 75008 Paris',
      patenteNumber: '987654321',
      rcNumber: 'RC987654',
      npeNumber: 'NPE123456',
      iceNumber: 'ICE987654321',
    };

    const actualStoreInfo = {
      storeName: loginData.user.storeName,
      storeAddress: loginData.user.storeAddress,
      patenteNumber: loginData.user.patenteNumber,
      rcNumber: loginData.user.rcNumber,
      npeNumber: loginData.user.npeNumber,
      iceNumber: loginData.user.iceNumber,
    };

    const storeInfoMatch = JSON.stringify(expectedStoreInfo) === JSON.stringify(actualStoreInfo);
    if (!storeInfoMatch) {
      console.error('❌ Les informations du magasin ne correspondent pas');
      console.error('Attendu:', expectedStoreInfo);
      console.error('Reçu:', actualStoreInfo);
      return false;
    }
    console.log('✅ Informations du magasin correctement sauvegardées et récupérées');

    // Test de l'endpoint /me
    console.log("\n👤 Test de l'endpoint /me...");
    const meRes = await fetch(`${BASE}/v1/auth/me`, {
      headers: { Authorization: `Bearer ${loginData.tokens.accessToken}` },
    });

    if (!meRes.ok) {
      console.error('❌ Échec de /me:', meRes.status, await meRes.text());
      return false;
    }

    const meData = await meRes.json();
    console.log('✅ /me réussi!');
    console.log('👤 Informations utilisateur:', {
      id: meData.user.id,
      email: meData.user.email,
      storeName: meData.user.storeName,
      storeAddress: meData.user.storeAddress,
    });

    // Nettoyage
    console.log('\n🧹 Nettoyage...');
    await mongoose.connect(MONGO_URI);
    await User.deleteOne({ _id: regData.user.id });
    await mongoose.connection.close();
    console.log('✅ Utilisateur de test supprimé');

    console.log("\n🎉 Test d'inscription avec informations du magasin: SUCCÈS!");
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test:', error);
    return false;
  }
}

// Test d'inscription sans informations du magasin (rétrocompatibilité)
async function testRegisterWithoutStoreInfo() {
  const rnd = crypto.randomBytes(4).toString('hex');
  const email = `test_basic_${rnd}@example.com`;
  const password = 'P@ssw0rd123';
  const tenantId = 't1';

  console.log("\n🧪 Test d'inscription basique (rétrocompatibilité)...");
  console.log(`📧 Email: ${email}`);

  try {
    const registerData = {
      tenantId,
      email,
      password,
    };

    const regRes = await fetch(`${BASE}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    });

    if (!regRes.ok) {
      const errorText = await regRes.text();
      console.error("❌ Échec de l'inscription basique:", regRes.status, errorText);
      return false;
    }

    const regData = await regRes.json();
    console.log('✅ Inscription basique réussie!');

    // Vérifier que les champs du magasin sont undefined/null
    const storeFields = [
      'storeName',
      'storeAddress',
      'patenteNumber',
      'rcNumber',
      'npeNumber',
      'iceNumber',
    ];
    const hasStoreInfo = storeFields.some(
      (field) => regData.user[field] !== undefined && regData.user[field] !== null
    );

    if (hasStoreInfo) {
      console.error(
        "❌ Des informations du magasin sont présentes alors qu'elles ne devraient pas l'être"
      );
      return false;
    }

    console.log('✅ Aucune information du magasin (comme attendu)');

    // Nettoyage
    await mongoose.connect(MONGO_URI);
    await User.deleteOne({ _id: regData.user.id });
    await mongoose.connection.close();

    console.log("🎉 Test d'inscription basique: SUCCÈS!");
    return true;
  } catch (error) {
    console.error('❌ Erreur lors du test basique:', error);
    return false;
  }
}

async function main() {
  console.log("🚀 Démarrage des tests d'inscription...\n");

  const test1 = await testRegisterWithStoreInfo();
  const test2 = await testRegisterWithoutStoreInfo();

  if (test1 && test2) {
    console.log('\n🎉 Tous les tests sont passés avec succès!');
    process.exit(0);
  } else {
    console.log('\n❌ Certains tests ont échoué');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('❌ Erreur fatale:', error);
  process.exit(1);
});
