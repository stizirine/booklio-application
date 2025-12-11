#!/usr/bin/env npx tsx

/**
 * Script pour insérer les données via l'API
 * - Crée une prescription optique de test via l'API
 */

const API_BASE_URL = 'http://localhost:4000';

async function seedViaAPI() {
  console.log("🌱 Seed via l'API...\n");

  try {
    // 1. Connexion avec test@booklio.com
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

    // 2. Créer un client de test
    console.log("\n👤 Création d'un client de test...");
    const clientResponse = await fetch(`${API_BASE_URL}/v1/clients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.accessToken}`,
      },
      body: JSON.stringify({
        firstName: 'Marie',
        lastName: 'Dupont',
        phone: '+33 6 12 34 56 78',
        email: 'marie.dupont@example.com',
      }),
    });

    if (!clientResponse.ok) {
      console.error('❌ Échec de la création du client');
      const errorData = await clientResponse.json();
      console.error('Erreur:', errorData);
      return;
    }

    const clientData = await clientResponse.json();
    console.log('📄 Réponse complète:', JSON.stringify(clientData, null, 2));
    const clientId =
      clientData.client?._id || clientData.client?.id || clientData._id || clientData.id;
    console.log('✅ Client créé:', clientId);

    // 3. Créer une prescription optique de test
    console.log("\n👓 Création d'une prescription optique de test...");

    const prescriptionData = {
      clientId: clientId,
      kind: 'glasses',
      correction: {
        od: {
          sphere: -2.5,
          cylinder: -0.75,
          axis: 180,
          add: 1.5,
        },
        og: {
          sphere: -2.25,
          cylinder: -0.5,
          axis: 10,
          add: 1.5,
        },
      },
      glassesParams: {
        lensType: 'progressive',
        index: '1.74',
        treatments: ['anti_reflection', 'blue_light_filter'],
        pd: { mono: { od: 32.5, og: 32 }, near: 64 },
        segmentHeight: 18,
        frame: {
          type: 'full_rim',
          eye: 52,
          bridge: 18,
          temple: 140,
          material: 'acetate',
        },
      },
      issuedAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
      notes: "Prescription de test pour l'opticien",
      source: 'manual',
    };

    const prescriptionResponse = await fetch(`${API_BASE_URL}/v1/optician/prescriptions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokens.accessToken}`,
      },
      body: JSON.stringify(prescriptionData),
    });

    if (!prescriptionResponse.ok) {
      console.error('❌ Échec de la création de la prescription');
      const errorData = await prescriptionResponse.json();
      console.error('Erreur:', errorData);
      return;
    }

    const prescriptionDataResp = await prescriptionResponse.json();
    console.log('✅ Prescription créée:', prescriptionDataResp.id);

    console.log('\n✅ Seed terminé avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    throw error;
  }
}

seedViaAPI().catch(console.error);
