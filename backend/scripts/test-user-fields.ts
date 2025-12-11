#!/usr/bin/env npx tsx

/**
 * Script de test pour les nouveaux champs utilisateur (firstName, lastName, phone)
 */

const API_BASE_URL = 'http://localhost:4000';

async function testUserFields() {
  console.log('🧪 Test des nouveaux champs utilisateur (firstName, lastName, phone)...\n');

  // 1. Test d'inscription avec informations personnelles
  console.log("📝 Test d'inscription avec informations personnelles...");
  const registerResponse = await fetch(`${API_BASE_URL}/v1/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      tenantId: 't1',
      email: 'test.personnel@booklio.com',
      password: 'password123',
      firstName: 'Jean',
      lastName: 'Dupont',
      phone: '+33 6 12 34 56 78',
    }),
  });

  if (registerResponse.ok) {
    const registerData = await registerResponse.json();
    console.log('✅ Inscription réussie!');
    console.log('👤 Utilisateur créé:', {
      firstName: registerData.user.firstName,
      lastName: registerData.user.lastName,
      phone: registerData.user.phone,
    });

    const { tokens } = registerData;

    // 2. Test de l'endpoint /me
    console.log("\n🔍 Test de l'endpoint /me...");
    const meResponse = await fetch(`${API_BASE_URL}/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    if (meResponse.ok) {
      const meData = await meResponse.json();
      console.log('✅ /me fonctionne!');
      console.log('👤 Informations personnelles:', {
        firstName: meData.user.firstName,
        lastName: meData.user.lastName,
        phone: meData.user.phone,
      });
    } else {
      console.error('❌ Échec de /me');
    }

    // 3. Test de mise à jour des informations personnelles
    console.log('\n📝 Test de mise à jour des informations personnelles...');
    const updateResponse = await fetch(`${API_BASE_URL}/v1/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.accessToken}`,
      },
      body: JSON.stringify({
        firstName: 'Marie',
        lastName: 'Martin',
        phone: '+33 6 98 76 54 32',
      }),
    });

    if (updateResponse.ok) {
      const updateData = await updateResponse.json();
      console.log('✅ Mise à jour réussie!');
      console.log('👤 Informations mises à jour:', {
        firstName: updateData.user.firstName,
        lastName: updateData.user.lastName,
        phone: updateData.user.phone,
      });
    } else {
      console.error('❌ Échec de la mise à jour');
    }

    // 4. Test de mise à jour mixte (personnel + magasin)
    console.log('\n📝 Test de mise à jour mixte (personnel + magasin)...');
    const mixedUpdateResponse = await fetch(`${API_BASE_URL}/v1/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.accessToken}`,
      },
      body: JSON.stringify({
        firstName: 'Pierre',
        lastName: 'Durand',
        phone: '+33 6 11 22 33 44',
        storeName: 'Optique Pierre Durand',
        storeAddress: '456 Avenue des Champs-Élysées, 75008 Paris',
        phoneNumber: '+33 1 44 55 66 77',
      }),
    });

    if (mixedUpdateResponse.ok) {
      const mixedUpdateData = await mixedUpdateResponse.json();
      console.log('✅ Mise à jour mixte réussie!');
      console.log('👤 Informations personnelles:', {
        firstName: mixedUpdateData.user.firstName,
        lastName: mixedUpdateData.user.lastName,
        phone: mixedUpdateData.user.phone,
      });
      console.log('🏪 Informations du magasin:', {
        storeName: mixedUpdateData.user.storeName,
        storeAddress: mixedUpdateData.user.storeAddress,
        phoneNumber: mixedUpdateData.user.phoneNumber,
      });
    } else {
      console.error('❌ Échec de la mise à jour mixte');
    }

    // 5. Test de suppression d'un champ (mettre à null)
    console.log("\n🗑️ Test de suppression d'un champ...");
    const clearResponse = await fetch(`${API_BASE_URL}/v1/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.accessToken}`,
      },
      body: JSON.stringify({
        phone: null, // Note: Zod attend string ou undefined, pas null
      }),
    });

    if (clearResponse.ok) {
      const clearData = await clearResponse.json();
      console.log('✅ Suppression réussie!');
      console.log('👤 Phone après suppression:', clearData.user.phone);
    } else {
      console.log('ℹ️ Suppression avec null non supportée (comportement attendu)');
    }

    // 6. Test de suppression d'un champ (mettre à undefined via omission)
    console.log("\n🗑️ Test de suppression d'un champ (omission)...");
    const clearUndefinedResponse = await fetch(`${API_BASE_URL}/v1/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.accessToken}`,
      },
      body: JSON.stringify({
        firstName: 'Nouveau Prénom',
        // lastName et phone omis - ne devraient pas être modifiés
      }),
    });

    if (clearUndefinedResponse.ok) {
      const clearUndefinedData = await clearUndefinedResponse.json();
      console.log('✅ Mise à jour partielle réussie!');
      console.log('👤 Informations après mise à jour partielle:', {
        firstName: clearUndefinedData.user.firstName,
        lastName: clearUndefinedData.user.lastName,
        phone: clearUndefinedData.user.phone,
      });
    } else {
      console.error('❌ Échec de la mise à jour partielle');
    }
  } else {
    const errorData = await registerResponse.json();
    console.error("❌ Échec de l'inscription:", errorData);
  }

  console.log('\n🎉 Tests terminés!');
}

testUserFields().catch(console.error);
