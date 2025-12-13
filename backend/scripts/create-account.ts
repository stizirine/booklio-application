#!/usr/bin/env tsx
import 'dotenv/config.js';
import bcrypt from 'bcrypt';
import mongoose from 'mongoose';
import { program } from 'commander';
import { User } from '../src/modules/users/model.js';
import { ClientType, TenantModel } from '../src/modules/tenants/model.js';
import { Capability, FeatureFlag } from '../src/modules/tenants/types.js';
import { tenantRegistry } from '../src/modules/tenants/registry.js';

// Configuration du CLI
program
  .name('create-account')
  .description('Créer un compte utilisateur avec tenant personnalisé')
  .requiredOption('-t, --tenant-id <tenantId>', 'Tenant ID (ex: t1, acme)')
  .requiredOption('-e, --email <email>', 'Email de l\'utilisateur')
  .requiredOption('-p, --password <password>', 'Mot de passe')
  .option('-c, --client-type <type>', 'Type de client (optician, generic)', 'optician')
  .option('--capabilities <capabilities...>', 'Liste des capabilities (dashboard, clients, appointments, invoices, optics)', ['dashboard', 'clients', 'appointments', 'invoices'])
  .option('--feature-flags <flags...>', 'Liste des feature flags à activer')
  .option('--first-name <firstName>', 'Prénom')
  .option('--last-name <lastName>', 'Nom')
  .option('--phone <phone>', 'Téléphone')
  .option('--store-name <storeName>', 'Nom du magasin')
  .option('--store-address <storeAddress>', 'Adresse du magasin')
  .option('--patente <patenteNumber>', 'Numéro de patente')
  .option('--rc <rcNumber>', 'Numéro RC')
  .option('--npe <npeNumber>', 'Numéro NPE')
  .option('--ice <iceNumber>', 'Numéro ICE')
  .parse();

const options = program.opts();

// Mapping des capabilities
const capabilityMap: Record<string, Capability> = {
  dashboard: Capability.Dashboard,
  clients: Capability.Clients,
  appointments: Capability.Appointments,
  invoices: Capability.Invoices,
  optics: Capability.Optics,
  'optics-measurements': Capability.Optics,
  'optics-prescriptions': Capability.Optics,
};

// Mapping des feature flags
const featureFlagMap: Record<string, FeatureFlag> = {
  'optics-measurements': FeatureFlag.OpticsMeasurements,
  'optics-prescriptions': FeatureFlag.OpticsPrescriptions,
  'optics-print': FeatureFlag.OpticsPrint,
  'optics_measurements': FeatureFlag.OpticsMeasurements,
  'optics_prescriptions': FeatureFlag.OpticsPrescriptions,
  'optics_print': FeatureFlag.OpticsPrint,
};

async function createAccount() {
  try {
    // Connexion à MongoDB
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI ou MONGODB_URI doit être défini dans les variables d\'environnement');
    }

    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('✅ Connecté à MongoDB\n');

    const {
      tenantId,
      email,
      password,
      clientType,
      capabilities: capabilitiesInput,
      featureFlags: featureFlagsInput,
      firstName,
      lastName,
      phone,
      storeName,
      storeAddress,
      patenteNumber,
      rcNumber,
      npeNumber,
      iceNumber,
    } = options;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email, tenantId });
    if (existingUser) {
      console.error(`❌ Un utilisateur avec l'email ${email} existe déjà pour le tenant ${tenantId}`);
      process.exit(1);
    }

    // Parser le clientType
    const parsedClientType = clientType === 'optician' ? ClientType.Optician : ClientType.Generic;

    // Parser les capabilities
    const capabilities: Capability[] = [];
    for (const cap of capabilitiesInput) {
      const mappedCap = capabilityMap[cap.toLowerCase()];
      if (mappedCap && !capabilities.includes(mappedCap)) {
        capabilities.push(mappedCap);
      }
    }

    // Pour optician, ajouter automatiquement Optics si pas présent
    if (parsedClientType === ClientType.Optician && !capabilities.includes(Capability.Optics)) {
      capabilities.push(Capability.Optics);
    }

    // Parser les feature flags
    const featureFlags: Partial<Record<FeatureFlag, boolean>> = {};
    if (featureFlagsInput && featureFlagsInput.length > 0) {
      for (const flag of featureFlagsInput) {
        const mappedFlag = featureFlagMap[flag.toLowerCase().replace(/-/g, '_')];
        if (mappedFlag) {
          featureFlags[mappedFlag] = true;
        }
      }
    } else if (parsedClientType === ClientType.Optician) {
      // Pour optician, activer les feature flags par défaut
      featureFlags[FeatureFlag.OpticsMeasurements] = true;
      featureFlags[FeatureFlag.OpticsPrescriptions] = true;
      featureFlags[FeatureFlag.OpticsPrint] = true;
    }

    // Créer ou mettre à jour le tenant
    let tenant = await TenantModel.findOne({ tenantId });
    if (tenant) {
      console.log(`ℹ️  Tenant ${tenantId} existe déjà, mise à jour de la configuration...`);
      tenant.clientType = parsedClientType;
      tenant.capabilities = capabilities;
      tenant.featureFlags = featureFlags;
      await tenant.save();
      console.log('✅ Tenant mis à jour\n');
    } else {
      console.log(`➕ Création du tenant ${tenantId}...`);
      tenant = await TenantModel.create({
        tenantId,
        clientType: parsedClientType,
        capabilities,
        featureFlags,
      });
      console.log('✅ Tenant créé\n');
    }

    // Recharger le registre des tenants
    await tenantRegistry.load();

    // Créer l'utilisateur
    console.log(`👤 Création de l'utilisateur ${email}...`);
    const passwordHash = await bcrypt.hash(password, Number(process.env.BCRYPT_SALT_ROUNDS || 12));

    const userData: any = {
      tenantId,
      email,
      passwordHash,
      roles: ['admin'],
    };

    // Ajouter les champs optionnels s'ils sont fournis
    if (firstName) userData.firstName = firstName;
    if (lastName) userData.lastName = lastName;
    if (phone) userData.phone = phone;
    if (storeName) userData.storeName = storeName;
    if (storeAddress) userData.storeAddress = storeAddress;
    if (patenteNumber) userData.patenteNumber = patenteNumber;
    if (rcNumber) userData.rcNumber = rcNumber;
    if (npeNumber) userData.npeNumber = npeNumber;
    if (iceNumber) userData.iceNumber = iceNumber;

    const user = await User.create(userData);
    console.log('✅ Utilisateur créé\n');

    // Afficher le résumé
    console.log('📋 Résumé de la création:');
    console.log('─'.repeat(50));
    console.log(`Tenant ID:        ${tenantId}`);
    console.log(`Client Type:      ${parsedClientType}`);
    console.log(`Capabilities:     ${capabilities.join(', ')}`);
    console.log(`Feature Flags:    ${Object.entries(featureFlags).filter(([, v]) => v).map(([k]) => k).join(', ') || 'Aucun'}`);
    console.log('─'.repeat(50));
    console.log(`Email:            ${email}`);
    console.log(`User ID:          ${user.id}`);
    console.log(`Roles:            ${user.roles.join(', ')}`);
    if (firstName || lastName) {
      console.log(`Nom:              ${firstName || ''} ${lastName || ''}`);
    }
    if (storeName) {
      console.log(`Magasin:          ${storeName}`);
    }
    console.log('─'.repeat(50));
    console.log('\n✨ Compte créé avec succès!');

  } catch (error) {
    console.error('❌ Erreur lors de la création du compte:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

// Exécuter le script
createAccount();

