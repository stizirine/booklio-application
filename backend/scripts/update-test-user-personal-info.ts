#!/usr/bin/env npx tsx

/**
 * Script pour mettre à jour l'utilisateur test@booklio.com avec les informations personnelles
 */

const API_BASE_URL = 'http://localhost:4000';

async function updateTestUser() {
  console.log("🔄 Mise à jour de l'utilisateur test@booklio.com...\n");

  // 1. Connexion avec l'utilisateur test
  console.log('🔐 Connexion avec test@booklio.com...');
  const loginResponse = await fetch(`${API_BASE_URL}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test@booklio.com',
      password: 'password123',
    }),
  });

  if (!loginResponse.ok) {
    console.error('❌ Échec de la connexion');
    const errorData = await loginResponse.json();
    console.error('Erreur:', errorData);
    return;
  }

  const { tokens } = await loginResponse.json();
  console.log('✅ Connexion réussie!');

  // 2. Vérifier les informations actuelles
  console.log('\n🔍 Vérification des informations actuelles...');
  const meResponse = await fetch(`${API_BASE_URL}/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });

  if (meResponse.ok) {
    const meData = await meResponse.json();
    console.log('👤 Informations actuelles:');
    console.log('  - firstName:', meData.user.firstName || 'Non défini');
    console.log('  - lastName:', meData.user.lastName || 'Non défini');
    console.log('  - phone:', meData.user.phone || 'Non défini');
    console.log('  - storeName:', meData.user.storeName || 'Non défini');
    console.log('  - storeAddress:', meData.user.storeAddress || 'Non défini');
    console.log('  - phoneNumber:', meData.user.phoneNumber || 'Non défini');
  } else {
    console.error('❌ Échec de la récupération des informations');
  }

  // 3. Mise à jour avec les informations personnelles
  console.log('\n📝 Mise à jour avec les informations personnelles...');
  const updateResponse = await fetch(`${API_BASE_URL}/v1/auth/update-profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens.accessToken}`,
    },
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'Booklio',
      phone: '+33 6 12 34 56 78',
    }),
  });

  if (updateResponse.ok) {
    const updateData = await updateResponse.json();
    console.log('✅ Mise à jour réussie!');
    console.log('👤 Nouvelles informations personnelles:');
    console.log('  - firstName:', updateData.user.firstName);
    console.log('  - lastName:', updateData.user.lastName);
    console.log('  - phone:', updateData.user.phone);
  } else {
    console.error('❌ Échec de la mise à jour');
    const errorData = await updateResponse.json();
    console.error('Erreur:', errorData);
  }

  // 4. Mise à jour avec des informations complètes (personnel + magasin)
  console.log('\n📝 Mise à jour avec des informations complètes...');
  const completeUpdateResponse = await fetch(`${API_BASE_URL}/v1/auth/update-profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens.accessToken}`,
    },
    body: JSON.stringify({
      firstName: 'Test',
      lastName: 'Booklio',
      phone: '+33 6 12 34 56 78',
      storeName: 'Optique Test Booklio',
      storeAddress: '123 Rue de la Paix, 75001 Paris',
      phoneNumber: '+33 1 23 45 67 89',
      patenteNumber: '123456789',
      rcNumber: 'RC123456',
      npeNumber: 'NPE987654',
      iceNumber: 'ICE123456789',
    }),
  });

  if (completeUpdateResponse.ok) {
    const completeUpdateData = await completeUpdateResponse.json();
    console.log('✅ Mise à jour complète réussie!');
    console.log('👤 Informations personnelles:');
    console.log('  - firstName:', completeUpdateData.user.firstName);
    console.log('  - lastName:', completeUpdateData.user.lastName);
    console.log('  - phone:', completeUpdateData.user.phone);
    console.log('🏪 Informations du magasin:');
    console.log('  - storeName:', completeUpdateData.user.storeName);
    console.log('  - storeAddress:', completeUpdateData.user.storeAddress);
    console.log('  - phoneNumber:', completeUpdateData.user.phoneNumber);
    console.log('  - patenteNumber:', completeUpdateData.user.patenteNumber);
    console.log('  - rcNumber:', completeUpdateData.user.rcNumber);
    console.log('  - npeNumber:', completeUpdateData.user.npeNumber);
    console.log('  - iceNumber:', completeUpdateData.user.iceNumber);
  } else {
    console.error('❌ Échec de la mise à jour complète');
    const errorData = await completeUpdateResponse.json();
    console.error('Erreur:', errorData);
  }

  // 5. Vérification finale
  console.log('\n🔍 Vérification finale...');
  const finalMeResponse = await fetch(`${API_BASE_URL}/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });

  if (finalMeResponse.ok) {
    const finalMeData = await finalMeResponse.json();
    console.log('✅ Vérification finale réussie!');
    console.log('👤 Informations finales:');
    console.log('  - firstName:', finalMeData.user.firstName);
    console.log('  - lastName:', finalMeData.user.lastName);
    console.log('  - phone:', finalMeData.user.phone);
    console.log('🏪 Informations du magasin:');
    console.log('  - storeName:', finalMeData.user.storeName);
    console.log('  - storeAddress:', finalMeData.user.storeAddress);
    console.log('  - phoneNumber:', finalMeData.user.phoneNumber);
  } else {
    console.error('❌ Échec de la vérification finale');
  }

  console.log('\n🎉 Mise à jour terminée!');
}

updateTestUser().catch(console.error);
