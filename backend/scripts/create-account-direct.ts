#!/usr/bin/env tsx
/**
 * Créer un compte utilisateur directement dans MongoDB (pour la production)
 * 
 * Ce script bypasse l'API et insère directement dans la base de données.
 * À utiliser en production où l'endpoint /register est désactivé.
 * 
 * Usage:
 *   NODE_ENV=prod npx tsx scripts/create-account-direct.ts \
 *     -t tenant-id \
 *     -e email@example.com \
 *     -p password123
 */
import './load-env.js';

import bcrypt from 'bcrypt';
import { program } from 'commander';
import mongoose from 'mongoose';

import { ClientType, TenantModel } from '../src/modules/tenants/model.js';
import { User } from '../src/modules/users/model.js';

// Configuration du CLI
program
  .name('create-account-direct')
  .description('Créer un compte utilisateur directement dans MongoDB')
  .requiredOption('-t, --tenant-id <tenantId>', 'Tenant ID (ex: t1, ichbilia-optique)')
  .requiredOption('-e, --email <email>', 'Email de l\'utilisateur')
  .requiredOption('-p, --password <password>', 'Mot de passe')
  .option('-c, --client-type <type>', 'Type de client (optician, generic)', 'optician')
  .option('--first-name <firstName>', 'Prénom')
  .option('--last-name <lastName>', 'Nom')
  .option('--phone <phone>', 'Téléphone')
  .option('--store-name <storeName>', 'Nom du magasin')
  .option('--store-address <storeAddress>', 'Adresse du magasin')
  .option('--phone-number <phoneNumber>', 'Numéro de téléphone fixe du magasin')
  .option('--store-phone <storePhone>', 'Autre téléphone du magasin')
  .option('--patente <patenteNumber>', 'Numéro de patente')
  .option('--rc <rcNumber>', 'Numéro RC')
  .option('--npe <npeNumber>', 'Numéro NPE')
  .option('--ice <iceNumber>', 'Numéro ICE')
  .option('--api-url <url>', 'URL de l\'API pour recharger le registre', 'http://localhost:4000')
  .option('--api-key <key>', 'API Key pour l\'API', process.env.REQUIRED_HEADER_VALUE || '')
  .parse();

async function createAccountDirect() {
  try {
    const options = program.opts();
    const {
      tenantId,
      email,
      password,
      clientType,
      firstName,
      lastName,
      phone,
      storeName,
      storeAddress,
      phoneNumber,
      storePhone,
      patente: patenteNumber,
      rc: rcNumber,
      npe: npeNumber,
      ice: iceNumber,
      apiUrl,
      apiKey,
    } = options as any;
    
    let tenantCreated = false;

    console.log('🔌 Connexion à MongoDB...\n');
    
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/booklio';
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connecté à MongoDB\n');

    // Vérifier si le tenant existe
    let tenant = await TenantModel.findOne({ tenantId });
    
    if (!tenant) {
      console.log(`📦 Création du tenant "${tenantId}"...`);
      
      // Déterminer les capacités selon le type de client
      const capabilities = clientType === 'optician' 
        ? ['dashboard', 'clients', 'appointments', 'invoices', 'optics']
        : ['dashboard', 'clients', 'appointments', 'invoices'];
      
      const featureFlags = clientType === 'optician'
        ? {
            optics_measurements: true,
            optics_prescriptions: true,
            optics_print: true,
          }
        : {};

      tenant = await TenantModel.create({
        tenantId,
        clientType: clientType === 'optician' ? ClientType.Optician : ClientType.Generic,
        capabilities,
        featureFlags,
      });
      
      tenantCreated = true;
      
      console.log(`✅ Tenant créé:`, {
        tenantId: tenant.tenantId,
        clientType: tenant.clientType,
        capabilities: tenant.capabilities,
      });
    } else {
      console.log(`✅ Tenant "${tenantId}" existe déjà`);
    }

    // Vérifier si l'utilisateur existe
    const existingUser = await User.findOne({ email });
    
    if (existingUser) {
      console.log(`\n⚠️  L'utilisateur avec l'email "${email}" existe déjà`);
      console.log(`   ID: ${existingUser._id}`);
      console.log(`   Tenant: ${existingUser.tenantId}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    // Hasher le mot de passe
    console.log(`\n🔐 Hashage du mot de passe...`);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Créer l'utilisateur
    console.log(`👤 Création de l'utilisateur "${email}"...`);
    
    const userData: any = {
      tenantId,
      email,
      passwordHash: hashedPassword,
      roles: ['user'],
    };

    // Ajouter les champs optionnels
    if (firstName) userData.firstName = firstName;
    if (lastName) userData.lastName = lastName;
    if (phone) userData.phone = phone;
    if (storeName) userData.storeName = storeName;
    if (storeAddress) userData.storeAddress = storeAddress;
    if (phoneNumber) userData.phoneNumber = phoneNumber;
    if (storePhone) userData.storePhone = storePhone;
    if (patenteNumber) userData.patenteNumber = patenteNumber;
    if (rcNumber) userData.rcNumber = rcNumber;
    if (npeNumber) userData.npeNumber = npeNumber;
    if (iceNumber) userData.iceNumber = iceNumber;

    const user = await User.create(userData);

    console.log(`\n✅ Utilisateur créé avec succès!`);
    console.log(`   ID: ${user._id}`);
    console.log(`   Email: ${user.email}`);
    console.log(`   Password: ${password}`);
    console.log(`   Tenant: ${user.tenantId}`);
    console.log(`   Type: ${clientType}`);
    
    if (storeName) {
      console.log(`   Magasin: ${storeName}`);
    }

    await mongoose.disconnect();
    console.log(`\n✅ Déconnexion de MongoDB`);
    
    // Recharger le registre des tenants si un nouveau tenant a été créé
    if (tenantCreated && apiUrl) {
      console.log(`\n🔄 Rechargement du registre des tenants...`);
      try {
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        
        if (apiKey) {
          headers['x-api-key'] = apiKey;
        }
        
        const response = await fetch(`${apiUrl}/v1/tenants/reload`, {
          method: 'POST',
          headers,
        } as any);
        
        if (response.ok) {
          console.log(`✅ Registre rechargé avec succès! Le tenant est maintenant disponible dans l'API.`);
        } else {
          console.log(`⚠️  Échec du rechargement automatique (${response.status})`);
          console.log(`   Vous pouvez recharger manuellement avec: curl -X POST ${apiUrl}/v1/tenants/reload`);
          console.log(`   Ou redémarrer le backend: docker restart booklio-api`);
        }
      } catch (error: any) {
        console.log(`⚠️  Impossible de recharger automatiquement le registre`);
        console.log(`   Raison: ${error.message}`);
        console.log(`   Vous devez redémarrer le backend: docker restart booklio-api`);
      }
    }
    
    console.log();
    
  } catch (error: any) {
    console.error('\n❌ Erreur lors de la création du compte:', error.message);
    process.exit(1);
  }
}

createAccountDirect();

