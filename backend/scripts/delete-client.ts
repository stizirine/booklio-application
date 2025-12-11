#!/usr/bin/env tsx

import { config } from 'dotenv';
import mongoose from 'mongoose';

import { AppointmentModel } from '../src/modules/crm/appointments/model.js';
import { ClientModel } from '../src/modules/crm/clients/model.js';
import { InvoiceModel } from '../src/modules/crm/invoices/model.js';

// Charger les variables d'environnement
config();

async function deleteClient(clientId: string, tenantId: string, hard = false) {
  try {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log('✅ Connecté à MongoDB');

    // Vérifier que le client existe
    const client = await ClientModel.findOne({ _id: clientId, tenantId });
    if (!client) {
      console.log('❌ Client non trouvé');
      return;
    }

    console.log(`👤 Client trouvé: ${client.firstName} ${client.lastName}`);

    if (hard) {
      // Suppression physique
      console.log('🗑️  Suppression physique...');

      // Supprimer le client et ses relations
      const [deletedClient, deletedAppointments, deletedInvoices] = await Promise.all([
        ClientModel.deleteOne({ _id: clientId, tenantId }),
        AppointmentModel.deleteMany({ tenantId, clientId }),
        InvoiceModel.deleteMany({ tenantId, clientId }),
      ]);

      console.log(`✅ Client supprimé: ${deletedClient.deletedCount}`);
      console.log(`✅ Rendez-vous supprimés: ${deletedAppointments.deletedCount}`);
      console.log(`✅ Factures supprimées: ${deletedInvoices.deletedCount}`);
    } else {
      // Suppression logique (soft delete)
      console.log('🗑️  Suppression logique...');

      const now = new Date();
      const [updatedClient, updatedAppointments, updatedInvoices] = await Promise.all([
        ClientModel.findOneAndUpdate(
          { _id: clientId, tenantId },
          { deletedAt: now },
          { new: true }
        ),
        AppointmentModel.updateMany({ tenantId, clientId }, { $set: { deletedAt: now } }),
        InvoiceModel.updateMany({ tenantId, clientId }, { $set: { deletedAt: now } }),
      ]);

      console.log(`✅ Client soft-deleted: ${updatedClient ? 'Oui' : 'Non'}`);
      console.log(`✅ Rendez-vous soft-deleted: ${updatedAppointments.modifiedCount}`);
      console.log(`✅ Factures soft-deleted: ${updatedInvoices.modifiedCount}`);
    }

    await mongoose.disconnect();
    console.log('✅ Déconnecté de MongoDB');
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

// Exécuter si appelé directement
if (import.meta.url === `file://${process.argv[1]}`) {
  const args = process.argv.slice(2);
  const clientId = args[0];
  const tenantId = args[1] || 't1';
  const hard = args[2] === '--hard';

  if (!clientId) {
    console.log('Usage: tsx scripts/delete-client.ts <clientId> [tenantId] [--hard]');
    console.log('Exemple: tsx scripts/delete-client.ts 507f1f77bcf86cd799439011 t1 --hard');
    process.exit(1);
  }

  deleteClient(clientId, tenantId, hard);
}

export { deleteClient };
