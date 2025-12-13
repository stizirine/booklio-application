#!/usr/bin/env npx tsx

/**
 * Script pour insérer les données dans la base de données MongoDB
 * - Insère le tenant t1 dans la collection tenants
 * - Crée une prescription optique de test
 */

import fs from 'fs';
import path from 'path';

import mongoose from 'mongoose';

import { OpticalPrescription } from '../dist/modules/optician/prescriptions.model.js';
import { TenantModel } from '../dist/modules/tenants/model.js';

const MONGODB_URI = process.env.MONGO_URI || process.env.MONGODB_URI || 'mongodb://localhost:27017/booklio';

async function seedTenantAndPrescription() {
  console.log('🌱 Seed de la base de données...\n');

  try {
    // Connexion à MongoDB
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connecté à MongoDB');

    // 1. Lire le fichier t1.json
    console.log('\n📄 Lecture du fichier tenants/t1.json...');
    const t1Path = path.join(process.cwd(), 'tenants', 't1.json');
    const t1Content = fs.readFileSync(t1Path, 'utf-8');
    const t1Data = JSON.parse(t1Content);

    console.log('📋 Configuration tenant:', {
      tenantId: t1Data.tenantId,
      clientType: t1Data.clientType,
      capabilities: t1Data.capabilities,
      featureFlags: t1Data.featureFlags,
    });

    // 2. Vérifier si le tenant existe déjà
    console.log('\n🔍 Vérification si le tenant existe...');
    const existingTenant = await TenantModel.findOne({ tenantId: t1Data.tenantId });

    if (existingTenant) {
      console.log('⚠️ Le tenant t1 existe déjà, mise à jour...');
      existingTenant.clientType = t1Data.clientType;
      existingTenant.capabilities = t1Data.capabilities;
      existingTenant.featureFlags = t1Data.featureFlags;
      await existingTenant.save();
      console.log('✅ Tenant mis à jour!');
    } else {
      console.log('➕ Création du tenant...');
      await TenantModel.create({
        tenantId: t1Data.tenantId,
        clientType: t1Data.clientType,
        capabilities: t1Data.capabilities,
        featureFlags: t1Data.featureFlags,
      });
      console.log('✅ Tenant créé!');
    }

    // 3. Créer une prescription optique de test
    console.log("\n👓 Création d'une prescription optique de test...");

    // D'abord, récupérer un client de test
    const { default: User } = await import('../dist/modules/users/model.js');
    const testUser = await User.findOne({ tenantId: 't1' });

    if (!testUser) {
      console.log('⚠️ Aucun utilisateur trouvé avec tenantId t1');
      console.log('ℹ️ La prescription sera créée sans clientId spécifique');
    }

    const testPrescriptionData = {
      tenantId: 't1',
      clientId: testUser?.id.toString() || 'test-client-id',
      kind: 'glasses' as const,
      correction: {
        od: {
          sphere: -2.5,
          cylinder: -0.75,
          axis: 180,
          add: 1.5,
          prism: null,
        },
        og: {
          sphere: -2.25,
          cylinder: -0.5,
          axis: 10,
          add: 1.5,
          prism: null,
        },
      },
      glassesParams: {
        lensType: 'progressive' as const,
        index: '1.74' as const,
        treatments: ['anti_reflection', 'blue_light_filter'],
        pd: { mono: { od: 32.5, og: 32 }, near: 64 },
        segmentHeight: 18,
        vertexDistance: 12,
        baseCurve: 6,
        frame: {
          type: 'full_rim' as const,
          eye: 52,
          bridge: 18,
          temple: 140,
          material: 'acetate' as const,
        },
      },
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 an
      notes: "Prescription de test pour l'opticien",
      source: 'manual' as const,
    };

    const prescription = await OpticalPrescription.create(testPrescriptionData);
    console.log('✅ Prescription créée:', prescription.id);

    // 4. Afficher un résumé
    console.log('\n📊 Résumé:');
    const tenantCount = await TenantModel.countDocuments({});
    const prescriptionCount = await OpticalPrescription.countDocuments({});
    console.log(`📋 Tenants dans la base: ${tenantCount}`);
    console.log(`👓 Prescriptions dans la base: ${prescriptionCount}`);

    console.log('\n✅ Seed terminé avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    throw error;
  } finally {
    // Fermer la connexion
    await mongoose.disconnect();
    console.log('\n🔌 Déconnecté de MongoDB');
  }
}

seedTenantAndPrescription().catch(console.error);
