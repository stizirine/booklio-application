#!/usr/bin/env tsx
import 'dotenv/config.js';
import { program } from 'commander';

// Configuration du CLI
program
  .name('create-account')
  .description('Créer un compte utilisateur avec tenant personnalisé via l\'API')
  .requiredOption('-t, --tenant-id <tenantId>', 'Tenant ID (ex: t1, acme)')
  .requiredOption('-e, --email <email>', 'Email de l\'utilisateur')
  .requiredOption('-p, --password <password>', 'Mot de passe')
  .option('-c, --client-type <type>', 'Type de client (optician, generic)', 'optician')
  .option('--api-url <url>', 'URL de l\'API', 'http://localhost:4000')
  .option('--api-key <key>', 'API Key (x-api-key header)', process.env.REQUIRED_HEADER_VALUE || '')
  .option('--first-name <firstName>', 'Prénom')
  .option('--last-name <lastName>', 'Nom')
  .option('--phone <phone>', 'Téléphone')
  .option('--store-name <storeName>', 'Nom du magasin')
  .option('--store-address <storeAddress>', 'Adresse du magasin')
  .option('--phone-number <phoneNumber>', 'Numéro de téléphone du magasin')
  .option('--patente <patenteNumber>', 'Numéro de patente')
  .option('--rc <rcNumber>', 'Numéro RC')
  .option('--npe <npeNumber>', 'Numéro NPE')
  .option('--ice <iceNumber>', 'Numéro ICE')
  .parse();

const options = program.opts();

async function createAccount() {
  try {
    const {
      tenantId,
      email,
      password,
      clientType,
      apiUrl,
      apiKey,
      firstName,
      lastName,
      phone,
      storeName,
      storeAddress,
      phoneNumber,
      patenteNumber,
      rcNumber,
      npeNumber,
      iceNumber,
    } = options;

    console.log('🚀 Création du compte via l\'API...\n');

    // Construire le payload pour l'API
    const payload: any = {
      tenantId,
      email,
      password,
      clientType,
    };

    // Ajouter les champs optionnels s'ils sont fournis
    if (firstName) payload.firstName = firstName;
    if (lastName) payload.lastName = lastName;
    if (phone) payload.phone = phone;
    if (storeName) payload.storeName = storeName;
    if (storeAddress) payload.storeAddress = storeAddress;
    if (phoneNumber) payload.phoneNumber = phoneNumber;
    if (patenteNumber) payload.patenteNumber = patenteNumber;
    if (rcNumber) payload.rcNumber = rcNumber;
    if (npeNumber) payload.npeNumber = npeNumber;
    if (iceNumber) payload.iceNumber = iceNumber;

    // Préparer les headers
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    
    if (apiKey) {
      headers['x-api-key'] = apiKey;
    }

    // Appel à l'API de registration
    console.log(`📡 Appel à ${apiUrl}/v1/auth/register...`);
    const response = await fetch(`${apiUrl}/v1/auth/register`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Erreur lors de la création du compte:');
      console.error(JSON.stringify(data, null, 2));
      process.exit(1);
    }

    console.log('✅ Compte créé avec succès!\n');

    // Récupérer les informations du tenant via /me
    console.log('📡 Récupération des informations du tenant...');
    const meResponse = await fetch(`${apiUrl}/v1/auth/me`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${data.tokens.accessToken}`,
        ...(apiKey ? { 'x-api-key': apiKey } : {}),
      },
    });

    const meData = await meResponse.json();

    // Afficher le résumé
    console.log('\n📋 Résumé de la création:');
    console.log('─'.repeat(50));
    console.log(`Tenant ID:        ${meData.tenant.tenantId}`);
    console.log(`Client Type:      ${meData.tenant.clientType}`);
    console.log(`Capabilities:     ${meData.tenant.capabilities.join(', ')}`);
    const activeFlags = Object.entries(meData.tenant.featureFlags || {})
      .filter(([, v]) => v)
      .map(([k]) => k);
    console.log(`Feature Flags:    ${activeFlags.join(', ') || 'Aucun'}`);
    console.log('─'.repeat(50));
    console.log(`Email:            ${meData.user.email}`);
    console.log(`User ID:          ${meData.user.id}`);
    console.log(`Roles:            ${meData.user.roles.join(', ')}`);
    if (meData.user.firstName || meData.user.lastName) {
      console.log(`Nom:              ${meData.user.firstName || ''} ${meData.user.lastName || ''}`);
    }
    if (meData.user.storeName) {
      console.log(`Magasin:          ${meData.user.storeName}`);
    }
    if (meData.user.storeAddress) {
      console.log(`Adresse:          ${meData.user.storeAddress}`);
    }
    console.log('─'.repeat(50));
    console.log('\n✨ Le tenant est maintenant disponible dans l\'API!');
    console.log('💡 Vous pouvez vous connecter avec ces identifiants.');

  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter le script
createAccount();

