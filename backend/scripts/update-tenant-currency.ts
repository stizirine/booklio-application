#!/usr/bin/env tsx
/**
 * Mettre à jour la devise d'un tenant existant
 * 
 * Usage:
 *   npx tsx scripts/update-tenant-currency.ts \
 *     -t ichbilia-optique \
 *     -c MAD
 */
import './load-env.js';

import { program } from 'commander';
import mongoose from 'mongoose';

import { TenantModel } from '../src/modules/tenants/model.js';

// Configuration du CLI
program
  .name('update-tenant-currency')
  .description('Mettre à jour la devise d\'un tenant existant')
  .requiredOption('-t, --tenant-id <tenantId>', 'Tenant ID (ex: ichbilia-optique)')
  .requiredOption('-c, --currency <currency>', 'Code devise (ex: MAD, EUR, USD)')
  .option('--api-url <url>', 'URL de l\'API pour recharger le registre', 'http://localhost:4000')
  .option('--api-key <key>', 'API Key pour l\'API', process.env.REQUIRED_HEADER_VALUE || '')
  .parse();

async function updateTenantCurrency() {
  try {
    const options = program.opts();
    const {
      tenantId,
      currency,
      apiUrl,
      apiKey,
    } = options as any;

    console.log('🔌 Connexion à MongoDB...\n');
    
    const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/booklio';
    await mongoose.connect(mongoUri);
    
    console.log('✅ Connecté à MongoDB\n');

    // Vérifier si le tenant existe
    const tenant = await TenantModel.findOne({ tenantId });
    
    if (!tenant) {
      console.error(`❌ Le tenant "${tenantId}" n'existe pas`);
      await mongoose.disconnect();
      process.exit(1);
    }

    console.log(`📦 Mise à jour du tenant "${tenantId}"...`);
    console.log(`   Devise actuelle: ${tenant.currency || 'non définie'}`);
    console.log(`   Nouvelle devise: ${currency}\n`);

    // Mettre à jour la devise
    tenant.currency = currency;
    await tenant.save();

    console.log(`✅ Tenant mis à jour avec succès!`);
    console.log(`   Tenant ID: ${tenant.tenantId}`);
    console.log(`   Devise: ${tenant.currency}\n`);

    await mongoose.disconnect();
    console.log(`✅ Déconnexion de MongoDB`);
    
    // Recharger le registre des tenants
    if (apiUrl) {
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
          console.log(`✅ Registre rechargé avec succès!`);
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
    console.error('\n❌ Erreur lors de la mise à jour du tenant:', error.message);
    process.exit(1);
  }
}

updateTenantCurrency();

