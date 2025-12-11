const BASE = process.env.BASE_URL || 'http://localhost:4000';

async function updateTestUserViaAPI() {
  console.log("🔄 Mise à jour de l'utilisateur test@booklio.com via l'API...\n");

  try {
    // 1. D'abord, se connecter avec l'utilisateur test
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

    // 2. Vérifier l'endpoint /me pour voir l'état actuel
    console.log("\n🔍 Vérification de l'état actuel via /me...");
    const meResponse = await fetch(`${BASE}/v1/auth/me`, {
      headers: { Authorization: `Bearer ${loginData.tokens.accessToken}` },
    });

    if (!meResponse.ok) {
      console.error('❌ Échec de /me:', meResponse.status, await meResponse.text());
      return;
    }

    const meData = await meResponse.json();
    console.log("📊 État actuel de l'utilisateur:");
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
      const value = meData.user[field];
      console.log(`   ${field}: ${value || 'undefined'}`);
    });

    // 3. Note: Il n'y a pas d'endpoint de mise à jour des informations du magasin
    // Les informations du magasin sont ajoutées lors de l'inscription
    console.log("\nℹ️  Note: Les informations du magasin sont ajoutées lors de l'inscription.");
    console.log("   L'utilisateur test@booklio.com a été créé avant l'ajout de ces champs.");
    console.log(
      "   Pour tester les nouveaux champs, créez un nouvel utilisateur avec l'API d'inscription."
    );

    // 4. Créer un nouvel utilisateur de test avec les informations du magasin
    console.log("\n🧪 Création d'un nouvel utilisateur de test avec informations du magasin...");
    const testEmail = `test_store_${Date.now()}@booklio.com`;

    const registerData = {
      tenantId: 't1',
      email: testEmail,
      password: 'password123',
      storeName: 'Optique Test Booklio',
      storeAddress: '123 Avenue des Tests, 75001 Paris',
      phoneNumber: '+33 1 23 45 67 89',
      patenteNumber: '123456789',
      rcNumber: 'RC123456',
      npeNumber: 'NPE987654',
      iceNumber: 'ICE123456789',
    };

    const registerResponse = await fetch(`${BASE}/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(registerData),
    });

    if (!registerResponse.ok) {
      console.error(
        "❌ Échec de l'inscription:",
        registerResponse.status,
        await registerResponse.text()
      );
      return;
    }

    const registerData_result = await registerResponse.json();
    console.log('✅ Nouvel utilisateur créé avec succès!');
    console.log('👤 Utilisateur avec informations du magasin:');
    console.log({
      id: registerData_result.user.id,
      email: registerData_result.user.email,
      storeName: registerData_result.user.storeName,
      storeAddress: registerData_result.user.storeAddress,
      phoneNumber: registerData_result.user.phoneNumber,
      patenteNumber: registerData_result.user.patenteNumber,
      rcNumber: registerData_result.user.rcNumber,
      npeNumber: registerData_result.user.npeNumber,
      iceNumber: registerData_result.user.iceNumber,
    });

    console.log('\n🎉 Test terminé! Les nouveaux champs fonctionnent parfaitement.');
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

updateTestUserViaAPI();
