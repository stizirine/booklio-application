const BASE = process.env.BASE_URL || 'http://localhost:4000';

async function debugServerRoutes() {
  console.log('🔍 Debug des routes du serveur...\n');

  try {
    // Test de connexion
    console.log('🔐 Test de connexion...');
    const loginResponse = await fetch(`${BASE}/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'test@booklio.com',
        password: 'password123',
      }),
    });

    if (!loginResponse.ok) {
      console.error('❌ Échec de la connexion:', loginResponse.status);
      return;
    }

    const loginData = await loginResponse.json();
    const accessToken = loginData.tokens.accessToken;
    console.log('✅ Connexion réussie!');

    // Test de toutes les routes d'auth
    const routes = [
      { method: 'GET', path: '/v1/auth/me' },
      { method: 'PUT', path: '/v1/auth/update-profile' },
      { method: 'POST', path: '/v1/auth/logout' },
    ];

    for (const route of routes) {
      console.log(`\n🧪 Test ${route.method} ${route.path}...`);

      const response = await fetch(`${BASE}${route.path}`, {
        method: route.method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: route.method === 'PUT' ? JSON.stringify({ storeName: 'Test' }) : undefined,
      });

      console.log(`   Status: ${response.status}`);

      if (response.status === 404) {
        const errorText = await response.text();
        if (errorText.includes('Cannot')) {
          console.log(`   ❌ Route non trouvée: ${errorText.split('Cannot ')[1]?.split(' ')[0]}`);
        } else {
          console.log(`   ❌ Erreur 404: ${errorText.substring(0, 100)}...`);
        }
      } else if (response.status === 200 || response.status === 201) {
        console.log(`   ✅ Route fonctionne!`);
      } else {
        const errorText = await response.text();
        console.log(`   ⚠️  Status ${response.status}: ${errorText.substring(0, 100)}...`);
      }
    }
  } catch (error) {
    console.error('❌ Erreur:', error);
  }
}

debugServerRoutes();
