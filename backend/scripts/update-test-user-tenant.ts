#!/usr/bin/env npx tsx

/**
 * Script pour mettre à jour l'utilisateur test avec les capabilities et featureFlags
 * du tenant t1 depuis le fichier tenants/t1.json
 */

const API_BASE_URL = 'http://localhost:4000';

async function updateTestUserTenant() {
  console.log("🔄 Mise à jour de l'utilisateur test avec le tenant t1...\n");

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

  // 2. Vérifier les informations actuelles du tenant
  console.log('\n🔍 Vérification des informations actuelles du tenant...');
  const meResponse = await fetch(`${API_BASE_URL}/v1/auth/me`, {
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
    },
  });

  if (meResponse.ok) {
    const meData = await meResponse.json();
    console.log('👤 Utilisateur:', meData.user.email);
    console.log('🏢 Tenant ID:', meData.tenant.tenantId);
    console.log('📋 Client Type:', meData.tenant.clientType);
    console.log('✅ Capabilities:', meData.tenant.capabilities);
    console.log('🚩 Feature Flags:', meData.tenant.featureFlags);
  } else {
    console.error('❌ Échec de la récupération des informations');
    const errorData = await meResponse.json();
    console.error('Erreur:', errorData);
  }

  // 3. Vérifier les informations depuis le fichier t1.json
  console.log('\n📄 Vérification des informations depuis tenants/t1.json...');

  try {
    const fs = await import('fs');
    const path = await import('path');

    const t1Path = path.join(process.cwd(), 'tenants', 't1.json');
    const t1Content = fs.readFileSync(t1Path, 'utf-8');
    const t1Data = JSON.parse(t1Content);

    console.log('📋 Tenant ID (fichier):', t1Data.tenantId);
    console.log('📋 Client Type (fichier):', t1Data.clientType);
    console.log('✅ Capabilities (fichier):', t1Data.capabilities);
    console.log('🚩 Feature Flags (fichier):', t1Data.featureFlags);

    // 4. Vérifier que les informations correspondent
    console.log('\n🔍 Vérification de la correspondance...');

    const meResponse2 = await fetch(`${API_BASE_URL}/v1/auth/me`, {
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
      },
    });

    if (meResponse2.ok) {
      const meData = await meResponse2.json();

      const capabilitiesMatch =
        JSON.stringify(meData.tenant.capabilities.sort()) ===
        JSON.stringify(t1Data.capabilities.sort());
      const featureFlagsMatch =
        JSON.stringify(meData.tenant.featureFlags) === JSON.stringify(t1Data.featureFlags);
      const clientTypeMatch = meData.tenant.clientType === t1Data.clientType;

      console.log('📋 Client Type match:', clientTypeMatch ? '✅' : '❌');
      console.log('✅ Capabilities match:', capabilitiesMatch ? '✅' : '❌');
      console.log('🚩 Feature Flags match:', featureFlagsMatch ? '✅' : '❌');

      if (clientTypeMatch && capabilitiesMatch && featureFlagsMatch) {
        console.log('\n✅ Les informations du tenant sont déjà à jour!');
      } else {
        console.log('\n⚠️ Les informations du tenant ne correspondent pas au fichier t1.json');
        console.log('ℹ️ Le système charge automatiquement les informations du fichier t1.json');
        console.log('ℹ️ Assurez-vous que le fichier est correctement configuré');

        if (!clientTypeMatch) {
          console.log(`\n📋 Client Type: ${meData.tenant.clientType} → ${t1Data.clientType}`);
        }
        if (!capabilitiesMatch) {
          console.log(`\n✅ Capabilities:`, meData.tenant.capabilities, '→', t1Data.capabilities);
        }
        if (!featureFlagsMatch) {
          console.log(`\n🚩 Feature Flags:`, meData.tenant.featureFlags, '→', t1Data.featureFlags);
        }
      }
    } else {
      console.error('❌ Échec de la vérification finale');
    }
  } catch (error) {
    console.error('❌ Erreur lors de la lecture du fichier t1.json:', error);
    console.log(
      'ℹ️ Assurez-vous que le fichier tenants/t1.json existe et est correctement formaté'
    );
  }

  console.log('\n🎉 Vérification terminée!');
  console.log('\n💡 Note: Les tenant configurations sont lues depuis les fichiers JSON');
  console.log(
    "💡 Pour changer le tenant d'un utilisateur, vous devez changer son tenantId dans la base de données"
  );
}

updateTestUserTenant().catch(console.error);
