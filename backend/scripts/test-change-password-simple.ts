#!/usr/bin/env npx tsx

/**
 * Script de test simple pour l'endpoint change-password
 */

const API_BASE_URL = 'http://localhost:4000';

async function testChangePassword() {
  console.log("🧪 Test simple de l'endpoint change-password...\n");

  // 1. Connexion
  console.log('🔐 Connexion...');
  const loginResponse = await fetch(`${API_BASE_URL}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@booklio.com', password: 'password123' }),
  });

  if (!loginResponse.ok) {
    console.error('❌ Échec de la connexion');
    return;
  }

  const { tokens } = await loginResponse.json();
  console.log('✅ Connexion réussie!');

  // 2. Changement de mot de passe
  console.log('\n📝 Changement de mot de passe...');
  const changeResponse = await fetch(`${API_BASE_URL}/v1/auth/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens.accessToken}`,
    },
    body: JSON.stringify({
      currentPassword: 'password123',
      newPassword: 'nouveauMotDePasse456',
    }),
  });

  if (changeResponse.ok) {
    const result = await changeResponse.json();
    console.log('✅ Changement de mot de passe réussi!');
    console.log('📄 Réponse:', result);
  } else {
    const error = await changeResponse.json();
    console.error('❌ Échec du changement de mot de passe:', error);
    return;
  }

  // 3. Test de connexion avec le nouveau mot de passe
  console.log('\n🔐 Test de connexion avec le nouveau mot de passe...');
  const newLoginResponse = await fetch(`${API_BASE_URL}/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test@booklio.com', password: 'nouveauMotDePasse456' }),
  });

  if (newLoginResponse.ok) {
    console.log('✅ Connexion avec le nouveau mot de passe réussie!');
  } else {
    console.error('❌ Échec de la connexion avec le nouveau mot de passe');
  }

  // 4. Restauration du mot de passe original
  console.log('\n🔄 Restauration du mot de passe original...');
  const restoreResponse = await fetch(`${API_BASE_URL}/v1/auth/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokens.accessToken}`,
    },
    body: JSON.stringify({
      currentPassword: 'nouveauMotDePasse456',
      newPassword: 'password123',
    }),
  });

  if (restoreResponse.ok) {
    console.log('✅ Mot de passe original restauré!');
  } else {
    console.error('❌ Échec de la restauration');
  }

  console.log('\n🎉 Test terminé!');
}

testChangePassword().catch(console.error);
