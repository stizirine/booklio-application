#!/usr/bin/env npx tsx

/**
 * Script pour insérer le tenant t1 dans la collection tenants de MongoDB
 * et créer une prescription optique de test
 */

import 'dotenv/config.js';
import fs from 'fs';
import path from 'path';

import mongoose from 'mongoose';

import { ClientModel } from '../src/modules/crm/clients/model.js';
import { OpticalPrescription } from '../src/modules/optician/prescriptions.model.js';
import { TenantModel } from '../src/modules/tenants/model.js';

const TENANT_ID = 't1';
const MONGO_URI = process.env.MONGO_URI as string;

async function seedTenant() {
  try {
    console.log('🔌 Connexion à MongoDB...');
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connecté à MongoDB\n');

    // 1. Lire le fichier t1.json et créer le tenant dans la DB
    console.log('📄 Lecture du fichier tenants/t1.json...');
    const t1Path = path.join(process.cwd(), 'tenants', 't1.json');
    const t1Content = fs.readFileSync(t1Path, 'utf-8');
    const t1Data = JSON.parse(t1Content);

    console.log('📋 Configuration tenant:', {
      tenantId: t1Data.tenantId,
      clientType: t1Data.clientType,
      capabilities: t1Data.capabilities,
      featureFlags: t1Data.featureFlags,
    });

    // 2. Créer ou mettre à jour le tenant dans la DB
    console.log('\n🏢 Création du tenant dans la base de données...');
    const existingTenant = await TenantModel.findOne({ tenantId: t1Data.tenantId });

    if (existingTenant) {
      console.log('⚠️ Le tenant t1 existe déjà, mise à jour...');
      existingTenant.clientType = t1Data.clientType;
      existingTenant.capabilities = t1Data.capabilities;
      existingTenant.featureFlags = t1Data.featureFlags;
      await existingTenant.save();
      console.log('✅ Tenant mis à jour!');
    } else {
      await TenantModel.create({
        tenantId: t1Data.tenantId,
        clientType: t1Data.clientType,
        capabilities: t1Data.capabilities,
        featureFlags: t1Data.featureFlags,
      });
      console.log('✅ Tenant créé!');
    }

    // 3. Créer un client de test si nécessaire
    console.log('\n👤 Vérification des clients...');
    let testClient = await ClientModel.findOne({ tenantId: TENANT_ID });

    if (!testClient) {
      console.log("➕ Création d'un client de test...");
      testClient = await ClientModel.create({
        tenantId: TENANT_ID,
        firstName: 'Marie',
        lastName: 'Dupont',
        email: 'marie.dupont@example.com',
        phone: '+33 6 12 34 56 78',
      });
      console.log('✅ Client créé!');
    } else {
      console.log('✅ Client existant trouvé');
    }

    const clientId = testClient._id.toString();

    // 4. Créer une prescription optique de test
    console.log("\n👓 Création d'une prescription optique de test...");
    const existingPrescription = await OpticalPrescription.findOne({
      tenantId: TENANT_ID,
      clientId: clientId,
    });

    if (existingPrescription) {
      console.log('ℹ️ Prescription existante trouvée, suppression...');
      await OpticalPrescription.deleteOne({ _id: existingPrescription._id });
      console.log('✅ Prescription supprimée');
    }

    const prescription = await OpticalPrescription.create({
      tenantId: TENANT_ID,
      clientId: clientId,
      kind: 'glasses',
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
        lensType: 'progressive',
        index: '1.74',
        treatments: ['anti_reflect', 'blue_light'],
        pd: { mono: { od: 32.5, og: 32 }, near: 64 },
        segmentHeight: 18,
        vertexDistance: 12,
        baseCurve: 6,
        frame: {
          type: 'full_rim',
          eye: 52,
          bridge: 18,
          temple: 140,
          material: 'acetate',
        },
      },
      issuedAt: new Date(),
      expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      notes: "Prescription de test pour l'opticien",
      source: 'manual',
    });

    console.log('✅ Prescription créée!');
    console.log('   📝 ID:', prescription.id);

    // 5. Résumé
    console.log('\n📊 Résumé:');
    const tenantCount = await TenantModel.countDocuments({});
    const prescriptionCount = await OpticalPrescription.countDocuments({});
    console.log(`   🏢 Tenants: ${tenantCount}`);
    console.log(`   👓 Prescriptions: ${prescriptionCount}`);

    console.log('\n✅ Seed terminé avec succès!');
  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
    throw error;
  } finally {
    await mongoose.disconnect();
    console.log('\n👋 Déconnecté de MongoDB');
  }
}

seedTenant();
