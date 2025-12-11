const BASE = process.env.BASE_URL || 'http://localhost:4000';

async function testSimpleUpdate() {
  console.log("🧪 Test simple de l'endpoint update-profile...\n");

  try {
    // 1. Test de connexion
    console.log('🔐 Test de connexion...');
    const loginResponse = await fetch(`${BASE}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@booklio.com',
        password: 'password123',
      }),
    });

    console.log('Status de connexion:', loginResponse.status);

    if (!loginResponse.ok) {
      const errorText = await loginResponse.text();
      console.error('❌ Échec de la connexion:', errorText);
      return;
    }

    const loginData = await loginResponse.json();
    console.log('✅ Connexion réussie!');
    console.log('Token reçu:', loginData.tokens?.accessToken ? 'Oui' : 'Non');

    const accessToken = loginData.tokens.accessToken;

    // 2. Test de l'endpoint /me
    console.log('\n🔍 Test de /me...');
    const meResponse = await fetch(`${BASE}/v1/auth/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    console.log('Status de /me:', meResponse.status);

    if (!meResponse.ok) {
      const errorText = await meResponse.text();
      console.error('❌ Échec de /me:', errorText);
      return;
    }

    const meData = await meResponse.json();
    console.log('✅ /me fonctionne!');
    console.log('Utilisateur:', meData.user?.email);

    // 3. Test de l'endpoint update-profile
    console.log('\n📝 Test de update-profile...');
    const updateResponse = await fetch(`${BASE}/v1/auth/update-profile`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({
        storeName: 'Test Store',
        phoneNumber: '+33 1 23 45 67 89',
      }),
    });

    console.log('Status de update-profile:', updateResponse.status);

    if (!updateResponse.ok) {
      const errorText = await updateResponse.text();
      console.error('❌ Échec de update-profile:', errorText);
      return;
    }

    const updateData = await updateResponse.json();
    console.log('✅ update-profile fonctionne!');
    console.log('Utilisateur mis à jour:', updateData.user?.storeName);
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

testSimpleUpdate();
