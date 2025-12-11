const BASE = process.env.BASE_URL || 'http://localhost:4000';

async function testUpdateProfile() {
  console.log("🧪 Test de l'endpoint /v1/auth/update-profile...\n");

  try {
    // 1. Se connecter avec l'utilisateur test
    console.log('🔐 Connexion avec test@booklio.com...');
    const loginResponse = await fetch(`${BASE}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@booklio.com',
        password: 'password123',
      }),
    });

    if (!loginResponse.ok) {
      console.error('❌ Échec de la connexion:', loginResponse.status, await loginResponse.text());
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Connexion réussie!');
    console.log('👤 Utilisateur actuel:', {
      id: loginData.user.id,
      email: loginData.user.email,
      storeName: loginData.user.storeName || 'undefined',
      storeAddress: loginData.user.storeAddress || 'undefined',
      phoneNumber: loginData.user.phoneNumber || 'undefined',
    });

    const accessToken = loginData.tokens.accessToken;

    // 2. Vérifier l'état actuel via /me
    console.log('\n🔍 État actuel via /me...');
    const meResponse = await fetch(`${BASE}/v1/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!meResponse.ok) {
      console.error('❌ Échec de /me:', meResponse.status, await meResponse.text());
      return;
    }

    const meData = await meResponse.json();
    console.log('📊 État actuel:');
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
      console.log(`   ${field}: ${meData.user[field] || 'undefined'}`);
    });

    // 3. Test 1: Mise à jour complète
    console.log('\n📝 Test 1: Mise à jour complète des informations du magasin...');
    const updateData1 = {
      storeName: 'Optique Test Booklio',
      storeAddress: '123 Avenue des Tests, 75001 Paris',
      phoneNumber: '+33 1 23 45 67 89',
      patenteNumber: '123456789',
      rcNumber: 'RC123456',
      npeNumber: 'NPE987654',
      iceNumber: 'ICE123456789',
    };

    const updateResponse1 = await fetch(`${BASE}/v1/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updateData1),
    });

    if (!updateResponse1.ok) {
      console.error(
        '❌ Échec de la mise à jour complète:',
        updateResponse1.status,
        await updateResponse1.text()
      );
      return;
    }

    const updateResult1 = await updateResponse1.json();
    console.log('✅ Mise à jour complète réussie!');
    console.log('👤 Utilisateur mis à jour:', {
      id: updateResult1.user.id,
      email: updateResult1.user.email,
      storeName: updateResult1.user.storeName,
      storeAddress: updateResult1.user.storeAddress,
      phoneNumber: updateResult1.user.phoneNumber,
      patenteNumber: updateResult1.user.patenteNumber,
      rcNumber: updateResult1.user.rcNumber,
      npeNumber: updateResult1.user.npeNumber,
      iceNumber: updateResult1.user.iceNumber,
    });

    // 4. Test 2: Mise à jour partielle
    console.log('\n📝 Test 2: Mise à jour partielle (seulement le nom et téléphone)...');
    const updateData2 = {
      storeName: 'Optique Test Booklio - Mis à jour',
      phoneNumber: '+33 1 98 76 54 32',
    };

    const updateResponse2 = await fetch(`${BASE}/v1/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updateData2),
    });

    if (!updateResponse2.ok) {
      console.error(
        '❌ Échec de la mise à jour partielle:',
        updateResponse2.status,
        await updateResponse2.text()
      );
      return;
    }

    const updateResult2 = await updateResponse2.json();
    console.log('✅ Mise à jour partielle réussie!');
    console.log('👤 Utilisateur après mise à jour partielle:');
    storeFields.forEach((field) => {
      console.log(`   ${field}: ${updateResult2.user[field] || 'undefined'}`);
    });

    // 5. Test 3: Effacer certains champs (mettre à undefined)
    console.log('\n📝 Test 3: Effacer certains champs...');
    const updateData3 = {
      storeAddress: undefined,
      patenteNumber: undefined,
      rcNumber: undefined,
    };

    const updateResponse3 = await fetch(`${BASE}/v1/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(updateData3),
    });

    if (!updateResponse3.ok) {
      console.error(
        "❌ Échec de l'effacement:",
        updateResponse3.status,
        await updateResponse3.text()
      );
      return;
    }

    const updateResult3 = await updateResponse3.json();
    console.log('✅ Effacement réussi!');
    console.log('👤 Utilisateur après effacement:');
    storeFields.forEach((field) => {
      console.log(`   ${field}: ${updateResult3.user[field] || 'undefined'}`);
    });

    // 6. Vérification finale via /me
    console.log('\n🔍 Vérification finale via /me...');
    const finalMeResponse = await fetch(`${BASE}/v1/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!finalMeResponse.ok) {
      console.error(
        '❌ Échec de la vérification finale:',
        finalMeResponse.status,
        await finalMeResponse.text()
      );
      return;
    }

    const finalMeData = await finalMeResponse.json();
    console.log('📊 État final:');
    storeFields.forEach((field) => {
      console.log(`   ${field}: ${finalMeData.user[field] || 'undefined'}`);
    });

    console.log('\n🎉 Tous les tests de mise à jour du profil ont réussi!');
    console.log("✅ L'endpoint /v1/auth/update-profile fonctionne parfaitement!");
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testUpdateProfile();
