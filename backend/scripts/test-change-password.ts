#!/usr/bin/env npx tsx

/**
 * Script de test pour l'endpoint change-password
 * Teste le changement de mot de passe avec différents scénarios
 */

const API_BASE_URL = 'http://localhost:4000';

interface LoginResponse {
  user: {
    id: string;
    email: string;
    tenantId: string;
    roles: string[];
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

interface ChangePasswordResponse {
  success: boolean;
  message: string;
}

interface ErrorResponse {
  error: {
    errorId: string;
    message: string;
    description?: string;
  };
}

async function makeRequest<T>(
  url: string,
  options: RequestInit = {}
): Promise<{ status: number; data: T }> {
  try {
    const response = await fetch(url, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error('❌ Erreur de requête:', error);
    throw error;
  }
}

async function login(
  email: string,
  password: string
): Promise<{ status: number; data: LoginResponse }> {
  return makeRequest<LoginResponse>(`${API_BASE_URL}/v1/auth/login`, {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

async function changePassword(
  accessToken: string,
  currentPassword: string,
  newPassword: string
): Promise<{ status: number; data: ChangePasswordResponse | ErrorResponse }> {
  return makeRequest<ChangePasswordResponse | ErrorResponse>(
    `${API_BASE_URL}/v1/auth/change-password`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ currentPassword, newPassword }),
    }
  );
}

async function testChangePassword() {
  console.log("🧪 Test de l'endpoint change-password...\n");

  // Test 1: Connexion avec le mot de passe actuel
  console.log('🔐 Test de connexion avec le mot de passe actuel...');
  const loginResult = await login('test@booklio.com', 'password123');

  if (loginResult.status !== 200) {
    console.error('❌ Échec de la connexion:', loginResult.data);
    return;
  }

  console.log('✅ Connexion réussie!');
  const { accessToken } = loginResult.data.tokens;

  // Test 2: Changement de mot de passe valide
  console.log('\n📝 Test de changement de mot de passe valide...');
  const changeResult = await changePassword(accessToken, 'password123', 'nouveauMotDePasse456');

  if (changeResult.status === 200) {
    console.log('✅ Changement de mot de passe réussi!');
    console.log('📄 Réponse:', changeResult.data);
  } else {
    console.error('❌ Échec du changement de mot de passe:', changeResult.data);
  }

  // Test 3: Connexion avec le nouveau mot de passe
  console.log('\n🔐 Test de connexion avec le nouveau mot de passe...');
  const newLoginResult = await login('test@booklio.com', 'nouveauMotDePasse456');

  if (newLoginResult.status === 200) {
    console.log('✅ Connexion avec le nouveau mot de passe réussie!');
  } else {
    console.error('❌ Échec de la connexion avec le nouveau mot de passe:', newLoginResult.data);
  }

  // Test 4: Tentative de changement avec l'ancien mot de passe (doit échouer)
  console.log("\n🚫 Test de changement avec l'ancien mot de passe (doit échouer)...");
  const oldPasswordResult = await changePassword(accessToken, 'password123', 'autreMotDePasse789');

  if (oldPasswordResult.status === 401) {
    console.log('✅ Correctement rejeté - ancien mot de passe invalide');
  } else {
    console.error("❌ Problème: l'ancien mot de passe devrait être invalide");
  }

  // Test 5: Tentative de changement avec le même mot de passe (doit échouer)
  console.log('\n🚫 Test de changement avec le même mot de passe (doit échouer)...');
  const samePasswordResult = await changePassword(
    accessToken,
    'nouveauMotDePasse456',
    'nouveauMotDePasse456'
  );

  if (samePasswordResult.status === 400) {
    console.log('✅ Correctement rejeté - même mot de passe');
  } else {
    console.error('❌ Problème: le même mot de passe devrait être rejeté');
  }

  // Test 6: Restaurer le mot de passe original
  console.log('\n🔄 Restauration du mot de passe original...');
  const restoreResult = await changePassword(accessToken, 'nouveauMotDePasse456', 'password123');

  if (restoreResult.status === 200) {
    console.log('✅ Mot de passe original restauré!');
  } else {
    console.error('❌ Échec de la restauration:', restoreResult.data);
  }

  // Test 7: Validation - mot de passe trop court
  console.log('\n🚫 Test de validation - mot de passe trop court...');
  const shortPasswordResult = await changePassword(accessToken, 'password123', '123');

  if (shortPasswordResult.status === 400) {
    console.log('✅ Correctement rejeté - mot de passe trop court');
  } else {
    console.error('❌ Problème: mot de passe trop court devrait être rejeté');
  }

  console.log('\n🎉 Tests terminés!');
}

// Exécuter les tests
testChangePassword().catch(console.error);
